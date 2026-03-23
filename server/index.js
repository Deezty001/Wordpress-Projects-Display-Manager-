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
  );

  CREATE TABLE IF NOT EXISTS sites (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    token TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    createdAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS handshake_requests (
    id TEXT PRIMARY KEY,
    siteName TEXT NOT NULL,
    siteUrl TEXT NOT NULL,
    expiresAt INTEGER NOT NULL
  );
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

// --- Magic Handshake Endpoints ---

// 1. Initiate Handshake (Called by WP Plugin)
app.post('/api/handshake', (req, res) => {
  const { siteName, siteUrl } = req.body;
  if (!siteName || !siteUrl) return res.status(400).json({ error: 'Missing site info' });

  const id = Math.random().toString(36).substring(2, 15);
  const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes

  try {
    db.prepare('INSERT INTO handshake_requests (id, siteName, siteUrl, expiresAt) VALUES (?, ?, ?, ?)')
      .run(id, siteName, siteUrl, expiresAt);
    
    // In a real app, this would be a URL to your vault's authorize page
    const authUrl = `${process.env.PUBLIC_URL || 'http://localhost:5173'}/library?handshake=${id}`;
    res.json({ handshakeId: id, authUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Authorize Connection (Called by Vault UI after user approval)
app.post('/api/remote/authorize', (req, res) => {
  const { handshakeId } = req.body;
  try {
    const request = db.prepare('SELECT * FROM handshake_requests WHERE id = ?').get(handshakeId);
    if (!request) return res.status(404).json({ error: 'Handshake request not found or expired' });
    if (Date.now() > request.expiresAt) {
      db.prepare('DELETE FROM handshake_requests WHERE id = ?').run(handshakeId);
      return res.status(410).json({ error: 'Request expired' });
    }

    const siteId = Math.random().toString(36).substring(2, 15);
    const token = 'bv_' + Math.random().toString(36).substring(2, 32) + Math.random().toString(36).substring(2, 32);

    db.prepare('INSERT INTO sites (id, name, url, token, createdAt) VALUES (?, ?, ?, ?, ?)')
      .run(siteId, request.siteName, request.siteUrl, token, Date.now());
    
    db.prepare('DELETE FROM handshake_requests WHERE id = ?').run(handshakeId);

    // Return success AND the redirect URL for the WP admin page
    const redirectUrl = `${request.siteUrl}/wp-admin/admin.php?page=bricks-vault-connector&token=${token}`;
    res.json({ success: true, siteName: request.siteName, token, redirectUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Remote Save (Called by WP Plugin with token)
app.post('/api/remote/save', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.split(' ')[1];

  try {
    const site = db.prepare('SELECT * FROM sites WHERE token = ?').get(token);
    if (!site) return res.status(401).json({ error: 'Invalid token' });

    const { title, category, content } = req.body;
    const id = Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    
    // This reuse the logic from /api/templates but simplified
    const createdAt = Date.now();
    let imageUrl = '';
    let demoUrl = '';

    const wpRenderUrl = process.env.WP_RENDER_URL;
    const wpRenderSecret = process.env.WP_RENDER_SECRET || 'default-secret';
    
    if (wpRenderUrl) {
      const wpResponse = await fetch(wpRenderUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, secret: wpRenderSecret })
      });
      const wpData = await wpResponse.json();
      if (wpData.success && wpData.url) {
        demoUrl = wpData.url;
        imageUrl = wpData.url;
      }
    }

    db.prepare(`
      INSERT INTO templates (id, title, category, website, content, imageUrl, demoUrl, createdAt, isTrashed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).run(id, title, category || 'Remote', site.name, content, imageUrl, demoUrl, createdAt);

    res.status(201).json({ success: true, id, demoUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. List Connected Sites
app.get('/api/sites', (req, res) => {
  try {
    const sites = db.prepare('SELECT id, name, url, createdAt FROM sites').all();
    res.json(sites);
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
