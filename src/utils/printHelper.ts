import { toPng, toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';
import Swal from 'sweetalert2';

export interface PrintOptions {
  documentTitle?: string;
  type?: 'kwitansi' | 'thermal';
  paperWidth?: '58mm' | '80mm';
  customHeightMm?: number;
}

export const THERMAL_FONT =
  "'Roboto Condensed','Arial Narrow','Liberation Sans Narrow','Helvetica Neue',Arial,sans-serif";

export function getThermalLayout(paperWidth: '58mm' | '80mm') {
  const paperMm = paperWidth === '80mm' ? 80 : 58;
  const boxMm = +(paperMm * 0.9).toFixed(1);
  const padMm = +(boxMm * 0.05).toFixed(1);
  const fontPx = paperWidth === '80mm' ? 13 : 12;
  return { paperMm, boxMm, padMm, fontPx };
}

export async function getThermalLogo(customSrc?: string): Promise<string> {
  if (customSrc) return customSrc;
  return '';
}

export async function printElement(
  elementId: string,
  options?: PrintOptions | string
): Promise<boolean> {
  const opts: PrintOptions =
    typeof options === 'string'
      ? { documentTitle: options }
      : options || {};

  const documentTitle = opts.documentTitle || 'Dokumen';
  const printType = opts.type || (elementId.includes('thermal') ? 'thermal' : 'kwitansi');
  const paperWidth = opts.paperWidth || '58mm';

  const targetElement = document.getElementById(elementId);
  if (!targetElement) {
    window.print();
    return false;
  }

  const thermalWidth = paperWidth === '80mm' ? '80mm' : '58mm';
  const L = getThermalLayout(paperWidth);

  const rect = targetElement.getBoundingClientRect();
  const measuredHeightPx = Math.max(
    targetElement.offsetHeight || 0,
    targetElement.scrollHeight || 0,
    rect.height || 0
  );
  const autoHeightMm = Math.max(45, Math.ceil(measuredHeightPx * 0.264583) + 3);
  const exactHeightMm =
    opts.customHeightMm && opts.customHeightMm > 30 ? opts.customHeightMm : autoHeightMm;

  const styleId = 'direct-print-stylesheet';
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) existingStyle.remove();

  let mountEl: HTMLElement | null = null;
  if (printType === 'thermal') {
    const existingMount = document.getElementById('direct-thermal-mount');
    if (existingMount) existingMount.remove();

    mountEl = document.createElement('div');
    mountEl.id = 'direct-thermal-mount';
    mountEl.innerHTML = targetElement.innerHTML;
    mountEl.className = targetElement.className;
    document.body.appendChild(mountEl);
  }

  const styleEl = document.createElement('style');
  styleEl.id = styleId;

  if (printType === 'thermal') {
    styleEl.innerHTML = `
      @media print {
        @page {
          size: ${thermalWidth} ${exactHeightMm}mm !important;
          margin: 0mm !important;
        }
        html, body {
          width: ${thermalWidth} !important;
          height: ${exactHeightMm}mm !important;
          max-height: ${exactHeightMm}mm !important;
          min-height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          color: #000000 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          overflow: hidden !important;
        }
        .no-print { display: none !important; }
        body > *:not(#direct-thermal-mount) { display: none !important; }
        #direct-thermal-mount {
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: ${((L.paperMm - L.boxMm) / 2).toFixed(1)}mm !important;
          width: ${L.boxMm}mm !important;
          max-width: ${L.boxMm}mm !important;
          height: ${exactHeightMm}mm !important;
          max-height: ${exactHeightMm}mm !important;
          margin: 0 !important;
          padding: 2mm ${L.padMm}mm !important;
          border: none !important;
          background: #ffffff !important;
          font-family: ${THERMAL_FONT} !important;
          font-size: ${L.fontPx}px !important;
          font-weight: 500 !important;
          line-height: 1.25 !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
        }
        #direct-thermal-mount, #direct-thermal-mount * {
          color: #000000 !important;
          border-color: #000000 !important;
          font-family: ${THERMAL_FONT} !important;
        }
      }
    `;
  } else {
    styleEl.innerHTML = `
      @media print {
        @page { size: A4 portrait; margin: 8mm 10mm; }
        html, body {
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          color: #1e293b !important;
        }
        .no-print { display: none !important; }
        body * { visibility: hidden !important; }
        #${elementId}, #${elementId} * { visibility: visible !important; }
        #${elementId} {
          position: static !important;
          margin: 0 auto !important;
          padding: 0 !important;
          box-shadow: none !important;
          border: none !important;
          width: 100% !important;
          max-width: 100% !important;
        }
      }
    `;
  }

  document.head.appendChild(styleEl);
  const prevTitle = document.title;
  document.title = printType === 'thermal' ? '' : documentTitle;

  const cleanup = () => {
    document.title = prevTitle;
    const s = document.getElementById(styleId);
    if (s && document.head.contains(s)) document.head.removeChild(s);
    if (mountEl && document.body.contains(mountEl)) mountEl.remove();
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);
  await new Promise((resolve) => setTimeout(resolve, 80));

  try {
    window.print();
  } catch (err) {
    console.warn('window.print() error:', err);
  }

  setTimeout(cleanup, 2500);
  return true;
}

