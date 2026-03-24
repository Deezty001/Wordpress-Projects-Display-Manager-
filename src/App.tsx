import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { Solutions } from './pages/Solutions';
import { Pricing } from './pages/Pricing';
import { Changelog } from './pages/Changelog';
import { Library } from './pages/Library';

function AppContent() {
  const location = useLocation();
  const isLibrary = location.pathname.startsWith('/library');

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-accent selection:text-white">
      <Navbar />
      
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/changelog" element={<Changelog />} />
          <Route path="/library" element={<Library />} />
        </Routes>
      </main>

      {!isLibrary && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
