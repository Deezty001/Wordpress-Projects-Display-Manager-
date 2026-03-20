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
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(11, 12, 16, 0.9)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      {/* Top Toolbar */}
      <div style={{
        height: '64px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        background: 'var(--bg-secondary)'
      }}>
        {/* Left: Template Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{template.title}</h2>
          <span className="glass-pill" style={{ background: 'var(--accent-glow)', color: '#fff', borderColor: 'transparent' }}>
            {template.category}
          </span>
        </div>

        {/* Center: Viewport Controls */}
        <div style={{ display: 'flex', background: 'var(--bg-color)', borderRadius: 'var(--radius-full)', padding: '4px', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setViewport('desktop')}
            style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', background: viewport === 'desktop' ? 'var(--bg-secondary)' : 'transparent', color: viewport === 'desktop' ? '#fff' : 'var(--text-secondary)' }}
          >
            <Monitor size={18} />
          </button>
          <button 
            onClick={() => setViewport('tablet')}
            style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', background: viewport === 'tablet' ? 'var(--bg-secondary)' : 'transparent', color: viewport === 'tablet' ? '#fff' : 'var(--text-secondary)' }}
          >
            <Tablet size={18} />
          </button>
          <button 
            onClick={() => setViewport('mobile')}
            style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', background: viewport === 'mobile' ? 'var(--bg-secondary)' : 'transparent', color: viewport === 'mobile' ? '#fff' : 'var(--text-secondary)' }}
          >
            <Smartphone size={18} />
          </button>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a 
            href={template.demoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass-pill"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            Open Original <ExternalLink size={14} />
          </a>
          <button 
            onClick={onClose}
            className="glass-pill"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '2rem', overflow: 'hidden' }}>
        <div style={{
          width: viewportWidths[viewport],
          height: '100%',
          background: '#fff',
          borderRadius: viewport === 'desktop' ? 'var(--radius-lg)' : '2rem',
          border: viewport === 'desktop' ? 'none' : '12px solid #222',
          overflow: 'hidden',
          transition: 'width var(--transition-normal), border-radius var(--transition-normal)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <iframe 
            src={template.demoUrl} 
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={`Demo of ${template.title}`}
          />
        </div>
      </div>
    </div>
  );
}
