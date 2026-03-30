import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function Finance() {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({ type: 'expense', amount: '', description: '', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const res = await fetch('/api/finance');
    const data = await res.json();
    setTransactions(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/finance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setFormData({ type: 'expense', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
    fetchTransactions();
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/finance/${id}`, { method: 'DELETE' });
    fetchTransactions();
  };

  const balance = transactions.reduce((acc: number, curr: any) => 
    curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0
  );

  const income = transactions.reduce((acc: number, curr: any) => 
    curr.type === 'income' ? acc + curr.amount : acc, 0
  );

  const expense = transactions.reduce((acc: number, curr: any) => 
    curr.type === 'expense' ? acc + curr.amount : acc, 0
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Total Balance</p>
            <p className={`text-3xl font-bold mt-2 ${balance >= 0 ? 'text-yellow-500' : 'text-red-600'}`}>${balance.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-full text-yellow-500">
            <DollarSign className="w-8 h-8" />
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Total Income</p>
            <p className="text-3xl font-bold mt-2 text-yellow-500">${income.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-full text-yellow-500">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Total Expense</p>
            <p className="text-3xl font-bold mt-2 text-red-600">${expense.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full text-red-600">
            <TrendingDown className="w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <h2 className="text-xl font-semibold mb-4">{t('Add')} Transaction</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700">
            <option value="income">{t('Income')}</option>
            <option value="expense">{t('Expense')}</option>
          </select>
          <input required type="number" step="0.01" placeholder={t('Amount')} value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
          <input required type="text" placeholder={t('Description')} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="p-2 border rounded md:col-span-2 dark:bg-zinc-800 dark:border-zinc-700" />
          <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
          <button type="submit" className="bg-yellow-400 text-black font-medium p-2 rounded hover:bg-yellow-500 flex items-center justify-center gap-2 md:col-span-5">
            <Plus className="w-4 h-4" /> {t('Save')}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-black border-b border-gray-200 dark:border-zinc-800 text-sm">
              <th className="p-4 font-medium text-gray-500 dark:text-gray-400">{t('Date')}</th>
              <th className="p-4 font-medium text-gray-500 dark:text-gray-400">{t('Description')}</th>
              <th className="p-4 font-medium text-gray-500 dark:text-gray-400">{t('Type')}</th>
              <th className="p-4 font-medium text-gray-500 dark:text-gray-400">{t('Amount')}</th>
              <th className="p-4 font-medium text-gray-500 dark:text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {transactions.map((tx: any) => (
              <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="p-4 text-sm">{tx.date}</td>
                <td className="p-4 font-medium">{tx.description}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${tx.type === 'income' ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'}`}>
                    {t(tx.type === 'income' ? 'Income' : 'Expense')}
                  </span>
                </td>
                <td className={`p-4 font-bold ${tx.type === 'income' ? 'text-yellow-500' : 'text-red-600'}`}>
                  {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(tx.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">No transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
