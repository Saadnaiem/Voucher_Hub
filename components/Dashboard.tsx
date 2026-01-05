
import React, { useMemo, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { VoucherEntry } from '../types';
import { 
  Ticket, 
  Users, 
  Trash2, 
  Building2,
  RefreshCw,
  Database,
  Calendar,
  UserCheck,
  TrendingUp,
  MapPin
} from 'lucide-react';

interface DashboardProps {
  entries: VoucherEntry[];
  pharmacyCount: number;
  onClearData?: () => void;
  onImportData?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ entries, pharmacyCount, onClearData, onImportData }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Advanced data aggregation
  const analytics = useMemo(() => {
    const dailyMap: Record<string, number> = {};
    const pharmacyMap: Record<string, number> = {};
    const pharmacistMap: Record<string, number> = {};
    const voucherMap: Record<string, number> = {};
    
    let newEnrollments = 0;

    // Sort entries by date to help with timeline processing
    const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sorted.forEach(e => {
      // Per Day
      dailyMap[e.date] = (dailyMap[e.date] || 0) + 1;
      
      // Per Pharmacy
      pharmacyMap[e.pharmacyName] = (pharmacyMap[e.pharmacyName] || 0) + 1;
      
      // Per Pharmacist
      pharmacistMap[e.pharmacistId] = (pharmacistMap[e.pharmacistId] || 0) + 1;
      
      // Per Voucher
      voucherMap[e.voucherName] = (voucherMap[e.voucherName] || 0) + 1;

      if (e.lakumStatus === 'New Enrollment') newEnrollments++;
    });

    const dailyData = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));
    const pharmacyData = Object.entries(pharmacyMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    const pharmacistData = Object.entries(pharmacistMap)
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count);
    const voucherData = Object.entries(voucherMap).map(([name, count]) => ({ name, count }));

    return {
      total: entries.length,
      newEnrollments,
      reportingCount: Object.keys(pharmacyMap).length,
      dailyData,
      pharmacyData,
      pharmacistData,
      voucherData
    };
  }, [entries]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onImportData?.();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">Redemption Hub</h2>
          <p className="text-slate-500 font-bold text-lg">
            Analytics overview for <span className="text-indigo-600">{pharmacyCount} assigned locations</span>.
          </p>
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

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Redeemed', value: analytics.total, icon: <Ticket />, color: 'text-indigo-600', bg: 'bg-indigo-50', sub: 'Successful Logs' },
          { label: 'Active Pharmacies', value: analytics.reportingCount, icon: <Building2 />, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Current Reporting' },
          { label: 'Agent Top Perf', value: analytics.pharmacistData[0]?.count || 0, icon: <UserCheck />, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: `ID: ${analytics.pharmacistData[0]?.id || 'N/A'}` },
          { label: 'Lakum Conversion', value: analytics.newEnrollments, icon: <Users />, color: 'text-blue-600', bg: 'bg-blue-50', sub: 'New Enrollments' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 group hover:scale-[1.02] transition-transform">
             <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
                {React.cloneElement(stat.icon as React.ReactElement, { size: 28 })}
             </div>
             <p className={`text-[10px] font-black uppercase tracking-[0.25em] mb-1 ${stat.color}`}>{stat.label}</p>
             <p className="text-4xl font-black text-slate-900 tracking-tight mb-2">{stat.value}</p>
             <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Daily Trends Chart */}
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-10">
          <Calendar className="text-indigo-600" size={24} />
          Redemption Timeline (Daily)
        </h3>
        <div className="h-80 w-full">
          {analytics.dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.dailyData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-300 font-bold italic">No timeline data available</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Pharmacy Performance */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-8">
            <MapPin className="text-amber-500" size={24} />
            Top Pharmacies
          </h3>
          <div className="space-y-4">
            {analytics.pharmacyData.slice(0, 5).map((p, i) => (
              <div key={p.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-black text-slate-400 border border-slate-100">
                    {i + 1}
                  </div>
                  <span className="font-bold text-slate-700">{p.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-slate-900">{p.count}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">vouchers</span>
                </div>
              </div>
            ))}
            {analytics.pharmacyData.length > 5 && (
              <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest pt-2">
                + {analytics.pharmacyData.length - 5} more locations
              </p>
            )}
            {analytics.pharmacyData.length === 0 && <p className="text-center text-slate-300 italic">No branch data</p>}
          </div>
        </div>

        {/* Pharmacist ID Breakdown */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-8">
            <TrendingUp className="text-emerald-500" size={24} />
            Leaderboard (Pharmacist ID)
          </h3>
          <div className="overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Reference</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Count</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {analytics.pharmacistData.slice(0, 6).map((ph) => (
                  <tr key={ph.id} className="group">
                    <td className="py-4 font-bold text-slate-700">#{ph.id}</td>
                    <td className="py-4 text-right font-black text-slate-900">{ph.count}</td>
                    <td className="py-4 text-right">
                      <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black">
                        {((ph.count / analytics.total) * 100).toFixed(1)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {analytics.pharmacistData.length === 0 && <div className="py-10 text-center text-slate-300 italic">No agent performance data</div>}
          </div>
        </div>
      </div>

      {/* Voucher Mix Chart */}
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-12">
          <div className="w-1.5 h-8 bg-indigo-600 rounded-full"></div>
          Distribution by Brand
        </h3>
        <div className="h-96 w-full">
          {analytics.voucherData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.voucherData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#cbd5e1', fontSize: 10, fontWeight: 800}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#cbd5e1', fontSize: 12, fontWeight: 800}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                />
                <Bar dataKey="count" radius={[16, 16, 0, 0]} barSize={64}>
                  {analytics.voucherData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-300 font-black uppercase tracking-widest">
              No brand data collected yet
            </div>
          )}
        </div>
      </div>

      {/* Cache Management */}
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
