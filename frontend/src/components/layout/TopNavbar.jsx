import React, { useState } from 'react';
import { Bell, Search, UserCircle, AlertCircle, Info, ExternalLink } from 'lucide-react';

export default function TopNavbar() {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div
      className="sticky top-0 z-50 flex h-16 flex-shrink-0 items-center justify-between px-6"
      style={{
        background: 'rgba(8, 8, 24, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(99, 102, 241, 0.15)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Search */}
      <div className="relative w-80 group">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors"
        />
        <input
          type="text"
          placeholder="Search ticket IDs, keywords..."
          className="w-full pl-9 pr-4 py-2 text-sm font-medium text-slate-200 placeholder-slate-600 rounded-xl outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(99,102,241,0.15)',
          }}
          onFocus={e => {
            e.target.style.border = '1px solid rgba(79,142,247,0.5)';
            e.target.style.boxShadow = '0 0 0 3px rgba(79,142,247,0.12)';
          }}
          onBlur={e => {
            e.target.style.border = '1px solid rgba(99,102,241,0.15)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-400 hover:text-white transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.12)' }}
          >
            <Bell size={18} />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-ping"
              style={{ background: '#f43f5e', boxShadow: '0 0 6px #f43f5e' }}
            />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ background: '#f43f5e' }}
            />
          </button>
          
          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 rounded-xl overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-top-2"
                 style={{ 
                   background: 'rgba(13, 13, 37, 0.95)', 
                   border: '1px solid rgba(99, 102, 241, 0.3)',
                   backdropFilter: 'blur(16px)'
                 }}>
              <div className="p-3 border-b border-white/10 bg-white/5 flex justify-between items-center">
                <span className="text-white font-bold text-sm">Notifications</span>
                <span className="text-xs bg-rose-500/20 text-rose-400 px-2 rounded-full border border-rose-500/30">2 New</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer flex gap-3 transition-colors">
                  <div className="mt-0.5 text-rose-500 bg-rose-500/10 p-1.5 rounded-lg h-fit">
                    <AlertCircle size={14} />
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold mb-1">Critical Priority Ticket</p>
                    <p className="text-slate-400 text-[10px] leading-relaxed">Ticket #HS-491A re-escalated by multiple distinct user pings.</p>
                    <span className="text-slate-500 text-[9px] mt-1 block">Just now</span>
                  </div>
                </div>
                <div className="p-3 hover:bg-white/5 cursor-pointer flex gap-3 transition-colors">
                  <div className="mt-0.5 text-indigo-400 bg-indigo-500/10 p-1.5 rounded-lg h-fit">
                    <Info size={14} />
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold mb-1">Predictive Model Updated</p>
                    <p className="text-slate-400 text-[10px] leading-relaxed">System adjusted latency handling based on recent anomalies.</p>
                    <span className="text-slate-500 text-[9px] mt-1 block">2 hours ago</span>
                  </div>
                </div>
              </div>
              <div className="p-2 border-t border-white/10 bg-white/5 text-center">
                <button className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wider flex items-center justify-center gap-1 w-full p-1">
                  View All <ExternalLink size={10} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-indigo-500/15" />

        {/* Avatar */}
        <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all duration-200 hover:bg-white/5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(79,142,247,0.25), rgba(139,92,246,0.25))', border: '1px solid rgba(99,102,241,0.3)' }}
          >
            <UserCircle size={18} className="text-indigo-400" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-bold text-slate-200 leading-tight">Mayor's Office</p>
          </div>
        </button>
      </div>
    </div>
  );
}
