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

  CREATE TABLE IF NOT EXISTS learning_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS learning_subcategories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    name TEXT NOT NULL,
    FOREIGN KEY(category_id) REFERENCES learning_categories(id)
  );

  CREATE TABLE IF NOT EXISTS learning_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subcategory_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    created_at TEXT,
    is_bookmarked INTEGER DEFAULT 0,
    revise_later INTEGER DEFAULT 0,
    FOREIGN KEY(subcategory_id) REFERENCES learning_subcategories(id)
  );

  CREATE TABLE IF NOT EXISTS learning_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    is_completed INTEGER DEFAULT 0,
    date TEXT
  );

  CREATE TABLE IF NOT EXISTS learning_pdfs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT,
    file_path TEXT NOT NULL,
    total_pages INTEGER DEFAULT 0,
    current_page INTEGER DEFAULT 0,
    target_date TEXT,
    pages_per_day INTEGER DEFAULT 0,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS learning_pdf_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pdf_id INTEGER,
    page_number INTEGER,
    content TEXT,
    created_at TEXT,
    FOREIGN KEY(pdf_id) REFERENCES learning_pdfs(id)
  );
`);

// Seed learning categories and subcategories if they don't exist
const categoryCount = db.prepare('SELECT COUNT(*) as count FROM learning_categories').get() as { count: number };
if (categoryCount.count === 0) {
  const insertCat = db.prepare('INSERT INTO learning_categories (name) VALUES (?)');
  const insertSub = db.prepare('INSERT INTO learning_subcategories (category_id, name) VALUES (?, ?)');
  
  // English
  const engId = insertCat.run('English').lastInsertRowid;
  ['Vocabulary', 'Grammar', 'Speaking Practice', 'Listening', 'Reading'].forEach(sub => insertSub.run(engId, sub));
  
  // Accounting
  const accId = insertCat.run('Accounting').lastInsertRowid;
  ['Financial Accounting', 'Managerial Accounting', 'Journal Entries', 'Financial Statements', 'Ratio Analysis'].forEach(sub => insertSub.run(accId, sub));
  
  // Psychology
  const psyId = insertCat.run('Psychology').lastInsertRowid;
  ['Basic Concepts', 'Human Behavior', 'Cognitive Psychology', 'Emotions & Motivation', 'Case Studies'].forEach(sub => insertSub.run(psyId, sub));
}

export default db;
