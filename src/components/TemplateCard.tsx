import { useState } from 'react';
import { Eye, Globe, Tag, Copy, Trash2, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import type { Template } from '../data/mockData';

interface TemplateCardProps {
  template: Template;
  onClick: () => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onRestore?: (id: string, e: React.MouseEvent) => void;
  isTrashView?: boolean;
}

export function TemplateCard({ template, onClick, onDelete, onRestore, isTrashView }: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(template.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="glass-panel"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? 'var(--shadow-glow)' : 'var(--shadow-md)',
        position: 'relative'
      }}
    >
      {/* Action Buttons Top Right */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        zIndex: 10,
        display: 'flex',
        gap: '0.5rem',
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.2s'
      }}>
        {!isTrashView && (
          <button 
            onClick={handleCopy}
            className="glass-pill" 
            style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff' }}
            title="Copy Bricks Code"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        )}
        
        {isTrashView && onRestore ? (
          <>
            <button 
              onClick={(e) => onRestore(template.id, e)}
              className="glass-pill" 
              style={{ padding: '0.5rem', background: 'rgba(100,255,100,0.2)', border: 'none', color: '#aaffaa' }}
              title="Restore Template"
            >
              <RefreshCw size={16} />
            </button>
            <button 
              onClick={(e) => onDelete(template.id, e)}
              className="glass-pill" 
              style={{ padding: '0.5rem', background: 'rgba(255,50,50,0.4)', border: 'none', color: '#ffaaaa' }}
              title="Permanently Delete (Destroys Rendered Pages too)"
            >
              <AlertTriangle size={16} />
            </button>
          </>
        ) : (
          <button 
            onClick={(e) => onDelete(template.id, e)}
            className="glass-pill" 
            style={{ padding: '0.5rem', background: 'rgba(255,100,100,0.2)', border: 'none', color: '#ffaaaa' }}
            title="Move to Trash"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Image Container */}
      <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
        <iframe 
          src={template.demoUrl}
          title={template.title}
          loading="lazy"
          scrolling="no"
          style={{ 
            width: '1280px', 
            height: '880px', 
            border: 'none',
            transform: isHovered ? 'scale(0.26)' : 'scale(0.25)', 
            transformOrigin: 'top left',
            pointerEvents: 'none',
            transition: 'transform 0.5s ease, opacity 0.5s ease',
            opacity: isHovered ? 0.5 : 1
          }}
        />
        
        {/* Overlay on hover */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(11, 12, 16, 0.4)',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity var(--transition-normal)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="glass-pill" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.95rem' }}>
            <Eye size={18} />
            View Demo
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>{template.title}</h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span className="glass-pill" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Globe size={14} />
            {template.website}
          </span>
          <span className="glass-pill" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Tag size={14} />
            {template.category}
          </span>
        </div>
      </div>
    </div>
  );
}
