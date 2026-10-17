import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  UserCheck,
  Ruler,
  Calculator,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Order, OrderItem, Service, StockItem, Member } from '../types';
import {
  formatRupiah,
  roundToNearestFive,
  customRound,
  ensureISODate,
  getTodayISODate,
} from '../utils/format';
import { Select2Service } from './Select2Service';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderToEdit: Order | null;
  services: Service[];
  stockItems: StockItem[];
  members: Member[];
  currentUserName: string;
  onSave: (orderData: any) => Promise<void>;
}

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  isOpen,
  onClose,
  orderToEdit,
  services,
  members,
  currentUserName,
  onSave,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [orderDate, setOrderDate] = useState(getTodayISODate());
  const [deadlineDate, setDeadlineDate] = useState(getTodayISODate());
  const [receiver, setReceiver] = useState(currentUserName || 'Kasir');
  const [note, setNote] = useState('');
  const [isLunas, setIsLunas] = useState(false);
  const [dp, setDp] = useState<number>(0);

  const [isMemberActive, setIsMemberActive] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberPotonganPersen, setMemberPotonganPersen] = useState<number>(10);

  const [diskonRegulerType, setDiskonRegulerType] = useState<'nominal' | 'persen'>('nominal');
  const [diskonRegulerValue, setDiskonRegulerValue] = useState<number>(0);

  const [cartServices, setCartServices] = useState<OrderItem[]>([]);

  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedTipe, setSelectedTipe] = useState('');
  const [selectedBahan, setSelectedBahan] = useState('');
  const [selectedUkuran, setSelectedUkuran] = useState('');
  const [useDimensions, setUseDimensions] = useState(false);
  const [panjang, setPanjang] = useState<number | ''>('');
  const [lebar, setLebar] = useState<number | ''>('');
  const [finishing, setFinishing] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [satuan, setSatuan] = useState('pcs');
  const [baseHarga, setBaseHarga] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLockRef = useRef(false);

  useEffect(() => {
    if (orderToEdit) {
      setCustomerName(orderToEdit.nama);
      setCustomerNumber(orderToEdit.nomor);
      setOrderDate(ensureISODate(orderToEdit.tanggalDibuat));
      setDeadlineDate(ensureISODate(orderToEdit.tanggalDeadline || orderToEdit.tanggalDibuat));
      setReceiver(orderToEdit.penerima || currentUserName);
      setNote(orderToEdit.note || '');
      setIsLunas(orderToEdit.isLunas);
      setDp(orderToEdit.dp || 0);
      setCartServices(orderToEdit.order_pesanan || []);
    } else {
      setCustomerName('');
      setCustomerNumber('');
      const todayISO = getTodayISODate();
      setOrderDate(todayISO);
      setDeadlineDate(todayISO);
      setReceiver(currentUserName || 'Kasir');
      setNote('');
      setIsLunas(false);
      setDp(0);
      setIsMemberActive(false);
      setSelectedMember(null);
      setCartServices([]);
      setSelectedServiceId('');
      setQuantity(1);
      setBaseHarga(0);
    }
  }, [orderToEdit, isOpen, currentUserName]);

  const activeService = useMemo(() => {
    return services.find((s) => s.id === selectedServiceId) || null;
  }, [services, selectedServiceId]);

  useEffect(() => {
    if (!activeService || !activeService.service_detail || activeService.service_detail.length === 0) {
      setBaseHarga(0);
      return;
    }
    const first = activeService.service_detail[0];
    setBaseHarga(Number(first.harga) || 20000);
  }, [activeService]);

  const p = Number(panjang) || 0;
  const l = Number(lebar) || 0;
  const rawLuas = useDimensions && p > 0 && l > 0 ? (roundToNearestFive(p) * roundToNearestFive(l)) / 10000 : 1;
  const luasDibulatkan = customRound(rawLuas);
  const currentItemTotal = quantity * baseHarga * (useDimensions && p > 0 && l > 0 ? luasDibulatkan : 1);

  const handleAddServiceToCart = () => {
    if (!activeService || baseHarga <= 0) return;
    const newItem: OrderItem = {
      id: `item-${Date.now()}`,
      jenisLayanan: activeService.name,
      detailLayanan_1: selectedTipe || undefined,
      detailBahan: selectedBahan || undefined,
      detailukuran: selectedUkuran || undefined,
      jumlahPesanan: quantity,
      harga: baseHarga,
      satuan: satuan || 'pcs',
      panjang: useDimensions && p > 0 ? p : undefined,
      lebar: useDimensions && l > 0 ? l : undefined,
      finishing: finishing || undefined,
      luas: useDimensions && p > 0 && l > 0 ? luasDibulatkan : 1,
      totalHarga: currentItemTotal,
    };
    setCartServices([...cartServices, newItem]);
    setSelectedServiceId('');
    setQuantity(1);
  };

  const subtotalBeforeDiscount = useMemo(() => {
    return cartServices.reduce((acc, item) => acc + item.totalHarga, 0);
  }, [cartServices]);

  const diskonMemberAmount = isMemberActive
    ? Math.round(subtotalBeforeDiscount * (memberPotonganPersen / 100))
    : 0;

  const diskonRegulerAmount =
    diskonRegulerType === 'persen'
      ? Math.round(subtotalBeforeDiscount * (diskonRegulerValue / 100))
      : diskonRegulerValue;

  const totalDiscount = diskonMemberAmount + diskonRegulerAmount;
  const grandTotal = Math.max(0, subtotalBeforeDiscount - totalDiscount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLockRef.current || isSubmitting || cartServices.length === 0) return;

    submitLockRef.current = true;
    setIsSubmitting(true);
    try {
      await onSave({
        nama: customerName.trim(),
        nomor: customerNumber.trim(),
        tanggalDibuat: ensureISODate(orderDate),
        tanggalDeadline: ensureISODate(deadlineDate || orderDate),
        penerima: receiver.trim(),
        note: note.trim(),
        status: orderToEdit ? orderToEdit.status : 'Dalam Proses',
        isLunas,
        dp: isLunas ? 0 : dp,
        isMember: isMemberActive,
        memberPotonganPersen: isMemberActive ? memberPotonganPersen : 0,
        diskonMemberNominal: diskonMemberAmount,
        diskonRegulerNominal: diskonRegulerAmount,
        subtotalSebelumDiskon: subtotalBeforeDiscount,
        diskonType: diskonRegulerType,
        potongan: totalDiscount,
        grandtotalHarga: grandTotal,
        pesanan: cartServices,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
      submitLockRef.current = false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-6">
        <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>{orderToEdit ? 'Edit Order Percetakan' : 'Buat Order Kasir Baru'}</span>
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Pelanggan *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor HP (WA) *</label>
              <input
                type="tel"
                value={customerNumber}
                onChange={(e) => setCustomerNumber(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Dibuat</label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Deadline</label>
              <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-600/30 bg-emerald-50/20 space-y-3">
            <label className="text-xs font-bold text-slate-800 block">Pilih Layanan Percetakan</label>
            <Select2Service
              services={services}
              selectedServiceId={selectedServiceId}
              onSelectService={(id) => setSelectedServiceId(id)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Qty</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  min={1}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Satuan</label>
                <input
                  type="text"
                  value={satuan}
                  onChange={(e) => setSatuan(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Harga Satuan</label>
                <input
                  type="number"
                  value={baseHarga || ''}
                  onChange={(e) => setBaseHarga(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleAddServiceToCart}
                className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg h-[40px] cursor-pointer"
              >
                + Tambah ({formatRupiah(currentItemTotal)})
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 font-semibold">
                <tr>
                  <th className="p-3">Layanan</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Harga</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {cartServices.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-bold">{item.jenisLayanan}</td>
                    <td className="p-3 text-center">{item.jumlahPesanan} {item.satuan}</td>
                    <td className="p-3 text-right">{formatRupiah(item.harga)}</td>
                    <td className="p-3 text-right font-bold">{formatRupiah(item.totalHarga)}</td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => setCartServices(cartServices.filter((_, i) => i !== idx))}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <div className="text-sm font-bold text-emerald-700">
              Total Pembayaran: {formatRupiah(grandTotal)}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-slate-600">
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || cartServices.length === 0}
                className="px-6 py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Simpan Order
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
