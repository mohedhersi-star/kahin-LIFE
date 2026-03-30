import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    tasks: 0,
    books: 0,
    balance: 0,
    water: 0
  });

  useEffect(() => {
    // Fetch summary stats
    const fetchStats = async () => {
      try {
        const [tasksRes, booksRes, financeRes, waterRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/books'),
          fetch('/api/finance'),
          fetch('/api/water')
        ]);
        
        const tasks = await tasksRes.json();
        const books = await booksRes.json();
        const finance = await financeRes.json();
        const water = await waterRes.json();

        const balance = finance.reduce((acc: number, curr: any) => 
          curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0
        );

        const todayWater = water.find((w: any) => w.date === new Date().toISOString().split('T')[0])?.intake || 0;

        setStats({
          tasks: tasks.filter((t: any) => !t.done).length,
          books: books.length,
          balance,
          water: todayWater
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const data = [
    { name: 'Mon', progress: 40 },
    { name: 'Tue', progress: 30 },
    { name: 'Wed', progress: 20 },
    { name: 'Thu', progress: 27 },
    { name: 'Fri', progress: 18 },
    { name: 'Sat', progress: 23 },
    { name: 'Sun', progress: 34 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('Welcome')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{t('Tasks')}</h3>
          <p className="text-3xl font-bold text-yellow-500 mt-2">{stats.tasks} Pending</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{t('Books')}</h3>
          <p className="text-3xl font-bold text-yellow-500 mt-2">{stats.books} Read</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{t('Finance')}</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">${stats.balance.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{t('Water')}</h3>
          <p className="text-3xl font-bold text-yellow-400 mt-2">{stats.water} ml</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Weekly Progress</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="progress" fill="#eab308" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
