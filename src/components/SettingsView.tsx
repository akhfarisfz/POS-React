import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  Store,
  Printer,
  Key,
  Sliders,
  Image as ImageIcon,
  Upload,
  LayoutGrid,
  List as ListIcon,
  Palette,
  MessageCircle,
} from 'lucide-react';
import { StoreSettings, CatalogSettingsRow, CatalogDisplayOptions } from '../types';
import { dataStore, DEFAULT_CATALOG_SETTINGS_ROW } from '../services/store';
import Swal from 'sweetalert2';

interface SettingsViewProps {
  settings: StoreSettings;
  onUpdateSettings: (newSettings: Partial<StoreSettings>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdateSettings }) => {
  const [formData, setFormData] = useState<StoreSettings>(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'katalog'>('general');

  // State Pengaturan Global Katalog
  const [catalogSettings, setCatalogSettings] = useState<CatalogSettingsRow>(
    DEFAULT_CATALOG_SETTINGS_ROW
  );
  const [displayOptions, setDisplayOptions] = useState<CatalogDisplayOptions>(
    dataStore.getCatalogDisplayOptions()
  );
  const [isSavingCatalog, setIsSavingCatalog] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroBgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dataStore.fetchCatalogSettings().then((res) => {
      setCatalogSettings(res);
    });
    setDisplayOptions(dataStore.getCatalogDisplayOptions());
  }, []);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    Swal.fire({
      icon: 'success',
      title: 'Pengaturan Toko Disimpan',
      text: 'Profil toko dan pengaturan printer berhasil diperbarui.',
      timer: 1600,
      showConfirmButton: false,
    });
  };

  const handleSaveCatalogGlobal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCatalog(true);
    try {
      dataStore.saveCatalogDisplayOptions(displayOptions);
      const saved = await dataStore.saveCatalogSettings(catalogSettings);
      setCatalogSettings(saved);
      Swal.fire({
        icon: 'success',
        title: 'Pengaturan Katalog Disimpan!',
        text: 'Tampilan katalog, warna, visibilitas informasi, dan nomor WhatsApp berhasil diperbarui.',
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: err?.message || 'Terjadi kesalahan saat menyimpan pengaturan katalog.',
      });
    } finally {
      setIsSavingCatalog(false);
    }
  };

  const getHeroPreviewStyle = (): React.CSSProperties => {
    if (catalogSettings.hero_bg_type === 'color') {
      return { backgroundColor: catalogSettings.hero_bg_color || '#047857' };
    }
    if (catalogSettings.hero_bg_type === 'image' && catalogSettings.hero_bg_image_path) {
      return {
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.75)), url(${catalogSettings.hero_bg_image_path})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return {
      background:
        catalogSettings.hero_bg_gradient || 'linear-gradient(135deg, #0f172a 0%, #047857 100%)',
    };
  };

  const gradientPresets = [
    { name: 'Hijau Emerald Kharisma', value: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)' },
    { name: 'Biru Royal Profesional', value: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' },
    { name: 'Hitam Emas Mewah', value: 'linear-gradient(135deg, #0f172a 0%, #b45309 100%)' },
    { name: 'Merah Maroon Elegan', value: 'linear-gradient(135deg, #7f1d1d 0%, #e11d48 100%)' },
    { name: 'Ungu Modern Kreatif', value: 'linear-gradient(135deg, #3b0764 0%, #7c3aed 100%)' },
    { name: 'Oranye Sunset Hangat', value: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)' },
    { name: 'Tosca Segar', value: 'linear-gradient(135deg, #134e4a 0%, #0d9488 100%)' },
    { name: 'Biru Langit Cerah', value: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 100%)' },
    { name: 'Pink Rose Ceria', value: 'linear-gradient(135deg, #831843 0%, #db2777 100%)' },
    { name: 'Dark Slate Minimalis', value: 'linear-gradient(135deg, #090d16 0%, #334155 100%)' },
  ];

  const solidColorPresets = [
    { hex: '#047857', label: 'Emerald' },
    { hex: '#10b981', label: 'Hijau Cerah' },
    { hex: '#15803d', label: 'Hijau Daun' },
    { hex: '#0d9488', label: 'Tosca' },
    { hex: '#0891b2', label: 'Cyan' },
    { hex: '#0284c7', label: 'Biru Langit' },
    { hex: '#2563eb', label: 'Biru Royal' },
    { hex: '#1d4ed8', label: 'Biru Tua' },
    { hex: '#4f46e5', label: 'Indigo' },
    { hex: '#7c3aed', label: 'Ungu' },
    { hex: '#9333ea', label: 'Purple' },
    { hex: '#c026d3', label: 'Magenta' },
    { hex: '#db2777', label: 'Pink' },
    { hex: '#e11d48', label: 'Rose' },
    { hex: '#dc2626', label: 'Merah' },
    { hex: '#991b1b', label: 'Maroon' },
    { hex: '#ea580c', label: 'Oranye' },
    { hex: '#d97706', label: 'Amber Gold' },
    { hex: '#ca8a04', label: 'Emas' },
    { hex: '#65a30d', label: 'Lime' },
    { hex: '#57534e', label: 'Warm Stone' },
    { hex: '#334155', label: 'Abu Gelap' },
    { hex: '#1e293b', label: 'Navy Gelap' },
    { hex: '#0f172a', label: 'Hitam Pekat' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Pilihan Tab */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pengaturan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola profil toko, printer kasir, serta tampilan & kontak katalog online Anda
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Profil Toko & Printer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('katalog')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'katalog'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Pengaturan Global Katalog</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PROFIL TOKO & PRINTER */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-700" />
              Identitas Toko / Nota Struk
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Toko / Usaha</label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WA Office</label>
                <input
                  type="text"
                  value={formData.officePhone}
                  onChange={(e) => setFormData({ ...formData, officePhone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WA Online / Kasir</label>
                <input
                  type="text"
                  value={formData.onlinePhone}
                  onChange={(e) => setFormData({ ...formData, onlinePhone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Toko</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kota</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-700" />
                Pengaturan Printer Thermal & PIN Kasir
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lebar Kertas Printer Thermal</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, printerPaperWidth: '58mm' })}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-bold text-center cursor-pointer ${
                      formData.printerPaperWidth === '58mm'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    58 mm (Kecil Standar)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, printerPaperWidth: '80mm' })}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-bold text-center cursor-pointer ${
                      formData.printerPaperWidth === '80mm'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    80 mm (Lebar Besar)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kode PIN Masuk Kasir
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.accessCode}
                    onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
                    required
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-mono tracking-widest text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Profil Toko</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: PENGATURAN GLOBAL KATALOG */}
      {activeTab === 'katalog' && (
        <form onSubmit={handleSaveCatalogGlobal} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Kartu Kiri: Kontak WA, Judul Sambutan, Logo, & Model Tampilan */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Informasi Utama & Kontak Katalog</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp Penerima Pesanan Katalog <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={catalogSettings.whatsapp_number}
                  onChange={(e) =>
                    setCatalogSettings({
                      ...catalogSettings,
                      whatsapp_number: e.target.value.replace(/\D/g, ''),
                    })
                  }
                  placeholder="Contoh: 6285232217627"
                  required
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Gunakan awalan <strong>628...</strong> (tanpa tanda + atau spasi). Pelanggan yang klik tombol pesan di katalog akan diarahkan ke nomor ini.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul / Kalimat Sambutan Katalog <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={catalogSettings.hero_message}
                  onChange={(e) =>
                    setCatalogSettings({ ...catalogSettings, hero_message: e.target.value })
                  }
                  placeholder="Contoh: Pusat Cetak Murah & Berkualitas"
                  required
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              {/* Pilihan Layout */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Model Tampilan Daftar Produk
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setCatalogSettings({ ...catalogSettings, layout_mode: 'grid' })
                    }
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                      catalogSettings.layout_mode === 'grid'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span>Kotak-Kotak (Grid)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setCatalogSettings({ ...catalogSettings, layout_mode: 'list' })
                    }
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                      catalogSettings.layout_mode === 'list'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ListIcon className="w-4 h-4" />
                    <span>Daftar Memanjang (List)</span>
                  </button>
                </div>
              </div>

              {/* Upload Logo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Logo Toko di Katalog
                </label>
                <div className="flex items-center gap-3">
                  {catalogSettings.logo_path ? (
                    <div className="relative w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 p-1 shrink-0">
                      <img
                        src={catalogSettings.logo_path}
                        alt="Logo"
                        className="w-full h-full object-contain rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setCatalogSettings({ ...catalogSettings, logo_path: null })
                        }
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center shadow cursor-pointer"
                        title="Hapus Logo"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const url = await dataStore.uploadCatalogImage(f, 400, 0.85);
                        setCatalogSettings({ ...catalogSettings, logo_path: url });
                        e.target.value = '';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Foto Logo</span>
                    </button>
                    <input
                      type="text"
                      value={catalogSettings.logo_path || ''}
                      onChange={(e) =>
                        setCatalogSettings({
                          ...catalogSettings,
                          logo_path: e.target.value || null,
                        })
                      }
                      placeholder="Atau tempel link gambar logo..."
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Sembunyikan / Tampilkan Informasi di Katalog */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <label className="block text-xs font-bold text-slate-800">
                  Sembunyikan / Tampilkan Informasi di Katalog:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'showPrice', label: 'Tampilkan Harga Produk' },
                    { key: 'showDescription', label: 'Tampilkan Deskripsi Produk' },
                    { key: 'showVariants', label: 'Tampilkan Pilihan Spesifikasi/Varian' },
                    { key: 'showOrderButton', label: 'Tampilkan Tombol Pesan WA' },
                    { key: 'showCategoryBadge', label: 'Tampilkan Label Kategori' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white cursor-pointer font-semibold text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean((displayOptions as any)[item.key])}
                        onChange={(e) =>
                          setDisplayOptions({
                            ...displayOptions,
                            [item.key]: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Kartu Kanan: Warna Tema / Gambar Sampul Atas */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Palette className="w-4 h-4 text-purple-600" />
                  <span>Tampilan Sampul Atas (Banner Katalog)</span>
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Pilih Jenis Latar Belakang Sampul
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'gradient', label: 'Warna Gradasi' },
                      { id: 'color', label: 'Warna Polos' },
                      { id: 'image', label: 'Foto Banner' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          if (opt.id === 'gradient') {
                            setCatalogSettings({
                              ...catalogSettings,
                              hero_bg_type: 'gradient',
                              hero_bg_gradient:
                                catalogSettings.hero_bg_gradient ||
                                'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
                              hero_bg_color: null,
                              hero_bg_image_path: null,
                            });
                          } else if (opt.id === 'color') {
                            setCatalogSettings({
                              ...catalogSettings,
                              hero_bg_type: 'color',
                              hero_bg_color: catalogSettings.hero_bg_color || '#047857',
                              hero_bg_gradient: null,
                              hero_bg_image_path: null,
                            });
                          } else {
                            setCatalogSettings({
                              ...catalogSettings,
                              hero_bg_type: 'image',
                              hero_bg_gradient: null,
                              hero_bg_color: null,
                            });
                          }
                        }}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition ${
                          catalogSettings.hero_bg_type === opt.id
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pilihan Rekomendasi Tema (Suggest Tema) */}
                {catalogSettings.hero_bg_type === 'gradient' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700">
                        Rekomendasi Tema Pilihan (Tinggal Klik):
                      </label>
                      {catalogSettings.hero_bg_gradient && (
                        <button
                          type="button"
                          onClick={() =>
                            setCatalogSettings({
                              ...catalogSettings,
                              hero_bg_gradient: null,
                            })
                          }
                          className="text-[11px] font-bold text-slate-500 hover:text-red-600 cursor-pointer"
                        >
                          Batalkan Pilihan (Unselect)
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                      {gradientPresets.map((preset, idx) => {
                        const isSelected =
                          catalogSettings.hero_bg_type === 'gradient' &&
                          catalogSettings.hero_bg_gradient === preset.value;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setCatalogSettings({
                                ...catalogSettings,
                                hero_bg_type: 'gradient',
                                hero_bg_gradient: preset.value,
                                hero_bg_color: null,
                                hero_bg_image_path: null,
                              })
                            }
                            className={`h-11 px-3 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer flex items-center justify-between transition ${
                              isSelected
                                ? 'ring-2 ring-offset-2 ring-emerald-600 scale-[1.01]'
                                : 'opacity-90 hover:opacity-100'
                            }`}
                            style={{ background: preset.value }}
                          >
                            <span className="truncate">{preset.name}</span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-white text-slate-900 text-[10px] flex items-center justify-center shrink-0">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pilihan Palet Warna Polos Luas + Color Picker Bebas */}
                {catalogSettings.hero_bg_type === 'color' && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="color"
                          value={catalogSettings.hero_bg_color || '#047857'}
                          onChange={(e) =>
                            setCatalogSettings({
                              ...catalogSettings,
                              hero_bg_type: 'color',
                              hero_bg_color: e.target.value,
                              hero_bg_gradient: null,
                              hero_bg_image_path: null,
                            })
                          }
                          className="w-11 h-10 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0"
                          title="Klik untuk bebas memilih warna apa saja"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">
                            Pilih Warna Bebas (Color Picker)
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Klik kotak warna di samping atau ketik kode HEX
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={catalogSettings.hero_bg_color || ''}
                          onChange={(e) =>
                            setCatalogSettings({
                              ...catalogSettings,
                              hero_bg_type: 'color',
                              hero_bg_color: e.target.value || null,
                              hero_bg_gradient: null,
                              hero_bg_image_path: null,
                            })
                          }
                          placeholder="#047857"
                          className="w-28 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 uppercase text-center"
                        />
                        {catalogSettings.hero_bg_color && (
                          <button
                            type="button"
                            onClick={() =>
                              setCatalogSettings({
                                ...catalogSettings,
                                hero_bg_color: null,
                              })
                            }
                            className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-700 text-[11px] font-bold cursor-pointer"
                            title="Unselect warna polos"
                          >
                            Unselect
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Atau Pilih dari Palet 24 Warna Siap Pakai:
                      </label>
                      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                        {solidColorPresets.map((clr) => {
                          const isSelected =
                            catalogSettings.hero_bg_type === 'color' &&
                            (catalogSettings.hero_bg_color || '').toLowerCase() ===
                              clr.hex.toLowerCase();
                          return (
                            <button
                              key={clr.hex}
                              type="button"
                              onClick={() =>
                                setCatalogSettings({
                                  ...catalogSettings,
                                  hero_bg_type: 'color',
                                  hero_bg_color: clr.hex,
                                  hero_bg_gradient: null,
                                  hero_bg_image_path: null,
                                })
                              }
                              title={`${clr.label} (${clr.hex})`}
                              className={`h-9 rounded-xl border flex items-center justify-center cursor-pointer transition ${
                                isSelected
                                  ? 'ring-2 ring-offset-2 ring-slate-900 scale-105 border-white'
                                  : 'border-black/10 hover:scale-105'
                              }`}
                              style={{ backgroundColor: clr.hex }}
                            >
                              {isSelected && (
                                <span className="text-white text-xs font-bold drop-shadow">
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Pilihan Foto Banner */}
                {catalogSettings.hero_bg_type === 'image' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700">
                        Upload Foto Banner Sampul (Otomatis Unselect Semua Warna):
                      </label>
                      {catalogSettings.hero_bg_image_path && (
                        <button
                          type="button"
                          onClick={() =>
                            setCatalogSettings({
                              ...catalogSettings,
                              hero_bg_image_path: null,
                            })
                          }
                          className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                        >
                          Hapus Foto Banner
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        ref={heroBgInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const url = await dataStore.uploadCatalogImage(f, 1200, 0.82);
                          setCatalogSettings({
                            ...catalogSettings,
                            hero_bg_type: 'image',
                            hero_bg_image_path: url,
                            hero_bg_gradient: null,
                            hero_bg_color: null,
                          });
                          e.target.value = '';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => heroBgInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Gambar Sampul</span>
                      </button>
                      <input
                        type="text"
                        value={catalogSettings.hero_bg_image_path || ''}
                        onChange={(e) =>
                          setCatalogSettings({
                            ...catalogSettings,
                            hero_bg_type: 'image',
                            hero_bg_image_path: e.target.value || null,
                            hero_bg_gradient: null,
                            hero_bg_color: null,
                          })
                        }
                        placeholder="Atau tempel link gambar..."
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-700"
                      />
                    </div>
                  </div>
                )}

                {/* Pratinjau Sampul */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1.5">
                    Contoh Tampilan Atas Katalog Anda:
                  </span>
                  <div
                    className="rounded-2xl p-6 text-white text-center space-y-2 shadow-inner"
                    style={getHeroPreviewStyle()}
                  >
                    {catalogSettings.logo_path && (
                      <img
                        src={catalogSettings.logo_path}
                        alt="Logo"
                        className="w-11 h-11 mx-auto rounded-xl bg-white p-1 object-contain"
                      />
                    )}
                    <h4 className="font-black text-lg tracking-tight">
                      {catalogSettings.hero_message || 'Pusat Cetak Murah & Berkualitas'}
                    </h4>
                    <p className="text-[11px] text-white/85">
                      Order via WhatsApp: +{catalogSettings.whatsapp_number}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingCatalog}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isSavingCatalog ? 'Menyimpan...' : 'Simpan Pengaturan Katalog'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
