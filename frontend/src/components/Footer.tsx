import React from 'react';
import { Home } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-white font-bold text-lg">RealEstateHub</span>
          </div>
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} RealEstateHub. Personal Portfolio & Recommendation Platform.
          </p>
        </div>
      </div>
    </footer>
  );
};
