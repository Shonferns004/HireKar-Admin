import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  List,
  MagnifyingGlass,
  Bell
} from 'phosphor-react';

export const TopNav = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 sm:px-8 w-full">
      <div className="flex items-center gap-3 flex-1">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <List size={22} />
        </button>

        
      </div>

      <div className="flex items-center gap-2 sm:gap-6 ml-2">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors hidden sm:flex">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-slate-900 leading-none">
              {user?.name}
            </p>
            <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-wide">
              {user?.role}
            </p>
          </div>
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-primary transition-all">
            <img 
              src={user?.avatar} 
              alt="User" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
