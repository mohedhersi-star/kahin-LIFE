import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function Books() {
  const { t } = useTranslation();
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({ title: '', author: '', category: '', progress: 0, notes: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const res = await fetch('/api/books');
    const data = await res.json();
    setBooks(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await fetch(`/api/books/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } else {
      await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    }
    setFormData({ title: '', author: '', category: '', progress: 0, notes: '' });
    setEditingId(null);
    fetchBooks();
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/books/${id}`, { method: 'DELETE' });
    fetchBooks();
  };

  const handleEdit = (book: any) => {
    setFormData({ title: book.title, author: book.author, category: book.category, progress: book.progress, notes: book.notes });
    setEditingId(book.id);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <h2 className="text-xl font-semibold mb-4">{editingId ? t('Edit') : t('Add')} {t('Books')}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required type="text" placeholder={t('Title')} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
          <input type="text" placeholder={t('Author')} value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
          <input type="text" placeholder={t('Category')} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
          <input type="number" placeholder={t('Progress')} value={formData.progress} onChange={e => setFormData({...formData, progress: parseInt(e.target.value)})} className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
          <textarea placeholder={t('Notes')} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="p-2 border rounded md:col-span-2 dark:bg-zinc-800 dark:border-zinc-700" />
          <button type="submit" className="bg-yellow-400 text-black font-medium p-2 rounded hover:bg-yellow-500 flex items-center justify-center gap-2 md:col-span-2">
            <Plus className="w-4 h-4" /> {t('Save')}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book: any) => (
          <div key={book.id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{book.title}</h3>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(book)} className="text-yellow-500 hover:text-yellow-600"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(book.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{book.author} • {book.category}</p>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-zinc-800">
                <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${Math.min(book.progress, 100)}%` }}></div>
              </div>
              <p className="text-xs text-right mt-1">{book.progress}%</p>
            </div>
            {book.notes && <p className="mt-4 text-sm bg-gray-50 dark:bg-black p-3 rounded">{book.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
