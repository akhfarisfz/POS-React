import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Swal from 'sweetalert2';
import { Member } from '../types';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit: Member | null;
  onSave: (memberData: any) => Promise<void>;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  memberToEdit,
  onSave,
}) => {
  const [nama, setNama] = useState('');
  const [nomor, setNomor] = useState('');
  const [alamat, setAlamat] = useState('');
  const [status, setStatus] = useState(true);
  const [potongan, setPotongan] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (memberToEdit) {
      setNama(memberToEdit.nama);
      setNomor(memberToEdit.nomor);
      setAlamat(memberToEdit.alamat || '');
      setStatus(memberToEdit.status);
      setPotongan(memberToEdit.potongan || 0);
    } else {
      setNama('');
      setNomor('');
      setAlamat('');
      setStatus(true);
      setPotongan(10);
    }
  }, [memberToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !nomor.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Belum Lengkap',
        text: 'Nama dan nomor telepon (WA) member harus diisi!',
        confirmButtonColor: '#047857',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: memberToEdit?.id,
        nama: nama.trim(),
        nomor: nomor.trim(),
        alamat: alamat.trim(),
        status,
        potongan: Number(potongan) || 0,
      });
      onClose();
      Swal.fire({
        icon: 'success',
        title: memberToEdit ? 'Member Diperbarui' : 'Member Ditambahkan',
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan Member',
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
          <h3 className="font-semibold text-base">{memberToEdit ? 'Edit Member' : 'Tambah Member Baru'}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {memberToEdit ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs flex items-center justify-between">
              <span className="text-emerald-800 font-medium">Kode Member:</span>
              <span className="font-mono font-bold text-xs text-emerald-950 bg-white px-2 py-1 rounded border border-emerald-300">
                {memberToEdit.id}
              </span>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-600 flex items-center justify-between">
              <span className="text-slate-500">Format Kode:</span>
              <span className="font-mono font-bold text-xs text-slate-800">MEMBER-DDMMYYYYXXXX</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Member / Pelanggan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              required
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Telepon / WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={nomor}
              onChange={(e) => setNomor(e.target.value.replace(/\D/g, ''))}
              placeholder="Contoh: 081234567890"
              required
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat (Opsional)</label>
            <input
              type="text"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder="Alamat lengkap atau domisili"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status Keanggotaan</label>
              <select
                value={status ? 'true' : 'false'}
                onChange={(e) => setStatus(e.target.value === 'true')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              >
                <option value="true">Member Aktif ⭐</option>
                <option value="false">Non-Member Biasa</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Diskon Khusus (%)</label>
              <input
                type="number"
                value={potongan}
                onChange={(e) => setPotongan(Number(e.target.value) || 0)}
                min={0}
                max={100}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
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
              {isSubmitting ? 'Menyimpan...' : 'Simpan Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