export async function printThermalPureImage(
  elementId: string,
  paperWidth: '58mm' | '80mm' = '58mm',
  customHeightMm?: number
): Promise<boolean> {
  return printElement(elementId, { type: 'thermal', paperWidth, customHeightMm });
}

export async function saveElementAsImage(elementId: string, filename: string): Promise<boolean> {
  const targetElement = document.getElementById(elementId);
  if (!targetElement) return false;

  try {
    Swal.fire({
      title: 'Menyiapkan Gambar...',
      text: 'Mohon tunggu sebentar',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const dataUrl = await toPng(targetElement, {
      pixelRatio: 2.5,
      backgroundColor: '#ffffff',
      skipFonts: true,
      filter: (node: any) => !(node.classList && node.classList.contains('no-print')),
    });

    const link = document.createElement('a');
    link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      icon: 'success',
      title: 'Gambar Berhasil Disimpan!',
      text: `File "${link.download}" telah diunduh.`,
      timer: 1800,
      showConfirmButton: false,
    });
    return true;
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal Menyimpan Gambar',
      text: err?.message || 'Terjadi kesalahan saat mengekspor gambar.',
    });
    return false;
  }
}

export async function saveElementAsPdf(
  elementId: string,
  filename: string,
  orientation: 'p' | 'l' = 'p',
  customPageSizeMm?: [number, number]
): Promise<boolean> {
  const targetElement = document.getElementById(elementId);
  if (!targetElement) return false;

  try {
    Swal.fire({
      title: 'Menyiapkan Dokumen PDF...',
      text: 'Mohon tunggu sebentar',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const canvas = await toCanvas(targetElement, {
      pixelRatio: 2.5,
      backgroundColor: '#ffffff',
      skipFonts: true,
      style: { boxShadow: 'none' },
      filter: (node: any) => !(node.classList && node.classList.contains('no-print')),
    });

    const imgData = canvas.toDataURL('image/png');
    const isCustomSize = Boolean(customPageSizeMm && customPageSizeMm[0] && customPageSizeMm[1]);
    const pdf = new jsPDF({
      orientation: isCustomSize ? 'p' : orientation,
      unit: 'mm',
      format: isCustomSize ? customPageSizeMm : 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = isCustomSize ? pdfWidth * 0.05 : 8;
    const availableWidth = pdfWidth - margin * 2;
    const imgWidth = availableWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (isCustomSize) {
      pdf.addImage(imgData, 'PNG', margin, 0, imgWidth, Math.min(imgHeight, pdfHeight), undefined, 'FAST');
    } else {
      const xOffset = (pdfWidth - imgWidth) / 2;
      pdf.addImage(imgData, 'PNG', xOffset, margin, imgWidth, Math.min(imgHeight, pdfHeight - margin * 2), undefined, 'FAST');
    }

    const finalName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(finalName);

    Swal.fire({
      icon: 'success',
      title: 'PDF Berhasil Disimpan!',
      text: `File "${finalName}" telah diunduh.`,
      timer: 1800,
      showConfirmButton: false,
    });
    return true;
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal Menyimpan PDF',
      text: err?.message || 'Terjadi kesalahan saat membuat file PDF.',
    });
    return false;
  }
}
