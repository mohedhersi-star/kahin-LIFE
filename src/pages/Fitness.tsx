import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Activity } from 'lucide-react';
import { apiFetch } from '../lib/apiFetch';

export default function Fitness() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [formData, setFormData] = useState({ exercise: 'Push-ups', reps_duration: '', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const res = await apiFetch('/api/fitness');
    const data = await res.json();
    setLogs(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/api/fitness', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setFormData({ exercise: 'Push-ups', reps_duration: '', date: new Date().toISOString().split('T')[0] });
    fetchLogs();
  };

  const handleDelete = async (id: number) => {
    await apiFetch(`/api/fitness/${id}`, { method: 'DELETE' });
    fetchLogs();
  };

  const exercises = ['Push-ups', 'Sit-ups', 'Squats', 'Plank', 'Jumping Jacks'];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <h2 className="text-xl font-semibold mb-4">{t('Add')} {t('Fitness')} Log</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select value={formData.exercise} onChange={e => setFormData({...formData, exercise: e.target.value})} className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700">
            {exercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
          </select>
          <input required type="text" placeholder={t('Reps/Duration') + ' (e.g. 20 reps, 60s)'} value={formData.reps_duration} onChange={e => setFormData({...formData, reps_duration: e.target.value})} className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
          <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
          <button type="submit" className="bg-yellow-400 text-black font-medium p-2 rounded hover:bg-yellow-500 flex items-center justify-center gap-2 md:col-span-3">
            <Plus className="w-4 h-4" /> {t('Save')}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {logs.map((log: any) => (
            <li key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-full text-yellow-500 shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{log.exercise}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{log.reps_duration}</p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                <span className="text-sm font-medium text-gray-500">{log.date}</span>
                <button onClick={() => handleDelete(log.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </li>
          ))}
          {logs.length === 0 && (
            <li className="p-8 text-center text-gray-500">No fitness logs found.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
