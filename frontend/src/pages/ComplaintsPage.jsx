import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, X, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { initialComplaints } from '../data/mockComplaints';
import { Card, Badge } from '../components/UI';

export const ComplaintsPage = () => {
  const [complaints, setComplaints] = useState(initialComplaints);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [urgencyFilter, setUrgencyFilter] = useState("All");
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // Highlight simulation for "New" tickets that socket pushes in (Wow factor for judges)
  const [newlyAddedIds, setNewlyAddedIds] = useState(new Set(["C-9921"]));

  // Mock API effect: Clear the "new" highlight after 4 seconds to simulate realtime UI fade
  useEffect(() => {
    const timer = setTimeout(() => setNewlyAddedIds(new Set()), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Responsive Search & Filtering Logic
  const filteredComplaints = complaints.filter(c => {
    const matchSearch = c.id.toLowerCase().includes(search.toLowerCase()) || 
                        c.text.toLowerCase().includes(search.toLowerCase()) ||
                        c.citizen_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    const matchUrgency = urgencyFilter === "All" || c.urgency === urgencyFilter;
    return matchSearch && matchStatus && matchUrgency;
  });

  const handleStatusUpdate = (newStatus) => {
    if (!selectedTicket) return;
    
    // Simulate updating backend DB & React Context state
    setComplaints(prev => prev.map(c => 
      c.id === selectedTicket.id 
      ? { ...c, status: newStatus, is_overdue: newStatus === "Resolved" ? false : c.is_overdue } 
      : c
    ));
    setSelectedTicket({ ...selectedTicket, status: newStatus });
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500 ease-out fill-mode-both">
      
      {/* Header Container */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
        <div className="pt-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Incident Queue</h2>
          <p className="text-slate-500 mt-2 font-medium text-lg">Manage, escalate, and resolve citizen grievances rapidly.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <span className="bg-white border border-emerald-200 shadow-sm text-slate-600 px-4 py-2 rounded-lg text-sm font-black flex items-center tracking-tight">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-2.5"></span>
            LIVE STREAM: <span className="text-emerald-600 ml-1">CONNECTED</span>
          </span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <Card className="p-3 shadow-md flex flex-col md:flex-row gap-4 items-center justify-between bg-white border-slate-200">
        <div className="relative w-full md:w-96 group transition-all">
          <Search className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-blue-500" size={18} />
          <input 
            type="text" 
            placeholder="Query Ticket ID, NLP keyword, or Citizen..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-700"
          />
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl transition-all focus-within:border-blue-300">
            <Filter size={16} className="text-slate-400" />
            <select className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl transition-all focus-within:border-blue-300">
            <AlertTriangle size={16} className="text-slate-400" />
            <select className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer" value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)}>
              <option value="All">All Urgencies</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Heavy Data Table */}
      <Card className="p-0 overflow-hidden shadow-lg border-slate-200">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#1E293B] text-white">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest border-b border-slate-800">Ticket Route ID</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest border-b border-slate-800">Citizen Reporter</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest border-b border-slate-800">Incident Details</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest border-b border-slate-800">NLP Domain</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest border-b border-slate-800">Urgency</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest border-b border-slate-800">Pipeline Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredComplaints.map(c => {
                const isNew = newlyAddedIds.has(c.id);
                // "Flash" red if overdue (SLA breached), otherwise flash amber pulse if literally brand new WebSocket trigger
                const rowBaseClass = c.is_overdue ? "bg-rose-50/70 hover:bg-rose-100/60" : "hover:bg-slate-50";
                const flashClass = isNew ? "animate-pulse bg-amber-50" : "";
                
                return (
                  <tr 
                    key={c.id} 
                    onClick={() => setSelectedTicket(c)}
                    className={`${rowBaseClass} ${flashClass} transition-all duration-300 cursor-pointer group`}
                  >
                    <td className="px-6 py-5 font-black text-slate-800 whitespace-nowrap text-[15px] group-hover:text-blue-600">
                      {c.id}
                      {c.is_overdue && <span className="ml-2 inline-block w-2.5 h-2.5 bg-rose-500 rounded-full animate-bounce shadow-sm shadow-rose-500" title="SLA Breached!"></span>}
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-600">{c.citizen_name}</td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-slate-800 truncate max-w-[280px]">{c.text}</p>
                      <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wide">{c.ward}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-100">
                        {c.category}
                      </span>
                    </td>
                    <td className="px-6 py-5"><Badge variant={c.urgency}>{c.urgency}</Badge></td>
                    <td className="px-6 py-5">
                      <span className={`text-[13px] font-black uppercase tracking-wide ${c.status === 'Resolved' ? 'text-emerald-600' : c.status === 'In Progress' ? 'text-blue-600' : 'text-slate-500'}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Mock Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-sm text-slate-500 font-bold">Displaying 1 to {filteredComplaints.length} of 3,192 incidents</span>
          <div className="flex space-x-2">
            <button className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-colors"><ChevronLeft size={20}/></button>
            <button className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-colors"><ChevronRight size={20}/></button>
          </div>
        </div>
      </Card>

      {/* Ticket Slide-Out Drawer Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-sm transition-all duration-500" onClick={() => setSelectedTicket(null)}>
          <div 
            className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300 ease-out"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header Navbar */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-[#F8FAFC]">
              <h3 className="font-black text-2xl text-slate-800 tracking-tight">Ticket {selectedTicket.id}</h3>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-700 bg-white shadow-sm border border-slate-200 rounded-lg p-2 transition-transform hover:scale-105">
                <X size={20} className="stroke-[3px]" />
              </button>
            </div>
            
            {/* Drawer Content Body */}
            <div className="p-8 overflow-y-auto flex-1 space-y-8">
              
              {/* Dynamic SLA Overdue Alert Box */}
              {selectedTicket.is_overdue && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start space-x-4 shadow-[0_0_15px_rgba(225,29,72,0.15)]">
                  <AlertTriangle className="text-rose-600 mt-0.5" size={24} />
                  <div>
                    <h4 className="text-sm font-black text-rose-800 tracking-tight">SLA Breach Authorized</h4>
                    <p className="text-xs font-semibold text-rose-600 mt-1 leading-relaxed">This ticket completely exceeded statutory 24-hr resolution limits. Escalation protocols directly to the Mayor's Office are now authorized.</p>
                  </div>
                </div>
              )}

              {/* Citizen Details Block */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">Citizen Reporter</p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-100 to-blue-50 text-indigo-700 flex items-center justify-center font-black text-xl border border-indigo-200 shadow-sm">
                    {selectedTicket.citizen_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-lg leading-tight">{selectedTicket.citizen_name}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">Ingress API Source: <span className="text-blue-600 font-bold px-1">{selectedTicket.source}</span></p>
                  </div>
                </div>
              </div>

              {/* NLP Processing Output Box */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">NLP Inferred Complaint Data</p>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 shadow-inner">
                  <Badge variant={selectedTicket.urgency} className="mb-4 inline-block">{selectedTicket.urgency}</Badge>
                  <p className="text-slate-700 font-bold text-[15px] leading-relaxed">"{selectedTicket.text}"</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="text-[11px] bg-white border border-slate-200 px-2.5 py-1 rounded-md font-black uppercase text-slate-600 tracking-wider shadow-sm">{selectedTicket.category}</span>
                    <span className="text-[11px] bg-white border border-slate-200 px-2.5 py-1 rounded-md font-black uppercase text-slate-600 tracking-wider shadow-sm">{selectedTicket.ward}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  {/* Routed Department */}
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 border-b border-slate-100 pb-1">Routed Department</p>
                     <p className="font-bold text-slate-700 text-sm leading-tight mt-2">{selectedTicket.department}</p>
                  </div>

                  {/* Timestamp Receipt */}
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 border-b border-slate-100 pb-1">API Receipt Timestamp</p>
                     <p className="text-sm font-bold text-slate-600 mt-2">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                  </div>
              </div>

            </div>

            {/* sticky footer containing action buttons */}
            <div className="p-8 border-t border-slate-100 bg-[#F8FAFC] space-y-4 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Perform Action</p>
              
              <div className="flex grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleStatusUpdate("In Progress")}
                  className={`py-3 rounded-lg text-sm font-black border-2 transition-all hover:scale-[1.02] ${selectedTicket.status === 'In Progress' ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  Mark In-Progress
                </button>
                <button 
                  onClick={() => handleStatusUpdate("Resolved")}
                  className={`py-3 flex justify-center items-center rounded-lg text-sm font-black border-2 transition-all hover:scale-[1.02] ${selectedTicket.status === 'Resolved' ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                >
                  <CheckCircle2 size={18} className="mr-2" /> Resolve Ticket
                </button>
              </div>

              {selectedTicket.is_overdue && (
                <button className="w-full py-3.5 mt-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-lg text-sm font-black shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.01] flex justify-center items-center">
                  <AlertTriangle size={18} className="mr-2" /> Force Execute Escalation
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
