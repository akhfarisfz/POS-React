import React from 'react';
import { X, Package, Ruler, Layers } from 'lucide-react';
import { Order, OrderItem } from '../types';
import { formatRupiah, formatDateIndo, getOrderStatusBadgeStyle } from '../utils/format';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const items: OrderItem[] = order.order_pesanan || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700/80 flex items-center justify-center text-white">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Detail Item Pesanan</h3>
                <span className="font-mono text-xs font-bold bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-slate-700">
                  {order.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Rincian lengkap jenis layanan, spesifikasi bahan, ukuran & biaya
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Pelanggan</span>
            <span className="font-semibold text-slate-800 truncate block">{order.nama}</span>
            <span className="text-[11px] text-slate-500 font-mono">{order.nomor}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Status Order</span>
            {(() => {
              const style = getOrderStatusBadgeStyle(order.status);
              return (
                <span className={`inline-flex items-center gap-1.5 mt-0.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${style.bg} ${style.text} ${style.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                  <span>{order.status}</span>
                </span>
              );
            })()}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Deadline</span>
            <span className="font-medium text-slate-700">{formatDateIndo(order.tanggalDeadline)}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Biaya</span>
            <span className="font-bold text-emerald-700 text-sm">{formatRupiah(order.grandtotalHarga)}</span>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {items.length === 0 ? (
            <div className="text-center py-8 text-slate-400 italic text-sm">
              Tidak ada rincian item pesanan untuk order ini.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id || index}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{item.jenisLayanan}</h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 pl-7">
                        {item.detailLayanan_1 && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                            {item.detailLayanan_1}
                          </span>
                        )}
                        {item.detailBahan && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                            Bahan: {item.detailBahan}
                          </span>
                        )}
                        {item.detailukuran && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                            Ukuran: {item.detailukuran}
                          </span>
                        )}
                        {item.finishing && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                            Finishing: {item.finishing}
                          </span>
                        )}
                        {item.panjang && item.lebar ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                            <Ruler className="w-3 h-3" />
                            <span>{item.panjang} x {item.lebar} cm</span>
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs text-slate-500">
                        {item.jumlahPesanan} {item.satuan} × {formatRupiah(item.harga || 0)}
                      </div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">
                        {formatRupiah(item.totalHarga)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Total Item: <span className="font-bold text-slate-800">{items.length} jenis</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
