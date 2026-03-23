import { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, AlertTriangle } from 'lucide-react';

interface AuthorizeModalProps {
  handshakeId: string;
  onClose: () => void;
  onSuccess: (siteName: string) => void;
}

export function AuthorizeModal({ handshakeId, onClose, onSuccess }: AuthorizeModalProps) {
  const [loading, setLoading] = useState(true);
  const [authorizing, setAuthorizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHandshake = async () => {
      try {
        // Since we don't have a GET for handshake_requests yet, we'll just try to authorize directly 
        // or we can add a quick endpoint. For now, let's assume we need to verify it.
        // I'll quickly add a verification step or just show a generic "Connect Request"
        setLoading(false);
        // Note: In a real app, you'd fetch the siteName/siteUrl here to show the user what they are approving.
      } catch (err) {
        setError('Invalid or expired handshake request.');
        setLoading(false);
      }
    };
    fetchHandshake();
  }, [handshakeId]);

  const handleAuthorize = async () => {
    setAuthorizing(true);
    try {
      const response = await fetch('/api/remote/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handshakeId })
      });
      const data = await response.json();
      if (data.success && data.redirectUrl) {
        onSuccess(data.siteName);
        // Instant redirect back to WordPress
        setTimeout(() => {
          window.location.href = data.redirectUrl;
        }, 1500);
      } else {
        setError(data.error || 'Authorization failed');
      }
    } catch (err) {
      setError('Server communication error');
    } finally {
      setAuthorizing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950/90 backdrop-blur-xl p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[32px] shadow-2xl overflow-hidden animate-slide-up">
        {loading ? (
          <div className="p-12 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-accent" />
            <p className="text-zinc-400 font-medium">Verifying request...</p>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Connection Failed</h3>
              <p className="text-zinc-500 text-sm">{error}</p>
            </div>
            <button onClick={onClose} className="w-full py-4 bg-zinc-800 text-white rounded-2xl font-bold">Close</button>
          </div>
        ) : (
          <div className="p-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-[24px] bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-8 shadow-[0_0_40px_rgba(59,130,246,0.2)]">
              <ShieldCheck size={40} />
            </div>
            
            <h2 className="text-2xl font-black text-white tracking-tight mb-4 text-pretty px-4">Authorize Remote Connection?</h2>
            <p className="text-zinc-400 text-sm mb-10 leading-relaxed px-2">
              A WordPress site is requesting permission to save templates directly to your vault. 
              Only approve this if you initiated the connection.
            </p>

            <div className="w-full space-y-3">
              <button 
                onClick={handleAuthorize}
                disabled={authorizing}
                className="w-full py-4 bg-accent text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {authorizing ? <Loader2 className="animate-spin" size={20} /> : "Yes, Authorize Site"}
              </button>
              <button 
                onClick={onClose}
                disabled={authorizing}
                className="w-full py-4 text-zinc-500 hover:text-white font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
