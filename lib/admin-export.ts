import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface ExportColumn {
  header: string;
  key: string;
}

const COMPANY_INFO = {
  brandName: 'FunPrint',
  companyName: 'OSHIVO EXIM (OPC) PVT LTD',
  address: 'No: 325, Paper Mills Road, Perambur, Chennai - 600011',
  mobile: '9344925600',
  email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'support@funprint.in',
  website: 'funprint.in',
};

// Helper to load logo as base64 data URL in browser
async function getLogoDataUrl(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/logo.png');
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Universal Export to PDF with Company Logo, Address, Phone, Email & Footer
 */
export async function exportToPDF({
  filename,
  title,
  subtitle,
  columns,
  data,
  orientation = 'landscape',
}: {
  filename: string;
  title: string;
  subtitle?: string;
  columns: ExportColumn[];
  data: Record<string, any>[];
  orientation?: 'portrait' | 'landscape';
}) {
  const doc = new jsPDF({
    orientation,
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;

  // 1. Top Brand Accent Stripe
  doc.setFillColor(255, 192, 6); // #FFC006
  doc.rect(0, 0, pageWidth, 5, 'F');

  // 2. Load and draw Logo
  const logoUrl = await getLogoDataUrl();
  let textLeft = margin;
  if (logoUrl) {
    try {
      doc.addImage(logoUrl, 'PNG', margin, 18, 44, 44);
      textLeft = margin + 52;
    } catch {
      textLeft = margin;
    }
  }

  // 3. Company Header Left (Brand & Registered Company Name)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(17, 24, 39); // Gray 900
  doc.text(COMPANY_INFO.brandName, textLeft, 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(75, 85, 99); // Gray 600
  doc.text(COMPANY_INFO.companyName, textLeft, 42);
  doc.text(COMPANY_INFO.address, textLeft, 52);

  // 4. Company Header Right (Contact Information)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(75, 85, 99);
  doc.text(`Phone: ${COMPANY_INFO.mobile}`, pageWidth - margin, 30, { align: 'right' });
  doc.text(`Email: ${COMPANY_INFO.email}`, pageWidth - margin, 42, { align: 'right' });
  doc.text(`Web: ${COMPANY_INFO.website}`, pageWidth - margin, 52, { align: 'right' });

  // 5. Divider
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.8);
  doc.line(margin, 68, pageWidth - margin, 68);

  // 6. Report Title Bar
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(title, margin, 85);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const metaText = `Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} • Total Records: ${data.length}${subtitle ? ` • ${subtitle}` : ''}`;
  doc.text(metaText, pageWidth - margin, 85, { align: 'right' });

  // 7. AutoTable with Table Data
  const headRows = [columns.map((c) => c.header)];
  const bodyRows = data.map((row) => columns.map((c) => String(row[c.key] ?? '-')));

  autoTable(doc, {
    startY: 96,
    head: headRows,
    body: bodyRows,
    theme: 'grid',
    headStyles: {
      fillColor: [17, 24, 39], // Gray 900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 5,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 4.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Slate 50
    },
    styles: {
      overflow: 'linebreak',
      cellWidth: 'auto',
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
    },
    margin: { left: margin, right: margin, bottom: 32 },
    didDrawPage: (pageData) => {
      // Footer on every page
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `© 2026 FunPrint. All rights reserved. • ${COMPANY_INFO.companyName} • Confidential Administrative Report`,
        margin,
        pageHeight - 14
      );
      doc.text(
        `Page ${pageData.pageNumber} of ${doc.getNumberOfPages()}`,
        pageWidth - margin,
        pageHeight - 14,
        { align: 'right' }
      );
    },
  });

  doc.save(`${filename}.pdf`);
}

/**
 * Universal Export to Excel with Company Logo, Address, Phone, Email & Footer
 */
export function exportToExcel({
  filename,
  title,
  columns,
  data,
}: {
  filename: string;
  title: string;
  columns: ExportColumn[];
  data: Record<string, any>[];
}) {
  const wsData: any[][] = [
    [`FUNPRINT — ${COMPANY_INFO.companyName}`],
    [`Address: ${COMPANY_INFO.address}`],
    [`Phone: ${COMPANY_INFO.mobile} | Email: ${COMPANY_INFO.email} | Website: ${COMPANY_INFO.website}`],
    [`Report: ${title} | Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} | Total Records: ${data.length}`],
    [], // Blank spacing row
    columns.map((c) => c.header), // Table Headers
  ];

  // Data rows
  data.forEach((row) => {
    wsData.push(columns.map((c) => row[c.key] ?? ''));
  });

  // Footer rows
  wsData.push([]);
  wsData.push([`© 2026 FunPrint. All rights reserved. • ${COMPANY_INFO.companyName} • Official Export`]);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Auto-fit column widths
  const colWidths = columns.map((col) => {
    let maxLen = col.header.length;
    data.forEach((row) => {
      const val = String(row[col.key] ?? '');
      if (val.length > maxLen) maxLen = Math.min(val.length, 45);
    });
    return { wch: Math.max(maxLen + 4, 14) };
  });

  ws['!cols'] = colWidths;

  const sanitizedSheetName = title.replace(/[:\\/?*[\]]/g, '').slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, sanitizedSheetName || 'Report');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
