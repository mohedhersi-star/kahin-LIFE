import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Edit2, Repeat } from 'lucide-react';
import { apiFetch } from '../lib/apiFetch';

export default function Habits() {
  const { t } = useTranslation();
  const [habits, setHabits] = useState([]);
  const [formData, setFormData] = useState({ name: '', consistency: 0 });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    const res = await apiFetch('/api/habits');
    const data = await res.json();
    setHabits(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await apiFetch(`/api/habits/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } else {
      await apiFetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    }
    setFormData({ name: '', consistency: 0 });
    setEditingId(null);
    fetchHabits();
  };

  const handleDelete = async (id: number) => {
    await apiFetch(`/api/habits/${id}`, { method: 'DELETE' });
    fetchHabits();
  };

  const handleEdit = (habit: any) => {
    setFormData({ name: habit.name, consistency: habit.consistency });
    setEditingId(habit.id);
  };

  const incrementConsistency = async (habit: any) => {
    await apiFetch(`/api/habits/${habit.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...habit, consistency: habit.consistency + 1 })
    });
    fetchHabits();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <h2 className="text-xl font-semibold mb-4">{editingId ? t('Edit') : t('Add')} {t('Habits')}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <input required type="text" placeholder={t('Name')} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="flex-1 p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
          <input type="number" placeholder={t('Consistency')} value={formData.consistency} onChange={e => setFormData({...formData, consistency: parseInt(e.target.value)})} className="w-32 p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
          <button type="submit" className="bg-yellow-400 text-black font-medium px-6 py-2 rounded hover:bg-yellow-500 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> {t('Save')}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits.map((habit: any) => (
          <div key={habit.id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col items-center text-center">
            <div className="w-full flex justify-end gap-2 mb-2">
              <button onClick={() => handleEdit(habit)} className="text-yellow-500 hover:text-yellow-600"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(habit.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="w-20 h-20 rounded-full border-4 border-yellow-100 dark:border-yellow-900/40 flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-yellow-500 dark:text-yellow-400">{habit.consistency}</span>
            </div>
            <h3 className="font-semibold text-lg mb-4">{habit.name}</h3>
            <button 
              onClick={() => incrementConsistency(habit)}
              className="w-full py-2 bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-lg font-medium hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors flex items-center justify-center gap-2"
            >
              <Repeat className="w-4 h-4" /> Mark Done Today
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
