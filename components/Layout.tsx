
import React, { useEffect, useState } from 'react';
import { NAV_ITEMS } from '../constants';
import { UserSession, UserRole } from '../types';
import { LogOut, User as UserIcon, ShieldCheck, ChevronRight, CloudOff } from 'lucide-react';
import { SyncService } from '../syncService';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserSession;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user, onLogout }) => {
  const [pendingCount, setPendingCount] = useState(0);
  const visibleNav = NAV_ITEMS.filter(item => item.roles.includes(user.role));

  useEffect(() => {
    const checkSync = async () => {
      const data = JSON.parse(localStorage.getItem('voucher_hub_cloud_sync') || '[]');
      const unsynced = data.filter((e: any) => !e.isSynced).length;
      setPendingCount(unsynced);
      
      if (unsynced > 0 && navigator.onLine) {
        const synced = await SyncService.syncPendingEntries();
        if (synced > 0) setPendingCount(prev => Math.max(0, prev - synced));
      }
    };

    checkSync();
    const interval = setInterval(checkSync, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
             <ShieldCheck size={20} />
          </div>
          <span className="font-bold text-slate-800 text-lg">Voucher Hub</span>
        </div>
        <button 
          onClick={onLogout} 
          className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-black uppercase tracking-widest"
        >
          <LogOut size={14} />
          Switch
        </button>
      </header>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0 p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
             <ShieldCheck size={24} />
          </div>
          <h1 className="font-extrabold text-xl text-slate-800 tracking-tight">VoucherHub</h1>
        </div>

        {/* User Context */}
        <div className="mb-8 px-2">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${user.role === UserRole.ADMIN ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {user.role === UserRole.ADMIN ? <ShieldCheck size={18} /> : <UserIcon size={18} />}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-slate-800 truncate">{user.name}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</span>
              </div>
            </div>
            
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-between group px-3 py-2 bg-white border border-slate-100 rounded-xl hover:border-rose-200 hover:bg-rose-50 transition-all"
            >
              <div className="flex items-center gap-2 text-xs font-black text-slate-400 group-hover:text-rose-600">
                <LogOut size={14} />
                SWITCH ACCOUNT
              </div>
              <ChevronRight size={12} className="text-slate-300 group-hover:text-rose-400" />
            </button>
          </div>

          {pendingCount > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl animate-pulse">
              <div className="flex items-center gap-2 text-amber-700">
                <CloudOff size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {pendingCount} Pending Sync
                </span>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-2">
          {visibleNav.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4 text-center">
            <span className="text-sm text-slate-400 font-medium">v1.3.0 Optimized</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        <div className="max-w-6xl mx-auto p-4 md:p-10">
          {children}
        </div>
      </main>

      {/* Mobile Nav Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-50 shadow-lg">
        {visibleNav.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              activeTab === item.id ? 'bg-indigo-50 text-indigo-600 px-4' : 'text-slate-400'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
