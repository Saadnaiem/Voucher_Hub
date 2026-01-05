
import React from 'react';
import { VoucherEntry, UserSession, UserRole } from '../types';
import { Trash2, Filter, FileDown, Clock } from 'lucide-react';

interface HistoryListProps {
  entries: VoucherEntry[];
  onDelete: (id: string) => void;
  user: UserSession;
}

export const HistoryList: React.FC<HistoryListProps> = ({ entries, onDelete, user }) => {
  const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

  const downloadCSV = () => {
    const headers = ["Date", "Time", "Voucher", "Pharmacy", "Pharmacist ID", "Phone Number", "Lakum Status", "Sync Status"];
    
    const rows = sortedEntries.map(entry => [
      entry.date,
      formatTime(entry.timestamp),
      `"${entry.voucherName.replace(/"/g, '""')}"`,
      `"${entry.pharmacyName.replace(/"/g, '""')}"`,
      entry.pharmacistId,
      entry.customerPhoneNumber,
      entry.lakumStatus,
      entry.isSynced ? "Synced" : "Local Only"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `voucher_redemption_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (sortedEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
        <div className="bg-slate-50 p-6 rounded-full mb-4">
          <Filter className="w-12 h-12 text-slate-300" />
        </div>
        <p className="text-slate-500 font-black uppercase tracking-widest text-center">
          No entries recorded yet.<br/>
          <span className="text-[10px] font-bold text-slate-400">Redemption history will appear here.</span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Redemption Log</h2>
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
            <Filter size={14} className="text-indigo-500" />
            {user.role === UserRole.ADMIN ? 'Full Network View' : 'Personal Agent Records'}
          </div>
        </div>

        <button 
          onClick={downloadCSV}
          className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
        >
          <FileDown size={20} />
          DOWNLOAD CSV REPORT
        </button>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Time</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Voucher</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pharmacy</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pharmacist</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5 whitespace-nowrap">
                   {entry.isSynced ? (
                     <div className="flex items-center gap-2 text-emerald-500" title="Synced to Cloud">
                        <CloudCheck size={18} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Cloud</span>
                     </div>
                   ) : (
                     <div className="flex items-center gap-2 text-amber-500 animate-pulse" title="Saved Locally Only">
                        <CloudOff size={18} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Local</span>
                     </div>
                   )}
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-500">
                  {entry.date}
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                   <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                      <Clock size={14} className="opacity-40" />
                      {formatTime(entry.timestamp)}
                   </div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                    entry.voucherName.includes('Huggies') ? 'bg-indigo-50 text-indigo-700' :
                    entry.voucherName.includes('Kotex') ? 'bg-emerald-50 text-emerald-700' :
                    entry.voucherName.includes('Blevit') ? 'bg-amber-50 text-amber-700' :
                    'bg-rose-50 text-rose-700'
                  }`}>
                    {entry.voucherName}
                  </span>
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm font-black text-slate-900">
                  {entry.pharmacyName}
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    ID: {entry.pharmacistId}
                  </span>
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                  <span className="text-sm font-black text-indigo-600">
                    {entry.customerPhoneNumber}
                  </span>
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-right">
                  <button 
                    onClick={() => {
                      if(confirm("Permanently delete this entry?")) onDelete(entry.id);
                    }}
                    className="p-3 text-slate-200 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CloudCheck = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
    <path d="m9 13 2 2 4-4"/>
  </svg>
);

const CloudOff = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m2 2 20 20"/>
    <path d="M5.782 5.782A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.307-.193"/>
    <path d="M22.5 15a4.5 4.5 0 0 0-3.69-4.425"/>
    <path d="M15.791 10.125a7 7 0 0 0-9.666-3.916"/>
  </svg>
);
