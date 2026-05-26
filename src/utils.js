import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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

export const exportToPDF = (entry, labels) => {
  const doc = new jsPDF();
  
  doc.setFont("helvetica"); // Note: Default jspdf font might not support Cyrillic well. 
  // For production Cyrillic, we'd need to embed a custom font. 
  // I'll use standard text first, but warning: Cyrillic may need a font file.
  
  doc.text(`Отчет по коммунальным услугам - ${entry.date}`, 10, 10);
  
  const tableData = [];
  
  // Utilities
  Object.entries(entry.utilities).forEach(([key, val]) => {
    tableData.push([labels[key], val.current, val.previous, val.sum.toFixed(2)]);
  });
  
  // Others
  tableData.push(['Паркоместо', '-', '-', entry.parking.toFixed(2)]);
  
  entry.mortgages.forEach(m => {
    tableData.push([`Ипотека: ${m.name}`, '-', '-', m.amount.toFixed(2)]);
  });
  
  entry.creditCards.forEach(c => {
    tableData.push([`Карта: ${c.name}`, '-', '-', c.amount.toFixed(2)]);
  });
  
  tableData.push(['ИТОГО', '-', '-', entry.total.toFixed(2)]);

  doc.autoTable({
    startY: 20,
    head: [['Услуга', 'Тек.', 'Пред.', 'Сумма']],
    body: tableData,
  });

  doc.save(`utility-report-${entry.date}.pdf`);
};
