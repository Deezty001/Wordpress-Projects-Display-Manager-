import { Clock, Zap } from 'lucide-react';

export function Changelog() {
  const updates = [
    {
      version: "v2.2.0",
      date: "March 21, 2026",
      title: "The Power User Update",
      type: "Major",
      changes: [
        "Implemented real-time Vault Search for instant filtering.",
        "Added One-Click .json Download for Bricks imports.",
        "Introduced Dynamic Categories - create categories on the fly.",
        "Performance optimizations for live rendering engine."
      ]
    },
    {
      version: "v2.1.0",
      date: "March 15, 2026",
      title: "Smart Trash System",
      type: "Feature",
      changes: [
        "Integrated soft-delete (Trash bin) functionality.",
        "Implemented synchronized remote deletion for orphaned WordPress pages.",
        "Added 'Restore' feature to bring templates back from trash."
      ]
    },
    {
      version: "v2.0.0",
      date: "March 01, 2026",
      title: "Tailwind UI Overhaul",
      type: "Alpha",
      changes: [
        "Complete transition from custom CSS to Tailwind CSS design system.",
        "Added micro-interactions and group-hover effects.",
        "New Sidebar navigation and responsive layout grid."
      ]
    }
  ];

  return (
    <div className="bg-zinc-950 min-h-screen pt-40 pb-32 px-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-bold mb-8">
            <Clock size={14} /> Tracking our journey
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6">WHAT'S NEW.</h1>
          <p className="text-xl text-zinc-500">
            Follow our progress as we build the world's most capable Bricks Builder library.
          </p>
        </header>

        <div className="space-y-16">
          {updates.map((upd, i) => (
            <div key={i} className="relative pl-12 border-l-2 border-zinc-900 pb-16 last:pb-0">
              {/* Timeline Marker */}
              <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-zinc-950 border-2 border-accent shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                 <div>
                    <span className="text-xs font-black tracking-widest text-zinc-600 uppercase mb-2 block">{upd.date}</span>
                    <h2 className="text-3xl font-black text-white tracking-tight">{upd.title}</h2>
                 </div>
                 <div className="flex gap-2">
                    <span className="px-3 py-1 bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold rounded-lg uppercase">{upd.version}</span>
                    <span className={`px-3 py-1 border text-[10px] font-bold rounded-lg uppercase ${upd.type === 'Major' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>{upd.type}</span>
                 </div>
              </div>

              <div className="p-8 rounded-3xl bg-zinc-900/30 border border-zinc-900">
                <ul className="space-y-4">
                  {upd.changes.map((change, j) => (
                    <li key={j} className="flex gap-3 text-zinc-400 text-sm leading-relaxed">
                       <Zap size={14} className="mt-1 text-zinc-600 shrink-0" />
                       {change}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
