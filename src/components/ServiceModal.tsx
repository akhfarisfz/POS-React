import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Layers,
  Image as ImageIcon,
  Upload,
  Eye,
} from 'lucide-react';
import Swal from 'sweetalert2';
import {
  Service,
  ServiceDetail,
  StockItem,
  PriceRange,
  CatalogCategoryRow,
} from '../types';
import { formatRupiah } from '../utils/format';
import { dataStore } from '../services/store';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceToEdit: Service | null;
  stockItems: StockItem[];
  onSave: (serviceData: any) => Promise<void>;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  serviceToEdit,
  stockItems,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [fotoPath, setFotoPath] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [urutan, setUrutan] = useState<number>(1);
  const [tampilDiKatalog, setTampilDiKatalog] = useState(true);
  const [catalogCategories, setCatalogCategories] = useState<CatalogCategoryRow[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [details, setDetails] = useState<ServiceDetail[]>([]);
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [tipe, setTipe] = useState('');
  const [bahan, setBahan] = useState('');
  const [ukuran, setUkuran] = useState('');
  const [priceType, setPriceType] = useState<'literal' | 'range'>('literal');
  const [harga, setHarga] = useState<number | ''>('');
  const [ranges, setRanges] = useState<PriceRange[]>([
    { minQuantity: 1, maxQuantity: 10, rangePrice: 0 },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      dataStore.fetchCatalogCategories().then((cats) => {
        setCatalogCategories(cats);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (serviceToEdit) {
      setName(serviceToEdit.name);
      setDeskripsi(serviceToEdit.deskripsi || '');
      setFotoPath(serviceToEdit.foto_path || '');
      setCategoryId(serviceToEdit.category_id || '');
      setUrutan(typeof serviceToEdit.urutan === 'number' ? serviceToEdit.urutan : 1);
      setTampilDiKatalog(serviceToEdit.tampil_di_katalog !== false);
      setDetails(serviceToEdit.service_detail || []);
      const linked = (serviceToEdit.service_stock || []).map((s) => s.IDStock);
      setSelectedStocks(linked);
    } else {
      setName('');
      setDeskripsi('');
      setFotoPath('');
      setCategoryId('');
      setUrutan(1);
      setTampilDiKatalog(true);
      setDetails([]);
      setSelectedStocks([]);
    }
  }, [serviceToEdit, isOpen]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const url = await dataStore.uploadCatalogImage(file, 900, 0.82);
      setFotoPath(url);
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Upload Gambar',
        text: err?.message || 'Terjadi kesalahan saat mengunggah gambar.',
      });
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAddDetail = () => {
    if (priceType === 'literal' && (!harga || Number(harga) <= 0)) {
      Swal.fire({ icon: 'warning', title: 'Masukkan harga valid!' });
      return;
    }

    const newDetail: ServiceDetail = {
      tipe: tipe.trim() || '-',
      bahan: bahan.trim() || '-',
      ukuran: ukuran.trim() || '-',
      harga: priceType === 'literal' ? Number(harga) : null,
      range_harga: priceType === 'range' ? ranges : null,
    };

    setDetails([...details, newDetail]);
    setTipe('');
    setBahan('');
    setUkuran('');
    setHarga('');
    setRanges([{ minQuantity: 1, maxQuantity: 10, rangePrice: 0 }]);
  };

  const handleStockToggle = (stockId: string) => {
    if (selectedStocks.includes(stockId)) {
      setSelectedStocks(selectedStocks.filter((id) => id !== stockId));
    } else {
      setSelectedStocks([...selectedStocks, stockId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      Swal.fire({ icon: 'warning', title: 'Nama Layanan Wajib Diisi' });
      return;
    }
    if (details.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Spesifikasi Harga Kosong',
        text: 'Tambahkan minimal 1 spesifikasi/harga layanan ke tabel.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const stockPayload = selectedStocks.map((id) => {
        const item = stockItems.find((s) => String(s.id) === String(id));
        return { id, name: item ? item.name : 'Stock' };
      });

      await onSave({
        id: serviceToEdit?.id,
        name: name.trim(),
        deskripsi: deskripsi.trim(),
        foto_path: fotoPath.trim(),
        category_id: categoryId || null,
        urutan: Number(urutan) || 0,
        tampil_di_katalog: tampilDiKatalog,
        detail: details.map((d) => ({
          Tipe: d.tipe,
          Bahan: d.bahan,
          Ukuran: d.ukuran,
          Harga: d.harga,
          RangeHarga: d.range_harga,
        })),
        stocks: stockPayload,
      });
      onClose();
      Swal.fire({
        icon: 'success',
        title: serviceToEdit ? 'Layanan Diperbarui!' : 'Layanan Ditambahkan!',
        text: 'Data layanan, gambar, dan deskripsi katalog berhasil disimpan.',
        timer: 1600,
        showConfirmButton: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-6">
        <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-base">
              {serviceToEdit ? 'Edit Layanan Percetakan & Katalog' : 'Tambah Layanan Percetakan & Katalog'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[82vh] overflow-y-auto space-y-5">
          {/* Nama, Kategori Katalog & Urutan */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Layanan Percetakan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Contoh: Cetak Spanduk / Banner"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori Katalog
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
              >
                <option value="">-- Pilih Kategori --</option>
                {catalogCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Urutan Katalog
              </label>
              <input
                type="number"
                value={urutan}
                onChange={(e) => setUrutan(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800"
              />
            </div>
          </div>

          {/* Bagian Gambar & Deskripsi Katalog */}
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-700" />
                <span>Gambar & Deskripsi Layanan (Tersinkron dengan Menu Katalog)</span>
              </span>

              <label className="inline-flex items-center gap-2 text-xs font-bold text-emerald-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tampilDiKatalog}
                  onChange={(e) => setTampilDiKatalog(e.target.checked)}
                  className="rounded text-emerald-600 w-4 h-4"
                />
                <Eye className="w-3.5 h-3.5 text-emerald-700" />
                <span>Tampilkan di Katalog Publik</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Upload / URL Gambar */}
              <div className="flex items-start gap-3">
                <div className="relative w-24 h-20 rounded-xl border border-slate-300 bg-white overflow-hidden shrink-0 flex items-center justify-center">
                  {fotoPath ? (
                    <>
                      <img src={fotoPath} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFotoPath('')}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded px-1.5 py-0.5 text-[9px] font-bold cursor-pointer"
                      >
                        Hapus
                      </button>
                    </>
                  ) : (
                    <div className="text-center text-slate-400 p-1">
                      <ImageIcon className="w-5 h-5 mx-auto" />
                      <span className="text-[9px] block">Belum ada</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-700">
                    Gambar Layanan (Upload / URL)
                  </label>
                  <input
                    type="text"
                    value={fotoPath}
                    onChange={(e) => setFotoPath(e.target.value)}
                    placeholder="https://... atau klik Upload"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingImage ? 'Mengunggah...' : 'Upload File Gambar'}</span>
                  </button>
                </div>
              </div>

              {/* Deskripsi Layanan */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Deskripsi Layanan / Produk
                </label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  rows={3}
                  placeholder="Tulis deskripsi spesifikasi, keunggulan bahan, atau keterangan layanan..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Spesifikasi & Detail Harga */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs uppercase text-slate-700">Tambah Spesifikasi / Detail Harga</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={tipe}
                onChange={(e) => setTipe(e.target.value)}
                placeholder="Tipe (cth: Outdoor)"
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
              />
              <input
                type="text"
                value={bahan}
                onChange={(e) => setBahan(e.target.value)}
                placeholder="Bahan (cth: Flexi 280g)"
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
              />
              <input
                type="text"
                value={ukuran}
                onChange={(e) => setUkuran(e.target.value)}
                placeholder="Ukuran (cth: Custom m²)"
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                value={harga}
                onChange={(e) => setHarga(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Harga Satuan (Rp)"
                className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold"
              />
              <button
                type="button"
                onClick={handleAddDetail}
                className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah ke Tabel</span>
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold">
                <tr>
                  <th className="p-2.5">Tipe</th>
                  <th className="p-2.5">Bahan</th>
                  <th className="p-2.5">Ukuran</th>
                  <th className="p-2.5">Harga</th>
                  <th className="p-2.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {details.map((d, i) => (
                  <tr key={i}>
                    <td className="p-2.5">{d.tipe}</td>
                    <td className="p-2.5">{d.bahan}</td>
                    <td className="p-2.5">{d.ukuran}</td>
                    <td className="p-2.5 font-semibold">{d.harga ? formatRupiah(d.harga) : 'Grosir'}</td>
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => setDetails(details.filter((_, idx) => idx !== i))}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Stok Bahan Terkait</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
              {stockItems.map((item) => (
                <label key={item.id} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStocks.includes(String(item.id))}
                    onChange={() => handleStockToggle(String(item.id))}
                  />
                  <span>{item.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-600 cursor-pointer">
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Layanan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
