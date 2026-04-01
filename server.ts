import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './src/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Auth Middleware & Routes
  app.post('/api/login', (req, res) => {
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '@MOHED3126';
    if (req.body.password === ADMIN_PASSWORD) {
      res.cookie('kahin_token', 'authenticated', { 
        httpOnly: true, 
        path: '/',
        secure: true,
        sameSite: 'none'
      });
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  });

  app.post('/api/logout', (req, res) => {
    res.clearCookie('kahin_token', { 
      path: '/',
      secure: true,
      sameSite: 'none'
    });
    res.json({ success: true });
  });

  app.use('/api', (req, res, next) => {
    if (req.path === '/login' || req.path === '/logout') return next();
    const cookies = req.headers.cookie || '';
    if (cookies.includes('kahin_token=authenticated')) {
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  });

  // API Routes
  
  // Books
  app.get('/api/books', (req, res) => {
    const books = db.prepare('SELECT * FROM books ORDER BY id DESC').all();
    res.json(books);
  });
  app.post('/api/books', (req, res) => {
    const { title, author, category, progress, notes } = req.body;
    const stmt = db.prepare('INSERT INTO books (title, author, category, progress, notes) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(title, author, category, progress || 0, notes || '');
    res.json({ id: info.lastInsertRowid });
  });
  app.put('/api/books/:id', (req, res) => {
    const { title, author, category, progress, notes } = req.body;
    const stmt = db.prepare('UPDATE books SET title = ?, author = ?, category = ?, progress = ?, notes = ? WHERE id = ?');
    stmt.run(title, author, category, progress, notes, req.params.id);
    res.json({ success: true });
  });
  app.delete('/api/books/:id', (req, res) => {
    db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Tasks
  app.get('/api/tasks', (req, res) => {
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY id DESC').all();
    res.json(tasks);
  });
  app.post('/api/tasks', (req, res) => {
    const { title, priority, done } = req.body;
    const stmt = db.prepare('INSERT INTO tasks (title, priority, done) VALUES (?, ?, ?)');
    const info = stmt.run(title, priority, done ? 1 : 0);
    res.json({ id: info.lastInsertRowid });
  });
  app.put('/api/tasks/:id', (req, res) => {
    const { title, priority, done } = req.body;
    const stmt = db.prepare('UPDATE tasks SET title = ?, priority = ?, done = ? WHERE id = ?');
    stmt.run(title, priority, done ? 1 : 0, req.params.id);
    res.json({ success: true });
  });
  app.delete('/api/tasks/:id', (req, res) => {
    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Finance
  app.get('/api/finance', (req, res) => {
    const transactions = db.prepare('SELECT * FROM finance ORDER BY date DESC').all();
    res.json(transactions);
  });
  app.post('/api/finance', (req, res) => {
    const { type, amount, description, date } = req.body;
    const stmt = db.prepare('INSERT INTO finance (type, amount, description, date) VALUES (?, ?, ?, ?)');
    const info = stmt.run(type, amount, description, date || new Date().toISOString().split('T')[0]);
    res.json({ id: info.lastInsertRowid });
  });
  app.delete('/api/finance/:id', (req, res) => {
    db.prepare('DELETE FROM finance WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Goals
  app.get('/api/goals', (req, res) => {
    const goals = db.prepare('SELECT * FROM goals ORDER BY id DESC').all();
    res.json(goals);
  });
  app.post('/api/goals', (req, res) => {
    const { description, target, progress, type } = req.body;
    const stmt = db.prepare('INSERT INTO goals (description, target, progress, type) VALUES (?, ?, ?, ?)');
    const info = stmt.run(description, target, progress || 0, type || 'monthly');
    res.json({ id: info.lastInsertRowid });
  });
  app.put('/api/goals/:id', (req, res) => {
    const { description, target, progress, type } = req.body;
    const stmt = db.prepare('UPDATE goals SET description = ?, target = ?, progress = ?, type = ? WHERE id = ?');
    stmt.run(description, target, progress, type, req.params.id);
    res.json({ success: true });
  });
  app.delete('/api/goals/:id', (req, res) => {
    db.prepare('DELETE FROM goals WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Habits
  app.get('/api/habits', (req, res) => {
    const habits = db.prepare('SELECT * FROM habits ORDER BY id DESC').all();
    res.json(habits);
  });
  app.post('/api/habits', (req, res) => {
    const { name, consistency } = req.body;
    const stmt = db.prepare('INSERT INTO habits (name, consistency) VALUES (?, ?)');
    const info = stmt.run(name, consistency || 0);
    res.json({ id: info.lastInsertRowid });
  });
  app.put('/api/habits/:id', (req, res) => {
    const { name, consistency } = req.body;
    const stmt = db.prepare('UPDATE habits SET name = ?, consistency = ? WHERE id = ?');
    stmt.run(name, consistency, req.params.id);
    res.json({ success: true });
  });
  app.delete('/api/habits/:id', (req, res) => {
    db.prepare('DELETE FROM habits WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Islamic Tracker
  app.get('/api/islamic', (req, res) => {
    const logs = db.prepare('SELECT * FROM islamic_logs ORDER BY date DESC').all();
    res.json(logs);
  });
  app.post('/api/islamic', (req, res) => {
    const { type, value, notes, date } = req.body;
    const stmt = db.prepare('INSERT INTO islamic_logs (type, value, notes, date) VALUES (?, ?, ?, ?)');
    const info = stmt.run(type, value, notes || '', date || new Date().toISOString().split('T')[0]);
    res.json({ id: info.lastInsertRowid });
  });
  app.delete('/api/islamic/:id', (req, res) => {
    db.prepare('DELETE FROM islamic_logs WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Quran Logs
  app.get('/api/quran', (req, res) => {
    const logs = db.prepare('SELECT * FROM quran_logs ORDER BY date DESC').all();
    res.json(logs);
  });
  app.post('/api/quran', (req, res) => {
    const { amount, unit, date } = req.body;
    const stmt = db.prepare('INSERT INTO quran_logs (amount, unit, date) VALUES (?, ?, ?)');
    const info = stmt.run(amount, unit, date || new Date().toISOString().split('T')[0]);
    res.json({ id: info.lastInsertRowid });
  });
  app.delete('/api/quran/:id', (req, res) => {
    db.prepare('DELETE FROM quran_logs WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Islamic Books
  app.get('/api/islamic-books', (req, res) => {
    const books = db.prepare('SELECT * FROM islamic_books ORDER BY id DESC').all();
    res.json(books);
  });
  app.post('/api/islamic-books', (req, res) => {
    const { title, progress, notes } = req.body;
    const stmt = db.prepare('INSERT INTO islamic_books (title, progress, notes) VALUES (?, ?, ?)');
    const info = stmt.run(title, progress || 0, notes || '');
    res.json({ id: info.lastInsertRowid });
  });
  app.put('/api/islamic-books/:id', (req, res) => {
    const { title, progress, notes } = req.body;
    const stmt = db.prepare('UPDATE islamic_books SET title = ?, progress = ?, notes = ? WHERE id = ?');
    stmt.run(title, progress, notes, req.params.id);
    res.json({ success: true });
  });
  app.delete('/api/islamic-books/:id', (req, res) => {
    db.prepare('DELETE FROM islamic_books WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Dhikr Logs
  app.get('/api/dhikr', (req, res) => {
    const logs = db.prepare('SELECT * FROM dhikr_logs ORDER BY date DESC').all();
    res.json(logs);
  });
  app.post('/api/dhikr', (req, res) => {
    const { type, count, date } = req.body;
    const stmt = db.prepare('INSERT INTO dhikr_logs (type, count, date) VALUES (?, ?, ?)');
    const info = stmt.run(type, count, date || new Date().toISOString().split('T')[0]);
    res.json({ id: info.lastInsertRowid });
  });
  app.delete('/api/dhikr/:id', (req, res) => {
    db.prepare('DELETE FROM dhikr_logs WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Journal
  app.get('/api/journal', (req, res) => {
    const entries = db.prepare('SELECT * FROM journal ORDER BY date DESC').all();
    res.json(entries);
  });
  app.post('/api/journal', (req, res) => {
    const { content, date } = req.body;
    const stmt = db.prepare('INSERT INTO journal (content, date) VALUES (?, ?)');
    const info = stmt.run(content, date || new Date().toISOString().split('T')[0]);
    res.json({ id: info.lastInsertRowid });
  });
  app.delete('/api/journal/:id', (req, res) => {
    db.prepare('DELETE FROM journal WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Fitness
  app.get('/api/fitness', (req, res) => {
    const logs = db.prepare('SELECT * FROM fitness ORDER BY date DESC').all();
    res.json(logs);
  });
  app.post('/api/fitness', (req, res) => {
    const { exercise, reps_duration, date } = req.body;
    const stmt = db.prepare('INSERT INTO fitness (exercise, reps_duration, date) VALUES (?, ?, ?)');
    const info = stmt.run(exercise, reps_duration, date || new Date().toISOString().split('T')[0]);
    res.json({ id: info.lastInsertRowid });
  });
  app.delete('/api/fitness/:id', (req, res) => {
    db.prepare('DELETE FROM fitness WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Water
  app.get('/api/water', (req, res) => {
    const logs = db.prepare('SELECT * FROM water ORDER BY date DESC').all();
    res.json(logs);
  });
  app.post('/api/water', (req, res) => {
    const { intake, target, date } = req.body;
    const stmt = db.prepare('INSERT INTO water (intake, target, date) VALUES (?, ?, ?)');
    const info = stmt.run(intake, target, date || new Date().toISOString().split('T')[0]);
    res.json({ id: info.lastInsertRowid });
  });
  app.delete('/api/water/:id', (req, res) => {
    db.prepare('DELETE FROM water WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
