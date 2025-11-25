
import React, { useState } from 'react';
import { Bell, Search, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
      logout();
      navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-10 sticky top-0 z-40">
      <div className="flex items-center md:hidden">
        <span className="font-bold text-slate-900">LogiTech</span>
      </div>

      <div className="hidden md:flex flex-1 max-w-md ml-64">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-slate-50 placeholder-slate-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors"
            placeholder="Sevkiyat, etiket veya ASN ara..."
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        <div className="relative border-l border-slate-200 pl-4">
            <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 hover:bg-slate-50 p-2 rounded-lg transition-colors"
            >
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500">{user?.company}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-600">
                    <User className="w-5 h-5" />
                </div>
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                    <Link 
                        to="/profile" 
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                        onClick={() => setShowDropdown(false)}
                    >
                        <User className="w-4 h-4 mr-2" /> Profilim
                    </Link>
                    <Link 
                        to="/settings" 
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                        onClick={() => setShowDropdown(false)}
                    >
                        <SettingsIcon className="w-4 h-4 mr-2" /> Ayarlar
                    </Link>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                        <LogOut className="w-4 h-4 mr-2" /> Çıkış Yap
                    </button>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};
