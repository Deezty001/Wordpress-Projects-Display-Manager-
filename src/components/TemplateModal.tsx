import { useState } from 'react';
import { X, Monitor, Tablet, Smartphone, ExternalLink } from 'lucide-react';
import type { Template } from '../data/mockData';

interface TemplateModalProps {
  template: Template;
  onClose: () => void;
}

type Viewport = 'desktop' | 'tablet' | 'mobile';

export function TemplateModal({ template, onClose }: TemplateModalProps) {
  const [viewport, setViewport] = useState<Viewport>('desktop');

  const viewportWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px'
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-zinc-950/95 backdrop-blur-2xl animate-fade-in">
      {/* Top Toolbar */}
      <div className="h-16 shrink-0 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50">
        {/* Left: Template Info */}
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold tracking-tight text-white">{template.title}</h2>
          <span className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-bold uppercase tracking-widest text-accent">
            {template.category}
          </span>
        </div>

        {/* Center: Viewport Controls */}
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button 
            onClick={() => setViewport('desktop')}
            className={`p-2 rounded-lg transition-all ${viewport === 'desktop' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Monitor size={18} />
          </button>
          <button 
            onClick={() => setViewport('tablet')}
            className={`p-2 rounded-lg transition-all ${viewport === 'tablet' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Tablet size={18} />
          </button>
          <button 
            onClick={() => setViewport('mobile')}
            className={`p-2 rounded-lg transition-all ${viewport === 'mobile' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Smartphone size={18} />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <a 
            href={template.demoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-semibold hover:bg-zinc-700 hover:text-white transition-all active:scale-95"
          >
            Open <ExternalLink size={14} />
          </a>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 p-8 flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,_#18181b_0%,_#09090b_100%)]">
        <div 
          className="bg-white shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16, 1, 0.3, 1)] overflow-hidden relative"
          style={{
            width: viewportWidths[viewport],
            height: '100%',
            borderRadius: viewport === 'desktop' ? '0px' : '32px',
            border: viewport === 'desktop' ? 'none' : '12px solid #1c1c1f',
          }}
        >
          {viewport !== 'desktop' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1c1c1f] rounded-b-2xl z-20" />
          )}
          <iframe 
            src={template.demoUrl} 
            className="w-full h-full border-none"
            title={`Demo of ${template.title}`}
          />
        </div>
      </div>
    </div>
  );
}
