
import React, { useMemo, useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';
import { VoucherEntry } from '../types';
import { SyncService } from '../syncService';
import { 
  Ticket, 
  Users, 
  Trash2, 
  Building2,
  RefreshCw,
  Database
} from 'lucide-react';

interface DashboardProps {
  entries: VoucherEntry[];
  pharmacyCount: number;
  onClearData?: () => void;
  onImportData?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ entries, pharmacyCount, onClearData, onImportData }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {
      total: entries.length,
      newEnrollments: 0,
      existingAccounts: 0,
    };

    const voucherCounts: Record<string, number> = {};
    const reportingPharmacies = new Set<string>();

    entries.forEach(e => {
      voucherCounts[e.voucherName] = (voucherCounts[e.voucherName] || 0) + 1;
      if (e.lakumStatus === 'New Enrollment') counts.newEnrollments++;
      else counts.existingAccounts++;
      reportingPharmacies.add(e.pharmacyName);
    });

    return { ...counts, voucherCounts, reportingCount: reportingPharmacies.size };
  }, [entries]);

  const chartData = useMemo(() => {
    return Object.entries(stats.voucherCounts).map(([name, value]) => ({
      name,
      value
    }));
  }, [stats]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onImportData?.();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">Issue Hub</h2>
          <p className="text-slate-500 font-bold text-lg">Monitoring redemptions across <span className="text-indigo-600">{pharmacyCount} active locations</span>.</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={handleManualRefresh}
            className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-black rounded-[1.5rem] hover:bg-black transition-all shadow-2xl shadow-slate-300"
          >
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin text-indigo-400' : ''} />
            REFRESH DATA
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Issued', value: stats.total, icon: <Ticket />, color: 'text-indigo-600', bg: 'bg-indigo-50', sub: 'Total Records' },
          { label: 'Active Sites', value: `${stats.reportingCount}`, icon: <Building2 />, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Locations Reporting' },
          { label: 'New Lakum', value: stats.newEnrollments, icon: <Users />, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'New Enrollments' },
          { label: 'Cloud Status', value: 'ONLINE', icon: <Database />, color: 'text-blue-600', bg: 'bg-blue-50', sub: 'Supabase Connected' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:scale-[1.02] transition-transform">
             <div className="relative z-10">
               <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
                  {React.cloneElement(stat.icon as React.ReactElement, { size: 28 })}
               </div>
               <p className={`text-[10px] font-black uppercase tracking-[0.25em] mb-1 ${stat.color}`}>{stat.label}</p>
               <p className="text-4xl font-black text-slate-900 tracking-tight mb-2">{stat.value}</p>
               <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">{stat.sub}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-12">
          <div className="w-1.5 h-8 bg-indigo-600 rounded-full"></div>
          Redemption Volume by Voucher
        </h3>
        <div className="h-96 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#cbd5e1', fontSize: 10, fontWeight: 800}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#cbd5e1', fontSize: 12, fontWeight: 800}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                />
                <Bar dataKey="value" radius={[16, 16, 0, 0]} barSize={64}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-300 font-black uppercase tracking-widest">
              No data collected yet
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center pt-20">
        <button 
          onClick={() => {
            if (confirm("Permanently wipe local issue data cache?")) {
              onClearData?.();
            }
          }}
          className="px-8 py-3 rounded-2xl border-2 border-slate-100 text-slate-300 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-all text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3"
        >
          <Trash2 size={16} />
          Reset Local Cache
        </button>
      </div>
    </div>
  );
};
