
import React, { useMemo, useState } from 'react';
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
  ArrowRight,
  ClipboardList,
  Store,
  User,
  PieChart,
  Target,
  BarChart3
} from 'lucide-react';

interface DashboardProps {
  entries: VoucherEntry[];
  pharmacyCount: number;
  voucherList: string[]; // Received from App.tsx
  onClearData?: () => void;
  onImportData?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ entries, pharmacyCount, voucherList, onClearData, onImportData }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Date format helper: YYYY-MM-DD -> DD-MM-YYYY
  const formatDateDMY = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}-${m}-${y}`;
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

  // Aggregated analytics
  const analytics = useMemo(() => {
    const pharmacyMap: Record<string, number> = {};
    const pharmacistMap: Record<string, number> = {};
    
    // CRITICAL: Initialize every voucher brand from the master list with 0
    const voucherMap: Record<string, number> = {};
    voucherList.forEach(v => {
      voucherMap[v] = 0;
    });

    const breakdownMap: Record<string, {
      pharmacy: string;
      date: string;
      pharmacistId: string;
      voucherName: string;
      count: number;
    }> = {};
    
    let newEnrollments = 0;

    filteredEntries.forEach(e => {
      // General KPIs
      pharmacyMap[e.pharmacyName] = (pharmacyMap[e.pharmacyName] || 0) + 1;
      pharmacistMap[e.pharmacistId] = (pharmacistMap[e.pharmacistId] || 0) + 1;
      
      // Update count (it's already initialized to 0 above)
      voucherMap[e.voucherName] = (voucherMap[e.voucherName] || 0) + 1;
      
      if (e.lakumStatus === 'New Enrollment') newEnrollments++;

      // Granular Breakdown Key: Pharmacy|Date|Pharmacist|Voucher
      const key = `${e.pharmacyName}|${e.date}|${e.pharmacistId}|${e.voucherName}`;
      if (!breakdownMap[key]) {
        breakdownMap[key] = {
          pharmacy: e.pharmacyName,
          date: e.date,
          pharmacistId: e.pharmacistId,
          voucherName: e.voucherName,
          count: 0
        };
      }
      breakdownMap[key].count += 1;
    });

    const pharmacyData = Object.entries(pharmacyMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const pharmacistData = Object.entries(pharmacistMap)
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count);

    const voucherPerformance = Object.entries(voucherMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const detailedBreakdown = Object.values(breakdownMap).sort((a, b) => {
      // Sort by date (desc) then pharmacy (asc)
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return a.pharmacy.localeCompare(b.pharmacy);
    });

    return {
      total: filteredEntries.length,
      newEnrollments,
      reportingCount: Object.keys(pharmacyMap).length,
      pharmacyData,
      pharmacistData,
      voucherPerformance,
      detailedBreakdown
    };
  }, [filteredEntries, voucherList]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onImportData?.();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const getVoucherColors = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('huggies')) return { text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: 'text-indigo-400' };
    if (n.includes('kotex')) return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'text-emerald-400' };
    if (n.includes('blevit')) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: 'text-amber-400' };
    if (n.includes('vitafos')) return { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: 'text-blue-400' };
    return { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: 'text-rose-400' };
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

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Redeemed in Period', value: analytics.total, icon: <Ticket />, color: 'text-indigo-600', bg: 'bg-indigo-50', sub: 'Successful Logs' },
          { label: 'Active in Period', value: analytics.reportingCount, icon: <Building2 />, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Locations Reporting' },
          { label: 'Top Performing Brand', value: analytics.voucherPerformance[0]?.count || 0, icon: <BarChart3 />, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: `${analytics.voucherPerformance[0]?.name || 'No Data'}` },
          { label: 'New Lakum Users', value: analytics.newEnrollments, icon: <Users />, color: 'text-blue-600', bg: 'bg-blue-50', sub: 'Period Enrollments' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 group hover:scale-[1.02] transition-transform">
             <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
                {React.cloneElement(stat.icon as React.ReactElement, { size: 28 })}
             </div>
             <p className={`text-[10px] font-black uppercase tracking-[0.25em] mb-1 ${stat.color}`}>{stat.label}</p>
             <p className="text-4xl font-black text-slate-900 tracking-tight mb-2">{stat.value}</p>
             <p className="text-xs font-bold text-slate-300 uppercase tracking-widest truncate">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* BRAND PERFORMANCE GRID - SHOWING ALL VOUCHERS */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
             <PieChart size={20} className="text-slate-400" />
             <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Brand Metrics (Full List)</h3>
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {voucherList.length} Total Brands Tracked
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {analytics.voucherPerformance.map((v) => {
            const styles = getVoucherColors(v.name);
            return (
              <div key={v.name} className={`${styles.bg} ${styles.border} border p-8 rounded-[2.5rem] shadow-sm transition-all hover:shadow-md group relative overflow-hidden`}>
                 <div className="flex justify-between items-start mb-6">
                    <div className={`${styles.icon} opacity-50`}>
                      <Target size={24} />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-4xl font-black ${styles.text}`}>{v.count}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Redemptions</span>
                    </div>
                 </div>
                 <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-2 truncate">{v.name}</h4>
                 <div className="w-full bg-white/50 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${styles.text.replace('text', 'bg')} opacity-60 transition-all duration-1000`} 
                      style={{ width: `${analytics.total === 0 ? 0 : (v.count / analytics.total) * 100}%` }}
                    />
                 </div>
                 <div className="flex justify-between mt-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Campaign Share</span>
                    <span className={`text-[9px] font-black ${styles.text}`}>
                      {analytics.total === 0 ? '0.0%' : ((v.count / analytics.total) * 100).toFixed(1)}%
                    </span>
                 </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Redemption Breakdown Table per Pharmacy */}
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ClipboardList className="text-indigo-600" size={24} />
            Network Redemption Log
          </h3>
          <div className="px-5 py-2 bg-indigo-50 rounded-full">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
              Detailed Aggregated Data
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Pharmacy</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Date</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Pharmacist ID</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Voucher Name</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 text-center">Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {analytics.detailedBreakdown.length > 0 ? (
                analytics.detailedBreakdown.map((row, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-lg text-slate-400 group-hover:text-indigo-500 transition-colors">
                          <Store size={14} />
                        </div>
                        <span className="font-bold text-slate-700">{row.pharmacy}</span>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <span className="text-sm font-bold text-slate-500">
                        {formatDateDMY(row.date)}
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-2">
                        <User size={12} className="text-slate-300" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          ID: {row.pharmacistId}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getVoucherColors(row.voucherName).bg} ${getVoucherColors(row.voucherName).text} ${getVoucherColors(row.voucherName).border}`}>
                        {row.voucherName}
                      </span>
                    </td>
                    <td className="py-5 px-4 text-center">
                      <span className="inline-block px-3 py-1 bg-slate-900 text-white rounded-lg text-sm font-black min-w-[32px]">
                        {row.count}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-300">
                      <Calendar size={48} className="opacity-20" />
                      <p className="font-black uppercase tracking-widest">
                        No redemptions found for<br/>selected period
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agent Performance Summary */}
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
