import type { Template } from '../data/mockData';
import { TemplateCard } from './TemplateCard';

interface TemplateGridProps {
  templates: Template[];
  onSelectTemplate: (template: Template) => void;
  onDeleteTemplate: (id: string, e: React.MouseEvent) => void;
  onRestoreTemplate: (id: string, e: React.MouseEvent) => void;
  isTrashView: boolean;
}

export function TemplateGrid({ templates, onSelectTemplate, onDeleteTemplate, onRestoreTemplate, isTrashView }: TemplateGridProps) {
  if (templates.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{isTrashView ? '🗑️' : '📦'}</div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 500 }}>{isTrashView ? 'Trash is empty' : 'No templates found'}</h3>
        <p>{isTrashView ? 'Your deleted items will appear here.' : 'Try adjusting your filters.'}</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', alignContent: 'start' }}>
      {templates.map(template => (
        <TemplateCard 
          key={template.id} 
          template={template} 
          onClick={() => onSelectTemplate(template)} 
          onDelete={onDeleteTemplate}
          onRestore={onRestoreTemplate}
          isTrashView={isTrashView}
        />
      ))}
    </div>
  );
}
