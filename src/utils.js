import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ROBOTO_REGULAR_BASE64 } from './assets/robotoFont';

export const calculateUtilitySum = (current, previous, rate) => {
  const numCurrent = Number(current);
  const numPrevious = Number(previous);
  const numRate = Number(rate);

  if (!Number.isFinite(numCurrent) || !Number.isFinite(numPrevious) || !Number.isFinite(numRate)) {
    return 0;
  }

  const diff = Math.max(0, numCurrent - numPrevious);
  return Math.round((diff * numRate) * 100) / 100;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'UAH',
    minimumFractionDigits: 2,
  }).format(amount);
};

const escapeCSVValue = (val) => {
  if (val === null || val === undefined) return '';

  const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const exportToCSV = (data, filename = 'history.csv') => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]).map(escapeCSVValue).join(',');
  const rows = data.map((item) =>
    Object.values(item).map(escapeCSVValue).join(',')
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

export const exportToPDF = async (entry, labels) => {
  const doc = new jsPDF();
  let activeFont = 'Roboto';

  try {
    doc.addFileToVFS('Roboto-Regular.ttf', ROBOTO_REGULAR_BASE64);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');
  } catch (error) {
    console.error('Error loading bundled font, Cyrillic might not render properly:', error);
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
