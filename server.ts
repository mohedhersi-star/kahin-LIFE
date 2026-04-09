import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import db from './src/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Setup multer for PDF uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use('/uploads', express.static(uploadDir));

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

  // Learning
  app.get('/api/learning/categories', (req, res) => {
    const categories = db.prepare('SELECT * FROM learning_categories').all();
    const subcategories = db.prepare('SELECT * FROM learning_subcategories').all();
    
    const result = categories.map((cat: any) => ({
      ...cat,
      subcategories: subcategories.filter((sub: any) => sub.category_id === cat.id)
    }));
    
    res.json(result);
  });

  app.get('/api/learning/content/:subcategoryId', (req, res) => {
    const content = db.prepare('SELECT * FROM learning_content WHERE subcategory_id = ? ORDER BY id DESC').all(req.params.subcategoryId);
    res.json(content);
  });

  app.post('/api/learning/content', (req, res) => {
    const { subcategory_id, title, description, is_bookmarked, revise_later } = req.body;
    const stmt = db.prepare('INSERT INTO learning_content (subcategory_id, title, description, created_at, is_bookmarked, revise_later) VALUES (?, ?, ?, ?, ?, ?)');
    const info = stmt.run(subcategory_id, title, description, new Date().toISOString(), is_bookmarked ? 1 : 0, revise_later ? 1 : 0);
    res.json({ id: info.lastInsertRowid });
  });

  app.put('/api/learning/content/:id', (req, res) => {
    const { title, description, is_bookmarked, revise_later } = req.body;
    const stmt = db.prepare('UPDATE learning_content SET title = ?, description = ?, is_bookmarked = ?, revise_later = ? WHERE id = ?');
    stmt.run(title, description, is_bookmarked ? 1 : 0, revise_later ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/learning/content/:id', (req, res) => {
    db.prepare('DELETE FROM learning_content WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/learning/goals', (req, res) => {
    const goals = db.prepare('SELECT * FROM learning_goals ORDER BY id DESC').all();
    res.json(goals);
  });

  app.post('/api/learning/goals', (req, res) => {
    const { description, is_completed, date } = req.body;
    const stmt = db.prepare('INSERT INTO learning_goals (description, is_completed, date) VALUES (?, ?, ?)');
    const info = stmt.run(description, is_completed ? 1 : 0, date || new Date().toISOString().split('T')[0]);
    res.json({ id: info.lastInsertRowid });
  });

  app.put('/api/learning/goals/:id', (req, res) => {
    const { description, is_completed } = req.body;
    const stmt = db.prepare('UPDATE learning_goals SET description = ?, is_completed = ? WHERE id = ?');
    stmt.run(description, is_completed ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/learning/goals/:id', (req, res) => {
    db.prepare('DELETE FROM learning_goals WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // PDF Endpoints
  app.get('/api/learning/pdfs', (req, res) => {
    const pdfs = db.prepare('SELECT * FROM learning_pdfs ORDER BY id DESC').all();
    res.json(pdfs);
  });

  app.post('/api/learning/pdfs', upload.single('pdf'), async (req, res) => {
    try {
      const { title, category, target_date, pages_per_day } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Parse PDF to get total pages
      const dataBuffer = fs.readFileSync(file.path);
      const data = await pdfParse(dataBuffer);
      const total_pages = data.numpages;

      const stmt = db.prepare('INSERT INTO learning_pdfs (title, category, file_path, total_pages, current_page, target_date, pages_per_day, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      const info = stmt.run(title, category, file.filename, total_pages, 0, target_date || null, pages_per_day || 0, new Date().toISOString());
      
      res.json({ id: info.lastInsertRowid, total_pages });
    } catch (error) {
      console.error('Error uploading PDF:', error);
      res.status(500).json({ error: 'Failed to upload PDF' });
    }
  });

  app.put('/api/learning/pdfs/:id', (req, res) => {
    const { current_page, target_date, pages_per_day } = req.body;
    const stmt = db.prepare('UPDATE learning_pdfs SET current_page = ?, target_date = ?, pages_per_day = ? WHERE id = ?');
    stmt.run(current_page, target_date, pages_per_day, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/learning/pdfs/:id', (req, res) => {
    const pdf = db.prepare('SELECT file_path FROM learning_pdfs WHERE id = ?').get(req.params.id) as any;
    if (pdf) {
      const filePath = path.join(uploadDir, pdf.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    db.prepare('DELETE FROM learning_pdf_notes WHERE pdf_id = ?').run(req.params.id);
    db.prepare('DELETE FROM learning_pdfs WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // PDF Notes
  app.get('/api/learning/pdfs/:id/notes', (req, res) => {
    const notes = db.prepare('SELECT * FROM learning_pdf_notes WHERE pdf_id = ? ORDER BY page_number ASC').all(req.params.id);
    res.json(notes);
  });

  app.post('/api/learning/pdfs/:id/notes', (req, res) => {
    const { page_number, content } = req.body;
    const stmt = db.prepare('INSERT INTO learning_pdf_notes (pdf_id, page_number, content, created_at) VALUES (?, ?, ?, ?)');
    const info = stmt.run(req.params.id, page_number, content, new Date().toISOString());
    res.json({ id: info.lastInsertRowid });
  });

  app.delete('/api/learning/pdf-notes/:id', (req, res) => {
    db.prepare('DELETE FROM learning_pdf_notes WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // SPA fallback for development
    app.use('*', async (req, res, next) => {
      try {
        let template = await fs.promises.readFile(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
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
