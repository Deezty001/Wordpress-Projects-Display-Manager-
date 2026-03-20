import { useState, useMemo } from 'react';
import { Layers } from 'lucide-react';
import { mockTemplates } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { TemplateGrid } from './components/TemplateGrid';
import { TemplateModal } from './components/TemplateModal';
import type { Template } from './data/mockData';

export default function App() {
  const [selectedWebsite, setSelectedWebsite] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);

  const websites = useMemo(() => ['All', ...new Set(mockTemplates.map(t => t.website))], []);
  const categories = useMemo(() => ['All', ...new Set(mockTemplates.map(t => t.category))], []);

  const filteredTemplates = useMemo(() => {
    return mockTemplates.filter(t => {
      const matchWebsite = selectedWebsite === 'All' || t.website === selectedWebsite;
      const matchCategory = selectedCategory === 'All' || t.category === selectedCategory;
      return matchWebsite && matchCategory;
    });
  }, [selectedWebsite, selectedCategory]);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="glass-panel" style={{ margin: '1rem', padding: '1rem 2rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '1rem', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
        <div style={{ background: 'var(--accent-glow)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
          <Layers size={24} color="var(--accent-secondary)" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Bricks Vault</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Your premium component library</p>
        </div>
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
        <TemplateGrid templates={filteredTemplates} onSelectTemplate={setActiveTemplate} />
      </main>

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
