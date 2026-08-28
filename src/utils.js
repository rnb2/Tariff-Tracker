import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const calculateUtilitySum = (current, previous, rate) => {
  const diff = Math.max(0, current - previous);
  return Math.round((diff * rate) * 100) / 100;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'UAH',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const exportToCSV = (data, filename = 'history.csv') => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]).join(',');
  const rows = data.map((item) => 
    Object.values(item).map(val => 
      typeof val === 'string' ? `"${val}"` : val
    ).join(',')
  );
  
  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

let cachedFontBase64 = null;

const getFontBase64 = async () => {
  if (cachedFontBase64) return cachedFontBase64;
  
  const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
  const response = await fetch(fontUrl);
  if (!response.ok) throw new Error('Failed to fetch Roboto-Regular font');
  const arrayBuffer = await response.arrayBuffer();
  
  let binary = '';
  const bytes = new Uint8Array(arrayBuffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  cachedFontBase64 = window.btoa(binary);
  return cachedFontBase64;
};

export const exportToPDF = async (entry, labels) => {
  const doc = new jsPDF();
  let activeFont = 'Roboto';
  
  try {
    const base64Font = await getFontBase64();
    doc.addFileToVFS('Roboto-Regular.ttf', base64Font);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');
  } catch (error) {
    console.error('Error loading font, Cyrillic might not render properly:', error);
    activeFont = 'helvetica';
    doc.setFont('helvetica');
  }

  // Set header
  const title = `Отчет по коммунальным услугам - ${entry.date || 'черновик'}`;
  doc.setFontSize(16);
  doc.text(title, 14, 15);
  
  const tableData = [];
  
  // Utilities
  Object.entries(entry.utilities).forEach(([key, val]) => {
    const currentVal = val.current !== '' ? val.current : '-';
    const previousVal = val.previous !== '' ? val.previous : '-';
    const sumVal = parseFloat(val.sum) || 0;
    tableData.push([labels[key] || key, currentVal, previousVal, `${sumVal.toFixed(2)} ₴`]);
  });
  
  // Others
  const parkingVal = parseFloat(entry.parking) || 0;
  if (parkingVal > 0) {
    tableData.push(['Паркоместо', '-', '-', `${parkingVal.toFixed(2)} ₴`]);
  }
  
  if (entry.mortgages) {
    entry.mortgages.forEach(m => {
      const amountVal = parseFloat(m.amount) || 0;
      if (amountVal > 0) {
        tableData.push([m.name || 'Ипотека', '-', '-', `${amountVal.toFixed(2)} ₴`]);
      }
    });
  }
  
  if (entry.creditCards) {
    entry.creditCards.forEach(c => {
      const amountVal = parseFloat(c.amount) || 0;
      if (amountVal > 0) {
        tableData.push([c.name || 'Карта', '-', '-', `${amountVal.toFixed(2)} ₴`]);
      }
    });
  }
  
  const totalVal = parseFloat(entry.total) || 0;
  tableData.push([
    { content: 'ИТОГО К ОПЛАТЕ', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
    { content: `${totalVal.toFixed(2)} ₴`, styles: { fontStyle: 'bold' } }
  ]);

  autoTable(doc, {
    startY: 22,
    head: [['Услуга', 'Тек. показ.', 'Пред. показ.', 'Сумма']],
    body: tableData,
    styles: { font: activeFont }, // This ensures autoTable uses the active fallback font and won't crash!
    headStyles: { fillColor: [37, 99, 235] }, // Nice blue theme matching tailwind blue-600
    theme: 'striped',
  });

  doc.save(`utility-report-${entry.date || 'draft'}.pdf`);
};
