import { ChevronDown, Filter } from 'lucide-react';

interface SidebarProps {
  websites: string[];
  categories: string[];
  selectedWebsite: string;
  selectedCategory: string;
  onSelectWebsite: (website: string) => void;
  onSelectCategory: (category: string) => void;
  isTrashView: boolean;
  onToggleTrash: () => void;
}

export function Sidebar({ 
  websites, 
  categories, 
  selectedWebsite, 
  selectedCategory, 
  onSelectWebsite, 
  onSelectCategory,
  isTrashView,
  onToggleTrash
}: SidebarProps) {
  return (
    <aside className="glass-panel" style={{ width: '300px', flexShrink: 0, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <Filter size={20} color="var(--accent-secondary)" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Filters</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Website</label>
        <div style={{ position: 'relative' }}>
          <select 
            value={selectedWebsite}
            onChange={(e) => onSelectWebsite(e.target.value)}
            style={{
              width: '100%',
              appearance: 'none',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.95rem',
              cursor: 'pointer',
              outline: 'none',
              transition: 'border-color var(--transition-fast)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
          >
            {websites.map(site => (
              <option key={site} value={site}>{site}</option>
            ))}
          </select>
          <ChevronDown size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Category</label>
        <div style={{ position: 'relative' }}>
          <select 
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
            disabled={isTrashView}
            style={{
              width: '100%',
              appearance: 'none',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.95rem',
              cursor: isTrashView ? 'not-allowed' : 'pointer',
              outline: 'none',
              opacity: isTrashView ? 0.5 : 1,
              transition: 'border-color var(--transition-fast)'
            }}
            onFocus={(e) => !isTrashView && (e.target.style.borderColor = 'var(--accent-primary)')}
            onBlur={(e) => !isTrashView && (e.target.style.borderColor = 'var(--border-color)')}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <ChevronDown size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
        </div>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
        <button
          onClick={onToggleTrash}
          className="glass-pill"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            background: isTrashView ? 'rgba(255,100,100,0.1)' : 'transparent',
            color: isTrashView ? '#ffaaaa' : 'var(--text-secondary)',
            border: isTrashView ? '1px solid rgba(255,100,100,0.2)' : '1px solid var(--border-color)',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isTrashView ? 'Exit Trash View' : 'View Trash'}
        </button>
      </div>

    </aside>
  );
}
