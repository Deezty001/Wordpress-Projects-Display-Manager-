import { Link } from 'react-router-dom';
import { Layers, Rocket, Shield, Zap, ArrowRight } from 'lucide-react';

export function Home() {
  return (
    <div className="bg-zinc-950 min-h-screen pt-32 overflow-hidden">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 text-center relative">
        {/* Animated Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/20 blur-[120px] -z-10 rounded-full animate-pulse" />
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in">
          <Zap size={14} /> Version 2.0 is live
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[0.9] animate-slide-up">
          THE ULTIMATE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-indigo-400">BRICKS VAULT.</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-xl text-zinc-400 mb-12 leading-relaxed animate-fade-in delay-200">
          Stop rebuilding the same sections. Store, preview, and deploy your Bricks Builder components in seconds with automated live rendering.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-300">
          <Link to="/library" className="w-full sm:w-auto px-8 py-4 bg-accent text-white rounded-full font-bold text-lg hover:bg-accent/90 transition-all shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
            Enter the Vault <ArrowRight size={20} />
          </Link>
          <Link to="/pricing" className="w-full sm:w-auto px-8 py-4 bg-zinc-900 text-white rounded-full font-bold text-lg border border-zinc-800 hover:bg-zinc-800 transition-all">
            See Pricing
          </Link>
        </div>

        {/* Hero Image / UI Preview Placeholder */}
        <div className="mt-24 px-4 animate-slide-up delay-500">
          <div className="max-w-5xl mx-auto aspect-video rounded-3xl bg-zinc-900 border border-zinc-800 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
               <Layers className="w-32 h-32 text-zinc-800" />
            </div>
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Automated Previews",
              desc: "Native WordPress rendering generates live previews of your code instantly. No screenshots required.",
              icon: <Zap className="text-yellow-400" />
            },
            {
              title: "Instant Copy-Paste",
              desc: "One click to copy your Bricks JSON. One click to download the file. Built for high-speed workflows.",
              icon: <Rocket className="text-blue-400" />
            },
            {
              title: "Safety First",
              desc: "Accidentally deleted a template? Our integrated Trash system ensures your work is never truly lost.",
              icon: <Shield className="text-emerald-400" />
            }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-accent/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-zinc-950 flex items-center justify-center mb-6 border border-zinc-800 transition-transform group-hover:scale-110">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-zinc-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="pb-32 px-6 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight">TRUSTED BY 500+ AGENCIES.</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40 grayscale contrast-200">
           {/* Replace with real logos or icons */}
           <div className="text-sm font-bold border border-white/10 p-4 rounded-lg">STUDIO.A</div>
           <div className="text-sm font-bold border border-white/10 p-4 rounded-lg">FLOW_DESIGN</div>
           <div className="text-sm font-bold border border-white/10 p-4 rounded-lg">PIXEL.ARC</div>
           <div className="text-sm font-bold border border-white/10 p-4 rounded-lg">MINT_WEB</div>
        </div>
      </section>
    </div>
  );
}
