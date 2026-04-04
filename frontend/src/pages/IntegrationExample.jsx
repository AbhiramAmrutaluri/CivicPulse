import React from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';
// import { kpis } from '../data/mockData'; // The Hackathon Fallback Object if needed

export const DemoApiComponent = () => {
    
    // Connect React component to actual FastAPI backend with a single line of code
    const { data: overview, loading, error, execute: refetch } = useApi(api.getAnalyticsOverview);

    // 1. Sleek "Loading" State
    if (loading) {
        return (
            <div className="p-8 w-full max-w-sm">
               <div className="h-24 bg-slate-100 rounded-2xl animate-pulse border border-slate-200"></div>
               <p className="text-center text-xs font-bold text-slate-400 mt-4 tracking-widest uppercase animate-pulse">Contacting Cluster Core...</p>
            </div>
        );
    }
    
    // 2. Iron-clad Error Handling Layout
    if (error) {
        return (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl max-w-md w-full shadow-inner m-4">
                 <div className="flex items-start">
                     <AlertCircle className="text-rose-500 mr-3 shrink-0" size={24} />
                     <div>
                         <h3 className="text-rose-800 font-black tracking-tight text-lg leading-none">FastAPI Connection Severed</h3>
                         <p className="text-sm text-rose-600 mt-2 font-medium">Failed to sync: {error}</p>
                         <p className="text-[10px] uppercase font-black tracking-widest text-rose-400 mt-4 border-t border-rose-100 pt-3">Is `uvicorn main:app` active?</p>
                         
                         <button onClick={refetch} className="mt-4 flex items-center px-4 py-2 bg-white text-rose-600 text-xs font-black uppercase tracking-widest rounded-lg border border-rose-200 shadow-sm hover:bg-rose-100 transition-colors">
                           <RefreshCw size={14} className="mr-2" /> Retry Ping
                         </button>
                     </div>
                 </div>
            </div>
        );
    }

    // 3. Perfect Data Render
    return (
        <div className="p-8 bg-white border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] rounded-3xl m-4 max-w-xl">
            <h2 className="text-2xl font-black mb-6 tracking-tight text-slate-800 border-b border-slate-100 pb-4">Live PostgreSQL Stats Sync</h2>
            
            <div className="grid grid-cols-2 gap-5">
               <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-100 hover:border-blue-200 transition-colors group cursor-pointer">
                  <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Total Aggregated Tickets</p>
                  <p className="text-4xl font-black text-slate-800 mt-2 group-hover:text-blue-600 transition-colors">
                    {/* Access Real Data safely via Optional Chaining */}
                    {overview?.total_complaints || 0}
                  </p>
               </div>
               
               <div className="bg-emerald-50 p-5 rounded-2xl border-2 border-emerald-100 hover:border-emerald-300 transition-colors group cursor-pointer">
                  <p className="text-[10px] font-black text-emerald-600/60 tracking-widest uppercase">Successfully Resolved</p>
                  <p className="text-4xl font-black text-emerald-700 mt-2 group-hover:text-emerald-500 transition-colors">
                    {overview?.resolved_tickets || 0}
                  </p>
               </div>
            </div>
        </div>
    );
};
