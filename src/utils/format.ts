/**
 * Format number to Indonesian Rupiah currency string
 */
export function formatRupiah(amount: number | string | null | undefined): string {
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d.-]/g, '')) : (amount ?? 0);
  if (isNaN(num)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Get current date strictly formatted as YYYY-MM-DD (ISO)
 */
export function getTodayISODate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Ensures a date is strictly formatted as YYYY-MM-DD (ISO standard).
 */
export function ensureISODate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) {
    return getTodayISODate();
  }

  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return getTodayISODate();
    return dateInput.toISOString().split('T')[0];
  }

  const rawStr = String(dateInput).trim();
  if (!rawStr) return getTodayISODate();

  const ymdMatch = rawStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (ymdMatch) {
    const y = parseInt(ymdMatch[1], 10);
    const m = parseInt(ymdMatch[2], 10);
    const d = parseInt(ymdMatch[3], 10);
    if (y >= 2000 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }

  const dmyMatch = rawStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10);
    const y = parseInt(dmyMatch[3], 10);
    if (y >= 2000 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }

  const parsed = new Date(rawStr);
  if (!isNaN(parsed.getTime())) {
    const iso = parsed.toISOString().split('T')[0];
    const year = parseInt(iso.split('-')[0], 10);
    if (year >= 2000 && year <= 2100) {
      return iso;
    }
  }

  return getTodayISODate();
}

export function parseISODateParts(dateInput: string | Date | null | undefined): { year: number; month: number; day: number } | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return null;
    return {
      year: dateInput.getFullYear(),
      month: dateInput.getMonth() + 1,
      day: dateInput.getDate(),
    };
  }

  const str = String(dateInput).trim();
  const match = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) {
    return {
      year: parseInt(match[1], 10),
      month: parseInt(match[2], 10),
      day: parseInt(match[3], 10),
    };
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
    };
  }
  return null;
}

export function formatDateIndo(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  const parts = parseISODateParts(dateInput);
  if (!parts) return String(dateInput);
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  const day = parts.day.toString().padStart(2, '0');
  const month = months[parts.month - 1] || '';
  const year = parts.year;
  return `${day} ${month} ${year}`;
}

export function formatDateFullIndo(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  const parts = parseISODateParts(dateInput);
  if (!parts) return String(dateInput);

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const day = parts.day.toString().padStart(2, '0');
  const month = months[parts.month - 1] || '';
  const year = parts.year;
  return `${day} ${month} ${year}`;
}

export function formatHariTanggalIndo(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  const parts = parseISODateParts(dateInput);
  if (!parts) return String(dateInput);

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const d = new Date(parts.year, parts.month - 1, parts.day);
  const dayName = days[d.getDay()] || '';
  const day = parts.day.toString().padStart(2, '0');
  const month = months[parts.month - 1] || '';
  const year = parts.year;
  return `${dayName}, ${day} ${month} ${year}`;
}

export function roundToNearestFive(num: number): number {
  if (num <= 0) return 0;
  const sisa = num % 100;
  const basis = Math.floor(num / 100) * 100;
  if (sisa === 0) {
    return num;
  } else if (sisa < 50) {
    return basis + 50;
  } else {
    return basis + 100;
  }
}

export function customRound(num: number): number {
  const integer = Math.floor(num);
  const decimal = num - integer;
  if (decimal === 0 || decimal === 0.5) {
    return num;
  } else if (decimal < 0.5) {
    return integer + 0.5;
  } else {
    return integer + 1;
  }
}

/**
 * Returns distinct colors and badge styling for order statuses
 */
export function getOrderStatusBadgeStyle(status: string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
  selectClass: string;
} {
  switch (status) {
    case 'Selesai':
      return {
        bg: 'bg-emerald-100',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
        dot: 'bg-emerald-500',
        selectClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100',
      };
    case 'Dalam Proses':
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        border: 'border-amber-300',
        dot: 'bg-amber-500',
        selectClass: 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100',
      };
    case 'Belum Diambil':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-300',
        dot: 'bg-blue-500',
        selectClass: 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100',
      };
    case 'Belum Lunas':
      return {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        border: 'border-orange-300',
        dot: 'bg-orange-500',
        selectClass: 'bg-orange-50 text-orange-800 border-orange-300 hover:bg-orange-100',
      };
    case 'Dibatalkan':
      return {
        bg: 'bg-rose-100',
        text: 'text-rose-800',
        border: 'border-rose-300',
        dot: 'bg-rose-500',
        selectClass: 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100',
      };
    default:
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-300',
        dot: 'bg-slate-400',
        selectClass: 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100',
      };
  }
}
