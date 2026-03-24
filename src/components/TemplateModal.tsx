import { X, Monitor, Tablet, Smartphone, Shield, Download, Copy, Check } from 'lucide-react';
import type { Template } from '../data/apiClient';
import { transformBricksJson } from '../utils/bricksTransformer';
import { copyToClipboard } from '../utils/clipboard';
import { downloadTemplate } from '../utils/download';
import { useState, useMemo } from 'react';

interface TemplateModalProps {
  template: Template;
  onClose: () => void;
}

type Viewport = 'desktop' | 'tablet' | 'mobile';

export function TemplateModal({ template, onClose }: TemplateModalProps) {
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [cleanVersion, setCleanVersion] = useState(false);
  const [customClasses, setCustomClasses] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const transformed = transformBricksJson(template.content, { cleanVersion, customClasses });
    const success = await copyToClipboard(transformed);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const transformed = transformBricksJson(template.content, { cleanVersion, customClasses });
    downloadTemplate(template.title, transformed);
  };

  const viewportWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px'
  };

  const previewUrl = useMemo(() => {
    const url = new URL(template.demoUrl);
    if (cleanVersion) url.searchParams.set('bv_clean', '1');
    if (customClasses) url.searchParams.set('bv_classes', customClasses);
    return url.toString();
  }, [template.demoUrl, cleanVersion, customClasses]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-zinc-950/95 backdrop-blur-2xl animate-fade-in">
      {/* Top Toolbar */}
      <div className="h-16 shrink-0 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50">
        {/* Left: Template Info */}
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold tracking-tight text-white">{template.title}</h2>
          <span className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-bold uppercase tracking-widest text-accent">
            {template.category}
          </span>
        </div>

        {/* Center: Viewport Controls */}
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button 
            onClick={() => setViewport('desktop')}
            className={`p-2 rounded-lg transition-all ${viewport === 'desktop' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Monitor size={18} />
          </button>
          <button 
            onClick={() => setViewport('tablet')}
            className={`p-2 rounded-lg transition-all ${viewport === 'tablet' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Tablet size={18} />
          </button>
          <button 
            onClick={() => setViewport('mobile')}
            className={`p-2 rounded-lg transition-all ${viewport === 'mobile' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Smartphone size={18} />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-semibold hover:bg-zinc-700 hover:text-white transition-all active:scale-95 border border-zinc-700/50"
            title="Download transformed JSON"
          >
            <Download size={16} /> Download
          </button>
          <button 
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 border ${copied ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-accent text-white border-accent/20 hover:bg-accent/90'}`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy to Bricks'}
          </button>
          
          <div className="h-6 w-px bg-zinc-800 mx-1" />

          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Transformation Settings */}
        <div className="w-80 shrink-0 border-r border-zinc-800 bg-zinc-900/30 p-6 flex flex-col gap-8">
          <div>
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Export Settings</h3>
            
            <div className="space-y-6">
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800 cursor-pointer hover:border-accent/40 transition-colors group">
                <div className="pt-1">
                  <input 
                    type="checkbox" 
                    checked={cleanVersion}
                    onChange={(e) => setCleanVersion(e.target.checked)}
                    className="w-5 h-5 rounded-lg border-zinc-700 bg-zinc-900 text-accent focus:ring-accent accent-accent"
                  />
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-100 mb-1 group-hover:text-accent transition-colors">Clean Version</div>
                  <p className="text-xs text-zinc-500 leading-relaxed">Remove all hard-coded colors, fonts, and spacing to use your own theme styles.</p>
                </div>
              </label>

              <div>
                <label className="block text-sm font-bold text-zinc-100 mb-2">Custom CSS Classes</label>
                <input 
                  type="text"
                  placeholder="e.g. section-dark hero-alt"
                  value={customClasses}
                  onChange={(e) => setCustomClasses(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 outline-none transition-all focus:border-accent placeholder:text-zinc-600"
                />
                <p className="text-[10px] text-zinc-500 mt-2 font-medium">Applied to the root element of the template.</p>
              </div>
            </div>
          </div>

          <div className="mt-auto p-4 rounded-2xl bg-accent/5 border border-accent/10">
            <div className="flex items-center gap-2 text-accent mb-2">
              <Shield size={16} />
              <span className="text-xs font-bold uppercase tracking-tight">Smart Strip</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Clean Version automatically strips color, typography, and spacing variables for a blank-slate import.
            </p>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,_#18181b_0%,_#09090b_100%)]">
          <div 
            className="bg-white shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16, 1, 0.3, 1)] overflow-hidden relative"
            style={{
              width: viewportWidths[viewport],
              height: '100%',
              borderRadius: viewport === 'desktop' ? '0px' : '32px',
              border: viewport === 'desktop' ? 'none' : '12px solid #1c1c1f',
            }}
          >
          {viewport !== 'desktop' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1c1c1f] rounded-b-2xl z-20" />
          )}
          <iframe 
            src={previewUrl} 
            className="w-full h-full border-none"
            title={`Demo of ${template.title}`}
          />
        </div>
      </div>
    </div>
  </div>
  );
}
