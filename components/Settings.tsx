
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Store, 
  CloudCheck,
  RefreshCw
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '../supabaseClient';

interface SettingsProps {
  voucherList: string[];
  onUpdateVouchers: (newList: string[]) => void;
  pharmacyList: string[];
  onUpdatePharmacies: (newList: string[]) => void;
  onRefreshAll: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  voucherList, 
  onUpdateVouchers,
  pharmacyList,
  onUpdatePharmacies,
  onRefreshAll
}) => {
  const [newVoucher, setNewVoucher] = useState('');
  const [newPharmacy, setNewPharmacy] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { error } = await client.from('app_config').select('key').limit(1);
          setIsConnected(!error);
        } catch (e) {
          setIsConnected(false);
        }
      }
    };
    checkConnection();
  }, []);

  const handleAddVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (newVoucher.trim() && !voucherList.includes(newVoucher.trim())) {
      onUpdateVouchers([...voucherList, newVoucher.trim()]);
      setNewVoucher('');
    }
  };

  const handleAddPharmacy = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPharmacy.trim() && !pharmacyList.includes(newPharmacy.trim())) {
      onUpdatePharmacies([...pharmacyList, newPharmacy.trim()]);
      setNewPharmacy('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-[800] text-slate-900 tracking-tighter">Master Setup</h2>
          <div className="flex items-center gap-2">
            <p className="text-slate-500 font-bold">Manage brands and distribution locations.</p>
            {isConnected ? (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                <CloudCheck size={12} />
                Live Sync Active
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                Offline Mode
              </span>
            )}
          </div>
        </div>

        <button 
          onClick={onRefreshAll}
          className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200"
        >
          <RefreshCw size={20} />
          FORCE GLOBAL SYNC
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl p-10 flex flex-col h-[600px]">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                <Ticket size={24} />
             </div>
             <div>
               <h3 className="text-xl font-black text-slate-800 tracking-tight">Voucher Brands</h3>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{voucherList.length} Items</p>
             </div>
          </div>
          <form onSubmit={handleAddVoucher} className="flex gap-3 mb-8">
            <input
              type="text"
              placeholder="New brand..."
              value={newVoucher}
              onChange={(e) => setNewVoucher(e.target.value)}
              className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-[1.2rem] px-6 py-4 focus:border-indigo-600 outline-none font-bold"
            />
            <button type="submit" className="bg-indigo-600 text-white p-4 rounded-[1.2rem] hover:bg-indigo-700 transition-all">
              <Plus size={24} />
            </button>
          </form>
          <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
            {voucherList.map(v => (
              <div key={v} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                <span className="font-bold text-slate-700">{v}</span>
                <button onClick={() => onUpdateVouchers(voucherList.filter(x => x !== v))} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl p-10 flex flex-col h-[600px]">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                <Store size={24} />
             </div>
             <div>
               <h3 className="text-xl font-black text-slate-800 tracking-tight">Pharmacy Network</h3>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{pharmacyList.length} Sites</p>
             </div>
          </div>
          <form onSubmit={handleAddPharmacy} className="flex gap-3 mb-8">
            <input
              type="text"
              placeholder="New branch..."
              value={newPharmacy}
              onChange={(e) => setNewPharmacy(e.target.value)}
              className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-[1.2rem] px-6 py-4 focus:border-amber-500 outline-none font-bold"
            />
            <button type="submit" className="bg-amber-500 text-white p-4 rounded-[1.2rem] hover:bg-amber-600 transition-all">
              <Plus size={24} />
            </button>
          </form>
          <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
            {pharmacyList.map(p => (
              <div key={p} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                <span className="font-bold text-slate-700">{p}</span>
                <button onClick={() => onUpdatePharmacies(pharmacyList.filter(x => x !== p))} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
