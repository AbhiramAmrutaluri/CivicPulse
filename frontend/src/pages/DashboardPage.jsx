import React from 'react';
import { useCivicPulseData } from '../hooks/useCivicPulseData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Sparkles, AlertTriangle, ArrowUpRight, Activity } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const DashboardPage = () => {
  const { analytics } = useCivicPulseData();
  const { dailyTrends, categoryData, recentFeed, hotspots } = analytics;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-[0.98] duration-500 ease-out fill-mode-both p-6">
      
      {/* Header & AI Summary Section */}
      <div className="flex flex-col xl:flex-row gap-6 justify-between items-start relative z-10">
        <div className="pt-2">
          <h2 className="text-4xl font-black text-white tracking-tight">Analytics Command Center</h2>
          <p className="text-slate-400 mt-2 font-medium text-lg">Real-time civic intelligence and NLP-powered routing.</p>
        </div>
        
        {/* Premium AI Glassmorphism Card */}
        <div className="w-full xl:max-w-lg glass bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-2xl p-6 shadow-2xl transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none" />
          <div className="flex items-start space-x-4 relative z-10">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.5)] mt-1 animate-pulse-glow">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-indigo-400 flex items-center tracking-wide uppercase">
                AI Executive Summary
                <span className="ml-3 flex items-center space-x-1 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                   <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">LIVE</span>
                </span>
              </h4>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed font-medium">
                Detected a <span className="font-bold text-white bg-indigo-500/20 px-1 rounded border border-indigo-500/30">45% anomaly spike</span> in Contaminated Water reports in Ward 4 over the last 2 hours. Engine escalated 15 identical high-urgency tasks directly to the Water Board SLA queue.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Trend Area Chart */}
        <div className="col-span-2 glass shadow-xl border border-indigo-500/15 rounded-2xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-extrabold text-white text-lg tracking-tight">7-Day Incident Volume</h3>
              <p className="text-indigo-400/70 text-xs font-semibold uppercase mt-1">Aggregated Timeline</p>
            </div>
            <select className="text-sm font-semibold border-indigo-500/20 bg-white/5 text-slate-300 rounded-lg py-2 px-4 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 transition-shadow">
              <option className="bg-surface-1">All Wards (Citywide)</option>
              <option className="bg-surface-1">Ward 4 - Secunderabad</option>
              <option className="bg-surface-1">Ward 10 - Charminar</option>
            </select>
          </div>
          <div className="h-72 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends}>
                <defs>
                  <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} dx={-10} />
                <Tooltip 
                  contentStyle={{backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)', color: '#fff'}}
                  itemStyle={{ color: '#fff' }}
                  cursor={{stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4'}}
                />
                <Area type="monotone" dataKey="complaints" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorComplaints)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Pie Chart */}
        <div className="glass flex flex-col shadow-xl border border-indigo-500/15 rounded-2xl p-6">
          <h3 className="font-extrabold text-white text-lg tracking-tight mb-2">NLP Domain Taxonomy</h3>
          <p className="text-indigo-400/70 text-xs font-semibold uppercase mb-4">Distribution</p>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.2)', color: '#fff'}} itemStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-4 pt-4 border-t border-white/10">
            {categoryData.slice(0,4).map((cat, i) => (
              <div key={i} className="flex items-center text-sm font-semibold text-slate-300">
                <span className="w-3.5 h-3.5 rounded bg-blue-500 mr-2.5 shadow-[0_0_8px_rgba(59,130,246,0.5)]" style={{backgroundColor: COLORS[i]}}></span>
                {cat.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row Lists */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 relative z-10">
        
        {/* Hotspots Cluster Table */}
        <div className="glass shadow-xl border border-indigo-500/15 rounded-2xl overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-6 pb-4">
            <div>
              <h3 className="font-extrabold text-white text-lg flex items-center tracking-tight">
                Active Duplication Clusters 
                <span className="ml-3 bg-indigo-500/20 text-indigo-300 text-[10px] px-2.5 py-1 rounded-md font-black uppercase tracking-wider shadow-sm border border-indigo-500/30">PySpark DBSCAN</span>
              </h3>
              <p className="text-indigo-400/70 text-xs font-semibold uppercase mt-1">Algorithmically Linked Incidents</p>
            </div>
            <button className="text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center space-x-1">
              <span>Map View</span> 
              <ArrowUpRight size={16}/>
            </button>
          </div>
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="min-w-full text-sm text-left border-collapse">
              <thead className="bg-white/5 border-y border-white/10">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Ward Location</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Representative Issue</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-xs text-right">Reports</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {hotspots.map((spot, i) => (
                  <tr key={i} className="hover:bg-white/[0.03] transition-colors cursor-pointer group">
                    <td className="px-6 py-4 font-bold text-slate-300 group-hover:text-blue-400 transition-colors">{spot.ward}</td>
                    <td className="px-6 py-4 font-medium text-slate-400 truncate max-w-[200px]">{spot.issue}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center justify-end space-x-2">
                        <span className="font-extrabold text-lg text-white">{spot.count}</span>
                        {spot.severity === 'High' && <AlertTriangle size={18} className="text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Ticker */}
        <div className="glass shadow-xl border border-indigo-500/15 rounded-2xl p-6 flex flex-col max-h-[620px] overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-extrabold text-white text-lg flex items-center tracking-tight">
                Real-Time Edge Feed
              </h3>
              <p className="text-indigo-400/70 text-xs font-semibold uppercase mt-1">Streaming via Kafka WebSockets</p>
            </div>
            <div className="flex items-center space-x-2 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <Activity size={14} className="text-emerald-400 animate-pulse"/>
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Sync Active</span>
            </div>
          </div>
          
          <div className="flex-1 min-h-0 rounded-xl border border-white/10 bg-white/5 p-3 overflow-hidden">
            <div className="h-full min-h-0 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {recentFeed.map((item, i) => {
              const uColor = item.urgency === 'Critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 
                             item.urgency === 'High' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 
                             item.urgency === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 
                             'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

              return (
              <div key={i} className="flex items-start justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-500/30 transition-all cursor-pointer group">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-black text-sm text-white tracking-tight">{item.id} <span className="text-slate-500 font-medium ml-1">• {item.citizen}</span></span>
                    <span className="text-xs font-bold text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded group-hover:bg-blue-500/20 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors">{item.time}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-400 truncate pr-4">{item.issue}</p>
                </div>
                <div className="ml-4 mt-1 flex-shrink-0">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${uColor}`}>
                    {item.urgency}
                  </span>
                </div>
              </div>
            )})}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
