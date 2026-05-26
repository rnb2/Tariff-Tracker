import React from 'react';
import { formatCurrency, exportToCSV } from '../utils';
import { Trash2, Download, ExternalLink } from 'lucide-react';
import { LABELS } from '../constants';

export default function HistoryView({ history, setHistory }) {
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
                  <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      {new Date(entry.date).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-bold text-blue-600">
                      {formatCurrency(entry.total)}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-slate-500 max-w-xs truncate">
                      {Object.entries(entry.utilities)
                        .filter(([_, v]) => v.sum > 0)
                        .map(([k, _]) => LABELS[k])
                        .join(', ')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => deleteEntry(entry.id)}
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
    </div>
  );
}
