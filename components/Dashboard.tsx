
import React, { useMemo, useState } from 'react';
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
import { 
  Ticket, 
  Users, 
  Building2,
  RefreshCw,
  Calendar,
  UserCheck,
  TrendingUp,
  MapPin,
  Filter,
  ArrowRight
} from 'lucide-react';

interface DashboardProps {
  entries: VoucherEntry[];
  pharmacyCount: number;
  onClearData?: () => void;
  onImportData?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ entries, pharmacyCount, onClearData, onImportData }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Date format helper: YYYY-MM-DD -> DD-MM-YY
  const formatDateDMY = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}-${m}-${y.slice(-2)}`;
  };

  // Date filter state - default to last 30 days
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const [dateRange, setDateRange] = useState({
    start: thirtyDaysAgo,
    end: today
  });

  // Filtered entries based on selected date range
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      return e.date >= dateRange.start && e.date <= dateRange.end;
    });
  }, [entries, dateRange]);

  // Aggregated analytics for the filtered period
  const analytics = useMemo(() => {
    const pharmacyMap: Record<string, number> = {};
    const pharmacistMap: Record<string, number> = {};
    
    let newEnrollments = 0;

    filteredEntries.forEach(e => {
      pharmacyMap[e.pharmacyName] = (pharmacyMap[e.pharmacyName] || 0) + 1;
      pharmacistMap[e.pharmacistId] = (pharmacistMap[e.pharmacistId] || 0) + 1;
      if (e.lakumStatus === 'New Enrollment') newEnrollments++;
    });

    const pharmacyData = Object.entries(pharmacyMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const pharmacistData = Object.entries(pharmacistMap)
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total: filteredEntries.length,
      newEnrollments,
      reportingCount: Object.keys(pharmacyMap).length,
      pharmacyData,
      pharmacistData
    };
  }, [filteredEntries]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#0ea5e9', '#f43f5e'];

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onImportData?.();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      
      {/* Header & Date Filter Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">Redemption Hub</h2>
          <p className="text-slate-500 font-bold text-lg">
            Network analytics for <span className="text-indigo-600">{pharmacyCount} locations</span>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-3 px-4 py-2 border-r border-slate-100 hidden sm:flex">
             <Filter size={18} className="text-slate-400" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period Filter</span>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="date" 
              name="start"
              value={dateRange.start}
              onChange={handleDateChange}
              className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
            />
            <ArrowRight size={16} className="text-slate-300" />
            <input 
              type="date" 
              name="end"
              value={dateRange.end}
              onChange={handleDateChange}
              className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <button 
            onClick={handleManualRefresh}
            className="sm:ml-4 p-3 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all flex items-center justify-center"
          >
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin text-indigo-400' : ''} />
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (Now Filtered) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Redeemed in Period', value: analytics.total, icon: <Ticket />, color: 'text-indigo-600', bg: 'bg-indigo-50', sub: 'Successful Logs' },
          { label: 'Active in Period', value: analytics.reportingCount, icon: <Building2 />, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Locations Reporting' },
          { label: 'Top Pharmacist', value: analytics.pharmacistData[0]?.count || 0, icon: <UserCheck />, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: `ID: ${analytics.pharmacistData[0]?.id || 'N/A'}` },
          { label: 'New Lakum Users', value: analytics.newEnrollments, icon: <Users />, color: 'text-blue-600', bg: 'bg-blue-50', sub: 'Period Enrollments' }
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

      {/* Main Pharmacy Performance Graph */}
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <MapPin className="text-indigo-600" size={24} />
            Total Redemptions per Pharmacy
          </h3>
          <div className="px-5 py-2 bg-indigo-50 rounded-full">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
              Data from {formatDateDMY(dateRange.start)} to {formatDateDMY(dateRange.end)}
            </span>
          </div>
        </div>
        
        <div className="h-[500px] w-full">
          {analytics.pharmacyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={analytics.pharmacyData} 
                layout="vertical" 
                margin={{ left: 40, right: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  width={150}
                  tick={{fill: '#64748b', fontSize: 11, fontWeight: 700}} 
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                />
                <Bar dataKey="count" radius={[0, 12, 12, 0]} barSize={32}>
                  {analytics.pharmacyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
              <Calendar size={48} className="opacity-20" />
              <p className="font-black uppercase tracking-widest text-center">
                No redemptions found for<br/>selected period
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard Table (Filtered) */}
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <TrendingUp className="text-emerald-500" size={24} />
            Agent Performance (Pharmacist ID)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pharmacist ID</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Redemptions</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Period Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {analytics.pharmacistData.slice(0, 10).map((ph, idx) => (
                <tr key={ph.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                        {idx + 1}
                      </div>
                      <span className="font-bold text-slate-700">#{ph.id}</span>
                    </div>
                  </td>
                  <td className="py-5 text-right font-black text-slate-900 text-lg">{ph.count}</td>
                  <td className="py-5 text-right">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black">
                      {((ph.count / (analytics.total || 1)) * 100).toFixed(1)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {analytics.pharmacistData.length === 0 && (
            <div className="py-20 text-center text-slate-300 italic font-medium uppercase tracking-widest">
              Zero records in this period
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
