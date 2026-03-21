export interface Template {
  id: string;
  title: string;
  website: string;
  category: string;
  imageUrl: string;
  demoUrl: string;
  content: string; // The Bricks JSON/Code
  createdAt: number;
  isTrashed?: number;
}

export const mockTemplates: Template[] = [
  {
    id: '1',
    title: 'Agency Hero Section',
    website: 'studio-alpha.com',
    category: 'Hero',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200&h=800',
    demoUrl: 'https://bricksbuilder.io/',
    content: '{"bricks":{"section":"hero","style":"modern"}}',
    createdAt: Date.now(),
    isTrashed: 0
  },
  {
    id: '2',
    title: 'SaaS Pricing Table',
    website: 'saas-builder.dev',
    category: 'Pricing',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200&h=800',
    demoUrl: 'https://bricksbuilder.io/',
    content: '{"bricks":{"section":"pricing","style":"saas"}}',
    createdAt: Date.now(),
    isTrashed: 0
  }
];

const API_URL = import.meta.env.PROD ? '' : 'http://localhost:8080';

export const fetchTemplates = async (): Promise<Template[]> => {
  const res = await fetch(`${API_URL}/api/templates`);
  if (!res.ok) throw new Error('Failed to fetch templates');
  return res.json();
};

export const createTemplate = async (template: Template): Promise<{id: string, imageUrl: string, demoUrl: string}> => {
  const res = await fetch(`${API_URL}/api/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(template)
  });
  if (!res.ok) throw new Error('Failed to save template');
  return res.json();
};

// Soft Delete (Moves to Trash)
export const removeTemplate = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/api/templates/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to trash template');
};

// Restore from Trash
export const restoreTemplate = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/api/templates/${id}/restore`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to restore template');
};

// Permanently Delete (Wipes SQLite + WordPress Render Page)
export const permanentDeleteTemplate = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/api/templates/${id}/permanent`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to permanently delete template');
};
