import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
  LayoutDashboard,
  ShoppingCart,
  Layers,
  Boxes,
  FileSpreadsheet,
  Users,
  Truck,
  BookOpen,
  Settings as SettingsIcon,
  LogOut,
  Plus,
  Printer,
  FileText,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Coins,
  PackageCheck,
  RefreshCw,
  Building2,
  Phone,
  MapPin,
  PanelLeftClose,
  PanelLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Swal from 'sweetalert2';

import {
  StockItem,
  Vendor,
  Member,
  Service,
  Order,
  FinancialRecord,
  StoreSettings,
  OrderStatus,
  CombinedTransaction,
} from './types';
import { dataStore } from './services/store';
import { formatRupiah, formatDateIndo, parseISODateParts, getOrderStatusBadgeStyle } from './utils/format';
import { DataTable, Column } from './components/DataTable';
import { ThermalReceiptModal } from './components/ThermalReceiptModal';
import { KwitansiModal } from './components/KwitansiModal';
import { OrderFormModal } from './components/OrderFormModal';
import { ServiceModal } from './components/ServiceModal';
import { StockModal } from './components/StockModal';
import { FinancialModal } from './components/FinancialModal';
import { MemberModal } from './components/MemberModal';
import { VendorModal } from './components/VendorModal';
import { AccessModal } from './components/AccessModal';
import { SettingsView } from './components/SettingsView';
import { FinancialChart } from './components/FinancialChart';
import { ServicesView } from './components/ServicesView';
import { OrderDetailModal } from './components/OrderDetailModal';
import { OrderItemSummaryCell } from './components/OrderItemSummaryCell';
import { CatalogView } from './components/CatalogView';

