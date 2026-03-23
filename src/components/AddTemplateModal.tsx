import { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import type { Template } from '../data/apiClient';

interface AddTemplateModalProps {
  onAdd: (template: Omit<Template, 'id' | 'createdAt'>) => void;
  onClose: () => void;
  existingCategories: string[];
}

export function AddTemplateModal({ onAdd, onClose, existingCategories }: AddTemplateModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Hero',
    website: '',
    content: '',
    imageUrl: '',
    demoUrl: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    setIsSubmitting(true);
    await onAdd(formData);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 sm:p-6 animate-fade-in">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-zinc-800 bg-zinc-900/50">
          <h2 className="text-2xl font-bold tracking-tight text-white">Add New Template</h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl border border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Container */}
        <div className="max-h-[75vh] overflow-y-auto p-8 hide-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-400 ml-1">Title</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Modern Landing Hero"
                className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-200 outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent placeholder:text-zinc-600"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-400 ml-1">Category</label>
                <div className="relative">
                  <input 
                    list="categories-list"
                    placeholder="Search or type category..."
                    className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-200 outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  />
                  <datalist id="categories-list">
                    {existingCategories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                    {['Hero', 'Pricing', 'Grid', 'Forms', 'Features', 'Testimonials', 'Header', 'Footer'].map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-400 ml-1">Website Origin</label>
                <input 
                  type="text" 
                  placeholder="e.g. acme-web.com"
                  className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-200 outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent placeholder:text-zinc-600"
                  value={formData.website}
                  onChange={e => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </div>

            <details className="group border border-zinc-800/60 rounded-xl bg-zinc-800/10 overflow-hidden transition-all duration-300">
              <summary className="flex items-center gap-2 p-4 text-xs font-bold uppercase tracking-widest text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors list-none select-none">
                <Plus size={14} className="group-open:rotate-45 transition-transform" />
                Manual Overrides
              </summary>
              <div className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 ml-1">Preview Image URL</label>
                  <input 
                    type="url" 
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-300 outline-none focus:border-accent transition-all"
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 ml-1">Live Demo URL</label>
                  <input 
                    type="url" 
                    placeholder="https://example.com/demo"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-300 outline-none focus:border-accent transition-all"
                    value={formData.demoUrl}
                    onChange={e => setFormData({ ...formData, demoUrl: e.target.value })}
                  />
                </div>
              </div>
            </details>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-400 ml-1">Bricks Template Code (JSON)</label>
              <textarea 
                required
                rows={6}
                placeholder="Paste your Bricks JSON here..."
                className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-200 outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent font-monospace text-sm resize-none placeholder:text-zinc-600"
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-lg transition-all shadow-lg active:scale-95 ${
                isSubmitting 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none' 
                  : 'bg-accent text-white hover:bg-accent/90 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Generating Preview ✨
                </>
              ) : (
                <>
                  <Plus size={20} /> Add to Vault
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
