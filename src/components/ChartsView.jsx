import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { LABELS } from '../constants';

export default function ChartsView({ history }) {
  const lineData = useMemo(() => {
    return [...history]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(entry => ({
        name: new Date(entry.date).toLocaleDateString('ru-RU', { month: 'short' }),
        total: entry.total
      }));
  }, [history]);

  const pieData = useMemo(() => {
    if (history.length === 0) return [];
    const last = history[0];
    const data = [];
    
    Object.entries(last.utilities).forEach(([key, val]) => {
      if (val.sum > 0) data.push({ name: LABELS[key], value: val.sum });
    });
    
    if (last.parking > 0) data.push({ name: LABELS.PARKING, value: last.parking });
    
    last.creditCards.forEach(c => {
      if (c.amount > 0) data.push({ name: c.name || 'Карта', value: c.amount });
    });
    
    last.mortgages.forEach(m => {
      if (m.amount > 0) data.push({ name: m.name || 'Ипотека', value: m.amount });
    });

    return data;
  }, [history]);

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <p className="text-lg">Нет данных для отображения графиков</p>
        <p className="text-sm">Сохраните расчеты в истории, чтобы увидеть статистику</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Статистика</h2>
        <p className="text-slate-500 text-sm">Визуализация ваших расходов за все время</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 font-semibold text-slate-700">Тренд расходов</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 font-semibold text-slate-700">Распределение (последний месяц)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