type ActiveTab =
  | 'dashboard'
  | 'penjualan'
  | 'layanan'
  | 'stok'
  | 'laporan'
  | 'member'
  | 'vendor'
  | 'katalog'
  | 'settings';

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>('Mas Rohman');
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  const isMasRohman = useMemo(() => {
    if (!currentUser) return false;
    const clean = currentUser.toLowerCase().replace(/[\s._-]+/g, '');
    return (
      clean.includes('masrohman') ||
      clean.includes('masrahman') ||
      clean.includes('rohman') ||
      clean.includes('rahman')
    );
  }, [currentUser]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('katalog');

  useEffect(() => {
    if (!isMasRohman && activeTab === 'dashboard') {
      setActiveTab('penjualan');
    }
  }, [isMasRohman, activeTab]);

  const [settings, setSettings] = useState<StoreSettings>(dataStore.getSettings());

  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [financials, setFinancials] = useState<FinancialRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const [kwitansiOrder, setKwitansiOrder] = useState<Order | null>(null);
  const [isKwitansiOpen, setIsKwitansiOpen] = useState(false);

  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);

  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const [stockToEdit, setStockToEdit] = useState<StockItem | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  const [financialToEdit, setFinancialToEdit] = useState<FinancialRecord | null>(null);
  const [isFinancialModalOpen, setIsFinancialModalOpen] = useState(false);

  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  const [vendorToEdit, setVendorToEdit] = useState<Vendor | null>(null);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [orderDetailToView, setOrderDetailToView] = useState<Order | null>(null);

  const [dashboardMonth, setDashboardMonth] = useState<string>('0');
  const [dashboardYear, setDashboardYear] = useState<string>(
    new Date().getFullYear().toString()
  );

  const [posStatusFilter, setPosStatusFilter] = useState<string>('');
  const [posMonthFilter, setPosMonthFilter] = useState<string>('');
  const [posYearFilter, setPosYearFilter] = useState<string>('');

  const [finStartDate, setFinStartDate] = useState('');
  const [finEndDate, setFinEndDate] = useState('');
  const [finTypeFilter, setFinTypeFilter] = useState<'semua' | 'pemasukan' | 'pengeluaran'>('semua');

  const [showOnlyMembers, setShowOnlyMembers] = useState(false);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('kharisma_userName') || localStorage.getItem('kharisma_userName');
    if (savedUser) {
      setCurrentUser(savedUser);
    }
  }, []);

  const handleLogin = (name: string) => {
    sessionStorage.setItem('kharisma_userName', name);
    localStorage.setItem('kharisma_userName', name);
    setCurrentUser(name);
    setIsAccessModalOpen(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('kharisma_userName');
    localStorage.removeItem('kharisma_userName');
    setCurrentUser(null);
    setIsAccessModalOpen(true);
  };

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [o, s, stk, m, v, f] = await Promise.all([
        dataStore.fetchOrders(),
        dataStore.fetchServices(),
        dataStore.fetchItems(),
        dataStore.fetchMembers(),
        dataStore.fetchVendors(),
        dataStore.fetchFinancials(),
      ]);
      setOrders(o);
      setServices(s);
      setStockItems(stk);
      setMembers(m);
      setVendors(v);
      setFinancials(f);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleUpdateSettings = (newSettings: Partial<StoreSettings>) => {
    dataStore.saveSettings(newSettings);
    setSettings(dataStore.getSettings());
  };

  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];

  const dashboardStats = useMemo(() => {
    const completedOrdersList = orders
      .filter((o) => o.status === 'Selesai')
      .map((o) => ({
        pemasukan: o.grandtotalHarga || 0,
        pengeluaran: 0,
        tanggal: o.tanggalDeadline || o.tanggalDibuat,
        orderCount: o.order_pesanan ? o.order_pesanan.length : 1,
      }));

    const manualFinList = financials.map((f) => ({
      pemasukan: f.pemasukan || 0,
      pengeluaran: f.pengeluaran || 0,
      tanggal: f.tanggal,
      orderCount: 0,
    }));

    const allCombined = [...completedOrdersList, ...manualFinList];

    const filtered = allCombined.filter((item) => {
      const d = new Date(item.tanggal);
      if (isNaN(d.getTime())) return false;
      const yr = d.getFullYear().toString();
      const mo = (d.getMonth() + 1).toString().padStart(2, '0');

      const matchYear = !dashboardYear || yr === dashboardYear;
      const matchMonth = dashboardMonth === '0' || mo === dashboardMonth;
      return matchYear && matchMonth;
    });

    let totalPendapatan = 0;
    let totalPengeluaran = 0;
    let totalOrderCount = 0;

    filtered.forEach((item) => {
      totalPendapatan += item.pemasukan;
      totalPengeluaran += item.pengeluaran;
      totalOrderCount += item.orderCount;
    });

    const totalLaba = totalPendapatan - totalPengeluaran;

    const monthlyMap: Record<string, { pemasukan: number; pengeluaran: number }> = {};
    for (let m = 1; m <= 12; m++) {
      const mStr = m.toString().padStart(2, '0');
      const key = `${dashboardYear}-${mStr}`;
      monthlyMap[key] = { pemasukan: 0, pengeluaran: 0 };
    }

    allCombined.forEach((item) => {
      const d = new Date(item.tanggal);
      if (isNaN(d.getTime())) return;
      if (d.getFullYear().toString() === dashboardYear) {
        const key = `${dashboardYear}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        if (monthlyMap[key]) {
          monthlyMap[key].pemasukan += item.pemasukan;
          monthlyMap[key].pengeluaran += item.pengeluaran;
        }
      }
    });

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des',
    ];

    const chartData = Object.keys(monthlyMap)
      .sort()
      .map((key, idx) => {
        const pem = monthlyMap[key].pemasukan;
        const peng = monthlyMap[key].pengeluaran;
        return {
          monthKey: key,
          monthLabel: monthNames[idx],
          pemasukan: pem,
          pengeluaran: peng,
          laba: pem - peng,
        };
      });

    return {
      totalPendapatan,
      totalPengeluaran,
      totalLaba,
      totalOrderCount,
      chartData,
    };
  }, [orders, financials, dashboardYear, dashboardMonth]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await dataStore.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengubah Status',
        text: err.message || 'Terjadi kesalahan.',
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const result = await Swal.fire({
      title: 'Hapus Pesanan?',
      text: `Hapus order ${orderId}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      await dataStore.deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const parts = parseISODateParts(order.tanggalDibuat);
      const m = parts ? parts.month.toString() : '';
      const y = parts ? parts.year.toString() : '';

      const matchStatus = !posStatusFilter || order.status === posStatusFilter;
      const matchMonth = !posMonthFilter || m === posMonthFilter;
      const matchYear = !posYearFilter || y === posYearFilter;
      return matchStatus && matchMonth && matchYear;
    });
  }, [orders, posStatusFilter, posMonthFilter, posYearFilter]);

  const orderColumns: Column<Order>[] = [
    {
      key: 'id',
      header: 'ID Order',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-1 rounded">
          {row.id}
        </span>
      ),
    },
    {
      key: 'nama',
      header: 'Pelanggan & Kontak',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{row.nama}</span>
          <span className="text-[11px] text-slate-500 font-mono">{row.nomor}</span>
        </div>
      ),
    },
    {
      key: 'order_pesanan',
      header: 'Item Pesanan',
      render: (row) => (
        <OrderItemSummaryCell
          order={row}
          onOpenDetail={(order) => setOrderDetailToView(order)}
        />
      ),
    },
    {
      key: 'status',
      header: 'Status Order',
      sortable: true,
      render: (row) => {
        const style = getOrderStatusBadgeStyle(row.status);
        return (
          <div className="inline-flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
            <select
              value={row.status}
              onChange={(e) => handleUpdateOrderStatus(row.id, e.target.value as OrderStatus)}
              className={`text-xs font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition shadow-2xs ${style.selectClass}`}
            >
              <option value="Dalam Proses" className="bg-white text-amber-800 font-bold">
                Dalam Proses
              </option>
              <option value="Belum Diambil" className="bg-white text-blue-800 font-bold">
                Belum Diambil
              </option>
              <option value="Selesai" className="bg-white text-emerald-800 font-bold">
                Selesai
              </option>
              <option value="Belum Lunas" className="bg-white text-orange-800 font-bold">
                Belum Lunas
              </option>
              <option value="Dibatalkan" className="bg-white text-rose-800 font-bold">
                Dibatalkan
              </option>
            </select>
          </div>
        );
      },
    },
    {
      key: 'tanggalDeadline',
      header: 'Deadline',
      sortable: true,
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800 block">
            {formatDateIndo(row.tanggalDeadline)}
          </span>
        </div>
      ),
    },
    {
      key: 'grandtotalHarga',
      header: 'Total Biaya',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">
            {formatRupiah(row.grandtotalHarga)}
          </span>
          <span
            className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold border ${
              row.isLunas
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
          >
            {row.isLunas ? 'Lunas' : 'Belum Lunas'}
          </span>
        </div>
      ),
    },
    {
      key: 'cetak',
      header: 'Cetak Dokumen',
      sortable: false,
      render: (row) => (
        <div className="flex flex-col gap-1 w-24">
          <button
            onClick={() => {
              setReceiptOrder(row);
              setIsReceiptOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1 py-1 px-2 text-[11px] font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md cursor-pointer"
          >
            <Printer className="w-3 h-3" />
            <span>Struk</span>
          </button>
          <button
            onClick={() => {
              setKwitansiOrder(row);
              setIsKwitansiOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1 py-1 px-2 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md cursor-pointer"
          >
            <FileText className="w-3 h-3" />
            <span>Kwitansi</span>
          </button>
        </div>
      ),
    },
    {
      key: 'aksi',
      header: 'Aksi',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setOrderToEdit(row);
              setIsOrderFormOpen(true);
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteOrder(row.id)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const combinedTransactions: CombinedTransaction[] = useMemo(() => {
    const list: CombinedTransaction[] = [];

    orders.forEach((o) => {
      if (o.status === 'Selesai') {
        const itemCount = o.order_pesanan ? o.order_pesanan.length : 1;
        list.push({
          id: `order-${o.id}`,
          namaTransaksi: `Pesanan Selesai: ${o.nama} (${itemCount} item)`,
          tanggalRaw: o.tanggalDeadline || o.tanggalDibuat,
          tanggalFormatted: formatDateIndo(o.tanggalDeadline || o.tanggalDibuat),
          pemasukan: o.grandtotalHarga,
          pengeluaran: 0,
          deskripsi: o.note || 'Transaksi POS Kasir',
          isFromOrder: true,
        });
      }
    });

    financials.forEach((f) => {
      list.push({
        id: f.id,
        namaTransaksi: f.judul,
        tanggalRaw: f.tanggal,
        tanggalFormatted: formatDateIndo(f.tanggal),
        pemasukan: f.pemasukan,
        pengeluaran: f.pengeluaran,
        deskripsi: f.notes || '-',
        isFromOrder: false,
      });
    });

    return list
      .filter((t) => {
        if (finTypeFilter === 'pemasukan' && t.pemasukan <= 0) return false;
        if (finTypeFilter === 'pengeluaran' && t.pengeluaran <= 0) return false;
        return true;
      })
      .sort((a, b) => new Date(b.tanggalRaw).getTime() - new Date(a.tanggalRaw).getTime());
  }, [orders, financials, finTypeFilter]);

  const handleExportExcelFinancial = () => {
    const exportData = combinedTransactions.map((t) => ({
      'Nama Transaksi': t.namaTransaksi,
      'Tanggal': t.tanggalFormatted,
      'Pemasukan (Rp)': t.pemasukan,
      'Pengeluaran (Rp)': t.pengeluaran,
      'Deskripsi': t.deskripsi,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Keuangan');
    XLSX.writeFile(wb, `Laporan_Keuangan_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const financialColumns: Column<CombinedTransaction>[] = [
    {
      key: 'namaTransaksi',
      header: 'Nama Transaksi',
      sortable: true,
      render: (row) => <span className="font-semibold text-slate-900">{row.namaTransaksi}</span>,
    },
    {
      key: 'tanggalRaw',
      header: 'Tanggal',
      sortable: true,
      render: (row) => <span className="text-xs text-slate-700">{row.tanggalFormatted}</span>,
    },
    {
      key: 'pemasukan',
      header: 'Pemasukan',
      sortable: true,
      render: (row) =>
        row.pemasukan > 0 ? (
          <span className="font-bold text-xs text-emerald-700">{formatRupiah(row.pemasukan)}</span>
        ) : (
          <span>-</span>
        ),
    },
    {
      key: 'pengeluaran',
      header: 'Pengeluaran',
      sortable: true,
      render: (row) =>
        row.pengeluaran > 0 ? (
          <span className="font-bold text-xs text-rose-700">{formatRupiah(row.pengeluaran)}</span>
        ) : (
          <span>-</span>
        ),
    },
    {
      key: 'deskripsi',
      header: 'Deskripsi',
      sortable: true,
      render: (row) => <span className="text-xs text-slate-600">{row.deskripsi}</span>,
    },
  ];

  const stockColumns: Column<StockItem>[] = [
    {
      key: 'name',
      header: 'Nama Produk / Bahan',
      sortable: true,
      render: (row) => <span className="font-semibold text-slate-900 text-sm">{row.name}</span>,
    },
    {
      key: 'stock',
      header: 'Stok Tersedia',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-sm text-slate-900">
          {row.stock} {row.unit}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Harga Modal',
      sortable: true,
      render: (row) => <span className="text-xs text-slate-800">{formatRupiah(row.price)}</span>,
    },
    {
      key: 'aksi',
      header: 'Aksi',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setStockToEdit(row);
              setIsStockModalOpen(true);
            }}
            className="p-1.5 text-blue-600 cursor-pointer"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={async () => {
              await dataStore.deleteItem(row.id);
              setStockItems((prev) => prev.filter((i) => i.id !== row.id));
            }}
            className="p-1.5 text-red-600 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const filteredMembers = useMemo(() => {
    if (showOnlyMembers) return members.filter((m) => m.status === true);
    return members;
  }, [members, showOnlyMembers]);

  const memberColumns: Column<Member>[] = [
    {
      key: 'id',
      header: 'ID Member',
      sortable: true,
      render: (row) => <span className="font-mono text-xs">{row.id}</span>,
    },
    {
      key: 'nama',
      header: 'Nama',
      sortable: true,
      render: (row) => <span className="font-semibold text-slate-900 text-sm">{row.nama}</span>,
    },
    {
      key: 'nomor',
      header: 'Nomor HP',
      sortable: true,
      render: (row) => <span className="font-mono text-xs">{row.nomor}</span>,
    },
    {
      key: 'status',
      header: 'Status & Diskon',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-bold text-emerald-700">
          {row.status ? `Member ⭐ (${row.potongan}%)` : 'Non-Member'}
        </span>
      ),
    },
    {
      key: 'aksi',
      header: 'Aksi',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setMemberToEdit(row);
              setIsMemberModalOpen(true);
            }}
            className="p-1 text-blue-600 cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={async () => {
              await dataStore.deleteMember(row.id);
              setMembers((prev) => prev.filter((m) => m.id !== row.id));
            }}
            className="p-1 text-red-600 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const vendorColumns: Column<Vendor>[] = [
    {
      key: 'vendorName',
      header: 'Nama Vendor',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-900 text-sm">{row.vendorName}</span>
        </div>
      ),
    },
    {
      key: 'kontak_vendor',
      header: 'Kontak / WhatsApp',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-700">
          <Phone className="w-3 h-3 text-slate-400" />
          <span>{row.kontak_vendor}</span>
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Alamat',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <MapPin className="w-3 h-3 text-slate-400" />
          <span>{row.address || '-'}</span>
        </div>
      ),
    },
    {
      key: 'aksi',
      header: 'Aksi',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setVendorToEdit(row);
              setIsVendorModalOpen(true);
            }}
            className="p-1.5 text-blue-600 cursor-pointer"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={async () => {
              await dataStore.deleteVendor(row.id);
              setVendors((prev) => prev.filter((v) => v.id !== row.id));
            }}
            className="p-1.5 text-red-600 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 flex text-slate-800 font-sans">
      {/* Sidebar Navigation */}
      <aside
        id="main-app-sidebar"
        className={`${
          isSidebarCollapsed ? 'w-18' : 'w-64'
        } bg-slate-900 text-white flex flex-col justify-between shrink-0 shadow-lg select-none transition-all duration-300 h-full`}
      >
        <div className="overflow-y-auto">
          {isSidebarCollapsed ? (
            <div className="p-3 border-b border-slate-800 flex flex-col items-center gap-2">
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="w-10 h-10 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs cursor-pointer"
              >
                KP
              </button>
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                  KP
                </span>
                <div className="truncate">
                  <h1 className="text-sm font-black tracking-tight text-white leading-tight">KHARISMA POS</h1>
                  <p className="text-[10px] text-slate-400 truncate">Kasir Percetakan Digital</p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Nav Items */}
          <nav className="p-2 space-y-1 text-xs font-medium">
            {isMasRohman && (
              <button
                onClick={() => setActiveTab('dashboard')}
                title="Dashboard & Statistik"
                className={`w-full flex items-center ${
                  isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5'
                } rounded-xl transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-700 text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-400 shrink-0" />
                {!isSidebarCollapsed && (
                  <>
                    <span>Dashboard & Statistik</span>
                    <span className="ml-auto bg-emerald-800/80 text-emerald-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      Owner
                    </span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setActiveTab('penjualan')}
              title="Penjualan (POS)"
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5'
              } rounded-xl transition-all cursor-pointer relative ${
                activeTab === 'penjualan'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && (
                <>
                  <span>Penjualan (POS)</span>
                  {orders.length > 0 && (
                    <span className="ml-auto bg-amber-400 text-slate-900 font-black text-[10px] px-2 py-0.5 rounded-full shadow-2xs">
                      {orders.length}
                    </span>
                  )}
                </>
              )}
            </button>

            <button
              onClick={() => setActiveTab('layanan')}
              title="Jenis Layanan"
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5'
              } rounded-xl transition-all cursor-pointer ${
                activeTab === 'layanan'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Jenis Layanan</span>}
            </button>

            <button
              onClick={() => setActiveTab('stok')}
              title="Manajemen Stok"
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5'
              } rounded-xl transition-all cursor-pointer ${
                activeTab === 'stok'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Boxes className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Manajemen Stok</span>}
            </button>

            <button
              onClick={() => setActiveTab('laporan')}
              title="Laporan Keuangan"
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5'
              } rounded-xl transition-all cursor-pointer ${
                activeTab === 'laporan'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Laporan Keuangan</span>}
            </button>

            <button
              onClick={() => setActiveTab('member')}
              title="Member / Pelanggan"
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5'
              } rounded-xl transition-all cursor-pointer ${
                activeTab === 'member'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Member / Pelanggan</span>}
            </button>

            <button
              onClick={() => setActiveTab('vendor')}
              title="Vendor / Pemasok"
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5'
              } rounded-xl transition-all cursor-pointer ${
                activeTab === 'vendor'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Vendor / Pemasok</span>}
            </button>

            {/* MENU KATALOG DI ATAS PENGATURAN */}
            <button
              onClick={() => setActiveTab('katalog')}
              title="Katalog"
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5'
              } rounded-xl transition-all cursor-pointer ${
                activeTab === 'katalog'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && (
                <>
                  <span>Katalog</span>
                  <span className="ml-auto bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[9px] font-bold px-1.5 py-0.5 rounded">
                    CMS
                  </span>
                </>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              title="Pengaturan"
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5'
              } rounded-xl transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <SettingsIcon className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Pengaturan</span>}
            </button>
          </nav>
        </div>

        {/* User footer & logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 shrink-0">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="overflow-hidden">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  {isMasRohman ? 'Owner / Admin' : 'Petugas Kasir'}
                </span>
                <span className="text-xs font-bold text-white truncate block">{currentUser || 'Guest'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                title="Keluar / Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header
          id="main-app-header"
          className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              {isSidebarCollapsed ? (
                <PanelLeft className="w-5 h-5 text-emerald-700" />
              ) : (
                <PanelLeftClose className="w-5 h-5 text-slate-600" />
              )}
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {activeTab === 'dashboard' && 'Statistik & Dashboard Toko'}
              {activeTab === 'penjualan' && 'Transaksi Penjualan (POS)'}
              {activeTab === 'layanan' && 'Pelayanan Percetakan'}
              {activeTab === 'stok' && 'Manajemen Stok & Bahan Baku'}
              {activeTab === 'laporan' && 'Laporan Keuangan & Laba Rugi'}
              {activeTab === 'member' && 'Daftar Member & Pelanggan'}
              {activeTab === 'vendor' && 'Daftar Vendor & Pemasok'}
              {activeTab === 'katalog' && 'Manajemen Katalog Produk & Pengaturan Tema (1-Tabel Supabase)'}
              {activeTab === 'settings' && 'Pengaturan Aplikasi & Toko'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={loadAllData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-700' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        <main id="main-app-content" className="p-4 sm:p-6 flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold uppercase">Total Pendapatan</span>
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {formatRupiah(dashboardStats.totalPendapatan)}
                  </h3>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold uppercase">Total Pengeluaran</span>
                    <TrendingDown className="w-4 h-4 text-rose-700" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {formatRupiah(dashboardStats.totalPengeluaran)}
                  </h3>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold uppercase">Total Transaksi</span>
                    <PackageCheck className="w-4 h-4 text-blue-700" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {dashboardStats.totalOrderCount} Pesanan
                  </h3>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold uppercase">Total Laba Bersih</span>
                    <Coins className="w-4 h-4 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-700">
                    {formatRupiah(dashboardStats.totalLaba)}
                  </h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="font-bold text-base text-slate-900 mb-4">Grafik Laba Rugi Bulanan ({dashboardYear})</h3>
                <FinancialChart data={dashboardStats.chartData} />
              </div>
            </div>
          )}

          {activeTab === 'penjualan' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Data Penjualan (POS)</h2>
                  <p className="text-xs text-slate-500">
                    Kelola antrean cetak, ubah status pesanan, dan cetak kwitansi / struk thermal
                  </p>
                </div>
                <button
                  onClick={() => {
                    setOrderToEdit(null);
                    setIsOrderFormOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Order</span>
                </button>
              </div>
              <DataTable
                data={filteredOrders}
                columns={orderColumns}
                keyExtractor={(row) => row.id}
                searchPlaceholder="Cari nama pelanggan, nomor HP, ID order..."
                customFilters={
                  <div className="flex items-center gap-2">
                    <select
                      value={posStatusFilter}
                      onChange={(e) => setPosStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                    >
                      <option value="">Semua Status</option>
                      <option value="Dalam Proses">Dalam Proses</option>
                      <option value="Belum Diambil">Belum Diambil</option>
                      <option value="Selesai">Selesai</option>
                      <option value="Belum Lunas">Belum Lunas</option>
                      <option value="Dibatalkan">Dibatalkan</option>
                    </select>

                    <select
                      value={posMonthFilter}
                      onChange={(e) => setPosMonthFilter(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                    >
                      <option value="">Semua Bulan</option>
                      <option value="1">Januari</option>
                      <option value="2">Februari</option>
                      <option value="3">Maret</option>
                      <option value="4">April</option>
                      <option value="5">Mei</option>
                      <option value="6">Juni</option>
                      <option value="7">Juli</option>
                      <option value="8">Agustus</option>
                      <option value="9">September</option>
                      <option value="10">Oktober</option>
                      <option value="11">November</option>
                      <option value="12">Desember</option>
                    </select>

                    <select
                      value={posYearFilter}
                      onChange={(e) => setPosYearFilter(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                    >
                      <option value="">Semua Tahun</option>
                      {availableYears.map((yr) => (
                        <option key={yr} value={yr.toString()}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>
                }
              />
            </div>
          )}

          {activeTab === 'layanan' && (
            <ServicesView
              services={services}
              stockItems={stockItems}
              onAddService={() => {
                setServiceToEdit(null);
                setIsServiceModalOpen(true);
              }}
              onEditService={(s) => {
                setServiceToEdit(s);
                setIsServiceModalOpen(true);
              }}
              onDeleteService={async (id) => {
                await dataStore.deleteService(id);
                setServices((prev) => prev.filter((x) => x.id !== id));
              }}
              onQuickOrder={() => {
                setOrderToEdit(null);
                setIsOrderFormOpen(true);
              }}
            />
          )}

          {activeTab === 'stok' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-slate-900">Manajemen Stok Barang & Bahan</h2>
                <button
                  onClick={() => {
                    setStockToEdit(null);
                    setIsStockModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Stok</span>
                </button>
              </div>
              <DataTable data={stockItems} columns={stockColumns} keyExtractor={(row) => row.id} />
            </div>
          )}

          {activeTab === 'laporan' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-slate-900">Laporan Keuangan & Laba Rugi</h2>
                <button
                  onClick={() => {
                    setFinancialToEdit(null);
                    setIsFinancialModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Transaksi</span>
                </button>
              </div>
              <DataTable
                data={combinedTransactions}
                columns={financialColumns}
                keyExtractor={(row) => row.id}
                onExportExcel={handleExportExcelFinancial}
              />
            </div>
          )}

          {activeTab === 'member' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-slate-900">Daftar Member & Pelanggan</h2>
                <button
                  onClick={() => {
                    setMemberToEdit(null);
                    setIsMemberModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Member</span>
                </button>
              </div>
              <DataTable data={filteredMembers} columns={memberColumns} keyExtractor={(row) => row.id} />
            </div>
          )}

          {activeTab === 'vendor' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-slate-900">Daftar Vendor & Pemasok Bahan</h2>
                <button
                  onClick={() => {
                    setVendorToEdit(null);
                    setIsVendorModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Vendor</span>
                </button>
              </div>
              <DataTable data={vendors} columns={vendorColumns} keyExtractor={(row) => row.id} />
            </div>
          )}

          {/* ======================= 8. KATALOG VIEW (DI ATAS SETTINGS) ======================= */}
          {activeTab === 'katalog' && (
            <CatalogView
              services={services}
              storeSettings={settings}
              onDataChanged={loadAllData}
            />
          )}

          {/* ======================= 9. PENGATURAN VIEW ======================= */}
          {activeTab === 'settings' && (
            <SettingsView settings={settings} onUpdateSettings={handleUpdateSettings} />
          )}
        </main>
      </div>

      {/* Modals */}
      <ThermalReceiptModal
        order={receiptOrder}
        settings={settings}
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          setReceiptOrder(null);
        }}
      />

      <KwitansiModal
        order={kwitansiOrder}
        settings={settings}
        isOpen={isKwitansiOpen}
        onClose={() => {
          setIsKwitansiOpen(false);
          setKwitansiOrder(null);
        }}
      />

      <OrderFormModal
        isOpen={isOrderFormOpen}
        onClose={() => {
          setIsOrderFormOpen(false);
          setOrderToEdit(null);
        }}
        orderToEdit={orderToEdit}
        services={services}
        stockItems={stockItems}
        members={members}
        currentUserName={currentUser || 'Kasir'}
        onSave={async (orderData) => {
          if (orderToEdit) {
            await dataStore.updateOrder(orderToEdit.id, orderData);
          } else {
            await dataStore.submitOrder(orderData);
          }
          await loadAllData();
        }}
      />

      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => {
          setIsServiceModalOpen(false);
          setServiceToEdit(null);
        }}
        serviceToEdit={serviceToEdit}
        stockItems={stockItems}
        onSave={async (serviceData) => {
          if (serviceToEdit) {
            await dataStore.updateService(serviceData);
          } else {
            await dataStore.addService(serviceData);
          }
          await loadAllData();
        }}
      />

      <StockModal
        isOpen={isStockModalOpen}
        onClose={() => {
          setIsStockModalOpen(false);
          setStockToEdit(null);
        }}
        itemToEdit={stockToEdit}
        vendors={vendors}
        onSave={async (itemData) => {
          if (stockToEdit) {
            await dataStore.updateItem(itemData);
          } else {
            await dataStore.addItem(itemData);
          }
          await loadAllData();
        }}
        onQuickAddVendor={async (vendorPayload) => {
          const added = await dataStore.addVendor(vendorPayload);
          await loadAllData();
          return added;
        }}
      />

      <FinancialModal
        isOpen={isFinancialModalOpen}
        onClose={() => {
          setIsFinancialModalOpen(false);
          setFinancialToEdit(null);
        }}
        recordToEdit={financialToEdit}
        stockItems={stockItems}
        onSave={async (recordData) => {
          if (financialToEdit) {
            await dataStore.updateFinancial(recordData);
          } else {
            await dataStore.addFinancial(recordData);
          }
          await loadAllData();
        }}
      />

      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setMemberToEdit(null);
        }}
        memberToEdit={memberToEdit}
        onSave={async (memberData) => {
          if (memberToEdit) {
            await dataStore.updateMember(memberData);
          } else {
            await dataStore.addMember(memberData);
          }
          await loadAllData();
        }}
      />

      <VendorModal
        isOpen={isVendorModalOpen}
        onClose={() => {
          setIsVendorModalOpen(false);
          setVendorToEdit(null);
        }}
        vendorToEdit={vendorToEdit}
        onSave={async (vendorData) => {
          if (vendorToEdit) {
            await dataStore.updateVendor(vendorData);
          } else {
            await dataStore.addVendor(vendorData);
          }
          await loadAllData();
        }}
      />

      <OrderDetailModal
        order={orderDetailToView}
        isOpen={Boolean(orderDetailToView)}
        onClose={() => setOrderDetailToView(null)}
      />

      <AccessModal
        isOpen={isAccessModalOpen}
        onLogin={handleLogin}
        expectedCode={settings.accessCode}
      />
    </div>
  );
}
