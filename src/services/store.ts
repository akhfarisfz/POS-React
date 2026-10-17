import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  StockItem,
  Vendor,
  Member,
  Service,
  Order,
  FinancialRecord,
  StoreSettings,
  OrderStatus,
  CatalogSettingsRow,
  CatalogCategoryRow,
  KatalogProdukViewRow,
  EditableCatalogItem,
  CatalogDisplayOptions,
} from '../types';
import { ensureISODate } from '../utils/format';

export const DEFAULT_CATALOG_DISPLAY_OPTIONS: CatalogDisplayOptions = {
  showPrice: true,
  showDescription: true,
  showVariants: true,
  showOrderButton: true,
  showCategoryBadge: true,
};

export const DEFAULT_CATALOG_SETTINGS_ROW: CatalogSettingsRow = {
  id: 'global_config',
  whatsapp_number: '6285232217627',
  hero_message: 'Pusat Cetak Murah & Berkualitas',
  layout_mode: 'grid',
  hero_bg_type: 'gradient',
  hero_bg_gradient: 'linear-gradient(135deg, #0f172a 0%, #047857 100%)',
  hero_bg_color: '#047857',
  hero_bg_image_path: 'https://images.unsplash.com/photo-1562564055-71e051d33c19?auto=format&fit=crop&w=1200&q=80',
  logo_path: '',
  updated_at: new Date().toISOString(),
};

export const INITIAL_CATALOG_CATEGORIES_ROWS: CatalogCategoryRow[] = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Outdoor & Spanduk', urutan: 1 },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Dokumen & Promosi', urutan: 2 },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Kartu & Undangan', urutan: 3 },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Bahan Baku & Inventory', urutan: 4 },
];

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'CV KHARISMA DEWI MULIA',
  officePhone: '0878 5040 6636',
  onlinePhone: '0852 3221 7627',
  email: 'kharismaprinting8@gmail.com',
  address: 'Jl Raya Labang Kec. Labang',
  city: 'Bangkalan',
  printerPaperWidth: '58mm',
  accessCode: '1234',
  supabaseUrl: 'https://ovlofjaukewyxxklqgnm.supabase.co',
  supabaseAnonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92bG9mamF1a2V3eXh4a2xxZ25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDIyOTYyMywiZXhwIjoyMDU1ODA1NjIzfQ.i6sfD3VNJwlI4lRXvscAnoSJXD-6D-B_tnRqUG_9Yts',
};

const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'v-1',
    vendorName: 'PT Sumber Kertas Surya',
    kontak_vendor: '081234567890',
    address: 'Kec. Rungkut, Surabaya',
    notes: 'Suplier Kertas Art Paper & HVS',
  },
  {
    id: 'v-2',
    vendorName: 'Indo Banner Sentosa',
    kontak_vendor: '082198765432',
    address: 'Bangkalan, Madura',
    notes: 'Bahan Flexi Frontlite 280g - 440g',
  },
];

const INITIAL_ITEMS: StockItem[] = [
  {
    id: 'stk-1',
    name: 'Flexi Frontlite 280gsm (Roll)',
    stock: 250,
    unit: 'meter',
    price: 3500000,
    vendor: 'v-2',
  },
  {
    id: 'stk-2',
    name: 'Art Paper 260gsm A3+',
    stock: 45,
    unit: 'rim',
    price: 1850000,
    vendor: 'v-1',
  },
  {
    id: 'stk-3',
    name: 'Sticker Vinyl Glossy',
    stock: 120,
    unit: 'meter',
    price: 2400000,
    vendor: 'v-2',
  },
  {
    id: 'stk-4',
    name: 'Mata Ayam Spanduk (Keling)',
    stock: 0,
    unit: 'pack',
    price: 150000,
    vendor: 'v-1',
  },
];

const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    name: 'Cetak Spanduk / Banner',
    service_detail: [
      {
        tipe: 'Outdoor',
        bahan: 'Flexi 280g',
        ukuran: 'Custom m²',
        harga: 20000,
        range_harga: [
          { minQuantity: 1, maxQuantity: 5, rangePrice: 20000 },
          { minQuantity: 6, maxQuantity: 50, rangePrice: 17500 },
          { minQuantity: 51, maxQuantity: 999, rangePrice: 15000 },
        ],
      },
      {
        tipe: 'Outdoor High Res',
        bahan: 'Flexi Korchin 380g',
        ukuran: 'Custom m²',
        harga: 35000,
        range_harga: null,
      },
    ],
    service_stock: [{ IDStock: 'stk-1', stock_name: 'Flexi Frontlite 280gsm (Roll)' }],
  },
  {
    id: 'srv-2',
    name: 'Cetak Brosur & Flayer',
    service_detail: [
      {
        tipe: 'Full Color 1 Sisi',
        bahan: 'Art Paper 150g',
        ukuran: 'A4',
        harga: 2500,
        range_harga: [
          { minQuantity: 1, maxQuantity: 100, rangePrice: 2500 },
          { minQuantity: 101, maxQuantity: 1000, rangePrice: 1800 },
        ],
      },
      {
        tipe: 'Full Color 2 Sisi',
        bahan: 'Art Paper 260g',
        ukuran: 'A4',
        harga: 4000,
        range_harga: null,
      },
    ],
    service_stock: [{ IDStock: 'stk-2', stock_name: 'Art Paper 260gsm A3+' }],
  },
  {
    id: 'srv-3',
    name: 'Cetak Kartu Nama',
    service_detail: [
      {
        tipe: 'Laminasi Doff',
        bahan: 'Art Carton 260g',
        ukuran: '9 x 5.5 cm',
        harga: 35000,
        range_harga: null,
      },
    ],
    service_stock: [{ IDStock: 'stk-2', stock_name: 'Art Paper 260gsm A3+' }],
  },
];

const INITIAL_MEMBERS: Member[] = [
  {
    id: 'MEMBER-200920260001',
    nama: 'Budi Santoso',
    nomor: '081234567890',
    alamat: 'Jl. Pemuda No. 12, Bangkalan',
    status: true,
    banyakMemesan: 8,
    potongan: 10,
  },
  {
    id: 'MEMBER-180920260001',
    nama: 'Siti Aminah (Toko Berkah)',
    nomor: '085232217627',
    alamat: 'Jl. Raya Kamal, Madura',
    status: true,
    banyakMemesan: 14,
    potongan: 12,
  },
  {
    id: 'MEMBER-120920260001',
    nama: 'Andi Saputra',
    nomor: '087850406636',
    alamat: 'Socah, Bangkalan',
    status: false,
    banyakMemesan: 2,
    potongan: 0,
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'KHA-202609206636-001',
    nama: 'Budi Santoso',
    nomor: '081234567890',
    tanggalDibuat: '2026-09-20',
    tanggalDeadline: '2026-09-21',
    status: 'Dalam Proses',
    penerima: 'Kasir Utama',
    isLunas: false,
    dp: 50000,
    diskonType: 'persen',
    potongan: 10,
    grandtotalHarga: 120000,
    note: 'Mohon warna biru sesuai logo, finishing mata ayam 4 sudut',
    order_pesanan: [
      {
        id: 'ord-item-1',
        jenisLayanan: 'Cetak Spanduk / Banner',
        detailLayanan_1: 'Outdoor',
        detailBahan: 'Flexi 280g',
        detailukuran: 'Custom m²',
        panjang: 300,
        lebar: 100,
        luas: 3,
        jumlahPesanan: 2,
        harga: 20000,
        satuan: 'buah',
        finishing: 'Mata ayam 4 sudut',
        totalHarga: 120000,
        stok: [{ stockId: 'stk-1', stockQuantity: 6 }],
      },
    ],
  },
  {
    id: 'KHA-202609187627-002',
    nama: 'Siti Aminah (Toko Berkah)',
    nomor: '085232217627',
    tanggalDibuat: '2026-09-18',
    tanggalDeadline: '2026-09-19',
    status: 'Selesai',
    penerima: 'Kasir Utama',
    isLunas: true,
    dp: 0,
    diskonType: 'nominal',
    potongan: 10000,
    grandtotalHarga: 250000,
    note: 'Sudah diambil oleh driver toko',
    order_pesanan: [
      {
        id: 'ord-item-2',
        jenisLayanan: 'Cetak Brosur & Flayer',
        detailLayanan_1: 'Full Color 1 Sisi',
        detailBahan: 'Art Paper 150g',
        detailukuran: 'A4',
        jumlahPesanan: 100,
        harga: 2500,
        satuan: 'lembar',
        totalHarga: 250000,
        stok: [{ stockId: 'stk-2', stockQuantity: 100 }],
      },
    ],
  },
];

