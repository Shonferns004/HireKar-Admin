import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Gauge,
  Users,
  ChartLine,
  FileText,
  Gear,
  Lifebuoy,
  SignOut,
  ChartPieSlice,
  GooglePodcastsLogo,
  UserCircleGear,
  UserFocus,
  Books,
  
} from 'phosphor-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: GooglePodcastsLogo , path: '/' },
  { id: 'users', label: 'Users', icon: UserFocus  , path: '/users' },
  { id: 'course', label: 'Courses', icon: Books  , path: '/courses' },
  { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
];

const systemItems = [
  { id: 'settings', label: 'Settings', icon: Gear, path: '/settings' },
  { id: 'support', label: 'Support', icon: Lifebuoy, path: '/support' },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col h-full
        transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary size-10 rounded-lg flex items-center justify-center text-black">
              <ChartPieSlice  size={22} weight="fill" />
            </div>
            <div>
              <h1 className="text-slate-900 text-base font-bold">HireKar Admin</h1>
              <p className="text-slate-500 text-xs font-medium">Analytics</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 font-medium'
              }`}
            >
              <item.icon
                size={20}
                weight={isActive(item.path) ? "fill" : "regular"}
              />
              <span className="text-sm leading-normal">{item.label}</span>
            </Link>
          ))}

          <div className="pt-6 pb-2">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              System
            </p>
          </div>

          {systemItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 font-medium'
              }`}
            >
              <item.icon
                size={20}
                weight={isActive(item.path) ? "fill" : "regular"}
              />
              <span className="text-sm leading-normal">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 p-2 group bg-slate-50 rounded-xl lg:bg-transparent">
            <img 
              src={user?.avatar} 
              alt={user?.name}
              className="size-8 rounded-full object-cover border border-slate-200"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {user?.name}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {user?.email}
              </p>
            </div>
            <button 
              onClick={logout}
              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <SignOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
