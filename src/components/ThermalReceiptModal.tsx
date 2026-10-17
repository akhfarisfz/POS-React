import React, { useRef, useState, useEffect } from 'react';
import { Printer, X, Copy, Check, Image as ImageIcon, FileDown, Sparkles } from 'lucide-react';
import { Order, StoreSettings } from '../types';
import { formatRupiah, formatDateFullIndo } from '../utils/format';
import {
  saveElementAsImage,
  saveElementAsPdf,
  printThermalPureImage,
  THERMAL_FONT,
  getThermalLayout,
} from '../utils/printHelper';

interface ThermalReceiptModalProps {
  order: Order | null;
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  order,
  settings,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>(
    settings.printerPaperWidth || '58mm'
  );
  const [heightMode, setHeightMode] = useState<'auto' | 'custom'>('auto');
  const [customHeightMm, setCustomHeightMm] = useState<number>(120);
  const [measuredHeightMm, setMeasuredHeightMm] = useState<number>(120);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (settings.printerPaperWidth) {
      setPaperWidth(settings.printerPaperWidth);
    }
  }, [settings.printerPaperWidth]);

  useEffect(() => {
    const el = receiptRef.current;
    if (!isOpen || !el) return;
    const measure = () => {
      const hPx = Math.max(el.scrollHeight, el.getBoundingClientRect().height);
      const mm = Math.max(45, Math.ceil(hPx * 0.264583) + 6);
      setMeasuredHeightMm(mm);
      if (heightMode === 'auto') setCustomHeightMm(mm);
    };
    measure();
  }, [isOpen, order, paperWidth, heightMode]);

  if (!isOpen || !order) return null;

  const now = new Date();
  const printTimeFormatted = now.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isLunas = order.isLunas || order.status === 'Selesai';
  const dp = order.dp || 0;

  const itemsSubtotal =
    order.order_pesanan && order.order_pesanan.length > 0
      ? order.order_pesanan.reduce((acc, it) => acc + (it.totalHarga || 0), 0)
      : order.subtotalSebelumDiskon || order.grandtotalHarga;

  const diskonMemberNominal = Number(order.diskonMemberNominal) || 0;
  const diskonRegulerNominal = Number(order.diskonRegulerNominal) || 0;
  const totalDiskon = diskonMemberNominal + diskonRegulerNominal;
  const totalBersih = order.grandtotalHarga > 0 ? order.grandtotalHarga : Math.max(0, itemsSubtotal - totalDiskon);
  const sisaPerluDibayar = isLunas ? 0 : Math.max(0, totalBersih - dp);

  const effectiveHeightMm = heightMode === 'auto' ? measuredHeightMm : customHeightMm;
  const L = getThermalLayout(paperWidth);

  const handlePrintPure = async () => {
    setIsProcessing(true);
    try {
      await printThermalPureImage('thermal-receipt-content', paperWidth, effectiveHeightMm);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAsImage = async () => {
    setIsProcessing(true);
    try {
      await saveElementAsImage('thermal-receipt-content', `Struk-${order.id}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAsPdf = async () => {
    setIsProcessing(true);
    try {
      const widthVal = paperWidth === '80mm' ? 80 : 58;
      await saveElementAsPdf('thermal-receipt-content', `Struk-${order.id}`, 'p', [widthVal, effectiveHeightMm]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyText = () => {
    if (!receiptRef.current) return;
    navigator.clipboard.writeText(receiptRef.current.innerText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-8">
        <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-base">Cetak Struk Thermal ({paperWidth})</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex rounded-lg bg-slate-200 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setPaperWidth('58mm')}
              className={`px-2.5 py-1 font-bold rounded-md cursor-pointer ${
                paperWidth === '58mm' ? 'bg-emerald-700 text-white' : 'text-slate-700'
              }`}
            >
              58mm
            </button>
            <button
              type="button"
              onClick={() => setPaperWidth('80mm')}
              className={`px-2.5 py-1 font-bold rounded-md cursor-pointer ${
                paperWidth === '80mm' ? 'bg-emerald-700 text-white' : 'text-slate-700'
              }`}
            >
              80mm
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
            <button
              onClick={handleSaveAsImage}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Gambar (WA)</span>
            </button>
            <button
              onClick={handleSaveAsPdf}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>PDF Struk</span>
            </button>
          </div>
        </div>

        <div className="p-6 bg-slate-200/80 flex justify-center items-start max-h-[60vh] overflow-y-auto">
          <div
            ref={receiptRef}
            id="thermal-receipt-content"
            className="bg-white shadow-sm border-0 text-black shrink-0"
            style={{
              width: `${L.boxMm}mm`,
              padding: `2mm ${L.padMm}mm 2mm`,
              fontSize: `${L.fontPx}px`,
              fontFamily: THERMAL_FONT,
              lineHeight: 1.25,
            }}
          >
            <div className="text-center pb-1.5 border-b border-dashed border-black">
              <h4 className="font-bold text-[15px] uppercase">{settings.storeName}</h4>
              <p className="text-[10px] mt-0.5">{settings.address}, {settings.city}</p>
              <p className="text-[10px]">WA: {settings.onlinePhone}</p>
            </div>

            <div className="py-1.5 border-b border-dashed border-black text-[11px]">
              <div className="flex justify-between"><span>No. Nota:</span><span className="font-bold">{order.id}</span></div>
              <div className="flex justify-between"><span>Pelanggan:</span><span className="font-bold">{order.nama}</span></div>
              <div className="flex justify-between"><span>Tanggal:</span><span>{formatDateFullIndo(order.tanggalDibuat)}</span></div>
              <div className="flex justify-between"><span>Dicetak:</span><span>{printTimeFormatted}</span></div>
            </div>

            <div className="py-1.5 border-b border-dashed border-black space-y-1">
              {(order.order_pesanan || []).map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between font-bold text-[12px]">
                    <span>{item.jenisLayanan}</span>
                    <span>{formatRupiah(item.totalHarga)}</span>
                  </div>
                  <div className="text-[10px]">
                    {item.jumlahPesanan} {item.satuan} x {formatRupiah(item.harga)}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-1.5 text-[11px]">
              <div className="flex justify-between font-bold text-[14px]">
                <span>Total:</span>
                <span>{formatRupiah(totalBersih)}</span>
              </div>
              {dp > 0 && sisaPerluDibayar > 0 && (
                <div className="flex justify-between font-bold text-[12px]">
                  <span>Sisa Bayar:</span>
                  <span>{formatRupiah(sisaPerluDibayar)}</span>
                </div>
              )}
            </div>

            <div className="text-center mt-2 pt-1.5 border-t border-dashed border-black text-[10px]">
              <p className="font-bold">Terima kasih atas kunjungannya</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-600">
            Tutup
          </button>
          <button
            onClick={handlePrintPure}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Cetak Thermal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
