import React, { useRef, useState } from 'react';
import { Printer, FileDown, Image as ImageIcon } from 'lucide-react';
import { Order, StoreSettings } from '../types';
import { formatHariTanggalIndo } from '../utils/format';
import { printElement, saveElementAsImage, saveElementAsPdf } from '../utils/printHelper';

interface KwitansiModalProps {
  order: Order | null;
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const KwitansiModal: React.FC<KwitansiModalProps> = ({
  order,
  settings,
  isOpen,
  onClose,
}) => {
  const kwitansiRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !order) return null;

  const isLunas = order.isLunas || order.status === 'Selesai';
  const dp = order.dp || 0;

  const itemsSubtotal =
    order.order_pesanan && order.order_pesanan.length > 0
      ? order.order_pesanan.reduce((acc, it) => acc + (it.totalHarga || 0), 0)
      : order.subtotalSebelumDiskon || order.grandtotalHarga;

  const totalBersih = order.grandtotalHarga > 0 ? order.grandtotalHarga : itemsSubtotal;
  const sisaPerluDibayarkan = isLunas ? 0 : Math.max(0, totalBersih - dp);
  const hariTanggalText = formatHariTanggalIndo(order.tanggalDibuat);

  const handlePrint = async () => {
    setIsProcessing(true);
    try {
      await printElement('kwitansi-print-area', {
        documentTitle: `Kwitansi-${order.id}`,
        type: 'kwitansi',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveKwitansi = async () => {
    setIsProcessing(true);
    try {
      await saveElementAsPdf('kwitansi-print-area', `Kwitansi-${order.id}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAsImage = async () => {
    setIsProcessing(true);
    try {
      await saveElementAsImage('kwitansi-print-area', `Kwitansi-${order.id}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(Math.round(num));
  };

  return (
    <div className="kwitansi-modal-backdrop fixed inset-0 z-50 flex flex-col items-center justify-start p-4 sm:p-6 bg-[#a5c8e4] overflow-y-auto min-h-screen">
      <div className="mb-4 no-print">
        <button
          onClick={onClose}
          className="px-8 py-2 bg-[#3498db] hover:bg-[#2980b9] text-white font-medium text-sm rounded shadow cursor-pointer"
        >
          Kembali
        </button>
      </div>

      <div
        ref={kwitansiRef}
        id="kwitansi-print-area"
        className="w-full max-w-[860px] bg-white rounded-xl shadow-xl p-8 text-slate-800 font-sans border border-slate-200"
      >
        <div className="pb-4 border-b-2 border-[#00a2e8] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase">{settings.storeName}</h2>
            <p className="text-xs text-slate-600">{settings.address}, {settings.city}</p>
            <p className="text-xs text-slate-600">WA Office: {settings.officePhone} • WA Online: {settings.onlinePhone}</p>
          </div>
          <div className="text-right">
            <span className="text-lg font-extrabold text-[#00a2e8] block">NOTA / KWITANSI</span>
            <span className="font-mono text-xs font-bold text-slate-700">{order.id}</span>
          </div>
        </div>

        <div className="py-3 flex flex-wrap items-start justify-between gap-4 text-xs font-bold text-slate-900 border-b border-slate-300">
          <div className="space-y-1.5 min-w-[240px]">
            <div className="flex items-center">
              <span className="w-24 font-bold shrink-0">Konsumen</span>
              <span className="mr-2">:</span>
              <span className="font-semibold uppercase">{order.nama}</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 font-bold shrink-0">No Telephon</span>
              <span className="mr-2">:</span>
              <span className="font-semibold font-mono">{order.nomor || '-'}</span>
            </div>
          </div>

          <div className="space-y-1.5 min-w-[260px]">
            <div className="flex items-center">
              <span className="w-28 font-bold shrink-0">Hari & Tanggal</span>
              <span className="mr-2">:</span>
              <span className="font-semibold">{hariTanggalText}</span>
            </div>
            <div className="flex items-center">
              <span className="w-28 font-bold shrink-0">Sales / Admin</span>
              <span className="mr-2">:</span>
              <span className="font-semibold">{order.penerima || 'Kasir Utama'}</span>
            </div>
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#00a2e8] text-white font-bold">
                <th className="py-2 px-2 text-center w-12">No</th>
                <th className="py-2 px-3 text-left">Nama Barang</th>
                <th className="py-2 px-2 text-center w-20">Jumlah</th>
                <th className="py-2 px-3 text-right w-28">Harga</th>
                <th className="py-2 px-3 text-center w-28">Ket.</th>
                <th className="py-2 px-3 text-right w-32">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(order.order_pesanan || []).map((item, idx) => (
                <tr key={idx} className="h-8 text-xs">
                  <td className="py-2 px-2 text-center">{idx + 1}</td>
                  <td className="py-2 px-3 font-semibold uppercase">{item.jenisLayanan}</td>
                  <td className="py-2 px-2 text-center">{item.jumlahPesanan} {item.satuan}</td>
                  <td className="py-2 px-3 text-right">{formatNumber(item.harga)}</td>
                  <td className="py-2 px-3 text-center">{item.detailukuran || '-'}</td>
                  <td className="py-2 px-3 text-right font-bold">Rp {formatNumber(item.totalHarga)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 flex items-start justify-between">
          <div
            className={`px-3 py-0.5 border-2 rounded text-xs font-bold inline-block uppercase ${
              isLunas ? 'border-[#27ae60] text-[#27ae60]' : 'border-[#e74c3c] text-[#e74c3c]'
            }`}
          >
            {isLunas ? 'Lunas' : 'Belum Lunas'}
          </div>

          <div className="text-right text-xs font-bold text-slate-900 space-y-1">
            <div className="text-sm font-extrabold">Total Bersih: Rp {formatNumber(totalBersih)}</div>
            {sisaPerluDibayarkan > 0 && (
              <div className="text-[#e74c3c]">Sisa Perlu Dibayar: Rp {formatNumber(sisaPerluDibayarkan)}</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 no-print pb-6">
        <button
          onClick={handlePrint}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#27ae60] text-white font-semibold text-xs rounded-lg cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Kwitansi</span>
        </button>

        <button
          onClick={handleSaveKwitansi}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2980b9] text-white font-semibold text-xs rounded-lg cursor-pointer"
        >
          <FileDown className="w-4 h-4" />
          <span>Save Kwitansi (PDF)</span>
        </button>

        <button
          onClick={handleSaveAsImage}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8e44ad] text-white font-semibold text-xs rounded-lg cursor-pointer"
        >
          <ImageIcon className="w-4 h-4" />
          <span>Save as Image (PNG)</span>
        </button>
      </div>
    </div>
  );
};
