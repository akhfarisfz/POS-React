import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Tag,
  Package,
  Printer,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Upload,
  MessageCircle,
  Search,
  X,
  ShoppingBag,
  CheckCircle2,
  LayoutGrid,
  List as ListIcon,
  SlidersHorizontal,
} from 'lucide-react';
import Swal from 'sweetalert2';
import {
  CatalogSettingsRow,
  CatalogCategoryRow,
  KatalogProdukViewRow,
  EditableCatalogItem,
  KatalogProdukVarian,
  CatalogDisplayOptions,
  Service,
  StoreSettings,
} from '../types';
import {
  dataStore,
  DEFAULT_CATALOG_SETTINGS_ROW,
} from '../services/store';
import { formatRupiah } from '../utils/format';

interface CatalogViewProps {
  services: Service[];
  storeSettings: StoreSettings;
  onDataChanged?: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  storeSettings,
  onDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'preview'>('products');

  const [settings, setSettings] = useState<CatalogSettingsRow>(DEFAULT_CATALOG_SETTINGS_ROW);
  const [categories, setCategories] = useState<CatalogCategoryRow[]>([]);
  const [allItems, setAllItems] = useState<EditableCatalogItem[]>([]);
  const [katalogViewRows, setKatalogViewRows] = useState<KatalogProdukViewRow[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Filter sederhana di Daftar Produk
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'TAMPIL' | 'SEMBUNYI'>('ALL');
  const [adminViewMode, setAdminViewMode] = useState<'grid' | 'list'>('grid');
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [displayOptions, setDisplayOptions] = useState<CatalogDisplayOptions>(
    dataStore.getCatalogDisplayOptions()
  );
  const [adminCols, setAdminCols] = useState({
    showFoto: true,
    showKategori: true,
    showDeskripsi: true,
    showVarian: true,
    showHarga: true,
  });

  // Modal Tambah / Edit Produk
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isNewItemMode, setIsNewItemMode] = useState(false);
  const [formSumber, setFormSumber] = useState<'layanan' | 'inventory'>('layanan');
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formDeskripsi, setFormDeskripsi] = useState('');
  const [formFotoPath, setFormFotoPath] = useState('');
  const [formCategoryId, setFormCategoryId] = useState<string>('');
  const [formUrutan, setFormUrutan] = useState<number>(1);
  const [formTampil, setFormTampil] = useState<boolean>(true);
  const [formHargaMulai, setFormHargaMulai] = useState<number>(0);
  const [formUnit, setFormUnit] = useState<string>('pcs');
  const [formStock, setFormStock] = useState<number>(100);
  const [formVarian, setFormVarian] = useState<KatalogProdukVarian[]>([]);

  // Tambah Varian di dalam Modal
  const [varTipe, setVarTipe] = useState('');
  const [varBahan, setVarBahan] = useState('');
  const [varUkuran, setVarUkuran] = useState('');
  const [varHarga, setVarHarga] = useState<number | ''>('');

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [quickUploadTarget, setQuickUploadTarget] = useState<EditableCatalogItem | null>(null);
  const [savingCardKey, setSavingCardKey] = useState<string | null>(null);

  const fotoInputRef = useRef<HTMLInputElement>(null);
  const quickCardFotoInputRef = useRef<HTMLInputElement>(null);

  // Form Kategori
  const [catName, setCatName] = useState('');
  const [catUrutan, setCatUrutan] = useState<number>(1);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // Filter Kategori pada Live Preview
  const [previewCatId, setPreviewCatId] = useState<string>('ALL');

  const loadAllCatalogData = async () => {
    setIsLoading(true);
    try {
      const [sRow, catRows, editables, viewRows] = await Promise.all([
        dataStore.fetchCatalogSettings(),
        dataStore.fetchCatalogCategories(),
        dataStore.fetchAllEditableCatalogItems(),
        dataStore.fetchKatalogViewProducts(),
      ]);
      setSettings(sRow);
      setCategories(catRows);
      setAllItems(editables);
      setKatalogViewRows(viewRows);
      setDisplayOptions(dataStore.getCatalogDisplayOptions());
    } catch (err) {
      console.error('Failed to load catalog data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllCatalogData();
  }, []);

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [categories]);

  const totalProducts = allItems.length;
  const activeCount = allItems.filter((i) => i.tampil_di_katalog).length;

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (categoryFilter !== 'ALL' && (item.category_id || '') !== categoryFilter) return false;
      if (statusFilter === 'TAMPIL' && !item.tampil_di_katalog) return false;
      if (statusFilter === 'SEMBUNYI' && item.tampil_di_katalog) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = (item.deskripsi || '').toLowerCase().includes(q);
        return matchName || matchDesc;
      }
      return true;
    });
  }, [allItems, categoryFilter, statusFilter, searchQuery]);

  // Sakelar ON/OFF Tampilkan di Katalog
  const handleToggleTampilKatalog = async (item: EditableCatalogItem) => {
    const updated: EditableCatalogItem = {
      ...item,
      tampil_di_katalog: !item.tampil_di_katalog,
    };
    const cardKey = `${item.sumber}-${item.id}`;
    setSavingCardKey(cardKey);
    try {
      await dataStore.updateCatalogItemMetadata(updated);
      setAllItems((prev) =>
        prev.map((x) => (x.sumber === item.sumber && x.id === item.id ? updated : x))
      );
      const latestView = await dataStore.fetchKatalogViewProducts();
      setKatalogViewRows(latestView);
      onDataChanged?.();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengubah Status',
        text: err?.message || 'Terjadi kesalahan saat menyimpan.',
      });
    } finally {
      setSavingCardKey(null);
    }
  };

  // Upload Foto Cepat langsung dari Kartu
  const handleQuickCardPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !quickUploadTarget) return;
    const target = quickUploadTarget;
    const cardKey = `${target.sumber}-${target.id}`;
    setSavingCardKey(cardKey);
    try {
      const url = await dataStore.uploadCatalogImage(file, 900, 0.82);
      const updated: EditableCatalogItem = { ...target, foto_path: url };
      await dataStore.updateCatalogItemMetadata(updated);
      setAllItems((prev) =>
        prev.map((x) => (x.sumber === target.sumber && x.id === target.id ? updated : x))
      );
      const latestView = await dataStore.fetchKatalogViewProducts();
      setKatalogViewRows(latestView);
      onDataChanged?.();
      Swal.fire({
        icon: 'success',
        title: 'Gambar Berhasil Diperbarui!',
        timer: 1300,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Gagal Upload Gambar', text: err?.message });
    } finally {
      setSavingCardKey(null);
      setQuickUploadTarget(null);
      e.target.value = '';
    }
  };

  const handleOpenCreateModal = () => {
    setIsNewItemMode(true);
    setFormSumber('layanan');
    setFormId('');
    setFormName('');
    setFormDeskripsi('');
    setFormFotoPath('');
    setFormCategoryId(categories[0]?.id || '');
    setFormUrutan(allItems.length + 1);
    setFormTampil(true);
    setFormHargaMulai(20000);
    setFormUnit('pcs');
    setFormStock(100);
    setFormVarian([
      { tipe: 'Standar', bahan: '-', ukuran: '-', harga: 20000, range_harga: null },
    ]);
    setIsItemModalOpen(true);
  };

  const handleOpenEditModal = (item: EditableCatalogItem) => {
    setIsNewItemMode(false);
    setFormSumber(item.sumber);
    setFormId(item.id);
    setFormName(item.name);
    setFormDeskripsi(item.deskripsi || '');
    setFormFotoPath(item.foto_path || '');
    setFormCategoryId(item.category_id || '');
    setFormUrutan(item.urutan || 1);
    setFormTampil(item.tampil_di_katalog);
    setFormHargaMulai(item.harga_mulai || 0);
    setFormUnit(item.unit || 'pcs');
    setFormStock(item.stock ?? 100);
    setFormVarian(item.varian || []);
    setIsItemModalOpen(true);
  };

  const handleUploadProductPhotoInModal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const url = await dataStore.uploadCatalogImage(file, 900, 0.82);
      setFormFotoPath(url);
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Gagal Upload Foto', text: err?.message });
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAddVarianRow = () => {
    if (!varHarga || Number(varHarga) <= 0) {
      Swal.fire({ icon: 'warning', title: 'Masukkan harga varian yang valid' });
      return;
    }
    const nextVar: KatalogProdukVarian = {
      tipe: varTipe.trim() || '-',
      bahan: varBahan.trim() || '-',
      ukuran: varUkuran.trim() || '-',
      harga: Number(varHarga),
      range_harga: null,
    };
    const nextList = [...formVarian, nextVar];
    setFormVarian(nextList);

    const prices = nextList.map((v) => Number(v.harga)).filter((n) => n > 0);
    if (prices.length > 0) {
      setFormHargaMulai(Math.min(...prices));
    }

    setVarTipe('');
    setVarBahan('');
    setVarUkuran('');
    setVarHarga('');
  };

  const handleSaveItemModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setIsSaving(true);
    try {
      if (isNewItemMode) {
        await dataStore.createNewCatalogSourceItem({
          sumber: formSumber,
          name: formName,
          deskripsi: formDeskripsi,
          foto_path: formFotoPath,
          category_id: formCategoryId || null,
          urutan: formUrutan,
          tampil_di_katalog: formTampil,
          harga_mulai: formHargaMulai,
          unit: formUnit,
          stock: formStock,
          varian: formVarian,
        });
      } else {
        await dataStore.updateCatalogItemMetadata({
          sumber: formSumber,
          id: formId,
          name: formName,
          deskripsi: formDeskripsi,
          foto_path: formFotoPath,
          category_id: formCategoryId || null,
          urutan: formUrutan,
          tampil_di_katalog: formTampil,
          harga_mulai: formHargaMulai,
          unit: formUnit,
          stock: formStock,
          varian: formVarian,
        });
      }

      setIsItemModalOpen(false);
      await loadAllCatalogData();
      onDataChanged?.();

      Swal.fire({
        icon: 'success',
        title: isNewItemMode ? 'Produk Ditambahkan!' : 'Perubahan Disimpan!',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: err?.message || String(err),
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Kategori CRUD
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    setIsSaving(true);
    try {
      if (editingCatId) {
        await dataStore.updateCatalogCategory(editingCatId, catName, catUrutan);
        Swal.fire({ icon: 'success', title: 'Kategori Diperbarui', timer: 1300, showConfirmButton: false });
      } else {
        await dataStore.addCatalogCategory(catName, catUrutan);
        Swal.fire({ icon: 'success', title: 'Kategori Ditambahkan', timer: 1300, showConfirmButton: false });
      }
      setEditingCatId(null);
      setCatName('');
      const refreshed = await dataStore.fetchCatalogCategories();
      setCategories(refreshed);
      setCatUrutan(refreshed.length + 1);
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Gagal Menyimpan Kategori', text: err?.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (cat: CatalogCategoryRow) => {
    const res = await Swal.fire({
      title: `Hapus Kategori "${cat.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    });

    if (res.isConfirmed) {
      try {
        await dataStore.deleteCatalogCategory(cat.id);
        setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      } catch (err: any) {
        Swal.fire({ icon: 'error', title: 'Gagal Menghapus', text: err?.message });
      }
    }
  };

  const getHeroBackgroundStyle = (): React.CSSProperties => {
    if (settings.hero_bg_type === 'color') {
      return { backgroundColor: settings.hero_bg_color || '#047857' };
    }
    if (settings.hero_bg_type === 'image' && settings.hero_bg_image_path) {
      return {
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.75)), url(${settings.hero_bg_image_path})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return {
      background:
        settings.hero_bg_gradient || 'linear-gradient(135deg, #0f172a 0%, #047857 100%)',
    };
  };

  return (
    <div className="space-y-6">
      {/* Header Simpel & Mudah Dipahami */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {settings.logo_path ? (
            <img
              src={settings.logo_path}
              alt="Logo"
              className="w-11 h-11 rounded-xl object-contain bg-white p-1"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Printer className="w-6 h-6" />
            </div>
          )}
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight">
              Kelola Katalog Produk
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Atur gambar, deskripsi, kategori, dan pilih produk mana saja yang ingin ditampilkan ke pelanggan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadAllCatalogData}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Muat Ulang</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab(activeTab === 'preview' ? 'products' : 'preview')
            }
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>
              {activeTab === 'preview' ? 'Kembali ke Edit Produk' : 'Lihat Hasil Katalog'}
            </span>
          </button>
        </div>
      </div>

      {/* Ringkasan Singkat + Menu Tab */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        {/* Navigasi 3 Tab Simpel */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'products'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Daftar Produk ({totalProducts})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Kategori Produk ({categories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Tampilan Katalog Pelanggan</span>
          </button>
        </div>

        {/* Info Jumlah Tampil */}
        <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 px-3.5 py-2 rounded-xl border border-emerald-200 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>
            <strong>{activeCount}</strong> dari {totalProducts} produk sedang ditampilkan di katalog
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: DAFTAR PRODUK (BERSIH & MUDAH DIPAHAMI)           */}
      {/* ======================================================== */}
      {activeTab === 'products' && (
        <div className="space-y-5">
          {/* Bar Pencarian, Pilihan Tampilan (Grid / List), Sembunyikan Info & Tombol Tambah */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[240px]">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama produk atau deskripsi..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="ALL">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="ALL">Semua Produk ({allItems.length})</option>
                <option value="TAMPIL">Ditampilkan ({activeCount})</option>
                <option value="SEMBUNYI">
                  Disembunyikan ({allItems.length - activeCount})
                </option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Toggle Tampilan: Kotak (Grid) vs Daftar (List) */}
              <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setAdminViewMode('grid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                    adminViewMode === 'grid'
                      ? 'bg-white text-emerald-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Tampilan Kotak (Grid)"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Kotak</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                    adminViewMode === 'list'
                      ? 'bg-white text-emerald-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Tampilan Daftar Baris (List)"
                >
                  <ListIcon className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
              </div>

              {/* Menu Sembunyikan / Tampilkan Kolom & Info */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Sembunyikan / Tampilkan</span>
                </button>

                {isColumnMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-30 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-slate-800">
                        Atur Info yang Ditampilkan
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsColumnMenuOpen(false)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-2">
                      {[
                        { key: 'showFoto', label: 'Foto Produk' },
                        { key: 'showKategori', label: 'Label Kategori' },
                        { key: 'showDeskripsi', label: 'Deskripsi Produk' },
                        { key: 'showVarian', label: 'Varian / Spesifikasi' },
                        { key: 'showHarga', label: 'Harga Mulai' },
                      ].map((col) => (
                        <label
                          key={col.key}
                          className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer font-semibold text-slate-700"
                        >
                          <span>{col.label}</span>
                          <input
                            type="checkbox"
                            checked={(adminCols as any)[col.key]}
                            onChange={(e) =>
                              setAdminCols({
                                ...adminCols,
                                [col.key]: e.target.checked,
                              })
                            }
                            className="w-4 h-4 rounded text-emerald-600"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Produk Baru</span>
              </button>
            </div>
          </div>

          {/* Input File Tersembunyi untuk Ganti Foto Langsung */}
          <input
            ref={quickCardFotoInputRef}
            type="file"
            accept="image/*"
            onChange={handleQuickCardPhotoChange}
            className="hidden"
          />

          {/* Tampilan Daftar Produk: GRID (4 Kolom, Gambar 1:1) vs LIST */}
          {filteredItems.length > 0 ? (
            adminViewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredItems.map((item) => {
                  const cardKey = `${item.sumber}-${item.id}`;
                  const isCardSaving = savingCardKey === cardKey;
                  const catNameLabel = item.category_id
                    ? categoryMap[item.category_id] || 'Tanpa Kategori'
                    : 'Tanpa Kategori';

                  return (
                    <div
                      key={cardKey}
                      className={`bg-white rounded-2xl border overflow-hidden shadow-2xs transition-all flex flex-col justify-between ${
                        item.tampil_di_katalog
                          ? 'border-slate-200 hover:border-emerald-400 hover:shadow-md'
                          : 'border-slate-200 bg-slate-50/70 opacity-80'
                      }`}
                    >
                      <div>
                        {/* Bagian Gambar Produk (1:1 aspect-square & terlihat penuh) */}
                        {adminCols.showFoto && (
                          <div className="relative aspect-square w-full bg-slate-100 border-b border-slate-100 overflow-hidden group flex items-center justify-center">
                            {item.foto_path ? (
                              <img
                                src={item.foto_path}
                                alt={item.name}
                                className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4 text-center">
                                <ImageIcon className="w-9 h-9 text-slate-300" />
                                <span className="text-xs font-medium text-slate-400">
                                  Belum ada foto produk
                                </span>
                              </div>
                            )}

                            {/* Label Kategori di Kiri Atas */}
                            {adminCols.showKategori && (
                              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold">
                                {catNameLabel}
                              </span>
                            )}

                            {/* Tombol Ganti/Upload Foto Cepat di Pojok Kanan Bawah Gambar */}
                            <button
                              type="button"
                              onClick={() => {
                                setQuickUploadTarget(item);
                                quickCardFotoInputRef.current?.click();
                              }}
                              disabled={isCardSaving}
                              className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/85 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>
                                {isCardSaving
                                  ? 'Menyimpan...'
                                  : item.foto_path
                                  ? 'Ganti Foto'
                                  : '+ Upload Foto'}
                              </span>
                            </button>
                          </div>
                        )}

                        {/* Bagian Info Produk */}
                        <div className="p-4 space-y-2.5">
                          {!adminCols.showFoto && adminCols.showKategori && (
                            <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
                              {catNameLabel}
                            </span>
                          )}

                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-slate-900 text-base leading-snug">
                              {item.name}
                            </h3>
                            {adminCols.showHarga && (
                              <span className="text-sm font-extrabold text-emerald-700 shrink-0">
                                {formatRupiah(item.harga_mulai)}
                              </span>
                            )}
                          </div>

                          {adminCols.showDeskripsi && (
                            <p className="text-xs text-slate-600 line-clamp-2 min-h-[34px] leading-relaxed">
                              {item.deskripsi ? (
                                item.deskripsi
                              ) : (
                                <span className="italic text-slate-400">
                                  Belum ada deskripsi produk. Klik tombol "Ubah Gambar & Info" di bawah untuk mengisi.
                                </span>
                              )}
                            </p>
                          )}

                          {adminCols.showVarian && item.varian && item.varian.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {item.varian.slice(0, 3).map((v, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold"
                                >
                                  {[v.tipe, v.bahan, v.ukuran]
                                    .filter((x) => x && x !== '-')
                                    .join(' • ') || 'Standar'}
                                </span>
                              ))}
                              {item.varian.length > 3 && (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-semibold">
                                  +{item.varian.length - 3} lainnya
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bagian Bawah Kartu: Sakelar Tampil & Tombol Edit */}
                      <div className="p-4 pt-3 bg-slate-50 border-t border-slate-100 space-y-2.5">
                        {/* Sakelar Tampilkan di Katalog */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-700">
                            Status di Katalog:
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleTampilKatalog(item)}
                            disabled={isCardSaving}
                            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                              item.tampil_di_katalog
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-200 text-slate-600 border border-slate-300'
                            }`}
                          >
                            {item.tampil_di_katalog ? (
                              <>
                                <Eye className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Ditampilkan</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                                <span>Disembunyikan</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Tombol Utama Ubah Gambar & Deskripsi */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="w-full py-2 px-3 bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-300 hover:border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Ubah Gambar, Deskripsi & Harga</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* MODE LIST (DAFTAR BARIS RINGKAS & MUDAH SEMBUNYIKAN/TAMPILKAN) */
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                        {adminCols.showFoto && <th className="py-3 px-4 w-24">Foto</th>}
                        <th className="py-3 px-4">Nama Produk</th>
                        {adminCols.showKategori && <th className="py-3 px-4">Kategori</th>}
                        {adminCols.showDeskripsi && <th className="py-3 px-4">Deskripsi</th>}
                        {adminCols.showVarian && <th className="py-3 px-4">Varian</th>}
                        {adminCols.showHarga && <th className="py-3 px-4">Harga Mulai</th>}
                        <th className="py-3 px-4 text-center">Tampil / Sembunyikan</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs">
                      {filteredItems.map((item) => {
                        const cardKey = `${item.sumber}-${item.id}`;
                        const isCardSaving = savingCardKey === cardKey;
                        const catNameLabel = item.category_id
                          ? categoryMap[item.category_id] || 'Tanpa Kategori'
                          : 'Tanpa Kategori';

                        return (
                          <tr
                            key={cardKey}
                            className={`transition hover:bg-slate-50 ${
                              !item.tampil_di_katalog ? 'bg-slate-50/60 opacity-75' : ''
                            }`}
                          >
                            {adminCols.showFoto && (
                              <td className="py-3 px-4">
                                <div className="relative w-16 h-16 aspect-square rounded-xl bg-white border border-slate-200 overflow-hidden group">
                                  {item.foto_path ? (
                                    <img
                                      src={item.foto_path}
                                      alt={item.name}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                      <ImageIcon className="w-5 h-5" />
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setQuickUploadTarget(item);
                                      quickCardFotoInputRef.current?.click();
                                    }}
                                    title="Ganti Foto"
                                    className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 text-white text-[10px] font-bold flex items-center justify-center transition cursor-pointer"
                                  >
                                    Upload
                                  </button>
                                </div>
                              </td>
                            )}

                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                                Sumber: {item.sumber}
                              </span>
                            </td>

                            {adminCols.showKategori && (
                              <td className="py-3 px-4">
                                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                                  {catNameLabel}
                                </span>
                              </td>
                            )}

                            {adminCols.showDeskripsi && (
                              <td className="py-3 px-4 max-w-xs">
                                {item.deskripsi ? (
                                  <p className="text-slate-600 line-clamp-2">{item.deskripsi}</p>
                                ) : (
                                  <span className="italic text-slate-400">Belum diisi</span>
                                )}
                              </td>
                            )}

                            {adminCols.showVarian && (
                              <td className="py-3 px-4">
                                {item.varian && item.varian.length > 0 ? (
                                  <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[11px]">
                                    {item.varian.length} Varian
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                            )}

                            {adminCols.showHarga && (
                              <td className="py-3 px-4 font-extrabold text-emerald-700 whitespace-nowrap">
                                {formatRupiah(item.harga_mulai)}
                              </td>
                            )}

                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleTampilKatalog(item)}
                                disabled={isCardSaving}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                                  item.tampil_di_katalog
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-slate-200 text-slate-600 border border-slate-300'
                                }`}
                              >
                                {item.tampil_di_katalog ? (
                                  <>
                                    <Eye className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>Tampil</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Sembunyi</span>
                                  </>
                                )}
                              </button>
                            </td>

                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(item)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-300 rounded-xl font-bold transition cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Ubah</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">Produk Tidak Ditemukan</h3>
              <p className="text-xs text-slate-500">
                Coba ubah kata kunci pencarian atau tambah produk baru.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: KATEGORI PRODUK                                   */}
      {/* ======================================================== */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs h-fit space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-700" />
              <span>{editingCatId ? 'Ubah Nama Kategori' : 'Tambah Kategori Baru'}</span>
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Contoh: Spanduk & Banner"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Urut Tampil
                </label>
                <input
                  type="number"
                  value={catUrutan}
                  onChange={(e) => setCatUrutan(Number(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                {editingCatId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCatId(null);
                      setCatName('');
                      setCatUrutan(categories.length + 1);
                    }}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  {editingCatId ? 'Simpan Kategori' : '+ Tambah Kategori'}
                </button>
              </div>
            </form>
          </div>

          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <span className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                Daftar Kategori Produk ({categories.length})
              </span>
            </div>

            <div className="divide-y divide-slate-200">
              {categories.length > 0 ? (
                categories.map((cat) => {
                  const linkedCount = allItems.filter((i) => i.category_id === cat.id).length;
                  return (
                    <div
                      key={cat.id}
                      className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                          {cat.urutan}
                        </span>
                        <div>
                          <span className="font-bold text-sm text-slate-900 block">
                            {cat.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {linkedCount} produk di kategori ini
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCatId(cat.id);
                            setCatName(cat.name);
                            setCatUrutan(cat.urutan || 1);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          title="Ubah Kategori"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Hapus Kategori"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  Belum ada kategori produk. Silakan tambahkan di sebelah kiri.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: TAMPILAN KATALOG PELANGGAN (LIVE PREVIEW)         */}
      {/* ======================================================== */}
      {activeTab === 'preview' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {settings.logo_path ? (
                <img
                  src={settings.logo_path}
                  alt="Logo"
                  className="w-10 h-10 rounded-xl object-contain border border-slate-200 p-0.5"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              )}
              <div>
                <h2 className="font-extrabold text-base text-slate-900">
                  {storeSettings.storeName}
                </h2>
                <p className="text-xs text-slate-500">{settings.hero_message}</p>
              </div>
            </div>

            <a
              href={`https://wa.me/${settings.whatsapp_number}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hubungi WhatsApp</span>
            </a>
          </div>

          <div
            className="px-6 py-12 sm:py-16 text-white text-center space-y-2"
            style={getHeroBackgroundStyle()}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-[11px] font-bold uppercase tracking-wider">
              Katalog Produk & Layanan
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {settings.hero_message}
            </h1>
          </div>

          <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setPreviewCatId('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer shrink-0 transition ${
                previewCatId === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Semua Produk ({katalogViewRows.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setPreviewCatId(c.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer shrink-0 transition ${
                  previewCatId === c.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="p-6 bg-slate-50/40">
            <div
              className={
                settings.layout_mode === 'list'
                  ? 'space-y-4 max-w-4xl mx-auto'
                  : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'
              }
            >
              {katalogViewRows
                .filter(
                  (row) => previewCatId === 'ALL' || (row.category_id || '') === previewCatId
                )
                .map((row) => {
                  const waText = encodeURIComponent(
                    `Halo ${storeSettings.storeName}, saya ingin memesan *${row.name}* (Mulai ${formatRupiah(row.harga_mulai || 0)}).`
                  );
                  return (
                    <div
                      key={`${row.sumber}-${row.id}`}
                      className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex ${
                        settings.layout_mode === 'list'
                          ? 'flex-col sm:flex-row'
                          : 'flex-col justify-between'
                      }`}
                    >
                      <div
                        className={`bg-white border-b border-slate-100 relative overflow-hidden ${
                          settings.layout_mode === 'list'
                            ? 'sm:w-44 aspect-square shrink-0 sm:border-b-0 sm:border-r'
                            : 'aspect-square w-full'
                        }`}
                      >
                        {row.foto_path ? (
                          <img
                            src={row.foto_path}
                            alt={row.name}
                            className="w-full h-full object-contain bg-white"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                            <ImageIcon className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          {displayOptions.showCategoryBadge && (
                            <span className="text-[10px] font-bold uppercase text-emerald-700">
                              {row.category_id
                                ? categoryMap[row.category_id] || 'Umum'
                                : 'Umum'}
                            </span>
                          )}
                          <h3 className="font-bold text-base text-slate-900">{row.name}</h3>
                          {displayOptions.showDescription && row.deskripsi && (
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {row.deskripsi}
                            </p>
                          )}

                          {displayOptions.showVariants &&
                            row.varian &&
                            row.varian.length > 0 && (
                              <div className="pt-2 space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                  Pilihan Spesifikasi:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {row.varian.slice(0, 4).map((v, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium"
                                    >
                                      {[v.tipe, v.bahan, v.ukuran]
                                        .filter((x) => x && x !== '-')
                                        .join(' • ') || 'Standar'}{' '}
                                      {displayOptions.showPrice && v.harga
                                        ? `(${formatRupiah(v.harga)})`
                                        : ''}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>

                        {(displayOptions.showPrice || displayOptions.showOrderButton) && (
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            {displayOptions.showPrice ? (
                              <div>
                                <span className="text-[10px] text-slate-400 block">
                                  Harga Mulai
                                </span>
                                <span className="text-base font-black text-emerald-700">
                                  {formatRupiah(row.harga_mulai || 0)}
                                </span>
                              </div>
                            ) : (
                              <div />
                            )}

                            {displayOptions.showOrderButton && (
                              <a
                                href={`https://wa.me/${settings.whatsapp_number}?text=${waText}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Pesan Sekarang</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL SIMPEL: UBAH GAMBAR, DESKRIPSI & HARGA PRODUK      */}
      {/* ======================================================== */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 my-6">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base">
                {isNewItemMode ? 'Tambah Produk Katalog Baru' : `Ubah Produk: ${formName}`}
              </h3>
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveItemModal}
              className="p-6 max-h-[80vh] overflow-y-auto space-y-4 text-xs"
            >
              {/* Foto Produk */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <label className="font-bold text-slate-800 block">Foto Produk</label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-32 h-28 rounded-xl border border-slate-300 bg-white overflow-hidden shrink-0 flex items-center justify-center">
                    {formFotoPath ? (
                      <>
                        <img src={formFotoPath} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormFotoPath('')}
                          className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-md px-2 py-0.5 text-[10px] font-bold cursor-pointer"
                        >
                          Hapus
                        </button>
                      </>
                    ) : (
                      <div className="text-center text-slate-400">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-[10px]">Belum ada foto</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <input
                      ref={fotoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleUploadProductPhotoInModal}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fotoInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="w-full py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>
                        {isUploadingImage ? 'Sedang Mengunggah...' : 'Pilih & Upload Foto dari Komputer'}
                      </span>
                    </button>

                    <input
                      type="text"
                      value={formFotoPath}
                      onChange={(e) => setFormFotoPath(e.target.value)}
                      placeholder="Atau tempel link gambar (https://...)"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Nama & Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Produk / Layanan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Produk</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-800 bg-white"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Deskripsi Produk
                </label>
                <textarea
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                  rows={3}
                  placeholder="Tulis penjelasan produk, keunggulan bahan, ukuran, dll..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              {/* Harga / Varian */}
              {formSumber === 'inventory' ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harga Produk (Rp)</label>
                  <input
                    type="number"
                    value={formHargaMulai}
                    onChange={(e) => setFormHargaMulai(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-emerald-700"
                  />
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Daftar Pilihan Harga / Varian</span>
                    <span className="text-emerald-700 font-bold">
                      Mulai: {formatRupiah(formHargaMulai)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={varTipe}
                      onChange={(e) => setVarTipe(e.target.value)}
                      placeholder="Tipe (cth: Outdoor)"
                      className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={varBahan}
                      onChange={(e) => setVarBahan(e.target.value)}
                      placeholder="Bahan (cth: Flexi)"
                      className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                    />
                    <input
                      type="number"
                      value={varHarga}
                      onChange={(e) =>
                        setVarHarga(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder="Harga (Rp)"
                      className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleAddVarianRow}
                      className="px-3 py-1.5 bg-slate-800 text-white font-bold rounded-lg cursor-pointer"
                    >
                      + Tambah
                    </button>
                  </div>

                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {formVarian.map((v, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-200"
                      >
                        <span>
                          {[v.tipe, v.bahan, v.ukuran].filter((x) => x && x !== '-').join(' • ') ||
                            'Standar'}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-emerald-700">
                            {v.harga ? formatRupiah(v.harga) : 'Grosir'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const next = formVarian.filter((_, idx) => idx !== i);
                              setFormVarian(next);
                              const prices = next
                                .map((x) => Number(x.harga))
                                .filter((n) => n > 0);
                              setFormHargaMulai(prices.length > 0 ? Math.min(...prices) : 0);
                            }}
                            className="text-red-500 font-bold cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Checkbox Tampilkan di Katalog */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 cursor-pointer font-bold text-emerald-950">
                <input
                  type="checkbox"
                  checked={formTampil}
                  onChange={(e) => setFormTampil(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span>Tampilkan produk ini di Katalog Pelanggan</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
