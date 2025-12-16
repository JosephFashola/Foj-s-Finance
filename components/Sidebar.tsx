import React from 'react';
import { LayoutDashboard, FileText, PieChart, MessageSquareText, Shield, Menu, X, History, LogOut, Lock } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  onLogout?: () => void;
  userPlan?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, toggleSidebar, onLogout, userPlan = 'SME' }) => {
  const isSME = userPlan.toLowerCase() === 'sme';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, locked: false },
    { id: 'ledger', label: 'Ledger Entries', icon: FileText, locked: false },
    { id: 'reports', label: 'Financial Reports', icon: PieChart, locked: false },
    { id: 'tax-ai', label: 'Tax Consultant AI', icon: MessageSquareText, locked: isSME },
    { id: 'audit', label: 'Audit Logs', icon: History, locked: isSME },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={toggleSidebar} />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
             <div className="bg-indigo-500 p-1.5 rounded-lg">
                <Shield size={24} className="text-white" />
             </div>
             <div>
                <h1 className="text-lg font-bold tracking-tight">FOJ's Finance</h1>
                <p className="text-[10px] text-slate-400 tracking-wider">ON STELLAR NETWORK</p>
             </div>
          </div>
          <button onClick={toggleSidebar} className="md:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 768) toggleSidebar();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors group ${
                  activeTab === item.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {item.locked && (
                  <Lock size={14} className="text-slate-600 group-hover:text-slate-400" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0">
          {onLogout && (
             <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors mb-4"
             >
                <LogOut size={20} />
                <span className="font-medium text-sm">Log Out</span>
             </button>
          )}

          <div className="bg-slate-800 rounded-xl p-4">
             <p className="text-xs text-slate-400 mb-2">Connected Node</p>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-mono text-green-400">stellar-testnet-public</span>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};