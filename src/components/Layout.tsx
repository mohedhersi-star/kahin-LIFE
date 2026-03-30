import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, BookOpen, CheckSquare, DollarSign, 
  Target, Repeat, Moon, Book, Activity, Droplet,
  Sun, Globe
} from 'lucide-react';

export default function Layout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleLanguage = () => {
    const langs = ['en', 'so', 'ar'];
    const currentIndex = langs.indexOf(i18n.language);
    const nextIndex = (currentIndex + 1) % langs.length;
    i18n.changeLanguage(langs[nextIndex]);
    document.documentElement.dir = langs[nextIndex] === 'ar' ? 'rtl' : 'ltr';
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/books', label: 'Books', icon: BookOpen },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/finance', label: 'Finance', icon: DollarSign },
    { path: '/goals', label: 'Goals', icon: Target },
    { path: '/habits', label: 'Habits', icon: Repeat },
    { path: '/islamic', label: 'Islamic Tracker', icon: Moon },
    { path: '/journal', label: 'Journal', icon: Book },
    { path: '/fitness', label: 'Fitness', icon: Activity },
    { path: '/water', label: 'Water', icon: Droplet },
  ];

  return (
    <div className="flex h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 dark:border-zinc-800 flex flex-col bg-gray-50 dark:bg-black">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-black dark:text-white">Kahin Life</h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                      isActive 
                        ? 'text-black bg-yellow-400 dark:bg-yellow-500 dark:text-black border-r-4 border-black dark:border-white' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {t(item.label)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-6 bg-white dark:bg-black">
          <h2 className="text-xl font-semibold">
            {t(navItems.find(i => i.path === location.pathname)?.label || 'Dashboard')}
          </h2>
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleLanguage}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2"
              title="Change Language"
            >
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium uppercase">{i18n.language}</span>
            </button>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 bg-white dark:bg-black">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
