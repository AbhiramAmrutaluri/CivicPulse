import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, Map, Settings, BarChart2, Activity, Radio } from 'lucide-react';

const navigation = [
  { name: 'Overview',   href: '/',          icon: LayoutDashboard },
  { name: 'Grievances', href: '/grievances', icon: AlertCircle },
  { name: 'Analytics',  href: '/analytics',  icon: BarChart2 },
  { name: 'Pulse Map',  href: '/map',        icon: Map },
  { name: 'Settings',   href: '/settings',   icon: Settings },
];

const aiTools = [
  { name: 'DBSCAN Clusters',  icon: Radio,    badge: 'AI' },
  { name: 'NLP Confidence',   icon: Activity, badge: 'AI' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div
      className="flex h-full w-64 flex-col flex-shrink-0 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #080818 0%, #0d0d25 100%)',
        borderRight: '1px solid rgba(99,102,241,0.15)',
      }}
    >
      {/* Aurora background blob */}
      <div
        className="animate-aurora absolute -top-24 -left-12 w-72 h-72 rounded-full pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)' }}
      />

      {/* Logo */}
      <div className="relative z-10 flex h-16 items-center flex-shrink-0 px-5 gap-3" style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse-glow"
          style={{ background: 'linear-gradient(135deg, #0f172a, #1d4ed8)' }}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
            <path
              d="M12 3 5 6.5V12c0 4.2 2.7 7.9 7 9 4.3-1.1 7-4.8 7-9V6.5L12 3Z"
              stroke="#e0f2fe"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M7.5 14.5c1.4-1.8 2.8-2.7 4.5-2.7s3.1.9 4.5 2.7"
              stroke="#38bdf8"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M8.3 11.5h2.1l1.1-2.2 1.2 4 1-1.8h1.9"
              stroke="#f8fafc"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-base font-black tracking-tight text-white leading-tight">
            CivicPulse
          </h1>
          <p className="text-[10px] text-indigo-400/70 font-semibold uppercase tracking-widest">Command Suite</p>
        </div>
      </div>

      {/* Nav */}
      <div className="relative z-10 flex-1 overflow-y-auto py-5 px-3">
        <p className="px-3 mb-3 text-[10px] font-bold text-indigo-400/50 uppercase tracking-widest">Navigation</p>
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'nav-active text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon
                  size={18}
                  className={`flex-shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-indigo-400'}`}
                />
                {item.name}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_#4f8ef7]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* AI Tools Section */}
        <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(99,102,241,0.12)' }}>
          <p className="px-3 mb-3 text-[10px] font-bold text-indigo-400/50 uppercase tracking-widest">AI Engine</p>
          <nav className="space-y-1">
            {aiTools.map((item) => (
              <button
                key={item.name}
                className="w-full group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-all duration-200"
              >
                <item.icon size={18} className="flex-shrink-0 text-indigo-500/60 group-hover:text-indigo-400" />
                <span>{item.name}</span>
                <span className="ml-auto text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                  style={{
                    background: 'rgba(139,92,246,0.15)',
                    border: '1px solid rgba(139,92,246,0.3)',
                    color: '#a78bfa',
                  }}>
                  {item.badge}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 p-4" style={{ borderTop: '1px solid rgba(99,102,241,0.12)' }}>
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(79,142,247,0.3), rgba(139,92,246,0.3))' }}
          >
            <span className="text-xs font-bold text-blue-300">M</span>
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-200 truncate">Mayor's Office</p>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 shadow-[0_0_6px_#10b981]" />
        </div>
      </div>
    </div>
  );
}
