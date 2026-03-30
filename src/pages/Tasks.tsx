import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Edit2, CheckCircle, Circle } from 'lucide-react';

export default function Tasks() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({ title: '', priority: 'Medium', done: false });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await fetch(`/api/tasks/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } else {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    }
    setFormData({ title: '', priority: 'Medium', done: false });
    setEditingId(null);
    fetchTasks();
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
  };

  const handleEdit = (task: any) => {
    setFormData({ title: task.title, priority: task.priority, done: task.done === 1 });
    setEditingId(task.id);
  };

  const toggleDone = async (task: any) => {
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, done: !task.done })
    });
    fetchTasks();
  };

  const priorityColors: any = {
    High: 'text-red-600 bg-red-100 dark:bg-red-900/40 dark:text-red-400',
    Medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/40 dark:text-yellow-400',
    Low: 'text-gray-600 bg-gray-100 dark:bg-zinc-800 dark:text-gray-400'
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <h2 className="text-xl font-semibold mb-4">{editingId ? t('Edit') : t('Add')} {t('Tasks')}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <input required type="text" placeholder={t('Title')} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="flex-1 p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
          <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700">
            <option value="High">{t('High')}</option>
            <option value="Medium">{t('Medium')}</option>
            <option value="Low">{t('Low')}</option>
          </select>
          <button type="submit" className="bg-yellow-400 text-black font-medium px-6 py-2 rounded hover:bg-yellow-500 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> {t('Save')}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {tasks.map((task: any) => (
            <li key={task.id} className={`p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${task.done ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-4">
                <button onClick={() => toggleDone(task)} className="text-gray-400 hover:text-yellow-500">
                  {task.done ? <CheckCircle className="w-6 h-6 text-yellow-500" /> : <Circle className="w-6 h-6" />}
                </button>
                <span className={`font-medium ${task.done ? 'line-through' : ''}`}>{task.title}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[task.priority]}`}>
                  {t(task.priority)}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(task)} className="p-2 text-gray-400 hover:text-yellow-500"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(task.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </li>
          ))}
          {tasks.length === 0 && (
            <li className="p-8 text-center text-gray-500">No tasks found. Add one above!</li>
          )}
        </ul>
      </div>
    </div>
  );
}
