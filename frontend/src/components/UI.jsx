import React from 'react';
import { Activity, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-5 ${className}`}>
    {children}
  </div>
);

// Soft Premium Glassmorphism
export const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/70 backdrop-blur-md border border-white/50 shadow-xl rounded-xl p-5 ${className}`}>
    {children}
  </div>
);

export const KPICard = ({ title, value, trend, type }) => {
  // Rich Municipal Colors
  const styles = {
    neutral: "text-blue-600 bg-blue-50 border-blue-100",
    success: "text-emerald-600 bg-emerald-50 border-emerald-100",
    warning: "text-amber-600 bg-amber-50 border-amber-100",
    danger: "text-rose-600 bg-rose-50 border-rose-100"
  };
  
  const icons = {
    neutral: <Activity size={22} />,
    success: <CheckCircle2 size={22} />,
    warning: <AlertTriangle size={22} />,
    danger: <AlertCircle size={22} />
  };

  return (
    <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group cursor-pointer">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{title}</p>
          <h3 className="text-4xl font-extrabold text-slate-800 mt-2 tracking-tight group-hover:text-blue-600 transition-colors">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl border ${styles[type]}`}>
          {icons[type]}
        </div>
      </div>
      <div className="mt-5 flex items-center text-sm">
        <span className={trend.startsWith('+') && type !== 'danger' ? 'text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded' : 'text-slate-500 font-bold bg-slate-50 px-2 py-0.5 rounded'}>
          {trend}
        </span>
        <span className="text-slate-400 ml-2 font-medium">vs last week</span>
      </div>
    </Card>
  );
};

export const Badge = ({ children, variant = 'neutral', className="" }) => {
  const styles = {
    critical: "bg-rose-100 text-rose-700 border-rose-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-emerald-100 text-emerald-700 border-emerald-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${styles[variant.toLowerCase()] || styles.neutral} ${className}`}>
      {children}
    </span>
  );
};
