import React, { useState } from 'react';
import { useCivicPulseData } from '../hooks/useCivicPulseData';
import { Search, Filter, Sparkles, AlertCircle, Clock, CheckCircle2, Zap } from 'lucide-react';

const urgencyIcons = {
  Low: CheckCircle2,
  Medium: Clock,
  High: AlertCircle,
  Critical: Zap,
};

const urgencyColors = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#ef4444',
  Critical: '#c026d3',
};

const statusStyles = {
  Pending: 'bg-white/5 text-slate-300 border border-white/10',
  Open: 'bg-white/5 text-slate-300 border border-white/10',
  'In Progress': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  Resolved: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
};

const statusOptions = ['Pending', 'In Progress', 'Resolved'];

function normalizeStatus(status) {
  return status === 'Open' ? 'Pending' : status;
}

export default function Grievances() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusOverrides, setStatusOverrides] = useState({});
  const [openStatusMenuId, setOpenStatusMenuId] = useState(null);
  const { complaints } = useCivicPulseData();

  const filteredTickets = complaints.filter(t => 
    (t.text || t.original_text || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-6 animate-fade-in relative">
      {/* Background glow for the table area */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header section */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-indigo-500/15">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Filter className="text-blue-400" size={24} />
            Grievance Hub
          </h1>
          <p className="mt-1.5 text-sm text-slate-400 font-medium">
            Real-time citizen complaints analyzed and routed by the AI system.
          </p>
        </div>

        {/* Toolbar */}
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <div className="relative group w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full rounded-xl bg-white/5 border border-indigo-500/20 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
              placeholder="Search ID, title, dept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="inline-flex items-center rounded-xl bg-white/5 border border-indigo-500/20 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-sm">
            <Filter className="mr-2 h-4 w-4 text-indigo-400" />
            Filters
          </button>
        </div>
      </div>

      {/* Table container - Glassmorphism & custom scrollbars */}
      <div className="relative z-10 mt-6 flex-1 flex flex-col overflow-hidden glass rounded-2xl border border-indigo-500/15 shadow-xl">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-indigo-500/15 text-left text-sm">
            <thead className="bg-surface-1/90 sticky top-0 z-20 backdrop-blur-md">
              <tr>
                <th scope="col" className="py-4 pl-6 pr-3 font-semibold text-slate-300 tracking-wider text-xs uppercase w-2/5">
                  ID & Title
                </th>
                <th scope="col" className="px-3 py-4 font-semibold text-slate-300 tracking-wider text-xs uppercase">
                  Category & Dept
                </th>
                <th scope="col" className="px-3 py-4 font-semibold text-slate-300 tracking-wider text-xs uppercase text-center">
                  AI Urgency
                </th>
                <th scope="col" className="px-3 py-4 font-semibold text-slate-300 tracking-wider text-xs uppercase text-center">
                  Status
                </th>
                <th scope="col" className="px-3 py-4 font-semibold text-slate-300 tracking-wider text-xs uppercase text-right pr-6">
                  Date Logged
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-transparent">
              {filteredTickets.map((ticket, index) => {
                const uColor = urgencyColors[ticket.urgency] || urgencyColors.Medium;
                const UIcon = urgencyIcons[ticket.urgency] || Clock;
                const currentStatus = statusOverrides[ticket.id] || normalizeStatus(ticket.status);
                
                return (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    style={{ animation: `fadeIn 0.3s ease-out ${index * 0.03}s both` }}
                  >
                    <td className="py-4 pl-6 pr-3 max-w-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                          {ticket.id}
                        </span>
                        {ticket.ai_confidence > 0.9 && (
                          <span className="flex items-center gap-1 text-[10px] uppercase font-black tracking-widest text-[#8b5cf6] bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 py-0.5 px-1.5 rounded flex-shrink-0">
                            <Sparkles size={10} /> Auto-Routed
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-medium text-slate-200 line-clamp-2 leading-relaxed group-hover:text-blue-100 transition-colors">
                        {ticket.text || ticket.original_text}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-300 mb-1">{ticket.department}</div>
                      <div className="text-xs font-medium text-slate-500">{ticket.category}</div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-center">
                      <div 
                        className="inline-flex flex-col items-center justify-center p-1.5 px-3 rounded-lg border bg-surface-2"
                        style={{ borderColor: `${uColor}30`, boxShadow: `inset 0 0 10px ${uColor}10` }}
                      >
                        <UIcon size={16} style={{ color: uColor }} className={ticket.urgency === 'Critical' ? 'animate-pulse' : ''} />
                        <span className="mt-1 text-[10px] font-black uppercase tracking-widest" style={{ color: uColor }}>
                          {ticket.urgency}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-center relative">
                      <button
                        type="button"
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all hover:brightness-110 ${statusStyles[currentStatus] || statusStyles.Pending}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenStatusMenuId((prev) => (prev === ticket.id ? null : ticket.id));
                        }}
                      >
                        {currentStatus}
                      </button>
                      {openStatusMenuId === ticket.id && (
                        <div className="absolute right-2 top-12 z-30 w-36 rounded-lg border border-indigo-500/30 bg-surface-1/95 p-1 shadow-xl backdrop-blur-sm">
                          {statusOptions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              className={`w-full rounded-md px-2 py-1.5 text-left text-xs font-semibold transition-colors ${
                                option === currentStatus
                                  ? 'bg-indigo-500/20 text-indigo-300'
                                  : 'text-slate-300 hover:bg-white/10'
                              }`}
                              onClick={(event) => {
                                event.stopPropagation();
                                setStatusOverrides((prev) => ({ ...prev, [ticket.id]: option }));
                                setOpenStatusMenuId(null);
                              }}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right pr-6">
                      <div className="text-sm text-slate-400 font-mono">
                        {new Date(ticket.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-slate-600 font-mono mt-0.5">
                        {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-slate-500">
                    <Search className="mx-auto w-8 h-8 opacity-20 mb-3" />
                    <p className="text-sm font-medium">No grievances found matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
