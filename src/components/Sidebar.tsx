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
    <aside className="w-[280px] shrink-0 p-6 flex flex-col gap-8 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-xl shadow-lg overflow-y-auto hide-scrollbar">
      <div className="flex items-center gap-3 mb-2">
        <Filter className="w-5 h-5 text-accent" />
        <h2 className="text-xl font-semibold tracking-tight">Filters</h2>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-zinc-400">Website</label>
        <div className="relative group">
          <select 
            value={selectedWebsite}
            onChange={(e) => onSelectWebsite(e.target.value)}
            className="w-full appearance-none bg-zinc-950/50 border border-zinc-800 text-zinc-200 px-4 py-3 rounded-xl text-sm outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent hover:border-zinc-700 cursor-pointer"
          >
            {websites.map(site => (
              <option key={site} value={site} className="bg-zinc-900 text-zinc-100">{site}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 group-hover:text-zinc-400 transition-colors" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-zinc-400">Category</label>
        <div className="relative group">
          <select 
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
            disabled={isTrashView}
            className={`w-full appearance-none bg-zinc-950/50 border border-zinc-800 text-zinc-200 px-4 py-3 rounded-xl text-sm outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent hover:border-zinc-700 ${isTrashView ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-zinc-900 text-zinc-100">{cat}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 group-hover:text-zinc-400 transition-colors" />
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-zinc-800/60">
        <button
          onClick={onToggleTrash}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-medium transition-all ${
            isTrashView 
              ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' 
              : 'bg-zinc-800/30 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
        >
          {isTrashView ? 'Exit Trash View' : 'View Trash'}
        </button>
      </div>
    </aside>
  );
}
