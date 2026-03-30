import Database from 'better-sqlite3';

const db = new Database('kahin_life.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT,
    category TEXT,
    progress INTEGER DEFAULT 0,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    priority TEXT,
    done INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS finance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- 'income' or 'expense'
    amount REAL NOT NULL,
    description TEXT,
    date TEXT
  );

  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    target TEXT,
    progress INTEGER DEFAULT 0,
    type TEXT -- 'monthly', 'short-term', 'long-term'
  );

  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    consistency INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS islamic_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- 'quran', 'dhikr', 'fasting', 'book'
    value TEXT,
    notes TEXT,
    date TEXT
  );

  CREATE TABLE IF NOT EXISTS quran_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    unit TEXT NOT NULL,
    date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS islamic_books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS dhikr_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    count INTEGER NOT NULL,
    date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS journal (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    date TEXT
  );

  CREATE TABLE IF NOT EXISTS fitness (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise TEXT NOT NULL,
    reps_duration TEXT,
    date TEXT
  );

  CREATE TABLE IF NOT EXISTS water (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    intake INTEGER DEFAULT 0,
    target INTEGER DEFAULT 2000,
    date TEXT
  );
`);

export default db;
