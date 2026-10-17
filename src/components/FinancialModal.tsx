import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Swal from 'sweetalert2';
import { FinancialRecord, StockItem } from '../types';

interface FinancialModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit: FinancialRecord | null;
  stockItems: StockItem[];
  onSave: (recordData: any) => Promise<void>;
}

export const FinancialModal: React.FC<FinancialModalProps> = ({
  isOpen,
  onClose,
  recordToEdit,
  stockItems,
  onSave,
}) => {
  const [judul, setJudul] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [tipeTransaksi, setTipeTransaksi] = useState<'Pemasukan' | 'Pengeluaran'>('Pengeluaran');
  const [nominal, setNominal] = useState<number | ''>('');
  const [paymentStatus, setPaymentStatus] = useState('Lunas');
  const [notes, setNotes] = useState('');
  const [stockID, setStockID] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (recordToEdit) {
      setJudul(recordToEdit.judul);
      setTanggal(recordToEdit.tanggal);
      setTipeTransaksi(recordToEdit.tipeTransaksi);
      const val = recordToEdit.tipeTransaksi === 'Pemasukan' ? recordToEdit.pemasukan : recordToEdit.pengeluaran;
      setNominal(val);
      setPaymentStatus(recordToEdit.paymentStatus || 'Lunas');
      setNotes(recordToEdit.notes || '');
      setStockID(recordToEdit.stockID || '');
    } else {
      setJudul('');
      setTanggal(new Date().toISOString().split('T')[0]);
      setTipeTransaksi('Pengeluaran');
      setNominal('');
      setPaymentStatus('Lunas');
      setNotes('');
      setStockID('');
    }
  }, [recordToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !nominal || Number(nominal) <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Tidak Valid',
        text: 'Judul dan nominal transaksi wajib diisi!',
        confirmButtonColor: '#047857',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: recordToEdit?.id,
        judul: judul.trim(),
        tanggal,
        tipeTransaksi,
        price: Number(nominal),
        paymentStatus,
        notes: notes.trim() || '-',
        stockID: stockID || undefined,
      });
      onClose();
      Swal.fire({
        icon: 'success',
        title: recordToEdit ? 'Transaksi Diperbarui' : 'Transaksi Disimpan',
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan Transaksi',
        text: err?.message || String(err),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">
          <h3 className="font-semibold text-base">
            {recordToEdit ? 'Edit Transaksi Keuangan' : 'Tambah Transaksi Keuangan'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul Transaksi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Pembelian Tinta, Bayar Listrik"
              required
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal</label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Transaksi</label>
              <select
                value={tipeTransaksi}
                onChange={(e) => setTipeTransaksi(e.target.value as 'Pemasukan' | 'Pengeluaran')}
                className={`w-full px-3 py-2 border rounded-lg text-sm font-semibold focus:outline-hidden ${
                  tipeTransaksi === 'Pemasukan'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-red-50 border-red-300 text-red-800'
                }`}
              >
                <option value="Pengeluaran">Pengeluaran</option>
                <option value="Pemasukan">Pemasukan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nominal (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={nominal}
                onChange={(e) => setNominal(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                min={1}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status Pembayaran</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              >
                <option value="Lunas">Lunas</option>
                <option value="Belum Lunas">Belum Lunas</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hubungkan ke Stok (Opsional)
            </label>
            <select
              value={stockID}
              onChange={(e) => setStockID(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              <option value="">-- Tidak ada stok terkait --</option>
              {stockItems.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (Stok: {s.stock} {s.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi / Keterangan</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
