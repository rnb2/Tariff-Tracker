import { LABELS, UNITS, UTILITY_TYPES } from '../constants';

export default function RatesView({ rates, setRates }) {
  const handleRateChange = (type, value) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setRates({ ...rates, [type]: numValue });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Тарифы</h2>
        <p className="text-slate-500 text-sm">Настройка стоимости за единицу ресурса</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.values(UTILITY_TYPES).map((type) => (
          <div key={type} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {LABELS[type]}
            </label>
            <div className="flex items-center gap-3">
              <input 
                type="number" step="any" 
                value={rates[type]}
                onChange={(e) => handleRateChange(type, e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-lg font-bold text-blue-600 focus:border-blue-500 outline-none"
              />
              <span className="text-sm text-slate-400 font-medium whitespace-nowrap">
                ₴ / {UNITS[type]}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-slate-100 p-6 text-sm text-slate-600">
        <p><strong>Примечание:</strong> Изменения тарифов будут применяться ко всем новым расчетам. Суммы в уже сохраненной истории не изменятся.</p>
      </div>
    </div>
  );
}
