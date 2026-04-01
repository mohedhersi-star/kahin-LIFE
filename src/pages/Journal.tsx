import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { apiFetch } from '../lib/apiFetch';

export default function Journal() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({ content: '', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const res = await apiFetch('/api/journal');
    const data = await res.json();
    setEntries(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setFormData({ content: '', date: new Date().toISOString().split('T')[0] });
    fetchEntries();
  };

  const handleDelete = async (id: number) => {
    await apiFetch(`/api/journal/${id}`, { method: 'DELETE' });
    fetchEntries();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <h2 className="text-xl font-semibold mb-4">{t('Add')} {t('Journal')} Entry</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea 
            required 
            placeholder={t('Content')} 
            value={formData.content} 
            onChange={e => setFormData({...formData, content: e.target.value})} 
            className="p-4 border rounded-xl min-h-[150px] dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-yellow-400 outline-none resize-y" 
          />
          <div className="flex gap-4">
            <input 
              required 
              type="date" 
              value={formData.date} 
              onChange={e => setFormData({...formData, date: e.target.value})} 
              className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" 
            />
            <button type="submit" className="bg-yellow-400 text-black font-medium px-6 py-2 rounded hover:bg-yellow-500 flex items-center justify-center gap-2 flex-1">
              <Plus className="w-4 h-4" /> {t('Save')}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {entries.map((entry: any) => (
          <div key={entry.id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 relative group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">{entry.date}</span>
              </div>
              <button 
                onClick={() => handleDelete(entry.id)} 
                className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
              {entry.content}
            </p>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="p-8 text-center text-gray-500 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
            No journal entries found. Start writing!
          </div>
        )}
      </div>
    </div>
  );
}
