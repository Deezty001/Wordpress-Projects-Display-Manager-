import { useState, useMemo, useEffect } from 'react';
import { Layers, Plus, Loader2, AlertCircle } from 'lucide-react';
import { fetchTemplates, createTemplate, removeTemplate } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { TemplateGrid } from './components/TemplateGrid';
import { TemplateModal } from './components/TemplateModal';
import { AddTemplateModal } from './components/AddTemplateModal';
import type { Template } from './data/mockData';

export default function App() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWebsite, setSelectedWebsite] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchTemplates();
        setTemplates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load templates');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const websites = useMemo(() => ['All', ...new Set(templates.map(t => t.website))], [templates]);
  const categories = useMemo(() => ['All', ...new Set(templates.map(t => t.category))], [templates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchWebsite = selectedWebsite === 'All' || t.website === selectedWebsite;
      const matchCategory = selectedCategory === 'All' || t.category === selectedCategory;
      return matchWebsite && matchCategory;
    });
  }, [templates, selectedWebsite, selectedCategory]);

  const handleAddTemplate = async (newTemplate: Omit<Template, 'id' | 'createdAt'>): Promise<boolean> => {
    const templateWithId: Template = {
      ...newTemplate,
      id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      createdAt: Date.now()
    };
    
    try {
      const generated = await createTemplate(templateWithId);
      
      // Update with server-generated URLs if auto-generation occurred
      if (generated.imageUrl) templateWithId.imageUrl = generated.imageUrl;
      if (generated.demoUrl) templateWithId.demoUrl = generated.demoUrl;
      
      setTemplates(prev => [templateWithId, ...prev]);
      setIsAddModalOpen(false);
      return true;
    } catch (err) {
      alert('Failed to save template to database');
      return false;
    }
  };

  const handleDeleteTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await removeTemplate(id);
        setTemplates(prev => prev.filter(t => t.id !== id));
      } catch (err) {
        alert('Failed to delete template from database');
      }
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="glass-panel" style={{ margin: '1rem', padding: '1.25rem 2rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--accent-glow)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <Layers size={24} color="var(--accent-secondary)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Bricks Vault</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Your premium component library</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="glass-pill"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.75rem 1.5rem',
            background: 'var(--accent-glow)',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Plus size={20} /> New Template
        </button>
      </header>

      {/* Main Layout */}
      <main className="app-main">
        <Sidebar 
          websites={websites} 
          categories={categories}
          selectedWebsite={selectedWebsite}
          selectedCategory={selectedCategory}
          onSelectWebsite={setSelectedWebsite}
          onSelectCategory={setSelectedCategory}
        />
        {isLoading ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
            <Loader2 className="spin" size={40} color="var(--accent-secondary)" />
            <p>Accessing the vault...</p>
          </div>
        ) : error ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: '#ff4b4b' }}>
            <AlertCircle size={40} />
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="glass-pill" style={{ marginTop: '1rem' }}>Retry</button>
          </div>
        ) : (
          <TemplateGrid 
            templates={filteredTemplates} 
            onSelectTemplate={setActiveTemplate} 
            onDeleteTemplate={handleDeleteTemplate}
          />
        )}
      </main>

      {/* Add Template Modal */}
      {isAddModalOpen && (
        <AddTemplateModal 
          onAdd={handleAddTemplate} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}

      {/* Full Demo Modal */}
      {activeTemplate && (
        <TemplateModal 
          template={activeTemplate} 
          onClose={() => setActiveTemplate(null)} 
        />
      )}
    </div>
  );
}
