import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Database setup
const dataDir = join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = join(dataDir, 'templates.db');
const db = new Database(dbPath);

// Initialize table
db.exec(`
  CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    website TEXT NOT NULL,
    content TEXT NOT NULL,
    imageUrl TEXT,
    demoUrl TEXT,
    createdAt INTEGER NOT NULL
  )
`);

// Add isTrashed column if missing
try {
  db.exec('ALTER TABLE templates ADD COLUMN isTrashed INTEGER DEFAULT 0');
} catch (e) {
  // Ignore, column exists
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// API Endpoints
app.get('/api/templates', (req, res) => {
  try {
    const templates = db.prepare('SELECT * FROM templates ORDER BY createdAt DESC').all();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/templates', async (req, res) => {
  let { id, title, category, website, content, imageUrl, demoUrl, createdAt } = req.body;
  try {
    const wpRenderUrl = process.env.WP_RENDER_URL;
    const wpRenderSecret = process.env.WP_RENDER_SECRET || 'default-secret';
    
    // Auto-generate preview & demo if the Render Server is configured
    if (wpRenderUrl && !demoUrl) {
      console.log('Generating automated demo via Render Server...');
      const wpResponse = await fetch(wpRenderUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, secret: wpRenderSecret })
      });
      
      const wpData = await wpResponse.json();
      
      if (wpData.success && wpData.url) {
        demoUrl = wpData.url;
        imageUrl = wpData.url; // Use demoUrl as imageUrl for backwards compatibility
        console.log('Demo generated:', demoUrl);
      } else {
        console.error('WP Render Server returned an error:', wpData);
      }
    }

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO templates (id, title, category, website, content, imageUrl, demoUrl, createdAt, isTrashed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `);
    stmt.run(id, title, category, website, content, imageUrl, demoUrl, createdAt);
    
    // Return the updated URLs to the frontend so it can update its local state
    res.status(201).json({ id, imageUrl, demoUrl });
  } catch (error) {
    console.error('Template Creation Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Soft Delete (Trash)
app.delete('/api/templates/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('UPDATE templates SET isTrashed = 1 WHERE id = ?').run(id);
    res.json({ message: 'Sent to trash' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restore from Trash
app.post('/api/templates/:id/restore', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('UPDATE templates SET isTrashed = 0 WHERE id = ?').run(id);
    res.json({ message: 'Restored successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Permanent Delete
app.delete('/api/templates/:id/permanent', async (req, res) => {
  const { id } = req.params;
  try {
    // Look up the URL first
    const template = db.prepare('SELECT demoUrl FROM templates WHERE id = ?').get(id);
    const wpRenderUrl = process.env.WP_RENDER_URL;

    // Contact WordPress Render Server to permanently wipe the orphan page
    if (template && template.demoUrl && wpRenderUrl) {
      console.log('Wiping orphaned WordPress page:', template.demoUrl);
      try {
        const deleteUrl = wpRenderUrl.replace('/generate', '/delete');
        await fetch(deleteUrl, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: template.demoUrl })
        });
      } catch (err) {
        console.error('Failed to reach WP server for deletion:', err);
      }
    }

    db.prepare('DELETE FROM templates WHERE id = ?').run(id);
    res.json({ message: 'Permanently deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
