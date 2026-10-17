import React from 'react';
import { formatRupiah } from '../utils/format';

interface MonthlyDataItem {
  monthKey: string;
  monthLabel: string;
  pemasukan: number;
  pengeluaran: number;
  laba: number;
}

interface FinancialChartProps {
  data: MonthlyDataItem[];
}

export const FinancialChart: React.FC<FinancialChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
        Belum ada data keuangan untuk periode yang dipilih
      </div>
    );
  }

  const maxVal = Math.max(
    ...data.flatMap((d) => [d.pemasukan, d.pengeluaran, Math.abs(d.laba)]),
    1000000
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-xs font-semibold">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-emerald-700"></span>
          <span className="text-slate-700">Pendapatan / Pemasukan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-rose-700"></span>
          <span className="text-slate-700">Pengeluaran</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-blue-700"></span>
          <span className="text-slate-700">Laba Bersih</span>
        </div>
      </div>

      <div className="h-64 pt-6 pb-2 px-2 flex items-end justify-between gap-3 overflow-x-auto border-b border-slate-200">
        {data.map((item, idx) => {
          const pemasukanHeight = Math.min(100, Math.max(4, (item.pemasukan / maxVal) * 100));
          const pengeluaranHeight = Math.min(100, Math.max(4, (item.pengeluaran / maxVal) * 100));
          const labaHeight = Math.min(100, Math.max(4, (Math.abs(item.laba) / maxVal) * 100));

          return (
            <div key={idx} className="flex-1 min-w-[70px] max-w-[120px] flex flex-col items-center gap-2 group relative">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 z-20 bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-lg whitespace-nowrap min-w-[140px]">
                <div className="font-bold border-b border-slate-700 pb-1 mb-1">{item.monthLabel}</div>
                <div className="text-emerald-400">Pemasukan: {formatRupiah(item.pemasukan)}</div>
                <div className="text-rose-400">Pengeluaran: {formatRupiah(item.pengeluaran)}</div>
                <div className="text-blue-300 font-bold">Laba: {formatRupiah(item.laba)}</div>
              </div>

              <div className="w-full flex items-end justify-center gap-1 h-48 bg-slate-50/60 rounded-t-md p-1">
                <div
                  style={{ height: `${pemasukanHeight}%` }}
                  className="w-1/3 bg-emerald-700 hover:bg-emerald-800 rounded-t-xs transition-all duration-300 relative"
                  title={`Pemasukan: ${formatRupiah(item.pemasukan)}`}
                />
                <div
                  style={{ height: `${pengeluaranHeight}%` }}
                  className="w-1/3 bg-rose-700 hover:bg-rose-800 rounded-t-xs transition-all duration-300 relative"
                  title={`Pengeluaran: ${formatRupiah(item.pengeluaran)}`}
                />
                <div
                  style={{ height: `${labaHeight}%` }}
                  className={`w-1/3 rounded-t-xs transition-all duration-300 relative ${
                    item.laba >= 0 ? 'bg-blue-700 hover:bg-blue-800' : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                  title={`Laba: ${formatRupiah(item.laba)}`}
                />
              </div>

              <span className="text-[11px] font-semibold text-slate-600 truncate w-full text-center">
                {item.monthLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
