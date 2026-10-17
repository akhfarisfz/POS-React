import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import { StockItem, Vendor } from '../types';

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit: StockItem | null;
  vendors: Vendor[];
  onSave: (itemData: any) => Promise<void>;
  onQuickAddVendor: (vendor: {
    vendorName: string;
    kontak_vendor: string;
    address?: string;
    notes?: string;
  }) => Promise<Vendor>;
}

export const StockModal: React.FC<StockModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
  vendors,
  onSave,
  onQuickAddVendor,
}) => {
  const [name, setName] = useState('');
  const [stock, setStock] = useState<number | ''>('');
  const [unit, setUnit] = useState('meter');
  const [price, setPrice] = useState<number | ''>('');
  const [vendorId, setVendorId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showAddVendor, setShowAddVendor] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorContact, setNewVendorContact] = useState('');
  const [isAddingVendor, setIsAddingVendor] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setStock(itemToEdit.stock);
      setUnit(itemToEdit.unit);
      setPrice(itemToEdit.price);
      setVendorId(itemToEdit.vendor || '');
    } else {
      setName('');
      setStock('');
      setUnit('meter');
      setPrice('');
      setVendorId('');
    }
    setShowAddVendor(false);
    setNewVendorName('');
    setNewVendorContact('');
  }, [itemToEdit, isOpen]);

  const handleQuickAddVendor = async () => {
    if (!newVendorName.trim() || !newVendorContact.trim()) return;
    setIsAddingVendor(true);
    try {
      const added = await onQuickAddVendor({
        vendorName: newVendorName.trim(),
        kontak_vendor: newVendorContact.trim(),
        address: '',
        notes: '',
      });
      setVendorId(added.id);
      setShowAddVendor(false);
      setNewVendorName('');
      setNewVendorContact('');
    } finally {
      setIsAddingVendor(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || stock === '' || Number(stock) < 0) return;

    setIsSubmitting(true);
    try {
      await onSave({
        id: itemToEdit?.id,
        name: name.trim(),
        stock: Number(stock),
        unit: unit.trim() || 'pcs',
        price: Number(price) || 0,
        vendor: vendorId || undefined,
      });
      onClose();
      Swal.fire({
        icon: 'success',
        title: itemToEdit ? 'Stok Diperbarui' : 'Stok Ditambahkan',
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
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">
          <h3 className="font-semibold text-base">{itemToEdit ? 'Edit Stok Barang' : 'Tambah Stok Barang Baru'}</h3>
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
              Nama Produk / Bahan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Flexi Frontlite 280g"
              required
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stok Saat Ini <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                min={0}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Satuan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="meter, rim, roll, pack"
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Harga Keseluruhan / Modal (Rp)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Contoh: 1500000"
              min={0}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Vendor / Pemasok</label>
              <button
                type="button"
                onClick={() => setShowAddVendor(!showAddVendor)}
                className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                {showAddVendor ? 'Batal Tambah' : '+ Vendor Baru'}
              </button>
            </div>

            <select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              <option value="">-- Tanpa Vendor / Pilih Nanti --</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vendorName} ({v.kontak_vendor})
                </option>
              ))}
            </select>
          </div>

          {showAddVendor && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-300 space-y-2.5">
              <h5 className="text-xs font-bold text-slate-800">Tambah Vendor Cepat</h5>
              <input
                type="text"
                value={newVendorName}
                onChange={(e) => setNewVendorName(e.target.value)}
                placeholder="Nama Vendor"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
              />
              <input
                type="text"
                value={newVendorContact}
                onChange={(e) => setNewVendorContact(e.target.value)}
                placeholder="Kontak / No HP Vendor"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
              />
              <button
                type="button"
                onClick={handleQuickAddVendor}
                disabled={isAddingVendor}
                className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold cursor-pointer"
              >
                {isAddingVendor ? 'Menyimpan...' : 'Simpan Vendor Ini'}
              </button>
            </div>
          )}

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
              {isSubmitting ? 'Menyimpan...' : 'Simpan Stok'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