const INITIAL_FINANCIALS: FinancialRecord[] = [
  {
    id: 'fin-1',
    judul: 'Pembelian Tinta Eco Solvent Cyan & Magenta',
    tanggal: '2026-09-17',
    pemasukan: 0,
    pengeluaran: 650000,
    notes: 'Nota No. 7812 dari Surya Perkasa',
    paymentStatus: 'Lunas',
    tipeTransaksi: 'Pengeluaran',
    stockID: 'stk-1',
  },
  {
    id: 'fin-2',
    judul: 'Penjualan Cetak Custom Langsung (Tunai)',
    tanggal: '2026-09-18',
    pemasukan: 320000,
    pengeluaran: 0,
    notes: 'Pembayaran tunai di meja kasir',
    paymentStatus: 'Lunas',
    tipeTransaksi: 'Pemasukan',
  },
];

class DataStore {
  private supabase: SupabaseClient | null = null;
  private settings: StoreSettings = DEFAULT_SETTINGS;
  private hasLiveSupabase = false;
  private orderSubmitLock: Promise<any> = Promise.resolve();

  constructor() {
    this.loadSettings();
    this.initSupabase();
  }

  public getSettings(): StoreSettings {
    return this.settings;
  }

  public saveSettings(newSettings: Partial<StoreSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem('kharisma_pos_settings', JSON.stringify(this.settings));
    this.initSupabase();
  }

  private loadSettings() {
    const saved = localStorage.getItem('kharisma_pos_settings');
    if (saved) {
      try {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    }
  }

  private initSupabase() {
    if (this.settings.supabaseUrl && this.settings.supabaseAnonKey) {
      try {
        this.supabase = createClient(this.settings.supabaseUrl, this.settings.supabaseAnonKey);
        this.hasLiveSupabase = true;
      } catch (e) {
        console.error('Supabase init failed, fallback to local', e);
        this.hasLiveSupabase = false;
      }
    } else {
      this.hasLiveSupabase = false;
    }
  }

  public isUsingLiveSupabase(): boolean {
    return this.hasLiveSupabase;
  }

  private getLocal<T>(key: string, defaultVal: T): T {
    const raw = localStorage.getItem(`kharisma_${key}`);
    if (!raw) {
      localStorage.setItem(`kharisma_${key}`, JSON.stringify(defaultVal));
      return defaultVal;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return defaultVal;
    }
  }

  private setLocal<T>(key: string, val: T) {
    localStorage.setItem(`kharisma_${key}`, JSON.stringify(val));
  }

  // ===================== ITEMS (STOK) =====================
  public async fetchItems(): Promise<StockItem[]> {
    if (this.hasLiveSupabase && this.supabase) {
      try {
        const { data, error } = await this.supabase.from('items').select('*');
        if (!error && data) {
          this.setLocal('items', data);
          return data as StockItem[];
        }
      } catch (err) {
        console.warn('Supabase fetchItems failed, using local storage cache', err);
      }
    }
    return this.getLocal<StockItem[]>('items', INITIAL_ITEMS);
  }

  public async fetchItemById(id: string): Promise<StockItem | null> {
    const items = await this.fetchItems();
    return items.find((i) => String(i.id) === String(id)) || null;
  }

  public async addItem(item: Omit<StockItem, 'id'>): Promise<StockItem> {
    if (this.hasLiveSupabase && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('items')
          .insert([{ name: item.name, stock: item.stock, unit: item.unit, price: item.price, vendor: item.vendor }])
          .select();
        if (!error && data && data.length > 0) {
          const newItem = data[0] as StockItem;
          const items = this.getLocal<StockItem[]>('items', INITIAL_ITEMS);
          this.setLocal('items', [newItem, ...items]);
          return newItem;
        }
      } catch (err) {
        console.warn('Supabase addItem failed, using local storage fallback', err);
      }
    }

    const newItem: StockItem = {
      ...item,
      id: `stk-${Date.now()}`,
    };
    const items = this.getLocal<StockItem[]>('items', INITIAL_ITEMS);
    const updated = [newItem, ...items];
    this.setLocal('items', updated);
    return newItem;
  }

  public async updateItem(item: StockItem): Promise<boolean> {
    if (this.hasLiveSupabase && this.supabase) {
      try {
        const { error } = await this.supabase
          .from('items')
          .update({
            name: item.name,
            stock: item.stock,
            unit: item.unit,
            price: item.price,
            vendor: item.vendor,
          })
          .eq('id', item.id);
        if (!error) {
          const items = this.getLocal<StockItem[]>('items', INITIAL_ITEMS);
          this.setLocal(
            'items',
            items.map((i) => (String(i.id) === String(item.id) ? item : i))
          );
          return true;
        }
      } catch (err) {
        console.warn('Supabase updateItem failed, fallback to local', err);
      }
    }

    const items = this.getLocal<StockItem[]>('items', INITIAL_ITEMS);
    this.setLocal(
      'items',
      items.map((i) => (String(i.id) === String(item.id) ? item : i))
    );
    return true;
  }

  public async deleteItem(id: string): Promise<boolean> {
    if (this.hasLiveSupabase && this.supabase) {
      try {
        await this.supabase.from('items').delete().eq('id', String(id));
      } catch (err) {
        console.warn('Supabase deleteItem failed', err);
      }
    }
    const items = this.getLocal<StockItem[]>('items', INITIAL_ITEMS);
    this.setLocal(
      'items',
      items.filter((i) => String(i.id) !== String(id))
    );
    return true;
  }

  public async updateQuantity(stockUpdates: { stockId: string; stockQuantity: number }[]): Promise<boolean> {
    const items = await this.fetchItems();
    for (const update of stockUpdates) {
      const target = items.find((i) => String(i.id) === String(update.stockId));
      if (target) {
        const newStock = Math.max(0, target.stock - Number(update.stockQuantity));
        target.stock = newStock;
        await this.updateItem(target);
      }
    }
    return true;
  }

