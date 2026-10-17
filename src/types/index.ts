export interface StockItem {
  id: string;
  name: string;
  stock: number;
  unit: string;
  price: number;
  vendor?: string;
  deskripsi?: string | null;
  foto_path?: string | null;
  category_id?: string | null;
  urutan?: number;
  tampil_di_katalog?: boolean;
  created_at?: string;
}

export interface Vendor {
  id: string;
  vendorName: string;
  kontak_vendor: string;
  address?: string;
  notes?: string;
  created_at?: string;
}

export interface Member {
  id: string;
  nama: string;
  nomor: string;
  alamat?: string;
  status: boolean;
  banyakMemesan: number;
  potongan: number;
  created_at?: string;
}

export interface PriceRange {
  minQuantity: number | string;
  maxQuantity: number | string;
  rangePrice: number | string;
}

export interface ServiceDetail {
  id?: string;
  service_id?: string;
  tipe?: string;
  bahan?: string;
  ukuran?: string;
  harga?: number | null;
  range_harga?: PriceRange[] | null;
}

export interface ServiceStock {
  id?: string;
  service_id?: string;
  IDStock: string;
  stock_name: string;
}

export interface Service {
  id: string;
  name: string;
  deskripsi?: string | null;
  foto_path?: string | null;
  category_id?: string | null;
  urutan?: number;
  tampil_di_katalog?: boolean;
  created_at?: string;
  service_detail?: ServiceDetail[];
  service_stock?: ServiceStock[];
  detail?: any[];
  stocks?: any[];
}

export interface OrderStockItem {
  stockId: string;
  stockQuantity: number;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  jenisLayanan: string;
  detailLayanan_1?: string;
  detailBahan?: string;
  detailukuran?: string;
  jumlahPesanan: number;
  harga: number;
  satuan: string;
  panjang?: number;
  lebar?: number;
  finishing?: string;
  luas?: number;
  totalHarga: number;
  stok?: OrderStockItem[];
  order_stock?: OrderStockItem[];
}

export type OrderStatus =
  | 'Dalam Proses'
  | 'Belum Diambil'
  | 'Selesai'
  | 'Belum Lunas'
  | 'Dibatalkan';

export interface Order {
  id: string;
  nama: string;
  nomor: string;
  alamat?: string;
  note?: string;
  tanggalDibuat: string;
  tanggalDeadline: string;
  status: OrderStatus;
  penerima: string;
  isLunas: boolean;
  dp: number;
  diskonType: 'nominal' | 'persen';
  potongan: number;
  isMember?: boolean;
  memberPotonganPersen?: number;
  diskonMemberNominal?: number;
  diskonRegulerNominal?: number;
  subtotalSebelumDiskon?: number;
  grandtotalHarga: number;
  order_pesanan?: OrderItem[];
  created_at?: string;
}

export interface FinancialRecord {
  id: string;
  judul: string;
  tanggal: string;
  pemasukan: number;
  pengeluaran: number;
  notes: string;
  paymentStatus: 'Lunas' | 'Belum Lunas' | string;
  stockID?: string;
  tipeTransaksi: 'Pemasukan' | 'Pengeluaran';
  price?: number;
  created_at?: string;
}

export interface CombinedTransaction {
  id: string;
  namaTransaksi: string;
  tanggalRaw: string;
  tanggalFormatted: string;
  pemasukan: number;
  pengeluaran: number;
  deskripsi: string;
  isFromOrder?: boolean;
}

export interface StoreSettings {
  storeName: string;
  officePhone: string;
  onlinePhone: string;
  email: string;
  address: string;
  city: string;
  printerPaperWidth: '58mm' | '80mm';
  accessCode: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export interface CatalogSettingsRow {
  id: string; // 'global_config'
  whatsapp_number: string;
  hero_message: string;
  layout_mode: 'grid' | 'list';
  hero_bg_type: 'gradient' | 'color' | 'image';
  hero_bg_gradient: string | null;
  hero_bg_color: string | null;
  hero_bg_image_path: string | null;
  logo_path: string | null;
  updated_at?: string;
}

export interface CatalogDisplayOptions {
  showPrice: boolean;
  showDescription: boolean;
  showVariants: boolean;
  showOrderButton: boolean;
  showCategoryBadge: boolean;
}

export interface CatalogCategoryRow {
  id: string; // uuid
  name: string;
  urutan: number;
  created_at?: string;
}

export interface KatalogProdukVarian {
  tipe?: string;
  bahan?: string;
  ukuran?: string;
  harga?: number | null;
  range_harga?: PriceRange[] | null;
}

export interface KatalogProdukViewRow {
  sumber: 'layanan' | 'inventory';
  id: string;
  name: string;
  deskripsi: string | null;
  foto_path: string | null;
  category_id: string | null;
  urutan: number;
  harga_mulai: number | null;
  varian: KatalogProdukVarian[];
}

export interface EditableCatalogItem {
  sumber: 'layanan' | 'inventory';
  id: string;
  name: string;
  deskripsi: string;
  foto_path: string;
  category_id: string | null;
  urutan: number;
  tampil_di_katalog: boolean;
  harga_mulai: number;
  unit?: string;
  stock?: number;
  varian: KatalogProdukVarian[];
}
