import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Sparkles,
  Printer,
  Edit,
  Trash2,
  ArrowRight,
  LayoutGrid,
  Table as TableIcon,
  Image as ImageIcon,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Service, StockItem } from '../types';
import { formatRupiah } from '../utils/format';
import { DataTable, Column } from './DataTable';

interface ServicesViewProps {
  services: Service[];
  stockItems: StockItem[];
  onAddService: () => void;
  onEditService: (service: Service) => void;
  onDeleteService: (serviceId: string) => Promise<void>;
  onQuickOrder: (service: Service) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  services,
  onAddService,
  onEditService,
  onDeleteService,
  onQuickOrder,
}) => {
  const [viewMode, setViewMode] = useState<'luxury_grid' | 'table'>('luxury_grid');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services;
    const q = searchQuery.toLowerCase();
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.deskripsi || '').toLowerCase().includes(q)
    );
  }, [services, searchQuery]);

  const serviceColumns: Column<Service>[] = [
    {
      key: 'foto_path',
      header: 'Gambar',
      sortable: false,
      render: (row) => (
        <div className="w-14 h-12 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center">
          {row.foto_path ? (
            <img src={row.foto_path} alt={row.name} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-4 h-4 text-slate-400" />
          )}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Nama Layanan & Deskripsi',
      sortable: true,
      render: (row) => (
        <div className="max-w-xs">
          <span className="font-bold text-slate-900 text-sm block">{row.name}</span>
          {row.deskripsi ? (
            <span className="text-xs text-slate-500 line-clamp-2 mt-0.5 block">
              {row.deskripsi}
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 italic">Belum ada deskripsi</span>
          )}
        </div>
      ),
    },
    {
      key: 'service_detail',
      header: 'Spesifikasi & Harga',
      render: (row) => (
        <div className="space-y-1">
          {(row.service_detail || []).map((d, i) => (
            <div key={i} className="text-xs text-slate-700">
              {d.tipe} • {d.bahan} • {d.harga ? formatRupiah(d.harga) : 'Grosir'}
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'aksi',
      header: 'Aksi',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onQuickOrder(row)}
            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-md border border-emerald-200 cursor-pointer"
          >
            Pesan
          </button>
          <button
            onClick={() => onEditService(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
            title="Edit Layanan, Gambar & Deskripsi"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteService(row.id)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MASTER LAYANAN POS & KATALOG</span>
          </div>
          <h2 className="text-2xl font-black">Jenis Layanan Percetakan</h2>
          <p className="text-xs text-slate-300 mt-1">
            Kelola spesifikasi cetak, harga, gambar produk, serta deskripsi layanan yang juga tampil di Katalog.
          </p>
        </div>

        <button
          onClick={onAddService}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Layanan Baru</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau deskripsi layanan..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
          />
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setViewMode('luxury_grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer ${
              viewMode === 'luxury_grid' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer ${
              viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Tabel</span>
          </button>
        </div>
      </div>

      {viewMode === 'luxury_grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between"
            >
              <div>
                {/* Gambar Layanan (`foto_path`) */}
                <div className="relative h-44 bg-slate-100 border-b border-slate-100 overflow-hidden group">
                  {service.foto_path ? (
                    <img
                      src={service.foto_path}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1">
                      <ImageIcon className="w-7 h-7 text-slate-300" />
                      <span className="text-[11px]">Belum ada gambar</span>
                    </div>
                  )}

                  <span
                    className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs ${
                      service.tampil_di_katalog !== false
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800/80 text-slate-200'
                    }`}
                  >
                    {service.tampil_di_katalog !== false ? (
                      <>
                        <Eye className="w-3 h-3" /> Di Katalog
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" /> Non-Katalog
                      </>
                    )}
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900">{service.name}</h3>
                    <Printer className="w-5 h-5 text-emerald-700 shrink-0" />
                  </div>

                  {service.deskripsi ? (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {service.deskripsi}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      Belum ada deskripsi layanan. Klik Edit untuk menambahkan.
                    </p>
                  )}

                  <div className="space-y-1.5 pt-1">
                    {(service.service_detail || []).map((detail, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between">
                        <span className="font-semibold text-slate-700">
                          {detail.tipe} • {detail.bahan}
                        </span>
                        <span className="font-bold text-emerald-700">
                          {detail.harga ? formatRupiah(detail.harga) : 'Grosir'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditService(service)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit & Gambar</span>
                  </button>
                  <button
                    onClick={() => onDeleteService(service.id)}
                    className="p-1.5 text-slate-600 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => onQuickOrder(service)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  <span>Buat Pesanan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DataTable data={filteredServices} columns={serviceColumns} keyExtractor={(row) => row.id} />
      )}
    </div>
  );
};
