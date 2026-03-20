import { useState } from 'react';
import { Eye, Globe, Tag } from 'lucide-react';
import type { Template } from '../data/mockData';

interface TemplateCardProps {
  template: Template;
  onClick: () => void;
}

export function TemplateCard({ template, onClick }: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false);

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
      }}
    >
      {/* Image Container */}
      <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
        <img 
          src={template.imageUrl} 
          alt={template.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
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
