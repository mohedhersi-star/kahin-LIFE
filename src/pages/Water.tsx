import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Droplet } from 'lucide-react';
import { apiFetch } from '../lib/apiFetch';

export default function Water() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [formData, setFormData] = useState({ intake: '', target: 2000, date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const res = await apiFetch('/api/water');
    const data = await res.json();
    setLogs(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/api/water', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setFormData({ intake: '', target: 2000, date: new Date().toISOString().split('T')[0] });
    fetchLogs();
  };

  const handleDelete = async (id: number) => {
    await apiFetch(`/api/water/${id}`, { method: 'DELETE' });
    fetchLogs();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <h2 className="text-xl font-semibold mb-4">{t('Add')} {t('Water')} Log</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input required type="number" placeholder={t('Intake') + ' (ml)'} value={formData.intake} onChange={e => setFormData({...formData, intake: e.target.value})} className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
          <input required type="number" placeholder={t('Target') + ' (ml)'} value={formData.target} onChange={e => setFormData({...formData, target: parseInt(e.target.value)})} className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
          <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
          <button type="submit" className="bg-yellow-400 text-black font-medium p-2 rounded hover:bg-yellow-500 flex items-center justify-center gap-2 md:col-span-3">
            <Plus className="w-4 h-4" /> {t('Save')}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {logs.map((log: any) => {
          const progress = Math.min((log.intake / log.target) * 100, 100);
          return (
            <div key={log.id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col items-center text-center relative">
              <button onClick={() => handleDelete(log.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              
              <div className="w-24 h-24 rounded-full border-4 border-yellow-100 dark:border-yellow-900/40 flex items-center justify-center mb-4 relative overflow-hidden">
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-yellow-400 opacity-50 transition-all duration-1000" 
                  style={{ height: `${progress}%` }}
                ></div>
                <Droplet className="w-8 h-8 text-yellow-500 dark:text-yellow-400 relative z-10" />
              </div>
              
              <h3 className="font-semibold text-lg mb-1">{log.date}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                <span className="font-bold text-yellow-500 dark:text-yellow-400">{log.intake}</span> / {log.target} ml
              </p>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-zinc-800">
                <div 
                  className={`h-2.5 rounded-full ${progress >= 100 ? 'bg-yellow-400' : 'bg-yellow-400'}`} 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs mt-2 font-medium">{progress.toFixed(0)}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
