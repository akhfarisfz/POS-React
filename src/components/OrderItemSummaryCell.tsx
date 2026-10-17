import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { Order, OrderItem } from '../types';
import { formatRupiah } from '../utils/format';

interface OrderItemSummaryCellProps {
  order: Order;
  onOpenDetail: (order: Order) => void;
}

export const OrderItemSummaryCell: React.FC<OrderItemSummaryCellProps> = ({ order, onOpenDetail }) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const items: OrderItem[] = order.order_pesanan || [];

  if (items.length === 0) {
    return <span className="text-slate-400 italic text-xs">-</span>;
  }

  const formattedItems = items.map((p) => {
    const details = [
      p.detailLayanan_1,
      p.panjang && p.lebar ? `${p.panjang}x${p.lebar}cm` : null,
      `${p.jumlahPesanan} ${p.satuan}`,
      formatRupiah(p.totalHarga),
    ]
      .filter(Boolean)
      .join(', ');

    return `${p.jenisLayanan} (${details})`;
  });

  const fullText = formattedItems.join('; ');
  const isOverLimit = fullText.length > 90;
  const displayText = isOverLimit ? `${fullText.slice(0, 90)}..` : fullText;

  return (
    <div
      className="relative group inline-block max-w-sm text-xs"
      onMouseEnter={() => setIsTooltipOpen(true)}
      onMouseLeave={() => setIsTooltipOpen(false)}
    >
      <div className="flex flex-col gap-1 items-start">
        <p className="text-slate-700 leading-snug break-words">
          <span className="font-medium text-slate-800">{displayText}</span>
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(order);
          }}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 transition-colors cursor-pointer"
        >
          <Info className="w-3 h-3" />
          <span>Detail Pesanan ({items.length} item)</span>
        </button>
      </div>

      {isTooltipOpen && (
        <div
          role="tooltip"
          className="absolute left-0 top-full mt-1.5 z-40 w-72 sm:w-80 p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 text-xs pointer-events-none"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="font-bold text-emerald-400">Rincian Item ({items.length})</span>
            <span className="text-[10px] text-slate-400">ID: {order.id}</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {items.map((p, idx) => (
              <div key={idx} className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                <div className="flex items-center justify-between font-semibold text-slate-100">
                  <span className="truncate mr-1">• {p.jenisLayanan}</span>
                  <span className="text-emerald-400 font-mono text-[11px]">
                    {formatRupiah(p.totalHarga)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5 space-x-1">
                  {p.detailLayanan_1 && <span>{p.detailLayanan_1}</span>}
                  {p.panjang && p.lebar && <span>| {p.panjang}x{p.lebar}cm</span>}
                  <span>| {p.jumlahPesanan} {p.satuan}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
