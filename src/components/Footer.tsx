import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 bg-[#050505] text-white mt-auto w-full">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-600 to-yellow-400 flex items-center justify-center">
              <Shield className="w-4 h-4 text-black" />
            </div>
            <span className="text-lg font-bold text-white/80">GramSahay</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/30">
            <Link to="/sign-in" className="hover:text-yellow-400 transition-colors">Sign In</Link>
            <a href="/#features" className="hover:text-yellow-400 transition-colors">Features</a>
            <a href="/#how-it-works" className="hover:text-yellow-400 transition-colors">How It Works</a>
          </div>
          <div className="text-sm text-white/20">
            Built with ❤️ for Indian Communities · Powered by Google Gemini
          </div>
        </div>
      </div>
    </footer>
  );
}
