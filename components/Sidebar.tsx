import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../constants';
import { Box } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800 z-50">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <Box className="w-8 h-8 text-brand-500 mr-3" />
        <span className="font-bold text-xl tracking-tight">LogiTech</span>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {NAVIGATION_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-4 mb-4">
          <h4 className="text-xs font-semibold text-slate-400 uppercase">Sistem Durumu</h4>
          <div className="mt-2 flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <span className="text-xs text-slate-300">VDA Servisleri Aktif</span>
          </div>
        </div>
        
        <div className="text-center">
            <a href="https://www.ubden.com" target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-500 hover:text-slate-400 transition-colors">
                powered by Ubden®
            </a>
        </div>
      </div>
    </aside>
  );
};