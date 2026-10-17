import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Swal from 'sweetalert2';
import { Vendor } from '../types';

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorToEdit: Vendor | null;
  onSave: (vendorData: any) => Promise<void>;
}

export const VendorModal: React.FC<VendorModalProps> = ({
  isOpen,
  onClose,
  vendorToEdit,
  onSave,
}) => {
  const [vendorName, setVendorName] = useState('');
  const [kontakVendor, setKontakVendor] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (vendorToEdit) {
      setVendorName(vendorToEdit.vendorName);
      setKontakVendor(vendorToEdit.kontak_vendor);
      setAddress(vendorToEdit.address || '');
      setNotes(vendorToEdit.notes || '');
    } else {
      setVendorName('');
      setKontakVendor('');
      setAddress('');
      setNotes('');
    }
  }, [vendorToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim() || !kontakVendor.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Belum Lengkap',
        text: 'Nama dan kontak vendor wajib diisi!',
        confirmButtonColor: '#047857',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        vendorName: vendorName.trim(),
        kontak_vendor: kontakVendor.trim(),
        address: address.trim(),
        notes: notes.trim(),
      };
      if (vendorToEdit?.id) {
        payload.id = vendorToEdit.id;
      }
      await onSave(payload);
      onClose();
      Swal.fire({
        icon: 'success',
        title: vendorToEdit ? 'Vendor Diperbarui' : 'Vendor Ditambahkan',
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan Vendor',
        text: err?.message || String(err),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">
          <h3 className="font-semibold text-base">{vendorToEdit ? 'Edit Vendor' : 'Tambah Vendor Baru'}</h3>
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
              Nama Vendor / Perusahaan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="Contoh: PT Sumber Kertas Abadi"
              required
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Telepon / Kontak <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={kontakVendor}
              onChange={(e) => setKontakVendor(e.target.value)}
              placeholder="Contoh: 08123456789"
              required
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Kantor / Gudang</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Alamat lengkap supplier"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Keterangan / Catatan Tambahan</label>
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
              {isSubmitting ? 'Menyimpan...' : 'Simpan Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
