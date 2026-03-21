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
      <div className="flex-1 h-full flex flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-zinc-800/50 rounded-2xl mx-1 my-2">
        <div className="text-5xl mb-4 opacity-50">{isTrashView ? '🗑️' : '📦'}</div>
        <h3 className="text-xl font-medium text-zinc-400 mb-2">{isTrashView ? 'Trash is empty' : 'No templates found'}</h3>
        <p className="text-sm">{isTrashView ? 'Your deleted items will appear here.' : 'Try adjusting your filters.'}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start pb-8">
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
