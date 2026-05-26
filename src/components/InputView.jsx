import React, { useMemo } from 'react';
import { UTILITY_TYPES, LABELS, UNITS } from '../constants';
import { calculateUtilitySum, formatCurrency, exportToPDF } from '../utils';
import { Save, Plus, Trash2, FileDown } from 'lucide-react';

export default function InputView({ draft, setDraft, rates, onSave }) {
  
  const handleUtilityChange = (type, field, value) => {
    const numValue = value === '' ? '' : parseFloat(value);
    const newUtilities = { ...draft.utilities };
    newUtilities[type][field] = value;
    
    // Recalculate sum
    const current = field === 'current' ? numValue : parseFloat(newUtilities[type].current);
    const previous = field === 'previous' ? numValue : parseFloat(newUtilities[type].previous);
    const rate = rates[type] || 0;
    
    if (!isNaN(current) && !isNaN(previous)) {
      newUtilities[type].sum = calculateUtilitySum(current, previous, rate);
    }
    
    setDraft({ ...draft, utilities: newUtilities });
  };

  const handleManualSumChange = (type, value) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setDraft({
      ...draft,
      utilities: {
        ...draft.utilities,
        [type]: { ...draft.utilities[type], sum: numValue }
      }
    });
  };

  const addCreditCard = () => {
    setDraft({
      ...draft,
      creditCards: [...draft.creditCards, { name: '', amount: '' }]
    });
  };

  const removeCreditCard = (index) => {
    const newList = [...draft.creditCards];
    newList.splice(index, 1);
    setDraft({ ...draft, creditCards: newList });
  };

  const updateCreditCard = (index, field, value) => {
    const newList = [...draft.creditCards];
    newList[index][field] = value;
    setDraft({ ...draft, creditCards: newList });
  };

  const total = useMemo(() => {
    let sum = 0;
    Object.values(draft.utilities).forEach(u => sum += (parseFloat(u.sum) || 0));
    sum += (parseFloat(draft.parking) || 0);
    draft.creditCards.forEach(c => sum += (parseFloat(c.amount) || 0));
    draft.mortgages.forEach(m => sum += (parseFloat(m.amount) || 0));
    return Math.round(sum * 100) / 100;
  }, [draft]);

  const handleSave = () => {
    const entry = {
      ...draft,
      id: Date.now(),
      total,
      // Convert string amounts to numbers for history
      parking: Math.round((parseFloat(draft.parking) || 0) * 100) / 100,
      creditCards: draft.creditCards.map(c => ({ ...c, amount: Math.round((parseFloat(c.amount) || 0) * 100) / 100 })),
      mortgages: draft.mortgages.map(m => ({ ...m, amount: Math.round((parseFloat(m.amount) || 0) * 100) / 100 })),
    };
    onSave(entry);
    alert('Сохранено в историю!');
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Новый расчет</h2>
          <p className="text-slate-500 text-sm">Введите показания счетчиков и другие расходы</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => exportToPDF({ ...draft, total }, LABELS)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <FileDown size={18} />
            PDF
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-all active:scale-95"
          >
            <Save size={18} />
            Сохранить
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Utilities */}
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-lg flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              Коммунальные услуги
            </h3>
            <div className="space-y-4">
              {Object.values(UTILITY_TYPES).map((type) => (
                <div key={type} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                  <div className="sm:col-span-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{LABELS[type]}</label>
                    <div className="text-xs text-slate-400 mt-1">{UNITS[type]} (Тариф: {rates[type]})</div>
                  </div>
                  <div className="sm:col-span-1">
                    <input 
                      type="number" 
                      placeholder="Пред."
                      value={draft.utilities[type].previous}
                      onChange={(e) => handleUtilityChange(type, 'previous', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <input 
                      type="number" 
                      placeholder="Тек."
                      value={draft.utilities[type].current}
                      onChange={(e) => handleUtilityChange(type, 'current', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <input 
                      type="number" 
                      placeholder="Сумма"
                      value={draft.utilities[type].sum}
                      onChange={(e) => handleManualSumChange(type, e.target.value)}
                      className="w-full rounded-lg border border-blue-100 bg-blue-50/30 px-3 py-2 text-sm font-medium text-blue-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-lg flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Паркоместо & Ипотека
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Паркоместо</label>
                  <input 
                    type="number" 
                    value={draft.parking}
                    onChange={(e) => setDraft({ ...draft, parking: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                  />
                </div>
                {draft.mortgages.map((m, idx) => (
                  <div key={idx}>
                    <label className="text-xs font-semibold text-slate-500 uppercase">{m.name}</label>
                    <input 
                      type="number" 
                      value={m.amount}
                      onChange={(e) => {
                        const newM = [...draft.mortgages];
                        newM[idx].amount = e.target.value;
                        setDraft({ ...draft, mortgages: newM });
                      }}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                  Кредитки
                </h3>
                <button 
                  onClick={addCreditCard}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="space-y-3">
                {draft.creditCards.map((card, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Название"
                      value={card.name}
                      onChange={(e) => updateCreditCard(idx, 'name', e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-blue-500 outline-none"
                    />
                    <input 
                      type="number" 
                      placeholder="Сумма"
                      value={card.amount}
                      onChange={(e) => updateCreditCard(idx, 'amount', e.target.value)}
                      className="w-24 rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-blue-500 outline-none"
                    />
                    <button 
                      onClick={() => removeCreditCard(idx)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          <div className="sticky top-8 rounded-2xl bg-blue-600 p-8 text-white shadow-xl shadow-blue-200 transition-all hover:shadow-2xl hover:shadow-blue-300">
            <h3 className="text-sm font-medium uppercase tracking-wider opacity-80">Итого к оплате</h3>
            <div className="mt-2 text-4xl font-black">
              {formatCurrency(total)}
            </div>
            <div className="mt-6 space-y-3 border-t border-white/20 pt-6 text-sm">
              <div className="flex justify-between">
                <span className="opacity-70">Коммуналка:</span>
                <span className="font-semibold">
                  {formatCurrency(Object.values(draft.utilities).reduce((s, u) => s + (parseFloat(u.sum) || 0), 0))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Другое:</span>
                <span className="font-semibold">
                  {formatCurrency(
                    (parseFloat(draft.parking) || 0) + 
                    draft.creditCards.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0) +
                    draft.mortgages.reduce((s, m) => s + (parseFloat(m.amount) || 0), 0)
                  )}
                </span>
              </div>
            </div>
          </div>
          
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
             <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Отчетный период</label>
             <input 
                type="date"
                value={draft.date}
                onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 outline-none"
             />
          </div>
        </div>
      </div>
    </div>
  );
}
