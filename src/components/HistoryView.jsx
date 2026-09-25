import { useState } from 'react';
import { formatCurrency, exportToCSV, buildEntryDetailRows } from '../utils';
import { Trash2, Download, Copy, X } from 'lucide-react';
import { LABELS } from '../constants';

export default function HistoryView({ history, setHistory, onUseAsTemplate }) {
  const [viewingEntry, setViewingEntry] = useState(null);

  const deleteEntry = (id) => {
    if (window.confirm('Удалить эту запись?')) {
      setHistory(history.filter(e => e.id !== id));
    }
  };

  const handleExport = () => {
    const exportData = history.map(entry => ({
      Дата: entry.date,
      Итого: entry.total,
      Парковка: entry.parking,
      ...Object.entries(entry.utilities).reduce((acc, [key, val]) => ({
        ...acc,
        [LABELS[key]]: val.sum
      }), {})
    }));
    exportToCSV(exportData, `utility_history_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportEntry = (entry) => {
    exportToCSV(buildEntryDetailRows(entry, LABELS), `utility_entry_${entry.date}.csv`);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">История расчетов</h2>
          <p className="text-slate-500 text-sm">Ваши сохраненные данные за прошлые периоды</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
        >
          <Download size={18} />
          Экспорт CSV
        </button>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Дата</th>
                <th className="px-6 py-4">Сумма</th>
                <th className="px-6 py-4 hidden md:table-cell">Детали</th>
                <th className="px-6 py-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    История пуста. Сохраните ваш первый расчет!
                  </td>
                </tr>
              ) : (
                history.map((entry) => (
                  <tr
                    key={entry.id}
                    onClick={() => setViewingEntry(entry)}
                    className="cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      {new Date(entry.date).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-bold text-blue-600">
                      {formatCurrency(entry.total)}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-slate-500 max-w-xs truncate">
                      {Object.entries(entry.utilities)
                        .filter(([, v]) => v.sum > 0)
                        .map(([k]) => LABELS[k])
                        .join(', ')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); onUseAsTemplate?.(entry); }}
                          title="Заполнить новый расчёт данными этой записи"
                          className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Copy size={18} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewingEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setViewingEntry(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {new Date(viewingEntry.date).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                </h3>
                <p className="text-sm text-slate-500">Детали расчёта</p>
              </div>
              <button
                onClick={() => setViewingEntry(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-x-auto px-6 py-4">
              <table className="w-full text-left text-sm">
                <thead className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-2 pr-2">Услуга</th>
                    <th className="py-2 pr-2">Пред.</th>
                    <th className="py-2 pr-2">Тек.</th>
                    <th className="py-2 text-right">Сумма</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {buildEntryDetailRows(viewingEntry, LABELS).map((row, idx, rows) => (
                    <tr key={idx} className={idx === rows.length - 1 ? 'font-bold text-blue-600' : ''}>
                      <td className="py-2 pr-2">{row['Услуга']}</td>
                      <td className="py-2 pr-2">{row['Пред. показ.']}</td>
                      <td className="py-2 pr-2">{row['Тек. показ.']}</td>
                      <td className="py-2 text-right">{formatCurrency(row['Сумма'])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => handleExportEntry(viewingEntry)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
              >
                <Download size={18} />
                Экспорт CSV
              </button>
              <button
                onClick={() => setViewingEntry(null)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-all"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
