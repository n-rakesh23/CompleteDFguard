import { Link }   from 'react-router-dom';
import { Home }   from 'lucide-react';
import Navbar     from '../components/layout/Navbar';
import Footer     from '../components/layout/Footer';
import Button     from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#030303] text-white">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <Navbar />

      <main className="flex-grow flex flex-col items-center justify-center text-center px-6 z-10">
        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.3em] mb-4">
          Error 404
        </p>
        <h1 className="text-7xl md:text-9xl font-display font-bold text-gradient mb-4">404</h1>
        <h2 className="text-xl md:text-2xl font-display font-bold text-white mb-3">
          Sector Does Not Exist
        </h2>
        <p className="text-gray-500 text-sm max-w-sm mb-8">
          The page you're looking for has been moved, deleted, or never existed in this system.
        </p>
        <Link to="/">
          <Button size="lg" className="rounded-full gap-2">
            <Home className="w-4 h-4" /> Return to Base
          </Button>
        </Link>
      </main>

      <Footer />
    </div>
  );
}
