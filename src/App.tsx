import { useState, useMemo, useEffect } from 'react';
import { Layers, Plus, Loader2, AlertCircle } from 'lucide-react';
import { fetchTemplates, createTemplate, removeTemplate, restoreTemplate, permanentDeleteTemplate } from './data/mockData';
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
  const [isTrashView, setIsTrashView] = useState(false);

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
      // Is it in the correct bin?
      const isInCurrentBin = isTrashView ? t.isTrashed === 1 : (t.isTrashed === 0 || !t.isTrashed);
      if (!isInCurrentBin) return false;

      // Skip website/category filters if in Trash view for easier viewing, OR apply them
      if (isTrashView) return true;

      const matchWebsite = selectedWebsite === 'All' || t.website === selectedWebsite;
      const matchCategory = selectedCategory === 'All' || t.category === selectedCategory;
      return matchWebsite && matchCategory;
    });
  }, [templates, selectedWebsite, selectedCategory, isTrashView]);

  const handleAddTemplate = async (newTemplate: Omit<Template, 'id' | 'createdAt'>): Promise<boolean> => {
    const templateWithId: Template = {
      ...newTemplate,
      id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      createdAt: Date.now(),
      isTrashed: 0
    };
    
    try {
      const generated = await createTemplate(templateWithId);
      
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
    
    if (isTrashView) {
      // Hard Delete
      if (confirm('WARNING: This will permanently delete this template AND wipe the generated Bricks Page from your WordPress Render Server. This cannot be undone. Are you sure?')) {
        try {
          await permanentDeleteTemplate(id);
          setTemplates(prev => prev.filter(t => t.id !== id));
        } catch (err) {
          alert('Failed to permanently delete template');
        }
      }
    } else {
      // Soft Delete (Trash)
      try {
        await removeTemplate(id);
        setTemplates(prev => prev.map(t => t.id === id ? { ...t, isTrashed: 1 } : t));
      } catch (err) {
        alert('Failed to move template to trash');
      }
    }
  };

  const handleRestoreTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await restoreTemplate(id);
      setTemplates(prev => prev.map(t => t.id === id ? { ...t, isTrashed: 0 } : t));
    } catch (err) {
      alert('Failed to restore template');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-accent selection:text-white">
      {/* Header */}
      <header className="m-4 px-8 py-5 rounded-2xl flex items-center justify-between gap-4 border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-accent-glow p-3 rounded-xl border border-accent/20">
            <Layers className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Bricks Vault</h1>
            <p className="text-sm text-zinc-400 font-medium">Your premium component library</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-accent text-white rounded-full font-semibold hover:bg-accent/90 transition-all active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
        >
          <Plus className="w-5 h-5" /> New Template
        </button>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex gap-6 px-4 pb-4 overflow-hidden relative">
        <Sidebar 
          websites={websites} 
          categories={categories}
          selectedWebsite={selectedWebsite}
          selectedCategory={selectedCategory}
          onSelectWebsite={setSelectedWebsite}
          onSelectCategory={setSelectedCategory}
          isTrashView={isTrashView}
          onToggleTrash={() => setIsTrashView(!isTrashView)}
        />
        
        <div className="flex-1 relative overflow-y-auto hide-scrollbar scroll-smooth pr-2">
          {isLoading ? (
            <div className="flex-1 h-full flex flex-col items-center justify-center gap-4 text-zinc-500">
              <Loader2 className="w-10 h-10 animate-spin text-accent" />
              <p className="font-medium animate-pulse">Accessing the vault...</p>
            </div>
          ) : error ? (
            <div className="flex-1 h-full flex flex-col items-center justify-center gap-4 text-red-400">
              <AlertCircle className="w-10 h-10" />
              <p className="font-medium">{error}</p>
              <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 rounded-full border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors">Retry</button>
            </div>
          ) : (
            <TemplateGrid 
              templates={filteredTemplates} 
              onSelectTemplate={setActiveTemplate} 
              onDeleteTemplate={handleDeleteTemplate}
              onRestoreTemplate={handleRestoreTemplate}
              isTrashView={isTrashView}
            />
          )}
        </div>
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
