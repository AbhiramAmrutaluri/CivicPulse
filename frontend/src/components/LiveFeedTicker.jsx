import React from 'react';
import { AlertCircle, FileWarning, Zap, TrendingUp, Clock, CheckCircle2, Search } from 'lucide-react';

const URGENCY_CONFIG = {
  Low: {
    icon: CheckCircle2,
    color: '#10b981',
    glow: 'rgba(16,185,129,0.25)',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.2)',
    label: 'LOW',
  },
  Medium: {
    icon: Clock,
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.25)',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    label: 'MED',
  },
  High: {
    icon: AlertCircle,
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.25)',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.2)',
    label: 'HIGH',
  },
  Critical: {
    icon: Zap,
    color: '#c026d3',
    glow: 'rgba(192,38,211,0.35)',
    bg: 'rgba(192,38,211,0.1)',
    border: 'rgba(192,38,211,0.3)',
    label: '!!!',
  },
};

const CATEGORY_COLORS = {
  Sanitation: '#4f8ef7',
  Roads: '#10b981',
  Water: '#22d3ee',
  Electricity: '#f59e0b',
  Drainage: '#8b5cf6',
  Other: '#64748b',
};

export default function LiveFeedTicker({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-600">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}
        >
          <Search size={22} className="animate-pulse text-indigo-400/50" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-500">Awaiting live data</p>
          <p className="text-xs text-slate-600 mt-1">Waiting for satellite &amp; citizen feed…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 h-full min-h-0 overflow-y-auto pr-1 custom-scrollbar">
      {events.map((ev, index) => {
        const cfg = URGENCY_CONFIG[ev.urgency] || URGENCY_CONFIG.Medium;
        const Icon = cfg.icon;
        const catColor = CATEGORY_COLORS[ev.category] || '#64748b';
        const timeStr = ev.created_at
          ? new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          : '--:--';

        return (
          <div
            key={`${ev.id}-${index}`}
            className="animate-slide-down group relative flex items-start gap-3 rounded-xl p-3.5 cursor-default transition-all duration-200"
            style={{
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              boxShadow: index === 0 ? `0 0 16px ${cfg.glow}` : 'none',
              animationDelay: `${index * 0.04}s`,
            }}
          >
            {/* Urgency icon */}
            <div
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
              style={{
                background: `rgba(255,255,255,0.05)`,
                border: `1px solid ${cfg.border}`,
                boxShadow: `0 0 10px ${cfg.glow}`,
              }}
            >
              <Icon size={15} style={{ color: cfg.color }} className={ev.urgency === 'Critical' ? 'animate-pulse' : ''} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Top row */}
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                  style={{ color: catColor, background: `${catColor}18`, border: `1px solid ${catColor}35` }}
                >
                  {ev.category || 'Unknown'}
                </span>
                <span
                  className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                  style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
                >
                  {cfg.label}
                </span>
                <span className="ml-auto text-[9px] font-mono text-slate-600 flex-shrink-0">{timeStr}</span>
              </div>

              {/* Text */}
              <p className="text-xs font-medium text-slate-300 leading-relaxed line-clamp-2">
                {ev.translated_text || ev.original_text}
              </p>

              {/* Meta */}
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-[10px] text-slate-600 font-mono">#{ev.id?.slice(0, 6)}</span>
                {ev.ward && (
                  <span className="text-[10px] text-slate-600 truncate max-w-[100px]">📍 {ev.ward}</span>
                )}
                {ev.department && (
                  <span className="ml-auto text-[10px] text-slate-600 truncate max-w-[80px]">{ev.department}</span>
                )}
              </div>
            </div>

            {/* Newest indicator */}
            {index === 0 && (
              <div
                className="absolute top-2 right-2 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(79,142,247,0.15)', color: '#4f8ef7', border: '1px solid rgba(79,142,247,0.3)' }}
              >
                NEW
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
