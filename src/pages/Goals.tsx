import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Edit2, Target } from 'lucide-react';
import { apiFetch } from '../lib/apiFetch';

export default function Goals() {
  const { t } = useTranslation();
  const [goals, setGoals] = useState([]);
  const [formData, setFormData] = useState({ description: '', target: '', progress: 0, type: 'monthly' });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const res = await apiFetch('/api/goals');
    const data = await res.json();
    setGoals(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await apiFetch(`/api/goals/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } else {
      await apiFetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    }
    setFormData({ description: '', target: '', progress: 0, type: 'monthly' });
    setEditingId(null);
    fetchGoals();
  };

  const handleDelete = async (id: number) => {
    await apiFetch(`/api/goals/${id}`, { method: 'DELETE' });
    fetchGoals();
  };

  const handleEdit = (goal: any) => {
    setFormData({ description: goal.description, target: goal.target, progress: goal.progress, type: goal.type });
    setEditingId(goal.id);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <h2 className="text-xl font-semibold mb-4">{editingId ? t('Edit') : t('Add')} {t('Goals')}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input required type="text" placeholder={t('Description')} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="p-2 border rounded md:col-span-2 dark:bg-zinc-800 dark:border-zinc-700" />
          <input type="text" placeholder={t('Target')} value={formData.target} onChange={e => setFormData({...formData, target: e.target.value})} className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
          <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700">
            <option value="monthly">Monthly</option>
            <option value="short-term">Short Term</option>
            <option value="long-term">Long Term</option>
          </select>
          <div className="md:col-span-4 flex items-center gap-4">
            <label className="text-sm font-medium w-24">{t('Progress')}: {formData.progress}%</label>
            <input type="range" min="0" max="100" value={formData.progress} onChange={e => setFormData({...formData, progress: parseInt(e.target.value)})} className="flex-1" />
          </div>
          <button type="submit" className="bg-yellow-400 text-black font-medium p-2 rounded hover:bg-yellow-500 flex items-center justify-center gap-2 md:col-span-4">
            <Plus className="w-4 h-4" /> {t('Save')}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal: any) => (
          <div key={goal.id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Target className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-yellow-50 text-yellow-500 dark:bg-yellow-900/20 dark:text-yellow-400 capitalize">
                  {goal.type.replace('-', ' ')}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(goal)} className="text-yellow-500 hover:text-yellow-600"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(goal.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="font-semibold text-lg mt-2">{goal.description}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Target: {goal.target}</p>
              
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span className="font-bold">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-zinc-800">
                  <div 
                    className={`h-2.5 rounded-full ${goal.progress >= 100 ? 'bg-yellow-400' : goal.progress >= 50 ? 'bg-yellow-500' : 'bg-yellow-400'}`} 
                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
