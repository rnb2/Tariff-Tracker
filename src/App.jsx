import React, { useState, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { UTILITY_TYPES, INITIAL_RATES, LABELS } from './constants';
import { calculateUtilitySum } from './utils';
import { 
  LayoutDashboard, 
  History as HistoryIcon, 
  Settings, 
  FileText, 
  Plus, 
  Trash2, 
  Download,
  PieChart as PieChartIcon
} from 'lucide-react';

// Components (will move to separate files later)
import InputView from './components/InputView';
import HistoryView from './components/HistoryView';
import ChartsView from './components/ChartsView';
import RatesView from './components/RatesView';

function App() {
  const [activeTab, setActiveTab] = useState('input');
  const [rates, setRates] = useLocalStorage('utility_rates', INITIAL_RATES);
  const [history, setHistory] = useLocalStorage('utility_history', []);
  
  const [currentDraft, setCurrentDraft] = useState({
    date: new Date().toISOString().split('T')[0],
    utilities: Object.values(UTILITY_TYPES).reduce((acc, type) => ({
      ...acc,
      [type]: { current: '', previous: '', sum: 0 }
    }), {}),
    parking: '',
    creditCards: [{ name: 'Моно', amount: '' }, { name: 'ПУМБ', amount: '' }],
    mortgages: [{ name: 'ДержМолодь', amount: '' }],
  });

  const tabs = [
    { id: 'input', label: 'Ввод', icon: Plus },
    { id: 'history', label: 'История', icon: HistoryIcon },
    { id: 'charts', label: 'Графики', icon: PieChartIcon },
    { id: 'rates', label: 'Тарифы', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 md:pb-0 md:pl-64">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-slate-200 bg-white p-6 md:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <FileText size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Tariff Tracker</h1>
        </div>
        <nav className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Bottom Nav - Mobile */}
      <nav className="fixed bottom-0 left-0 z-50 flex w-full border-t border-slate-200 bg-white p-2 md:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 transition-colors ${
              activeTab === tab.id ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <tab.icon size={20} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl p-4 md:p-8">
        {activeTab === 'input' && (
          <InputView 
            draft={currentDraft} 
            setDraft={setCurrentDraft} 
            rates={rates} 
            onSave={(entry) => setHistory([entry, ...history])}
          />
        )}
        {activeTab === 'history' && (
          <HistoryView history={history} setHistory={setHistory} />
        )}
        {activeTab === 'charts' && (
          <ChartsView history={history} />
        )}
        {activeTab === 'rates' && (
          <RatesView rates={rates} setRates={setRates} />
        )}
      </main>
    </div>
  );
}

export default App;
