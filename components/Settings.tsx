
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Store, 
  CloudCheck,
  RefreshCw,
  AlertTriangle,
  Zap,
  Lock,
  ShieldCheck,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '../supabaseClient';

interface SettingsProps {
  voucherList: string[];
  onUpdateVouchers: (newList: string[]) => void;
  pharmacyList: string[];
  onUpdatePharmacies: (newList: string[]) => void;
  adminPassword: string;
  onUpdateAdminPassword: (newPass: string) => void;
  onRefreshAll: () => void;
  onWipeDatabase: () => Promise<void>;
}

export const Settings: React.FC<SettingsProps> = ({ 
  voucherList, 
  onUpdateVouchers,
  pharmacyList,
  onUpdatePharmacies,
  adminPassword,
  onUpdateAdminPassword,
  onRefreshAll,
  onWipeDatabase
}) => {
  const [newVoucher, setNewVoucher] = useState('');
  const [newPharmacy, setNewPharmacy] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  
  const [isConnected, setIsConnected] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [isSavingPass, setIsSavingPass] = useState(false);

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

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin.trim() || newPin !== confirmPin) return;
    
    setIsSavingPass(true);
    await onUpdateAdminPassword(newPin.trim());
    setIsSavingPass(false);
    
    setNewPin('');
    setConfirmPin('');
    alert("Admin PIN updated successfully.");
  };

  const handleWipeData = async () => {
    if (confirm("⚠️ DANGER: This will permanently delete ALL redemption records from the database. This cannot be undone. Proceed?")) {
      if (confirm("FINAL CONFIRMATION: Type 'DELETE' in your mind. Are you absolutely sure?")) {
        setIsWiping(true);
        await onWipeDatabase();
        setIsWiping(false);
        alert("Database has been wiped successfully.");
      }
    }
  };

  const pinsMatch = newPin !== '' && newPin === confirmPin;
  const pinStrength = newPin.length >= 4;

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
        {/* Vouchers Section */}
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

        {/* Pharmacy Section */}
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

      {/* Security Section */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl p-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10">
          <div className="flex items-center gap-4 flex-1">
             <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-slate-200 shrink-0">
                <ShieldCheck size={32} />
             </div>
             <div>
               <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Security & Access</h3>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Update Master Administrator PIN</p>
             </div>
          </div>
          
          <form onSubmit={handleUpdatePassword} className="flex-[2] grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">New PIN</label>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  placeholder="Enter PIN"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.2rem] px-12 py-4 focus:border-indigo-600 outline-none font-black text-lg"
                />
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <button 
                  type="button" 
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Confirm PIN</label>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  placeholder="Repeat PIN"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className={`w-full bg-slate-50 border-2 rounded-[1.2rem] px-12 py-4 focus:ring-0 outline-none font-black text-lg transition-all ${
                    confirmPin === '' ? 'border-slate-100' :
                    pinsMatch ? 'border-emerald-500 bg-emerald-50/20' : 'border-rose-400 bg-rose-50/20'
                  }`}
                />
                {confirmPin !== '' && (
                  <div className="absolute right-5 top-1/2 -translate-y-1/2">
                    {pinsMatch ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-rose-400" />}
                  </div>
                )}
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              </div>
            </div>

            <div className="md:col-span-2 pt-2 flex justify-end">
              <button 
                type="submit" 
                disabled={isSavingPass || !pinsMatch || !pinStrength}
                className="bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] hover:bg-black transition-all font-black flex items-center justify-center gap-3 disabled:opacity-20 disabled:grayscale shadow-lg shadow-slate-200"
              >
                {isSavingPass ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                SAVE SECURE PIN
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-50 rounded-[3rem] border-2 border-dashed border-rose-200 p-10 mt-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 text-rose-600">
               <AlertTriangle size={24} strokeWidth={3} />
               <h3 className="text-2xl font-black uppercase tracking-tighter">Danger Zone</h3>
            </div>
            <p className="text-rose-900/60 font-bold max-w-md">
              Use this to remove test data or reset the campaign. This will wipe all redemption records from both the cloud and this device.
            </p>
          </div>
          
          <button 
            onClick={handleWipeData}
            disabled={isWiping}
            className="group flex items-center gap-4 px-10 py-6 bg-rose-600 text-white font-black rounded-[2rem] hover:bg-rose-700 transition-all shadow-2xl shadow-rose-200 active:scale-95 disabled:opacity-50"
          >
            {isWiping ? (
              <RefreshCw className="animate-spin" size={24} />
            ) : (
              <Zap size={24} className="group-hover:animate-pulse" />
            )}
            {isWiping ? "WIPING DATABASE..." : "WIPE ENTIRE DATABASE"}
          </button>
        </div>
      </div>
    </div>
  );
};
