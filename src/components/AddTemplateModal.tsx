import { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import type { Template } from '../data/mockData';

interface AddTemplateModalProps {
  onAdd: (template: Omit<Template, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export function AddTemplateModal({ onAdd, onClose }: AddTemplateModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Hero',
    website: '',
    content: '',
    imageUrl: '',
    demoUrl: ''
  });

  const categories = ['Hero', 'Pricing', 'Grid', 'Forms', 'Features', 'Testimonials', 'Header', 'Footer'];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    setIsSubmitting(true);
    await onAdd(formData);
    setIsSubmitting(false); // In case it fails, we stop loading
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 110,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(11, 12, 16, 0.8)',
      backdropFilter: 'blur(8px)',
      padding: '2rem'
    }}>
      <div className="glass-card" style={{ 
        width: '100%', 
        maxWidth: '600px', 
        maxHeight: '90vh', 
        overflowY: 'auto',
        position: 'relative',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Add New Template</h2>
          <button onClick={onClose} className="glass-pill" style={{ padding: '0.5rem' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Title</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Modern Landing Hero"
              style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: '#fff' }}
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Category</label>
              <select 
                style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: '#fff' }}
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Website Origin</label>
              <input 
                type="text" 
                placeholder="e.g. acme-web.com"
                style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: '#fff' }}
                value={formData.website}
                onChange={e => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
          </div>

          <details style={{ width: '100%' }}>
            <summary style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer', outline: 'none' }}>
              Manual Overrides (Skip if using Auto-Generate)
            </summary>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Preview Image URL</label>
                <input 
                  type="url" 
                  placeholder="https://example.com/image.jpg"
                  style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: '#fff' }}
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Live Demo URL</label>
                <input 
                  type="url" 
                  placeholder="https://example.com/demo"
                  style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: '#fff' }}
                  value={formData.demoUrl}
                  onChange={e => setFormData({ ...formData, demoUrl: e.target.value })}
                />
              </div>
            </div>
          </details>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Bricks Template Code (JSON)</label>
            <textarea 
              required
              rows={8}
              placeholder='Paste your Bricks JSON here...'
              style={{ 
                padding: '0.75rem 1rem', 
                borderRadius: 'var(--radius-md)', 
                background: 'var(--bg-color)', 
                border: '1px solid var(--border-color)', 
                color: '#fff',
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="glass-pill" 
            style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              background: isSubmitting ? 'var(--bg-secondary)' : 'var(--accent-glow)', 
              color: '#fff', 
              border: 'none', 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="spin" size={20} /> Generating Preview & Demo ✨
              </>
            ) : (
              <>
                <Plus size={20} /> Add Template
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
