import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Heart, PlusCircle, LogOut, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 text-blue-600 font-bold text-xl tracking-tight">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Home className="w-5 h-5" />
            </div>
            <span>RealEstate<span className="text-slate-900">Hub</span></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/properties"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              Browse Properties
            </Link>

            {isAuthenticated && user?.role === 'BUYER' && (
              <Link
                to="/saved"
                className="flex items-center space-x-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Saved</span>
              </Link>
            )}

            {isAuthenticated && user?.role === 'AGENT' && (
              <Link
                to="/create-property"
                className="flex items-center space-x-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>List Property</span>
              </Link>
            )}
          </nav>

          {/* Auth CTA or User Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-900">{user.name}</span>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{user.role}</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {user.name.charAt(0)}
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm shadow-blue-500/20 transition-all hover:shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/properties"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Browse Properties
          </Link>
          {isAuthenticated && user?.role === 'BUYER' && (
            <Link
              to="/saved"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Saved Properties
            </Link>
          )}
          {isAuthenticated && user?.role === 'AGENT' && (
            <Link
              to="/create-property"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
            >
              + List Property
            </Link>
          )}
          <div className="pt-4 border-t border-slate-200">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500 uppercase">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm text-rose-600 bg-rose-50 rounded-lg font-medium"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 px-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-700"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 px-3 bg-blue-600 text-white rounded-lg text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
