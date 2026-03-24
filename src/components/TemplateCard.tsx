import { useState } from 'react';
import { Eye, Globe, Tag, Copy, Trash2, Check, RefreshCw, AlertTriangle, Download } from 'lucide-react';
import type { Template } from '../data/apiClient';
import { copyToClipboard } from '../utils/clipboard';
import { downloadTemplate } from '../utils/download';

interface TemplateCardProps {
  template: Template;
  onClick: () => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onRestore?: (id: string, e: React.MouseEvent) => void;
  isTrashView?: boolean;
}

export function TemplateCard({ template, onClick, onDelete, onRestore, isTrashView }: TemplateCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(template.content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      alert('Failed to copy to clipboard. Please try again.');
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadTemplate(template.title, template.content);
  };

  return (
    <div 
      onClick={onClick}
      className="group relative bg-zinc-900/40 border border-zinc-800/60 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:translate-y-[-4px] hover:border-accent/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4),0_0_20px_rgba(59,130,246,0.1)]"
    >
      {/* Action Buttons Top Right */}
      <div className="absolute top-3 right-3 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {!isTrashView && (
          <>
            <button 
              onClick={handleDownload}
              className="p-2 rounded-xl bg-zinc-950/60 backdrop-blur-md border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
              title="Download .json file"
            >
              <Download size={16} />
            </button>
            <button 
              onClick={handleCopy}
              className="p-2 rounded-xl bg-zinc-950/60 backdrop-blur-md border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
              title="Copy Bricks Code"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </>
        )}
        
        {isTrashView && onRestore ? (
          <>
            <button 
              onClick={(e) => onRestore(template.id, e)}
              className="p-2 rounded-xl bg-emerald-500/20 backdrop-blur-md border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
              title="Restore Template"
            >
              <RefreshCw size={16} />
            </button>
            <button 
              onClick={(e) => onDelete(template.id, e)}
              className="p-2 rounded-xl bg-red-500/20 backdrop-blur-md border border-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              title="Permanently Delete"
            >
              <AlertTriangle size={16} />
            </button>
          </>
        ) : (
          <button 
            onClick={(e) => onDelete(template.id, e)}
            className="p-2 rounded-xl bg-red-500/20 backdrop-blur-md border border-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            title="Move to Trash"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Preview Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-zinc-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <iframe 
          src={template.demoUrl}
          title={template.title}
          loading="lazy"
          scrolling="no"
          className="absolute origin-top-left pointer-events-none transition-all duration-700 ease-in-out group-hover:opacity-40 group-hover:scale-[0.26]"
          style={{ 
            width: '1280px', 
            height: '800px', 
            border: 'none',
            transform: 'scale(0.25)', 
          }}
        />
        
        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-zinc-950 text-sm font-bold shadow-xl">
            <Eye size={16} />
            Preview
          </div>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-5">
        <h3 className="text-zinc-100 font-bold text-lg mb-3 tracking-tight group-hover:text-accent transition-colors truncate">
          {template.title}
        </h3>
        
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800/40 border border-zinc-700/50 text-xs font-semibold text-zinc-400">
            <Globe size={12} className="text-accent" />
            {template.website}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800/40 border border-zinc-700/50 text-xs font-semibold text-zinc-400">
            <Tag size={12} className="text-accent" />
            {template.category}
          </span>
        </div>
      </div>
    </div>
  );
}
