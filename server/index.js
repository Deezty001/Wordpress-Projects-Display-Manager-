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
    if (wpRenderUrl) {
      console.log('Generating automated demo via Render Server...');
      const wpResponse = await fetch(wpRenderUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, secret: wpRenderSecret })
      });
      
      const wpData = await wpResponse.json();
      
      if (wpData.success && wpData.url) {
        demoUrl = wpData.url;
        console.log('Demo generated:', demoUrl);
        
        // 2. Generate Screenshot using Microlink
        console.log('Generating automated screenshot...');
        const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(demoUrl)}&screenshot=true&meta=false&waitFor=3000`;
        const microResponse = await fetch(microlinkUrl);
        const microData = await microResponse.json();
        
        if (microData.status === 'success' && microData.data?.screenshot?.url) {
          imageUrl = microData.data.screenshot.url;
          console.log('Screenshot generated:', imageUrl);
        }
      } else {
        console.error('WP Render Server returned an error:', wpData);
      }
    }

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO templates (id, title, category, website, content, imageUrl, demoUrl, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, title, category, website, content, imageUrl, demoUrl, createdAt);
    
    // Return the updated URLs to the frontend so it can update its local state
    res.status(201).json({ id, imageUrl, demoUrl });
  } catch (error) {
    console.error('Template Creation Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/templates/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM templates WHERE id = ?').run(id);
    res.json({ message: 'Deleted successfully' });
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
