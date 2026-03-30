import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Book, Heart, Edit2, Target } from 'lucide-react';

export default function Islamic() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('quran');

  // Quran State
  const [quranLogs, setQuranLogs] = useState([]);
  const [quranForm, setQuranForm] = useState({ amount: '', unit: 'pages', date: new Date().toISOString().split('T')[0] });

  // Books State
  const [books, setBooks] = useState([]);
  const [bookForm, setBookForm] = useState({ title: '', progress: 0, notes: '' });
  const [editingBookId, setEditingBookId] = useState<number | null>(null);

  // Dhikr State
  const [dhikrLogs, setDhikrLogs] = useState([]);
  const [dhikrForm, setDhikrForm] = useState({ type: 'Morning', count: '', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    fetchQuran();
    fetchBooks();
    fetchDhikr();
  }, []);

  const fetchQuran = async () => {
    const res = await fetch('/api/quran');
    setQuranLogs(await res.json());
  };

  const fetchBooks = async () => {
    const res = await fetch('/api/islamic-books');
    setBooks(await res.json());
  };

  const fetchDhikr = async () => {
    const res = await fetch('/api/dhikr');
    setDhikrLogs(await res.json());
  };

  // --- Quran Handlers ---
  const handleQuranSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/quran', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quranForm)
    });
    setQuranForm({ amount: '', unit: 'pages', date: new Date().toISOString().split('T')[0] });
    fetchQuran();
  };

  const deleteQuran = async (id: number) => {
    await fetch(`/api/quran/${id}`, { method: 'DELETE' });
    fetchQuran();
  };

  // --- Books Handlers ---
  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBookId) {
      await fetch(`/api/islamic-books/${editingBookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookForm)
      });
    } else {
      await fetch('/api/islamic-books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookForm)
      });
    }
    setBookForm({ title: '', progress: 0, notes: '' });
    setEditingBookId(null);
    fetchBooks();
  };

  const editBook = (book: any) => {
    setBookForm({ title: book.title, progress: book.progress, notes: book.notes });
    setEditingBookId(book.id);
  };

  const deleteBook = async (id: number) => {
    await fetch(`/api/islamic-books/${id}`, { method: 'DELETE' });
    fetchBooks();
  };

  // --- Dhikr Handlers ---
  const handleDhikrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/dhikr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dhikrForm)
    });
    setDhikrForm({ type: 'Morning', count: '', date: new Date().toISOString().split('T')[0] });
    fetchDhikr();
  };

  const deleteDhikr = async (id: number) => {
    await fetch(`/api/dhikr/${id}`, { method: 'DELETE' });
    fetchDhikr();
  };

  // --- Progress Calculations ---
  const getQuranProgress = () => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    let todayJuz = 0, todayPages = 0;
    let weekJuz = 0, weekPages = 0;

    quranLogs.forEach((log: any) => {
      if (log.date === today) {
        if (log.unit === 'juz') todayJuz += log.amount;
        else todayPages += log.amount;
      }
      if (log.date >= weekAgo) {
        if (log.unit === 'juz') weekJuz += log.amount;
        else weekPages += log.amount;
      }
    });

    return { todayJuz, todayPages, weekJuz, weekPages };
  };

  const getDhikrProgress = () => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    let todayCount = 0;
    let weekCount = 0;

    dhikrLogs.forEach((log: any) => {
      if (log.date === today) todayCount += log.count;
      if (log.date >= weekAgo) weekCount += log.count;
    });

    return { todayCount, weekCount };
  };

  const quranProgress = getQuranProgress();
  const dhikrProgress = getDhikrProgress();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-zinc-800 pb-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {['quran', 'books', 'dhikr'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors shrink-0 ${
              activeTab === tab 
                ? 'bg-yellow-400 text-black border-b-2 border-black dark:border-white' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {tab === 'quran' ? "Qur'an Tracker" : tab === 'books' ? "Islamic Books" : "Dhikr Tracker"}
          </button>
        ))}
      </div>

      {/* Qur'an Tracker */}
      {activeTab === 'quran' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Today's Progress</h3>
              <p className="text-2xl font-bold mt-2 text-yellow-600 dark:text-yellow-500">
                {quranProgress.todayJuz > 0 && `${quranProgress.todayJuz} Juz `}
                {quranProgress.todayPages > 0 && `${quranProgress.todayPages} Pages`}
                {quranProgress.todayJuz === 0 && quranProgress.todayPages === 0 && 'None yet'}
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">This Week</h3>
              <p className="text-2xl font-bold mt-2 text-yellow-600 dark:text-yellow-500">
                {quranProgress.weekJuz > 0 && `${quranProgress.weekJuz} Juz `}
                {quranProgress.weekPages > 0 && `${quranProgress.weekPages} Pages`}
                {quranProgress.weekJuz === 0 && quranProgress.weekPages === 0 && 'None yet'}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
            <h2 className="text-xl font-semibold mb-4">Log Qur'an Reading</h2>
            <form onSubmit={handleQuranSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input required type="number" step="0.1" placeholder="Amount" value={quranForm.amount} onChange={e => setQuranForm({...quranForm, amount: e.target.value})} className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
              <select value={quranForm.unit} onChange={e => setQuranForm({...quranForm, unit: e.target.value})} className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700">
                <option value="pages">Pages</option>
                <option value="juz">Juz</option>
              </select>
              <input required type="date" value={quranForm.date} onChange={e => setQuranForm({...quranForm, date: e.target.value})} className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
              <button type="submit" className="bg-yellow-400 text-black font-medium p-2 rounded hover:bg-yellow-500 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Save
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {quranLogs.map((log: any) => (
                <li key={log.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-full text-yellow-500">
                      <Book className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Read {log.amount} {log.unit}</h3>
                      <p className="text-sm text-gray-500">{log.date}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteQuran(log.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </li>
              ))}
              {quranLogs.length === 0 && <li className="p-8 text-center text-gray-500">No logs found.</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Islamic Books Tracker */}
      {activeTab === 'books' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
            <h2 className="text-xl font-semibold mb-4">{editingBookId ? 'Edit' : 'Add'} Islamic Book</h2>
            <form onSubmit={handleBookSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input required type="text" placeholder="Book Title (e.g. Riyadh-us-Saliheen)" value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} className="p-2 border rounded md:col-span-2 dark:bg-zinc-800 dark:border-zinc-700" />
              <div className="flex items-center gap-2">
                <input type="number" min="0" max="100" placeholder="Progress %" value={bookForm.progress} onChange={e => setBookForm({...bookForm, progress: parseInt(e.target.value)})} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                <span className="text-gray-500">%</span>
              </div>
              <button type="submit" className="bg-yellow-400 text-black font-medium p-2 rounded hover:bg-yellow-500 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Save
              </button>
              <textarea placeholder="Notes" value={bookForm.notes} onChange={e => setBookForm({...bookForm, notes: e.target.value})} className="p-2 border rounded md:col-span-4 dark:bg-zinc-800 dark:border-zinc-700" />
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book: any) => (
              <div key={book.id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 relative">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{book.title}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => editBook(book)} className="text-yellow-500 hover:text-yellow-600"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => deleteBook(book.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Completed</span>
                    <span className="font-bold">{book.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-zinc-800">
                    <div 
                      className="h-2.5 rounded-full bg-yellow-400" 
                      style={{ width: `${Math.min(book.progress, 100)}%` }}
                    ></div>
                  </div>
                </div>
                {book.notes && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-black rounded text-sm text-gray-700 dark:text-gray-300">
                    {book.notes}
                  </div>
                )}
              </div>
            ))}
            {books.length === 0 && <div className="col-span-1 md:col-span-2 lg:col-span-3 p-8 text-center text-gray-500">No books tracked yet.</div>}
          </div>
        </div>
      )}

      {/* Dhikr Tracker */}
      {activeTab === 'dhikr' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Today's Dhikr</h3>
              <p className="text-3xl font-bold mt-2 text-yellow-600 dark:text-yellow-500">{dhikrProgress.todayCount}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">This Week</h3>
              <p className="text-3xl font-bold mt-2 text-yellow-600 dark:text-yellow-500">{dhikrProgress.weekCount}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
            <h2 className="text-xl font-semibold mb-4">Log Dhikr</h2>
            <form onSubmit={handleDhikrSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select value={dhikrForm.type} onChange={e => setDhikrForm({...dhikrForm, type: e.target.value})} className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700">
                <option value="Morning">Morning Dhikr</option>
                <option value="Evening">Evening Dhikr</option>
                <option value="After Salah">After Salah</option>
                <option value="Other">Other</option>
              </select>
              <input required type="number" placeholder="Count (e.g. 100)" value={dhikrForm.count} onChange={e => setDhikrForm({...dhikrForm, count: e.target.value})} className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
              <input required type="date" value={dhikrForm.date} onChange={e => setDhikrForm({...dhikrForm, date: e.target.value})} className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
              <button type="submit" className="bg-yellow-400 text-black font-medium p-2 rounded hover:bg-yellow-500 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Save
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {dhikrLogs.map((log: any) => (
                <li key={log.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full text-red-500">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{log.type}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Count: {log.count}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-500">{log.date}</span>
                    <button onClick={() => deleteDhikr(log.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </li>
              ))}
              {dhikrLogs.length === 0 && <li className="p-8 text-center text-gray-500">No dhikr logs found.</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
