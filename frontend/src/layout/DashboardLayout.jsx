import React from 'react';
import { Activity, LayoutDashboard, Ticket, Map, BarChart3, Radio, Sparkles, Search, Bell, User } from 'lucide-react';

export const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Sidebar - Deep Slate Theme */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex shadow-2xl z-20">
        <div className="p-6 flex items-center space-x-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-950 to-blue-700 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path d="M12 3 5 6.5V12c0 4.2 2.7 7.9 7 9 4.3-1.1 7-4.8 7-9V6.5L12 3Z" stroke="#e0f2fe" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M7.5 14.5c1.4-1.8 2.8-2.7 4.5-2.7s3.1.9 4.5 2.7" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">CivicPulse</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5">
          <NavItem icon={<LayoutDashboard size={20}/>} label="Command Center" active />
          <NavItem icon={<Ticket size={20}/>} label="Incidents Queue" />
          <NavItem icon={<Map size={20}/>} label="Live Heatmap" />
          <NavItem icon={<BarChart3 size={20}/>} label="Analytics Dept" />
          <NavItem icon={<Radio size={20}/>} label="Edge Stream" />
          <div className="pt-6 mt-6 border-t border-slate-800">
            <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">AI Engine</p>
            <NavItem icon={<Sparkles size={20}/>} label="DBSCAN Clusters" isPremium />
            <NavItem icon={<Activity size={20}/>} label="NLP Confidence" isPremium />
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Topbar - Glassmorphism */}
        <header className="h-20 bg-white/70 backdrop-blur-lg border-b border-slate-200/60 flex items-center justify-between px-8 sticky top-0 z-50">
          <div className="relative w-96 group">
            <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search via NLP (e.g. 'Show me pothole issues')..." 
              className="w-full pl-11 pr-4 py-2.5 bg-slate-100/50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all font-medium text-slate-700 outline-none"
            />
          </div>
          <div className="flex items-center space-x-6">
            <button className="relative p-2.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-700 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
            </button>
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center border border-indigo-200 shadow-sm group-hover:shadow-md transition-all">
                <User size={20} className="text-indigo-600" />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-bold text-slate-800 leading-tight">Mayor's Office</p>
                <p className="text-xs font-semibold text-slate-500">Root Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Flowing Background */}
        <div className="p-8 overflow-y-auto h-[calc(100vh-5rem)] relative">
          {/* Subtle background blob for premium flavor */}
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="relative z-10 w-full h-full">
             {children}
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, isPremium }) => (
  <a href="#" className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all group ${
    active ? 'bg-blue-600/15 text-blue-400 shadow-sm' : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
  }`}>
    <div className="flex items-center space-x-3">
      {icon}
      <span className="font-semibold text-sm">{label}</span>
    </div>
    {isPremium && <span className="bg-indigo-500/20 shadow-sm border border-indigo-500/30 text-indigo-300 text-[9px] px-2 py-0.5 rounded-md uppercase font-extrabold tracking-wider">AI API</span>}
  </a>
);