  // ===================== VENDORS =====================
  public async fetchVendors(): Promise<Vendor[]> {
    if (this.hasLiveSupabase && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('vendors')
          .select('*')
          .order('vendorName', { ascending: true });
        if (!error && data) {
          this.setLocal('vendors', data);
          return data as Vendor[];
        }
      } catch (err) {
        console.warn('Supabase fetchVendors failed, fallback to local', err);
      }
    }
    return this.getLocal<Vendor[]>('vendors', INITIAL_VENDORS);
  }

  public async fetchVendorById(id: string): Promise<Vendor | null> {
    const vendors = await this.fetchVendors();
    return vendors.find((v) => String(v.id) === String(id)) || null;
  }

  public async addVendor(vendor: Omit<Vendor, 'id'> & { id?: string }): Promise<Vendor> {
    const payload = {
      vendorName: (vendor.vendorName || '').trim(),
      kontak_vendor: (vendor.kontak_vendor || '').trim(),
      address: (vendor.address || '').trim(),
      notes: (vendor.notes || '').trim(),
    };

    if (this.hasLiveSupabase && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('vendors')
          .insert([payload])
          .select();

        if (!error && data && data.length > 0) {
          const newV = data[0] as Vendor;
          const vendors = this.getLocal<Vendor[]>('vendors', INITIAL_VENDORS);
          this.setLocal('vendors', [newV, ...vendors.filter((v) => v.id !== newV.id)]);
          return newV;
        }
      } catch (err) {
        console.warn('Supabase addVendor fallback to local', err);
      }
    }

    const newV: Vendor = { ...payload, id: `v-${Date.now()}` };
    const vendors = this.getLocal<Vendor[]>('vendors', INITIAL_VENDORS);
    this.setLocal('vendors', [newV, ...vendors]);
    return newV;
  }

  public async updateVendor(vendor: Vendor): Promise<boolean> {
    const payload = {
      vendorName: (vendor.vendorName || '').trim(),
      kontak_vendor: (vendor.kontak_vendor || '').trim(),
      address: (vendor.address || '').trim(),
      notes: (vendor.notes || '').trim(),
    };

    if (this.hasLiveSupabase && this.supabase) {
      try {
        await this.supabase
          .from('vendors')
          .update(payload)
          .eq('id', vendor.id);
      } catch (err) {
        console.warn('Supabase updateVendor fallback to local', err);
      }
    }

    const vendors = this.getLocal<Vendor[]>('vendors', INITIAL_VENDORS);
    this.setLocal(
      'vendors',
      vendors.map((v) => (String(v.id) === String(vendor.id) ? { ...v, ...payload } : v))
    );
    return true;
  }

  public async deleteVendor(id: string): Promise<boolean> {
    if (this.hasLiveSupabase && this.supabase) {
      try {
        await this.supabase.from('vendors').delete().eq('id', String(id));
      } catch (err) {
        console.warn('Supabase deleteVendor fallback to local', err);
      }
    }

    const vendors = this.getLocal<Vendor[]>('vendors', INITIAL_VENDORS);
    this.setLocal(
      'vendors',
      vendors.filter((v) => String(v.id) !== String(id))
    );
    return true;
  }

  // ===================== SERVICES =====================
  public async fetchServices(): Promise<Service[]> {
    if (this.hasLiveSupabase && this.supabase) {
      try {
        const { data: services, error: sErr } = await this.supabase.from('services').select('*');
        const { data: details } = await this.supabase.from('service_details').select('*');
        const { data: stocks } = await this.supabase.from('service_stocks').select('*');

        if (!sErr && services) {
          const merged = services.map((s: any) => ({
            ...s,
            service_detail: details ? details.filter((d: any) => d.service_id === s.id) : [],
            service_stock: stocks ? stocks.filter((st: any) => st.service_id === s.id) : [],
          }));
          this.setLocal('services', merged);
          return merged;
        }
      } catch (err) {
        console.warn('Supabase fetchServices failed, fallback to local', err);
      }
    }
    return this.getLocal<Service[]>('services', INITIAL_SERVICES);
  }

  public async fetchServiceById(id: string): Promise<Service | null> {
    const services = await this.fetchServices();
    return services.find((s) => String(s.id) === String(id)) || null;
  }

  public async addService(service: {
    name: string;
    deskripsi?: string;
    foto_path?: string;
    category_id?: string | null;
    urutan?: number;
    tampil_di_katalog?: boolean;
    detail: any[];
    stocks: { id: string; name: string }[];
  }): Promise<{ success: boolean; serviceId: string }> {
    const serviceId = `srv-${Date.now()}`;
    const newService: Service = {
      id: serviceId,
      name: service.name,
      deskripsi: service.deskripsi || null,
      foto_path: service.foto_path || null,
      category_id: service.category_id || null,
      urutan: typeof service.urutan === 'number' ? service.urutan : 0,
      tampil_di_katalog: service.tampil_di_katalog ?? true,
      service_detail: service.detail.map((d) => ({
        tipe: d.Tipe || d.tipe,
        bahan: d.Bahan || d.bahan,
        ukuran: d.Ukuran || d.ukuran,
        harga: typeof d.Harga === 'number' ? d.Harga : d.harga || null,
        range_harga: d.RangeHarga || d.range_harga || null,
      })),
      service_stock: service.stocks.map((st) => ({
        IDStock: st.id,
        stock_name: st.name,
      })),
    };

    if (this.hasLiveSupabase && this.supabase) {
      try {
        const { data: sData, error: sErr } = await this.supabase
          .from('services')
          .insert([
            {
              name: service.name,
              deskripsi: service.deskripsi || null,
              foto_path: service.foto_path || null,
              category_id: service.category_id || null,
              urutan: typeof service.urutan === 'number' ? service.urutan : 0,
              tampil_di_katalog: service.tampil_di_katalog ?? true,
            },
          ])
          .select()
          .single();
        if (!sErr && sData) {
          const dbServiceId = sData.id;
          const serviceDetails = service.detail.map((d) => ({
            service_id: dbServiceId,
            tipe: d.Tipe || d.tipe,
            bahan: d.Bahan || d.bahan,
            ukuran: d.Ukuran || d.ukuran,
            harga: typeof d.Harga === 'number' ? d.Harga : d.harga || null,
            range_harga: d.RangeHarga || d.range_harga || null,
          }));
          await this.supabase.from('service_details').insert(serviceDetails);

          const serviceStocks = service.stocks.map((st) => ({
            service_id: dbServiceId,
            IDStock: st.id,
            stock_name: st.name,
          }));
          await this.supabase.from('service_stocks').insert(serviceStocks);
          newService.id = dbServiceId;
        }
      } catch (err) {
        console.warn('Supabase addService failed', err);
      }
    }

    const services = this.getLocal<Service[]>('services', INITIAL_SERVICES);
    this.setLocal('services', [newService, ...services]);
    return { success: true, serviceId: newService.id };
  }

  public async updateService(service: {
    id: string;
    name: string;
    deskripsi?: string;
    foto_path?: string;
    category_id?: string | null;
    urutan?: number;
    tampil_di_katalog?: boolean;
    detail: any[];
    stocks: { id: string; name: string }[];
  }): Promise<boolean> {
    if (this.hasLiveSupabase && this.supabase) {
      try {
        await this.supabase
          .from('services')
          .update({
            name: service.name,
            deskripsi: service.deskripsi ?? null,
            foto_path: service.foto_path ?? null,
            category_id: service.category_id ?? null,
            urutan: typeof service.urutan === 'number' ? service.urutan : 0,
            tampil_di_katalog: service.tampil_di_katalog ?? true,
          })
          .eq('id', service.id);
        await this.supabase.from('service_details').delete().eq('service_id', service.id);
        await this.supabase.from('service_stocks').delete().eq('service_id', service.id);

        const newDetails = service.detail.map((d) => ({
          service_id: service.id,
          tipe: d.Tipe || d.tipe,
          bahan: d.Bahan || d.bahan,
          ukuran: d.Ukuran || d.ukuran,
          harga: typeof d.Harga === 'number' ? d.Harga : d.harga || null,
          range_harga: d.RangeHarga || d.range_harga || null,
        }));
        await this.supabase.from('service_details').insert(newDetails);

        const newStocks = service.stocks.map((st) => ({
          service_id: service.id,
          IDStock: st.id,
          stock_name: st.name,
        }));
        await this.supabase.from('service_stocks').insert(newStocks);
      } catch (err) {
        console.warn('Supabase updateService failed', err);
      }
    }

    const services = this.getLocal<Service[]>('services', INITIAL_SERVICES);
    const updated: Service = {
      id: service.id,
      name: service.name,
      deskripsi: service.deskripsi ?? null,
      foto_path: service.foto_path ?? null,
      category_id: service.category_id ?? null,
      urutan: typeof service.urutan === 'number' ? service.urutan : 0,
      tampil_di_katalog: service.tampil_di_katalog ?? true,
      service_detail: service.detail.map((d) => ({
        tipe: d.Tipe || d.tipe,
        bahan: d.Bahan || d.bahan,
        ukuran: d.Ukuran || d.ukuran,
        harga: typeof d.Harga === 'number' ? d.Harga : d.harga || null,
        range_harga: d.RangeHarga || d.range_harga || null,
      })),
      service_stock: service.stocks.map((st) => ({
        IDStock: st.id,
        stock_name: st.name,
      })),
    };
    this.setLocal(
      'services',
      services.map((s) => (s.id === service.id ? updated : s))
    );
    return true;
  }

  public async deleteService(id: string): Promise<boolean> {
    if (this.hasLiveSupabase && this.supabase) {
      try {
        await this.supabase.from('service_details').delete().eq('service_id', id);
        await this.supabase.from('service_stocks').delete().eq('service_id', id);
        await this.supabase.from('services').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteService failed', err);
      }
    }
    const services = this.getLocal<Service[]>('services', INITIAL_SERVICES);
    this.setLocal(
      'services',
      services.filter((s) => s.id !== id)
    );
    return true;
  }

  // ===================== MEMBERS =====================
  public async fetchMembers(): Promise<Member[]> {
    let list: Member[] = [];
    if (this.hasLiveSupabase && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('members')
          .select('*')
          .order('banyakMemesan', { ascending: false });
        if (!error && data) {
          list = data as Member[];
          this.setLocal('members', list);
          return list;
        }
      } catch (err) {
        console.warn('Supabase fetchMembers failed', err);
      }
    }
    return this.getLocal<Member[]>('members', INITIAL_MEMBERS);
  }

  public async fetchMemberByPhone(phone: string, name?: string): Promise<Member | null> {
    const members = await this.fetchMembers();
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const cleanName = (name || '').trim().toLowerCase();

    return (
      members.find((m) => {
        const mPhone = (m.nomor || '').replace(/\D/g, '');
        if (cleanPhone && mPhone && cleanPhone.length >= 8 && mPhone.length >= 8) {
          if (cleanPhone.slice(-8) === mPhone.slice(-8)) return true;
        }
        if (cleanName && m.nama && m.nama.trim().toLowerCase() === cleanName) {
          return true;
        }
        return false;
      }) || null
    );
  }

  public async addMember(member: {
    nama: string;
    nomor: string;
    alamat?: string;
    status: boolean;
    potongan: number;
  }): Promise<Member> {
    const today = new Date();
    const tgl = String(today.getDate()).padStart(2, '0');
    const bln = String(today.getMonth() + 1).padStart(2, '0');
    const thun = String(today.getFullYear());
    const datePrefix = `MEMBER-${tgl}${bln}${thun}`;

    let maxCounter = 0;
    const prefixPattern = `${datePrefix}%`;

    if (this.hasLiveSupabase && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('members')
          .select('id')
          .like('id', prefixPattern)
          .order('id', { ascending: false })
          .limit(1000);

        if (!error && data && data.length > 0) {
          for (const row of data) {
            const idStr = String(row.id || '');
            if (idStr.startsWith(datePrefix)) {
              const counterStr = idStr.slice(datePrefix.length);
              const parsedNum = parseInt(counterStr, 10);
              if (!isNaN(parsedNum) && parsedNum > maxCounter) {
                maxCounter = parsedNum;
              }
            }
          }
        }
      } catch (err) {
        console.warn('Supabase query latest member counter failed', err);
      }
    }

    const localMembers = this.getLocal<Member[]>('members', INITIAL_MEMBERS);
    for (const m of localMembers) {
      if (m.id && m.id.startsWith(datePrefix)) {
        const counterStr = m.id.slice(datePrefix.length);
        const parsedNum = parseInt(counterStr, 10);
        if (!isNaN(parsedNum) && parsedNum > maxCounter) {
          maxCounter = parsedNum;
        }
      }
    }

    const nextCounter = maxCounter + 1;
    const counterFormatted = String(nextCounter).padStart(4, '0');
    const customId = `${datePrefix}${counterFormatted}`;

    const newMember: Member = {
      id: customId,
      nama: member.nama,
      nomor: member.nomor,
      alamat: member.alamat || '',
      status: member.status,
      banyakMemesan: 0,
      potongan: member.potongan || 0,
    };

    if (this.hasLiveSupabase && this.supabase) {
      try {
        const { data, error } = await this.supabase.from('members').insert([newMember]).select();
        if (!error && data && data.length > 0) {
          const added = data[0] as Member;
          const members = this.getLocal<Member[]>('members', INITIAL_MEMBERS);
          this.setLocal('members', [added, ...members]);
          return added;
        }
      } catch (err) {
        console.warn('Supabase addMember failed', err);
      }
    }

    const members = this.getLocal<Member[]>('members', INITIAL_MEMBERS);
    this.setLocal('members', [newMember, ...members]);
    return newMember;
  }

  public async updateMember(member: Member): Promise<boolean> {
    const payload = {
      nama: member.nama,
      status: Boolean(member.status),
      nomor: member.nomor,
      alamat: member.alamat || '',
      potongan: Number(member.potongan) || 0,
      banyakMemesan: Number(member.banyakMemesan) || 0,
    };

    if (this.hasLiveSupabase && this.supabase) {
      try {
        await this.supabase.from('members').update(payload).eq('id', member.id);
      } catch (err) {
        console.warn('Supabase updateMember failed', err);
      }
    }
    const members = this.getLocal<Member[]>('members', INITIAL_MEMBERS);
    this.setLocal(
      'members',
      members.map((m) => (m.id === member.id ? { ...m, ...payload } : m))
    );
    return true;
  }

  public async updateMemberStatus(id: string, newStatus: boolean, customPotongan?: number): Promise<boolean> {
    const members = this.getLocal<Member[]>('members', INITIAL_MEMBERS);
    const existing = members.find((m) => m.id === id);

    let finalPotongan = customPotongan !== undefined ? customPotongan : (existing?.potongan || 0);
    if (newStatus && (!finalPotongan || finalPotongan <= 0)) {
      finalPotongan = 10;
    }

    const payload = {
      status: Boolean(newStatus),
      potongan: finalPotongan,
    };

    if (this.hasLiveSupabase && this.supabase) {
      try {
        await this.supabase.from('members').update(payload).eq('id', id);
      } catch (err) {
        console.warn('Supabase updateMemberStatus failed', err);
      }
    }

    this.setLocal(
      'members',
      members.map((m) => (m.id === id ? { ...m, ...payload } : m))
    );
    return true;
  }

  public async deleteMember(id: string): Promise<boolean> {
    if (this.hasLiveSupabase && this.supabase) {
      try {
        await this.supabase.from('members').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteMember failed', err);
      }
    }
    const members = this.getLocal<Member[]>('members', INITIAL_MEMBERS);
    this.setLocal(
      'members',
      members.filter((m) => m.id !== id)
    );
    return true;
  }

  // ===================== ORDERS (POS) =====================
  public async fetchOrders(): Promise<Order[]> {
    if (this.hasLiveSupabase && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('orders')
          .select(`
            *,
            order_pesanan (
              *,
              order_stock (*)
            )
          `)
          .order('tanggalDibuat', { ascending: false })
          .limit(10000);

        if (!error && data) {
          const parsedOrders = data.map((ord: any) => {
            let note = ord.note || '';
            let diskonMemberNominal = ord.diskonMemberNominal;
            let diskonRegulerNominal = ord.diskonRegulerNominal;
            let memberPotonganPersen = ord.memberPotonganPersen;
            let isMember = ord.isMember;

            const discMatch = note.match(/\[DISC:m=(\d+):r=(\d+):mp=(\d+)(?::mem=(\d))?\]/);
            if (discMatch) {
              diskonMemberNominal = Number(discMatch[1]) || 0;
              diskonRegulerNominal = Number(discMatch[2]) || 0;
              memberPotonganPersen = Number(discMatch[3]) || 0;
              isMember = discMatch[4] === '1';
              note = note.replace(/\[DISC:m=\d+:r=\d+:mp=\d+(?::mem=\d)?\]/, '').trim();
            } else {
              const rawPotongan = Number(ord.potongan) || 0;
              const isCustMember = Boolean(
                isMember ||
                (ord.nama && ord.nama.toLowerCase().includes('(member)'))
              );
              isMember = isCustMember;

              const itemsSubtotal =
                ord.order_pesanan && ord.order_pesanan.length > 0
                  ? ord.order_pesanan.reduce(
                      (sum: number, it: any) => sum + (Number(it.totalHarga) || 0),
                      0
                    )
                  : Number(ord.subtotalSebelumDiskon) || Number(ord.grandtotalHarga) || 0;

              if (rawPotongan > 0) {
                const isPercent = rawPotongan <= 100 || ord.diskonType === 'persen';
                const calculatedNominal = isPercent
                  ? Math.round(itemsSubtotal * (rawPotongan / 100))
                  : rawPotongan;

                if (isCustMember) {
                  diskonMemberNominal = calculatedNominal;
                  memberPotonganPersen = isPercent ? rawPotongan : 10;
                  diskonRegulerNominal = 0;
                } else {
                  diskonRegulerNominal = calculatedNominal;
                  diskonMemberNominal = 0;
                }
              }
            }

            return {
              ...ord,
              note,
              diskonMemberNominal,
              diskonRegulerNominal,
              memberPotonganPersen,
              isMember,
            };
          });

          this.setLocal('orders', parsedOrders);
          return parsedOrders as Order[];
        }
      } catch (err) {
        console.warn('Supabase fetchOrders failed, fallback to local', err);
      }
    }
    const local = this.getLocal<Order[]>('orders', INITIAL_ORDERS);
    return [...local].sort(
      (a, b) => new Date(b.tanggalDibuat).getTime() - new Date(a.tanggalDibuat).getTime()
    );
  }

  public async fetchOrderById(id: string): Promise<Order | null> {
    const orders = await this.fetchOrders();
    return orders.find((o) => o.id === id) || null;
  }

  public async submitOrder(order: any): Promise<{ success: boolean; orderId: string }> {
    const currentLock = this.orderSubmitLock;
    let releaseLock: (value?: any) => void = () => {};
    this.orderSubmitLock = new Promise((resolve) => {
      releaseLock = resolve;
    });

    await currentLock;
    try {
      return await this._executeSubmitOrder(order);
    } finally {
      releaseLock();
    }
  }

  private async _executeSubmitOrder(order: any): Promise<{ success: boolean; orderId: string }> {
    const safeTanggalDibuat = ensureISODate(order.tanggalDibuat);
    const safeTanggalDeadline = ensureISODate(order.tanggalDeadline || order.tanggalDibuat);

    const yyyymmdd = safeTanggalDibuat.replace(/-/g, '');
    const cleanPhone = (order.nomor || '').replace(/\D/g, '');
    const lastFourDigits = (cleanPhone.slice(-4) || '0000').padStart(4, '0');

    let maxCounter = 0;
    const prefixPattern = `KHA-${yyyymmdd}%`;

    if (this.hasLiveSupabase && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('orders')
          .select('id')
          .like('id', prefixPattern)
          .order('id', { ascending: false })
          .limit(1000);

        if (!error && data && data.length > 0) {
          for (const row of data) {
            const idStr = String(row.id || '');
            const parts = idStr.split('-');
            if (parts.length >= 3) {
              const counterStr = parts[parts.length - 1];
              const parsedNum = parseInt(counterStr, 10);
              if (!isNaN(parsedNum) && parsedNum > maxCounter) {
                maxCounter = parsedNum;
              }
            }
          }
        }
      } catch (err) {
        console.warn('Supabase query latest order counter failed', err);
      }
    }

    const localOrders = this.getLocal<Order[]>('orders', INITIAL_ORDERS);
    for (const o of localOrders) {
      if (o.id && o.id.startsWith(`KHA-${yyyymmdd}`)) {
        const parts = o.id.split('-');
        if (parts.length >= 3) {
          const counterStr = parts[parts.length - 1];
          const parsedNum = parseInt(counterStr, 10);
          if (!isNaN(parsedNum) && parsedNum > maxCounter) {
            maxCounter = parsedNum;
          }
        }
      }
    }

    const nextCounter = maxCounter + 1;
    const counterFormatted = String(nextCounter).padStart(3, '0');
    const customId = `KHA-${yyyymmdd}${lastFourDigits}-${counterFormatted}`;

    const newOrder: Order = {
      id: customId,
      nama: order.nama,
      nomor: order.nomor,
      alamat: order.alamat || '',
      note: order.note || '',
      tanggalDibuat: safeTanggalDibuat,
      tanggalDeadline: safeTanggalDeadline,
      status: (order.status as OrderStatus) || 'Dalam Proses',
      penerima: order.penerima,
      isLunas: Boolean(order.isLunas),
      dp: Number(order.dp) || 0,
      diskonType: order.diskonType || 'nominal',
      potongan: Number(order.potongan) || 0,
      isMember: Boolean(order.isMember),
      memberPotonganPersen: Number(order.memberPotonganPersen) || 0,
      diskonMemberNominal: Number(order.diskonMemberNominal) || 0,
      diskonRegulerNominal: Number(order.diskonRegulerNominal) || 0,
      subtotalSebelumDiskon: Number(order.subtotalSebelumDiskon) || 0,
      grandtotalHarga: Number(order.grandtotalHarga) || 0,
      order_pesanan: order.pesanan || order.order_pesanan || [],
    };

    const stockItemsToDeduct: { stockId: string; stockQuantity: number }[] = [];
    if (newOrder.order_pesanan) {
      newOrder.order_pesanan.forEach((p) => {
        if (p.stok) {
          p.stok.forEach((st) => stockItemsToDeduct.push(st));
        }
      });
    }
    if (stockItemsToDeduct.length > 0) {
      await this.updateQuantity(stockItemsToDeduct);
    }

    const existingMember = await this.fetchMemberByPhone(order.nomor, order.nama);
    if (existingMember) {
      await this.updateMember({
        ...existingMember,
        banyakMemesan: (existingMember.banyakMemesan || 0) + 1,
        status: order.isMember ? true : existingMember.status,
        potongan: order.isMember && (!existingMember.potongan || existingMember.potongan <= 0)
          ? (order.memberPotonganPersen || 10)
          : existingMember.potongan,
      });
    } else {
      await this.addMember({
        nama: order.nama,
        nomor: order.nomor,
        alamat: order.alamat || '',
        status: Boolean(order.isMember),
        potongan: order.isMember ? (order.memberPotonganPersen || 10) : 0,
      });
    }

    if (this.hasLiveSupabase && this.supabase) {
      try {
        const discTag = (newOrder.diskonMemberNominal || newOrder.diskonRegulerNominal)
          ? `[DISC:m=${newOrder.diskonMemberNominal || 0}:r=${newOrder.diskonRegulerNominal || 0}:mp=${newOrder.memberPotonganPersen || 0}:mem=${newOrder.isMember ? 1 : 0}]`
          : '';
        const noteWithDisc = newOrder.note ? `${newOrder.note} ${discTag}`.trim() : (discTag || null);

        let dbDiskonType: 'persen' | 'nominal' = newOrder.diskonType || 'nominal';
        let dbPotongan = Number(newOrder.potongan) || 0;

        if (newOrder.isMember && newOrder.memberPotonganPersen && newOrder.memberPotonganPersen > 0) {
          if (!newOrder.diskonRegulerNominal || newOrder.diskonRegulerNominal === 0) {
            dbDiskonType = 'persen';
            dbPotongan = newOrder.memberPotonganPersen;
          } else {
            dbDiskonType = 'nominal';
            dbPotongan = (newOrder.diskonMemberNominal || 0) + (newOrder.diskonRegulerNominal || 0);
          }
        } else if (newOrder.diskonType === 'persen' && newOrder.potongan && newOrder.potongan <= 100) {
          dbDiskonType = 'persen';
          dbPotongan = newOrder.potongan;
        }

        const orderData = {
          id: customId,
          nama: newOrder.nama,
          nomor: newOrder.nomor,
          note: noteWithDisc,
          tanggalDibuat: safeTanggalDibuat,
          tanggalDeadline: safeTanggalDeadline,
          status: newOrder.status,
          penerima: newOrder.penerima,
          isLunas: newOrder.isLunas,
          dp: newOrder.dp,
          diskonType: dbDiskonType,
          potongan: dbPotongan,
          grandtotalHarga: newOrder.grandtotalHarga,
        };
        await this.supabase.from('orders').insert([orderData]);

        if (newOrder.order_pesanan && newOrder.order_pesanan.length > 0) {
          const pesananRows = newOrder.order_pesanan.map((p) => ({
            order_id: customId,
            jenisLayanan: p.jenisLayanan,
            detailLayanan_1: p.detailLayanan_1,
            detailBahan: p.detailBahan,
            detailukuran: p.detailukuran,
            jumlahPesanan: p.jumlahPesanan,
            harga: p.harga,
            satuan: p.satuan,
            panjang: p.panjang,
            lebar: p.lebar,
            finishing: p.finishing,
            luas: p.luas,
            totalHarga: p.totalHarga,
          }));
          const { data: insertedP } = await this.supabase
            .from('order_pesanan')
            .insert(pesananRows)
            .select();

          if (insertedP) {
            const stockRows = insertedP.flatMap((p: any) => {
              const matched = newOrder.order_pesanan?.find((o) => o.jenisLayanan === p.jenisLayanan);
              return (matched?.stok || []).map((s) => ({
                order_id: customId,
                pesanan_id: p.id,
                stockId: s.stockId,
                stockQuantity: s.stockQuantity || 0,
              }));
            });
            if (stockRows.length > 0) {
              await this.supabase.from('order_stock').insert(stockRows);
            }
          }
        }
      } catch (err) {
        console.warn('Supabase submitOrder failed', err);
      }
    }

    const currentOrders = this.getLocal<Order[]>('orders', INITIAL_ORDERS);
    this.setLocal('orders', [newOrder, ...currentOrders]);
    return { success: true, orderId: customId };
  }

  public async updateOrder(orderId: string, updatedOrder: any): Promise<boolean> {
    const existing = await this.fetchOrderById(orderId);
    if (!existing) return false;

    const safeTanggalDibuat = ensureISODate(updatedOrder.tanggalDibuat || existing.tanggalDibuat);
    const safeTanggalDeadline = ensureISODate(updatedOrder.tanggalDeadline || existing.tanggalDeadline);

    const merged: Order = {
      ...existing,
      ...updatedOrder,
      id: orderId,
      tanggalDibuat: safeTanggalDibuat,
      tanggalDeadline: safeTanggalDeadline,
      isMember: updatedOrder.isMember !== undefined ? Boolean(updatedOrder.isMember) : existing.isMember,
      memberPotonganPersen: updatedOrder.memberPotonganPersen !== undefined ? Number(updatedOrder.memberPotonganPersen) : existing.memberPotonganPersen,
      diskonMemberNominal: updatedOrder.diskonMemberNominal !== undefined ? Number(updatedOrder.diskonMemberNominal) : existing.diskonMemberNominal,
      diskonRegulerNominal: updatedOrder.diskonRegulerNominal !== undefined ? Number(updatedOrder.diskonRegulerNominal) : existing.diskonRegulerNominal,
      subtotalSebelumDiskon: updatedOrder.subtotalSebelumDiskon !== undefined ? Number(updatedOrder.subtotalSebelumDiskon) : existing.subtotalSebelumDiskon,
      order_pesanan: updatedOrder.pesanan || updatedOrder.order_pesanan || existing.order_pesanan,
    };

    if (this.hasLiveSupabase && this.supabase) {
      try {
        const discTag = (merged.diskonMemberNominal || merged.diskonRegulerNominal)
          ? `[DISC:m=${merged.diskonMemberNominal || 0}:r=${merged.diskonRegulerNominal || 0}:mp=${merged.memberPotonganPersen || 0}:mem=${merged.isMember ? 1 : 0}]`
          : '';
        const noteWithDisc = merged.note ? `${merged.note} ${discTag}`.trim() : (discTag || null);

        let dbDiskonType: 'persen' | 'nominal' = merged.diskonType || 'nominal';
        let dbPotongan = Number(merged.potongan) || 0;

        if (merged.isMember && merged.memberPotonganPersen && merged.memberPotonganPersen > 0) {
          if (!merged.diskonRegulerNominal || merged.diskonRegulerNominal === 0) {
            dbDiskonType = 'persen';
            dbPotongan = merged.memberPotonganPersen;
          } else {
            dbDiskonType = 'nominal';
            dbPotongan = (merged.diskonMemberNominal || 0) + (merged.diskonRegulerNominal || 0);
          }
        } else if (merged.diskonType === 'persen' && merged.potongan && merged.potongan <= 100) {
          dbDiskonType = 'persen';
          dbPotongan = merged.potongan;
        }

        await this.supabase
          .from('orders')
          .update({
            nama: merged.nama,
            nomor: merged.nomor,
            note: noteWithDisc,
            tanggalDibuat: safeTanggalDibuat,
            tanggalDeadline: safeTanggalDeadline,
            status: merged.status,
            penerima: merged.penerima,
            isLunas: merged.isLunas,
            dp: merged.dp,
            diskonType: dbDiskonType,
            potongan: dbPotongan,
            grandtotalHarga: merged.grandtotalHarga,
          })
          .eq('id', orderId);
      } catch (err) {
        console.warn('Supabase updateOrder failed', err);
      }
    }

    const currentOrders = this.getLocal<Order[]>('orders', INITIAL_ORDERS);
    this.setLocal(
      'orders',
      currentOrders.map((o) => (o.id === orderId ? merged : o))
    );
    return true;
  }

  public async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<boolean> {
    if (this.hasLiveSupabase && this.supabase) {
      try {
        await this.supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      } catch (err) {
        console.warn('Supabase updateOrderStatus failed', err);
      }
    }
    const currentOrders = this.getLocal<Order[]>('orders', INITIAL_ORDERS);
    this.setLocal(
      'orders',
      currentOrders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    return true;
  }

  public async deleteOrder(orderId: string): Promise<boolean> {
    if (this.hasLiveSupabase && this.supabase) {
      try {
        const { data: pesananList } = await this.supabase
          .from('order_pesanan')
          .select('id')
          .eq('order_id', orderId);

        if (pesananList && pesananList.length > 0) {
          const pesananIds = pesananList.map((p: any) => p.id);
          await this.supabase.from('order_stock').delete().in('pesanan_id', pesananIds);
        }

        await this.supabase.from('order_stock').delete().eq('order_id', orderId);
        await this.supabase.from('order_pesanan').delete().eq('order_id', orderId);
        await this.supabase.from('orders').delete().eq('id', orderId);
      } catch (err) {
        console.warn('Supabase deleteOrder failed', err);
      }
    }
    const currentOrders = this.getLocal<Order[]>('orders', INITIAL_ORDERS);
    this.setLocal(
      'orders',
      currentOrders.filter((o) => o.id !== orderId)
    );
    return true;
  }

  // ===================== FINANCIALS =====================
  public async fetchFinancials(): Promise<FinancialRecord[]> {
    if (this.hasLiveSupabase && this.supabase) {
      try {
        const { data, error } = await this.supabase.from('financials').select('*');
        if (!error && data) {
          this.setLocal('financials', data);
          return data as FinancialRecord[];
        }
      } catch (err) {
        console.warn('Supabase fetchFinancials failed', err);
      }
    }
    return this.getLocal<FinancialRecord[]>('financials', INITIAL_FINANCIALS);
  }

  public async addFinancial(record: {
    judul: string;
    tanggal: string;
    tipeTransaksi: 'Pemasukan' | 'Pengeluaran';
    price: number;
    paymentStatus: string;
    notes: string;
    stockID?: string;
  }): Promise<FinancialRecord> {
    const newRecord: FinancialRecord = {
      id: `fin-${Date.now()}`,
      judul: record.judul,
      tanggal: record.tanggal,
      pemasukan: record.tipeTransaksi === 'Pemasukan' ? record.price : 0,
      pengeluaran: record.tipeTransaksi === 'Pengeluaran' ? record.price : 0,
      notes: record.notes,
      paymentStatus: record.paymentStatus,
      stockID: record.stockID || '',
      tipeTransaksi: record.tipeTransaksi,
    };

    if (this.hasLiveSupabase && this.supabase) {
      try {
        const { data, error } = await this.supabase.from('financials').insert([newRecord]).select();
        if (!error && data && data.length > 0) {
          const added = data[0] as FinancialRecord;
          const records = this.getLocal<FinancialRecord[]>('financials', INITIAL_FINANCIALS);
          this.setLocal('financials', [added, ...records]);
          return added;
        }
      } catch (err) {
        console.warn('Supabase addFinancial failed', err);
      }
    }

    const records = this.getLocal<FinancialRecord[]>('financials', INITIAL_FINANCIALS);
    this.setLocal('financials', [newRecord, ...records]);
    return newRecord;
  }

  public async updateFinancial(record: FinancialRecord): Promise<boolean> {
    if (this.hasLiveSupabase && this.supabase) {
      try {
        await this.supabase
          .from('financials')
          .update({
            judul: record.judul,
            tanggal: record.tanggal,
            pemasukan: record.pemasukan,
            pengeluaran: record.pengeluaran,
            notes: record.notes,
            paymentStatus: record.paymentStatus,
            stockID: record.stockID,
            tipeTransaksi: record.tipeTransaksi,
          })
          .eq('id', record.id);
      } catch (err) {
        console.warn('Supabase updateFinancial failed', err);
      }
    }
    const records = this.getLocal<FinancialRecord[]>('financials', INITIAL_FINANCIALS);
    this.setLocal(
      'financials',
      records.map((r) => (r.id === record.id ? record : r))
    );
    return true;
  }

  public async deleteFinancial(id: string): Promise<boolean> {
    if (this.hasLiveSupabase && this.supabase) {
      try {
        await this.supabase.from('financials').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteFinancial failed', err);
      }
    }
    const records = this.getLocal<FinancialRecord[]>('financials', INITIAL_FINANCIALS);
    this.setLocal(
      'financials',
      records.filter((r) => r.id !== id)
    );
    return true;
  }

  // ===================== CATALOG MANAGEMENT (SESUAI SKEMA SUPABASE USER) =====================
  /**
   * 1. Fetch & Update `public.catalog_settings` (id = 'global_config')
   */
  public getCatalogDisplayOptions(): CatalogDisplayOptions {
    return this.getLocal<CatalogDisplayOptions>(
      'catalog_display_options',
      DEFAULT_CATALOG_DISPLAY_OPTIONS
    );
  }

  public saveCatalogDisplayOptions(opts: Partial<CatalogDisplayOptions>): CatalogDisplayOptions {
    const current = this.getCatalogDisplayOptions();
    const updated: CatalogDisplayOptions = { ...current, ...opts };
    this.setLocal('catalog_display_options', updated);
    return updated;
  }

  public async bulkUpdateCatalogVisibility(
    items: EditableCatalogItem[],
    tampil: boolean
  ): Promise<boolean> {
    for (const item of items) {
      await this.updateCatalogItemMetadata({
        ...item,
        tampil_di_katalog: tampil,
      });
    }
    return true;
  }

  public async fetchCatalogSettings(): Promise<CatalogSettingsRow> {
    const local = this.getLocal<CatalogSettingsRow>('catalog_settings_row', DEFAULT_CATALOG_SETTINGS_ROW);
    if (this.hasLiveSupabase && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('catalog_settings')
          .select('*')
          .eq('id', 'global_config')
          .maybeSingle();

        if (!error && data) {
          const merged: CatalogSettingsRow = {
            ...DEFAULT_CATALOG_SETTINGS_ROW,
            ...data,
            id: 'global_config',
          };
          this.setLocal('catalog_settings_row', merged);
          return merged;
        }

        if (!error && !data) {
          // Insert default global_config row if empty
          const { data: inserted, error: insErr } = await this.supabase
            .from('catalog_settings')
            .upsert([local], { onConflict: 'id' })
            .select()
            .single();
          if (!insErr && inserted) {
            this.setLocal('catalog_settings_row', inserted as CatalogSettingsRow);
            return inserted as CatalogSettingsRow;
          }
        }
      } catch (err) {
        console.warn('Supabase fetchCatalogSettings fallback to local:', err);
      }
    }
    return local;
  }

  public async saveCatalogSettings(settings: Partial<CatalogSettingsRow>): Promise<CatalogSettingsRow> {
    const current = await this.fetchCatalogSettings();
    const bgType: 'gradient' | 'color' | 'image' =
      settings.hero_bg_type && ['gradient', 'color', 'image'].includes(settings.hero_bg_type)
        ? settings.hero_bg_type
        : current.hero_bg_type || 'gradient';

    // Pastikan kolom latar belakang yang tidak dipilih menjadi null (unselected)
    const finalGradient =
      bgType === 'gradient'
        ? settings.hero_bg_gradient !== undefined
          ? settings.hero_bg_gradient
          : current.hero_bg_gradient || 'linear-gradient(135deg, #064e3b 0%, #059669 100%)'
        : null;

    const finalColor =
      bgType === 'color'
        ? settings.hero_bg_color !== undefined
          ? settings.hero_bg_color
          : current.hero_bg_color || '#047857'
        : null;

    const finalImagePath =
      bgType === 'image'
        ? settings.hero_bg_image_path !== undefined
          ? settings.hero_bg_image_path
          : current.hero_bg_image_path
        : null;

    const payload: CatalogSettingsRow = {
      ...current,
      ...settings,
      id: 'global_config',
      layout_mode: settings.layout_mode === 'list' ? 'list' : 'grid',
      hero_bg_type: bgType,
      hero_bg_gradient: finalGradient,
      hero_bg_color: finalColor,
      hero_bg_image_path: finalImagePath,
      updated_at: new Date().toISOString(),
    };

    this.setLocal('catalog_settings_row', payload);

    if (this.hasLiveSupabase && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('catalog_settings')
          .upsert(
            [
              {
                id: 'global_config',
                whatsapp_number: payload.whatsapp_number,
                hero_message: payload.hero_message,
                layout_mode: payload.layout_mode,
                hero_bg_type: payload.hero_bg_type,
                hero_bg_gradient: payload.hero_bg_gradient,
                hero_bg_color: payload.hero_bg_color,
                hero_bg_image_path: payload.hero_bg_image_path,
                logo_path: payload.logo_path,
              },
            ],
            { onConflict: 'id' }
          )
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }
        if (data) {
          this.setLocal('catalog_settings_row', data as CatalogSettingsRow);
          return data as CatalogSettingsRow;
        }
      } catch (err) {
        console.warn('Supabase saveCatalogSettings error:', err);
        throw err;
      }
    }

    return payload;
  }

  /**
   * 2. Fetch, Add, Update, Delete `public.catalog_categories`
   */
  public async fetchCatalogCategories(): Promise<CatalogCategoryRow[]> {
    const local = this.getLocal<CatalogCategoryRow[]>('catalog_categories_rows', INITIAL_CATALOG_CATEGORIES_ROWS);
    if (this.hasLiveSupabase && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('catalog_categories')
          .select('*')
          .order('urutan', { ascending: true })
          .order('created_at', { ascending: true });

        if (!error && data) {
          this.setLocal('catalog_categories_rows', data as CatalogCategoryRow[]);
          return data as CatalogCategoryRow[];
        }
      } catch (err) {
        console.warn('Supabase fetchCatalogCategories fallback to local:', err);
      }
    }
    return [...local].sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0));
  }

  public async addCatalogCategory(name: string, urutan = 0): Promise<CatalogCategoryRow> {
    if (this.hasLiveSupabase && this.supabase) {
      const { data, error } = await this.supabase
        .from('catalog_categories')
        .insert([{ name: name.trim(), urutan: Number(urutan) || 0 }])
        .select()
        .single();

      if (error) throw new Error(error.message);
      if (data) {
        const list = this.getLocal<CatalogCategoryRow[]>('catalog_categories_rows', INITIAL_CATALOG_CATEGORIES_ROWS);
        this.setLocal('catalog_categories_rows', [...list, data as CatalogCategoryRow]);
        return data as CatalogCategoryRow;
      }
    }

    const newCat: CatalogCategoryRow = {
      id: crypto.randomUUID ? crypto.randomUUID() : `cat-${Date.now()}`,
      name: name.trim(),
      urutan: Number(urutan) || 0,
      created_at: new Date().toISOString(),
    };
    const list = this.getLocal<CatalogCategoryRow[]>('catalog_categories_rows', INITIAL_CATALOG_CATEGORIES_ROWS);
    this.setLocal('catalog_categories_rows', [...list, newCat]);
    return newCat;
  }

  public async updateCatalogCategory(id: string, name: string, urutan: number): Promise<boolean> {
    if (this.hasLiveSupabase && this.supabase) {
      const { error } = await this.supabase
        .from('catalog_categories')
        .update({ name: name.trim(), urutan: Number(urutan) || 0 })
        .eq('id', id);

      if (error) throw new Error(error.message);
    }

    const list = this.getLocal<CatalogCategoryRow[]>('catalog_categories_rows', INITIAL_CATALOG_CATEGORIES_ROWS);
    this.setLocal(
      'catalog_categories_rows',
      list.map((c) => (c.id === id ? { ...c, name: name.trim(), urutan: Number(urutan) || 0 } : c))
    );
    return true;
  }

  public async deleteCatalogCategory(id: string): Promise<boolean> {
    if (this.hasLiveSupabase && this.supabase) {
      const { error } = await this.supabase.from('catalog_categories').delete().eq('id', id);
      if (error) throw new Error(error.message);
    }

    const list = this.getLocal<CatalogCategoryRow[]>('catalog_categories_rows', INITIAL_CATALOG_CATEGORIES_ROWS);
    this.setLocal(
      'catalog_categories_rows',
      list.filter((c) => c.id !== id)
    );
    return true;
  }

  /**
   * 3. Fetch View `public.katalog_produk` (Data yang tampil di katalog publik)
   *    serta daftar lengkap semua `services` (layanan) + `items` (inventory) untuk dikelola di Admin Katalog
   */
  public async fetchKatalogViewProducts(): Promise<KatalogProdukViewRow[]> {
    if (this.hasLiveSupabase && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('katalog_produk')
          .select('*')
          .order('urutan', { ascending: true });

        if (!error && data) {
          return data as KatalogProdukViewRow[];
        }
      } catch (err) {
        console.warn('Supabase fetchKatalogViewProducts fallback:', err);
      }
    }

    // Fallback konstruksi view dari services & items lokal yang tampil_di_katalog = true
    const allEditable = await this.fetchAllEditableCatalogItems();
    return allEditable
      .filter((x) => x.tampil_di_katalog)
      .map((x) => ({
        sumber: x.sumber,
        id: x.id,
        name: x.name,
        deskripsi: x.deskripsi,
        foto_path: x.foto_path,
        category_id: x.category_id,
        urutan: x.urutan,
        harga_mulai: x.harga_mulai,
        varian: x.varian,
      }));
  }

  /**
   * Mengambil seluruh item dari tabel `services` (sumber: 'layanan') dan `items` (sumber: 'inventory')
   * agar admin dapat menyalakan/mematikan `tampil_di_katalog`, mengubah `deskripsi`, `foto_path`,
   * `category_id`, `urutan`, maupun harga/varian langsung dari menu Katalog.
   */
  public async fetchAllEditableCatalogItems(): Promise<EditableCatalogItem[]> {
    const [servicesList, itemsList] = await Promise.all([
      this.fetchServices(),
      this.fetchItems(),
    ]);

    const fromServices: EditableCatalogItem[] = servicesList.map((s, idx) => {
      const details = s.service_detail || [];
      const prices = details
        .map((d) => {
          if (typeof d.harga === 'number' && d.harga > 0) return d.harga;
          if (d.range_harga && d.range_harga.length > 0) {
            const rPrices = d.range_harga.map((r) => Number(r.rangePrice)).filter((n) => n > 0);
            if (rPrices.length > 0) return Math.min(...rPrices);
          }
          return null;
        })
        .filter((n): n is number => n !== null);

      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

      return {
        sumber: 'layanan',
        id: String(s.id),
        name: s.name,
        deskripsi: s.deskripsi || '',
        foto_path: s.foto_path || '',
        category_id: s.category_id || null,
        urutan: typeof s.urutan === 'number' ? s.urutan : idx + 1,
        tampil_di_katalog: Boolean(s.tampil_di_katalog),
        harga_mulai: minPrice,
        varian: details.map((d) => ({
          tipe: d.tipe,
          bahan: d.bahan,
          ukuran: d.ukuran,
          harga: d.harga,
          range_harga: d.range_harga,
        })),
      };
    });

    const fromInventory: EditableCatalogItem[] = itemsList.map((i, idx) => ({
      sumber: 'inventory',
      id: String(i.id),
      name: i.name,
      deskripsi: i.deskripsi || '',
      foto_path: i.foto_path || '',
      category_id: i.category_id || null,
      urutan: typeof i.urutan === 'number' ? i.urutan : idx + 1,
      tampil_di_katalog: Boolean(i.tampil_di_katalog),
      harga_mulai: Number(i.price) || 0,
      unit: i.unit,
      stock: i.stock,
      varian: [],
    }));

    return [...fromServices, ...fromInventory].sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0));
  }

  /**
   * Update kolom katalog pada tabel `services` atau `items`
   * (`name`, `deskripsi`, `foto_path`, `category_id`, `urutan`, `tampil_di_katalog`, dan `price` untuk inventory)
   */
  public async updateCatalogItemMetadata(
    item: EditableCatalogItem
  ): Promise<boolean> {
    const table = item.sumber === 'layanan' ? 'services' : 'items';
    const updatePayload: Record<string, any> = {
      name: item.name.trim(),
      deskripsi: item.deskripsi.trim() || null,
      foto_path: item.foto_path.trim() || null,
      category_id: item.category_id || null,
      urutan: Number(item.urutan) || 0,
      tampil_di_katalog: Boolean(item.tampil_di_katalog),
    };

    if (item.sumber === 'inventory') {
      updatePayload.price = Number(item.harga_mulai) || 0;
    }

    if (this.hasLiveSupabase && this.supabase) {
      const { error } = await this.supabase
        .from(table)
        .update(updatePayload)
        .eq('id', item.id);

      if (error) {
        throw new Error(error.message);
      }

      // Jika layanan dan varian diubah, kita juga bisa sinkronkan service_details
      if (item.sumber === 'layanan' && Array.isArray(item.varian) && item.varian.length > 0) {
        await this.supabase.from('service_details').delete().eq('service_id', item.id);
        const detailRows = item.varian.map((v) => ({
          service_id: item.id,
          tipe: v.tipe || '-',
          bahan: v.bahan || '-',
          ukuran: v.ukuran || '-',
          harga: typeof v.harga === 'number' ? v.harga : null,
          range_harga: v.range_harga || null,
        }));
        await this.supabase.from('service_details').insert(detailRows);
      }
    }

    // Update local cache
    if (item.sumber === 'layanan') {
      const services = this.getLocal<Service[]>('services', INITIAL_SERVICES);
      this.setLocal(
        'services',
        services.map((s) =>
          String(s.id) === String(item.id)
            ? {
                ...s,
                ...updatePayload,
                service_detail: item.varian.map((v) => ({
                  tipe: v.tipe || '-',
                  bahan: v.bahan || '-',
                  ukuran: v.ukuran || '-',
                  harga: v.harga,
                  range_harga: v.range_harga,
                })),
              }
            : s
        )
      );
    } else {
      const items = this.getLocal<StockItem[]>('items', INITIAL_ITEMS);
      this.setLocal(
        'items',
        items.map((i) =>
          String(i.id) === String(item.id)
            ? { ...i, ...updatePayload }
            : i
        )
      );
    }

    return true;
  }

  /**
   * Tambah produk baru langsung dari halaman Katalog ke tabel `services` (layanan) atau `items` (inventory)
   */
  public async createNewCatalogSourceItem(payload: {
    sumber: 'layanan' | 'inventory';
    name: string;
    deskripsi: string;
    foto_path: string;
    category_id: string | null;
    urutan: number;
    tampil_di_katalog: boolean;
    harga_mulai: number;
    unit?: string;
    stock?: number;
    varian?: {
      tipe?: string;
      bahan?: string;
      ukuran?: string;
      harga?: number | null;
      range_harga?: any[] | null;
    }[];
  }): Promise<boolean> {
    if (payload.sumber === 'layanan') {
      const servicePayload = {
        name: payload.name.trim(),
        deskripsi: payload.deskripsi.trim() || null,
        foto_path: payload.foto_path.trim() || null,
        category_id: payload.category_id || null,
        urutan: Number(payload.urutan) || 0,
        tampil_di_katalog: Boolean(payload.tampil_di_katalog),
      };

      const details =
        payload.varian && payload.varian.length > 0
          ? payload.varian
          : [
              {
                tipe: 'Standar',
                bahan: '-',
                ukuran: '-',
                harga: Number(payload.harga_mulai) || 0,
                range_harga: null,
              },
            ];

      if (this.hasLiveSupabase && this.supabase) {
        const { data: sData, error: sErr } = await this.supabase
          .from('services')
          .insert([servicePayload])
          .select()
          .single();

        if (sErr) throw new Error(sErr.message);
        if (sData) {
          const detailRows = details.map((d) => ({
            service_id: sData.id,
            tipe: d.tipe || '-',
            bahan: d.bahan || '-',
            ukuran: d.ukuran || '-',
            harga: typeof d.harga === 'number' ? d.harga : Number(payload.harga_mulai) || 0,
            range_harga: d.range_harga || null,
          }));
          await this.supabase.from('service_details').insert(detailRows);
          return true;
        }
      }

      const localServices = this.getLocal<Service[]>('services', INITIAL_SERVICES);
      this.setLocal('services', [
        {
          id: `srv-${Date.now()}`,
          ...servicePayload,
          service_detail: details,
          service_stock: [],
        },
        ...localServices,
      ]);
      return true;
    } else {
      const itemPayload = {
        name: payload.name.trim(),
        stock: Number(payload.stock) ?? 100,
        unit: payload.unit || 'pcs',
        price: Number(payload.harga_mulai) || 0,
        deskripsi: payload.deskripsi.trim() || null,
        foto_path: payload.foto_path.trim() || null,
        category_id: payload.category_id || null,
        urutan: Number(payload.urutan) || 0,
        tampil_di_katalog: Boolean(payload.tampil_di_katalog),
      };

      if (this.hasLiveSupabase && this.supabase) {
        const { error } = await this.supabase.from('items').insert([itemPayload]);
        if (error) throw new Error(error.message);
        return true;
      }

      const localItems = this.getLocal<StockItem[]>('items', INITIAL_ITEMS);
      this.setLocal('items', [{ id: `stk-${Date.now()}`, ...itemPayload }, ...localItems]);
      return true;
    }
  }

  public async uploadCatalogImage(file: File, maxWidth = 900, quality = 0.82): Promise<string> {
    if (this.hasLiveSupabase && this.supabase) {
      try {
        const ext = file.name.split('.').pop() || 'jpg';
        const filePath = `products/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
        const { data, error } = await this.supabase.storage
          .from('catalog')
          .upload(filePath, file, { upsert: true });

        if (!error && data) {
          const { data: pubUrl } = this.supabase.storage.from('catalog').getPublicUrl(filePath);
          if (pubUrl?.publicUrl) {
            return pubUrl.publicUrl;
          }
        }
      } catch {
        // Fallback to compressed Base64 DataURL
      }
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error('Gagal memuat file gambar'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsDataURL(file);
    });
  }
}

export const dataStore = new DataStore();
