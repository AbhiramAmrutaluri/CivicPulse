import React, { useState } from 'react';
import { useCivicPulseData } from '../hooks/useCivicPulseData';
import LiveFeedTicker from '../components/LiveFeedTicker';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area
} from 'recharts';
import { Activity, ShieldAlert, CheckCircle, Navigation, TrendingUp, Wifi, WifiOff, Cpu, Radio } from 'lucide-react';

const CHART_COLORS = ['#4f8ef7', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#22d3ee'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(13,13,37,0.95)',
        border: '1px solid rgba(79,142,247,0.3)',
        borderRadius: '12px',
        padding: '10px 14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        <p style={{ color: '#94a3b8', fontSize: '11px', marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#4f8ef7', fontWeight: 700, fontSize: '14px' }}>
          {payload[0].value?.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { isConnected, connectionStatus, overviewEvents, metrics, eventCount } = useCivicPulseData();
  const [isSatelliteConnected, setIsSatelliteConnected] = useState(false);

  // Show connection status
  console.log(`📊 Dashboard Status: ${connectionStatus.toUpperCase()} | Events: ${eventCount} | Metrics: ${metrics.total}`);

  const kpis = [
    {
      title: 'Total Ingested',
      value: metrics.total,
      icon: Activity,
      cls: 'kpi-blue',
      iconColor: '#4f8ef7',
      glow: 'rgba(79,142,247,0.3)',
      trend: '+12 today',
    },
    {
      title: 'Critical Urgency',
      value: metrics.critical,
      icon: ShieldAlert,
      cls: 'kpi-rose',
      iconColor: '#f43f5e',
      glow: 'rgba(244,63,94,0.3)',
      trend: 'Needs attention',
    },
    {
      title: 'Resolved Today',
      value: metrics.resolvedToday,
      icon: CheckCircle,
      cls: 'kpi-green',
      iconColor: '#10b981',
      glow: 'rgba(16,185,129,0.3)',
      trend: '↑ 8% vs yesterday',
    },
    {
      title: 'Active Routes',
      value: metrics.activeDepartments,
      icon: Navigation,
      cls: 'kpi-violet',
      iconColor: '#8b5cf6',
      glow: 'rgba(139,92,246,0.3)',
      trend: '4 departments',
    },
  ];

  const trendData = [
    { time: '08:00', vol: Math.max(0, metrics.total - 160) },
    { time: '10:00', vol: Math.max(0, metrics.total - 120) },
    { time: '12:00', vol: Math.max(0, metrics.total - 80) },
    { time: '14:00', vol: Math.max(0, metrics.total - 30) },
    { time: '16:00', vol: Math.max(0, metrics.total - 10) },
    { time: 'Now',   vol: metrics.total },
  ];

  // Calculate category data for charts (only show non-zero categories)
  const categoryDataArray = Object.entries(metrics.categories)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div
      className="min-h-screen py-7 px-6 lg:px-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #080818 0%, #0d0d25 60%, #12122e 100%)' }}
    >
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-10 animate-aurora"
        style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)' }} />
      <div className="pointer-events-none absolute bottom-0 -left-40 w-[400px] h-[400px] rounded-full opacity-8"
        style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-7">

        {/* ── Header ─────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Cpu size={22} className="text-indigo-400" />
              <h1 className="text-2xl font-black tracking-tight text-white">
                AI Command Center
              </h1>
            </div>
            <p className="text-sm text-slate-500 max-w-lg">
              Real-time ingestion and intelligent routing of citizen grievances across municipal departments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Connection pill */}
            {!isSatelliteConnected && (
              <div
                className="flex items-center gap-2.5 px-4 py-2 rounded-full flex-shrink-0 mt-1"
                style={{
                  background: isConnected
                    ? 'rgba(16,185,129,0.08)'
                    : 'rgba(244,63,94,0.08)',
                  border: `1px solid ${isConnected ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
                }}
              >
                {isConnected ? (
                  <>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                    </span>
                    <Wifi size={14} className="text-emerald-400" />
                    <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">Live Pipeline</span>
                  </>
                ) : (
                  <>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                    </span>
                    <WifiOff size={14} className="text-rose-400" />
                    <span className="text-xs font-bold tracking-widest text-rose-400 uppercase">Connecting…</span>
                  </>
                )}
              </div>
            )}

            {/* Connect to Satellite Button */}
            <button
              onClick={() => setIsSatelliteConnected(true)}
              className="group flex items-center gap-2.5 px-4 py-2 rounded-full flex-shrink-0 mt-1 transition-all duration-300"
              style={{
                background: isSatelliteConnected ? 'rgba(79,142,247,0.1)' : 'rgba(255,255,255,0.05)',
                border: isSatelliteConnected ? '1px solid rgba(79,142,247,0.3)' : '1px solid rgba(255,255,255,0.1)',
                cursor: isSatelliteConnected ? 'default' : 'pointer'
              }}
            >
              <Radio size={14} className={`transition-all duration-300 ${isSatelliteConnected ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'}`} />
              <span className={`text-xs font-bold tracking-widest uppercase transition-all duration-300 ${isSatelliteConnected ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'}`}>
                {isSatelliteConnected ? 'Connected to Satellite & API' : 'Connect'}
              </span>
            </button>
          </div>
        </div>

        {/* ── KPI Cards ──────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.title}
              className={`relative overflow-hidden rounded-2xl p-5 card-hover cursor-default ${kpi.cls}`}
              style={{
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
              }}
            >
              {/* Icon */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: `rgba(255,255,255,0.06)`,
                    border: `1px solid ${kpi.glow.replace('0.3', '0.2')}`,
                    boxShadow: `0 0 16px ${kpi.glow}`,
                  }}
                >
                  <kpi.icon size={20} style={{ color: kpi.iconColor }} />
                </div>
                <TrendingUp size={14} className="text-slate-600 mt-1" />
              </div>

              <div>
                <dd className="text-3xl font-black tracking-tight text-white tabular-nums" style={{ textShadow: `0 0 30px ${kpi.glow}` }}>
                  {kpi.value.toLocaleString()}
                </dd>
                <dt className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">{kpi.title}</dt>
                <p className="mt-2 text-[11px] text-slate-600 font-medium">{kpi.trend}</p>
              </div>

              {/* Corner glow */}
              <div
                className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${kpi.glow} 0%, transparent 70%)` }}
              />
            </div>
          ))}
        </div>

        {/* ── Charts + Feed ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Charts column */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Bar Chart */}
            <div
              className="rounded-2xl p-6 card-hover"
              style={{
                background: 'rgba(13,13,37,0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(99,102,241,0.15)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-white">Incident Categories</h3>
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold text-indigo-300"
                  style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  Live
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryDataArray} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(99,102,241,0.1)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(79,142,247,0.05)' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1200}>
                      {categoryDataArray.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          style={{ filter: `drop-shadow(0 0 6px ${CHART_COLORS[index % CHART_COLORS.length]}50)` }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Area Chart */}
            <div
              className="rounded-2xl p-6 card-hover"
              style={{
                background: 'rgba(13,13,37,0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(99,102,241,0.15)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-white">Real-time Volume Trend</h3>
                <span className="text-xs font-semibold text-slate-500">Today</span>
              </div>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#4f8ef7" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#4f8ef7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(99,102,241,0.1)" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="vol"
                      stroke="#4f8ef7"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#volGrad)"
                      animationDuration={1500}
                      dot={{ fill: '#4f8ef7', r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#4f8ef7', boxShadow: '0 0 8px #4f8ef7' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Live Feed Sidebar */}
          <div
            className="lg:col-span-1 rounded-2xl p-5 flex flex-col min-h-0 h-[620px] overflow-hidden card-hover"
            style={{
              background: 'rgba(13,13,37,0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(99,102,241,0.15)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              minHeight: '520px',
            }}
          >
            <div className="flex items-center justify-between mb-5 pb-4"
              style={{ borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
              <h3 className="text-base font-bold text-white">Live Intel Feed</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">{overviewEvents.length} events</span>
                <div className="relative flex h-5 w-5 items-center justify-center rounded-full"
                  style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)' }}>
                  <span className="animate-ping absolute h-3 w-3 rounded-full opacity-50" style={{ background: '#f43f5e' }} />
                  <span className="relative h-2 w-2 rounded-full" style={{ background: '#f43f5e', boxShadow: '0 0 6px #f43f5e' }} />
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <LiveFeedTicker events={overviewEvents} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
