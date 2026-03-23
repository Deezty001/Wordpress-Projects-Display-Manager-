import { useState, useMemo, useEffect } from 'react';
import { Layers, Plus, Loader2, AlertCircle, Search } from 'lucide-react';
import { fetchTemplates, createTemplate, removeTemplate, restoreTemplate, permanentDeleteTemplate, generateId } from '../data/apiClient';
import { Sidebar } from '../components/Sidebar';
import { TemplateGrid } from '../components/TemplateGrid';
import { TemplateModal } from '../components/TemplateModal';
import { AddTemplateModal } from '../components/AddTemplateModal';
import type { Template } from '../data/apiClient';

export function Library() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWebsite, setSelectedWebsite] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTrashView, setIsTrashView] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
      const isInCurrentBin = isTrashView ? t.isTrashed === 1 : (t.isTrashed === 0 || !t.isTrashed);
      if (!isInCurrentBin) return false;

      const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.website.toLowerCase().includes(searchTerm.toLowerCase());

      if (isTrashView) return matchSearch;

      const matchWebsite = selectedWebsite === 'All' || t.website === selectedWebsite;
      const matchCategory = selectedCategory === 'All' || t.category === selectedCategory;
      
      return matchWebsite && matchCategory && matchSearch;
    });
  }, [templates, selectedWebsite, selectedCategory, isTrashView, searchTerm]);

  const handleAddTemplate = async (newTemplate: Omit<Template, 'id' | 'createdAt'>): Promise<boolean> => {
    const templateWithId: Template = {
      ...newTemplate,
      id: generateId(),
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
      if (confirm('WARNING: Permanently delete? This cannot be undone.')) {
        try {
          await permanentDeleteTemplate(id);
          setTemplates(prev => prev.filter(t => t.id !== id));
        } catch (err) {
          alert('Failed to delete');
        }
      }
    } else {
      try {
        await removeTemplate(id);
        setTemplates(prev => prev.map(t => t.id === id ? { ...t, isTrashed: 1 } : t));
      } catch (err) {
        alert('Failed to trash');
      }
    }
  };

  const handleRestoreTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await restoreTemplate(id);
      setTemplates(prev => prev.map(t => t.id === id ? { ...t, isTrashed: 0 } : t));
    } catch (err) {
      alert('Failed to restore');
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Product Header */}
      <header className="px-8 py-5 flex items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-900/40 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="bg-accent-glow p-2 rounded-xl border border-accent/20">
            <Layers className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Template Vault</h1>
            <p className="text-xs text-zinc-400 font-medium">Manage your Bricks library</p>
          </div>
        </div>

        <div className="flex-1 max-w-xl relative group mx-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-accent transition-colors" />
          <input 
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-zinc-950/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent placeholder:text-zinc-600"
          />
        </div>
        
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-full text-sm font-semibold hover:bg-accent/90 transition-all active:scale-95 shadow-lg shrink-0"
        >
          <Plus className="w-4 h-4" /> New Template
        </button>
      </header>

      {/* Main Grid Area */}
      <div className="flex-1 flex gap-6 p-6 overflow-hidden relative">
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
              <p className="font-medium animate-pulse">Loading vault...</p>
            </div>
          ) : error ? (
            <div className="flex-1 h-full flex flex-col items-center justify-center gap-4 text-red-400">
              <AlertCircle className="w-10 h-10" />
              <p className="font-medium">{error}</p>
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
      </div>

      {activeTemplate && (
        <TemplateModal 
          template={activeTemplate} 
          onClose={() => setActiveTemplate(null)} 
        />
      )}

      {isAddModalOpen && (
        <AddTemplateModal 
          onAdd={handleAddTemplate} 
          onClose={() => setIsAddModalOpen(false)} 
          existingCategories={categories}
        />
      )}
    </div>
  );
}
