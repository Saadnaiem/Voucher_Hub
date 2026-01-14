
import React, { useState, useEffect, useRef } from 'react';
import { 
  LAKUM_STATUS_OPTIONS
} from '../constants';
import { LakumStatus, VoucherEntry, UserSession, UserRole } from '../types';
import { 
  Calendar, 
  User, 
  IdCard, 
  Store,
  Ticket,
  ChevronDown,
  Wifi,
  WifiOff,
  Check,
  Search,
  X,
  Smartphone,
  AlertCircle,
  Lock,
  Cloud,
  RefreshCw,
  PlusCircle,
  UserCheck,
  Zap,
  PhoneCall
} from 'lucide-react';
import { SyncService } from '../syncService';

interface EntryFormProps {
  onSubmit: (entry: VoucherEntry) => void;
  user: UserSession;
}

export const EntryForm: React.FC<EntryFormProps> = ({ onSubmit, user }) => {
  const [voucherList, setVoucherList] = useState<string[]>([]);
  const [pharmacyList, setPharmacyList] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [isPharmacyOpen, setIsPharmacyOpen] = useState(false);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  
  const [pharmacySearch, setPharmacySearch] = useState('');
  const [voucherSearch, setVoucherSearch] = useState('');
  
  const pharmacyDropdownRef = useRef<HTMLDivElement>(null);
  const voucherDropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    voucherName: '',
    date: new Date().toISOString().split('T')[0],
    pharmacyName: user.pharmacyName || '', 
    pharmacistId: '',
    customerPhoneNumber: '',
    lakumStatus: '' 
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isFormValid = !!(
    formData.voucherName && 
    formData.date && 
    formData.pharmacyName && 
    formData.pharmacistId && 
    formData.customerPhoneNumber && 
    formData.lakumStatus
  );

  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    const loadMasterLists = async () => {
      const [vouchers, pharmacies] = await Promise.all([
        SyncService.fetchVoucherList(),
        SyncService.fetchPharmacyList()
      ]);
      setVoucherList(vouchers);
      setPharmacyList(pharmacies);
    };
    loadMasterLists();

    const handleClickOutside = (event: MouseEvent) => {
      if (pharmacyDropdownRef.current && !pharmacyDropdownRef.current.contains(event.target as Node)) {
        setIsPharmacyOpen(false);
      }
      if (voucherDropdownRef.current && !voucherDropdownRef.current.contains(event.target as Node)) {
        setIsVoucherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const filteredPharmacies = pharmacyList.filter(p => 
    p.toLowerCase().includes(pharmacySearch.toLowerCase())
  );

  const filteredVouchers = voucherList.filter(v => 
    v.toLowerCase().includes(voucherSearch.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectPharmacy = (name: string) => {
    if (user.role !== UserRole.ADMIN && user.pharmacyName) return;
    setFormData(prev => ({ ...prev, pharmacyName: name }));
    setIsPharmacyOpen(false);
    setPharmacySearch('');
  };

  const selectVoucher = (name: string) => {
    setFormData(prev => ({ ...prev, voucherName: name }));
    setIsVoucherOpen(false);
    setVoucherSearch('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSyncing(true);
    
    const newEntry: VoucherEntry = {
      id: `REC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      voucherName: formData.voucherName,
      date: formData.date,
      pharmacyName: formData.pharmacyName,
      pharmacistId: formData.pharmacistId,
      customerPhoneNumber: formData.customerPhoneNumber,
      lakumStatus: formData.lakumStatus as LakumStatus,
      timestamp: Date.now(),
      userId: user.id
    };

    await onSubmit(newEntry);
    
    setIsSyncing(false);
    setShowSuccess(true);
    
    setTimeout(() => setShowSuccess(false), 2500);
    setFormData(prev => ({
      ...prev,
      pharmacistId: '',
      customerPhoneNumber: '',
      lakumStatus: ''
    }));
  };

  const isPharmacyLocked = user.role !== UserRole.ADMIN && !!user.pharmacyName;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-[800] text-slate-900 tracking-tighter">Voucher Redemption</h2>
          <div className="flex items-center gap-3">
            <p className="text-slate-500 font-bold">
              Authenticated Location: <span className="text-indigo-600">{user.pharmacyName || user.name}</span>
            </p>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isOnline ? 'Direct Cloud Sync' : 'Offline Mode (Local)'}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-[0_32px_64px_-12px_rgba(15,23,42,0.1)] overflow-hidden relative">
        {showSuccess && (
          <div className="absolute inset-0 bg-emerald-600/95 z-50 flex flex-col items-center justify-center text-white animate-in zoom-in duration-300 backdrop-blur-sm">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-md">
              <Check size={48} strokeWidth={4} />
            </div>
            <h3 className="text-4xl font-black mb-2">Logged!</h3>
            <p className="font-bold opacity-80 uppercase tracking-[0.3em] text-xs">Redemption Stored Successfully</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* Pharmacy Selection */}
            <div className="space-y-4 md:col-span-2 relative" ref={pharmacyDropdownRef}>
              <label className="flex items-center gap-3 text-xs font-black text-amber-600 uppercase tracking-[0.15em]">
                <Store size={20} className="text-amber-500" />
                Pharmacy Location <span className="text-rose-500 text-lg leading-none">*</span>
              </label>
              
              <div 
                onClick={() => !isPharmacyLocked && setIsPharmacyOpen(!isPharmacyOpen)}
                className={`w-full bg-slate-50 border-2 rounded-[1.5rem] px-8 py-5 transition-all flex items-center justify-between ${
                  isPharmacyLocked ? 'cursor-not-allowed border-slate-200 bg-slate-100 opacity-80' : 
                  isPharmacyOpen ? 'border-amber-500 ring-4 ring-amber-500/10' : !formData.pharmacyName ? 'border-slate-100' : 'border-slate-200'
                }`}
              >
                <span className={`text-lg font-[700] ${formData.pharmacyName ? 'text-slate-900' : 'text-slate-400'}`}>
                  {formData.pharmacyName || 'Choose location...'}
                </span>
                {isPharmacyLocked ? (
                  <Lock size={18} className="text-slate-300" />
                ) : (
                  <ChevronDown className={`text-slate-400 transition-transform ${isPharmacyOpen ? 'rotate-180' : ''}`} size={24} />
                )}
              </div>

              {!isPharmacyLocked && isPharmacyOpen && (
                <div className="absolute z-[60] left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                    <Search size={18} className="text-slate-400" />
                    <input 
                      autoFocus
                      type="text"
                      placeholder="Search branch name..."
                      value={pharmacySearch}
                      onChange={(e) => setPharmacySearch(e.target.value)}
                      className="bg-transparent border-none focus:ring-0 w-full font-bold text-slate-700"
                    />
                    {pharmacySearch && (
                      <button type="button" onClick={() => setPharmacySearch('')} className="text-slate-300 hover:text-slate-500">
                        <X size={18} />
                      </button>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                    {filteredPharmacies.length > 0 ? (
                      filteredPharmacies.map((name, idx) => (
                        <div 
                          key={idx}
                          onClick={() => selectPharmacy(name)}
                          className={`px-6 py-4 rounded-xl cursor-pointer font-bold transition-all flex items-center justify-between group ${
                            formData.pharmacyName === name 
                              ? 'bg-amber-50 text-amber-700' 
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          {name}
                          {formData.pharmacyName === name && <Check size={16} />}
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center text-slate-400 font-bold italic">
                        No matches found.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Voucher Selection - LIST CHOOSE FROM */}
            <div className="space-y-4 relative" ref={voucherDropdownRef}>
              <label className="flex items-center gap-3 text-xs font-black text-indigo-600 uppercase tracking-[0.15em]">
                <Ticket size={20} className="text-indigo-500" />
                Voucher Name <span className="text-rose-500 text-lg leading-none">*</span>
              </label>
              
              <div 
                onClick={() => setIsVoucherOpen(!isVoucherOpen)}
                className={`w-full bg-slate-50 border-2 rounded-[1.5rem] px-8 py-5 transition-all flex items-center justify-between cursor-pointer ${
                  isVoucherOpen ? 'border-indigo-500 ring-4 ring-indigo-500/10' : !formData.voucherName ? 'border-slate-100' : 'border-slate-200'
                }`}
              >
                <span className={`text-lg font-[700] ${formData.voucherName ? 'text-slate-900' : 'text-slate-400'}`}>
                  {formData.voucherName || 'Choose voucher...'}
                </span>
                <ChevronDown className={`text-slate-400 transition-transform ${isVoucherOpen ? 'rotate-180' : ''}`} size={24} />
              </div>

              {isVoucherOpen && (
                <div className="absolute z-[60] left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                    <Search size={18} className="text-slate-400" />
                    <input 
                      autoFocus
                      type="text"
                      placeholder="Search voucher name..."
                      value={voucherSearch}
                      onChange={(e) => setVoucherSearch(e.target.value)}
                      className="bg-transparent border-none focus:ring-0 w-full font-bold text-slate-700"
                    />
                    {voucherSearch && (
                      <button type="button" onClick={() => setVoucherSearch('')} className="text-slate-300 hover:text-slate-500">
                        <X size={18} />
                      </button>
                    )}
                  </div>
                  <div className="max-h-[250px] overflow-y-auto custom-scrollbar p-2">
                    {filteredVouchers.length > 0 ? (
                      filteredVouchers.map((name, idx) => (
                        <div 
                          key={idx}
                          onClick={() => selectVoucher(name)}
                          className={`px-6 py-4 rounded-xl cursor-pointer font-bold transition-all flex items-center justify-between group ${
                            formData.voucherName === name 
                              ? 'bg-indigo-50 text-indigo-700' 
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          {name}
                          {formData.voucherName === name && <Check size={16} />}
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center text-slate-400 font-bold italic">
                        No matches found.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 text-xs font-black text-rose-600 uppercase tracking-[0.15em]">
                <Calendar size={20} className="text-rose-500" />
                Date of Issue <span className="text-rose-500 text-lg leading-none">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-8 py-5 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all text-slate-900 font-[700] text-lg"
                required
              />
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 text-xs font-black text-slate-900 uppercase tracking-[0.15em]">
                <IdCard size={20} className="text-slate-900" />
                Pharmacist ID <span className="text-rose-500 text-lg leading-none">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="pharmacistId"
                  placeholder="Enter ID Number"
                  value={formData.pharmacistId}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-8 py-5 pl-14 focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 transition-all text-slate-900 font-[700] text-lg"
                  required
                />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">
                  <IdCard size={20} />
                </div>
              </div>
            </div>

            {/* MOM'S PHONE - BOLD AND COLOURED LABEL, ATTENTION SEEKING INPUT */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 text-lg font-black text-blue-700 uppercase tracking-[0.15em] animate-pulse">
                <Smartphone size={24} className="text-blue-600" />
                MOM'S PHONE <span className="text-rose-600 text-2xl leading-none">*</span>
              </label>
              <div className="relative group/phone">
                <input
                  type="tel"
                  name="customerPhoneNumber"
                  placeholder="+966 5X XXX XXXX"
                  value={formData.customerPhoneNumber}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-[3px] border-slate-100 rounded-[1.5rem] px-8 py-6 pl-16 focus:ring-[10px] focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 text-slate-900 font-[900] text-2xl placeholder:text-slate-300 placeholder:font-bold"
                  required
                />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/phone:text-blue-500 transition-colors group-hover/phone:scale-125 duration-500">
                  <PhoneCall size={28} />
                </div>
                {/* Visual highlight bar */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-blue-600 group-hover/phone:w-3/4 group-focus-within/phone:w-full transition-all duration-700 rounded-full" />
              </div>
            </div>

            {/* Lakum Status - BOLD AND RED LABEL */}
            <div className="space-y-4 md:col-span-2">
              <label className="flex items-center gap-3 text-2xl font-black text-red-600 uppercase tracking-[0.2em]">
                <Zap size={28} className="text-red-600 fill-red-600" />
                LAKUM STATUS <span className="text-red-700 text-3xl leading-none">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-6">
                {/* NEW ENROLLMENT BUTTON - COMPACT HALF-HEIGHT */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, lakumStatus: 'New Enrollment' }))}
                  className={`flex-1 group relative py-5 px-8 rounded-[2rem] border-4 transition-all duration-300 transform active:scale-95 overflow-hidden ${
                    formData.lakumStatus === 'New Enrollment'
                    ? 'border-emerald-600 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-[0_20px_40px_-10px_rgba(16,185,129,0.5)] scale-[1.02]'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-100'
                  }`}
                >
                  <div className="flex flex-row items-center justify-center gap-4 relative z-10">
                    <div className={`p-3 rounded-2xl shadow-md transition-all duration-500 ${formData.lakumStatus === 'New Enrollment' ? 'bg-white text-emerald-600 rotate-3' : 'bg-white/80 text-emerald-500'}`}>
                      <PlusCircle size={32} strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <span className={`block font-black text-base uppercase tracking-[0.1em] ${formData.lakumStatus === 'New Enrollment' ? 'text-white' : 'text-emerald-900'}`}>New Enrollment</span>
                      <span className={`text-[8px] font-bold uppercase opacity-60 tracking-widest ${formData.lakumStatus === 'New Enrollment' ? 'text-emerald-50' : 'text-emerald-600'}`}>Register Mom Now</span>
                    </div>
                  </div>
                  
                  {formData.lakumStatus === 'New Enrollment' && (
                    <div className="absolute top-2 right-4 bg-white text-emerald-600 p-1 rounded-full shadow-sm animate-bounce">
                      <Check size={14} strokeWidth={4} />
                    </div>
                  )}
                </button>

                {/* HAS ACCOUNT BUTTON - COMPACT HALF-HEIGHT */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, lakumStatus: 'Has account' }))}
                  className={`flex-1 group relative py-5 px-8 rounded-[2rem] border-4 transition-all duration-300 transform active:scale-95 overflow-hidden ${
                    formData.lakumStatus === 'Has account'
                    ? 'border-indigo-600 bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-700 text-white shadow-[0_20px_40px_-10px_rgba(79,70,229,0.5)] scale-[1.02]'
                    : 'border-indigo-200 bg-indigo-50 text-indigo-800 hover:border-indigo-400 hover:bg-indigo-100'
                  }`}
                >
                  <div className="flex flex-row items-center justify-center gap-4 relative z-10">
                    <div className={`p-3 rounded-2xl shadow-md transition-all duration-500 ${formData.lakumStatus === 'Has account' ? 'bg-white text-indigo-600 -rotate-3' : 'bg-white/80 text-indigo-500'}`}>
                      <UserCheck size={32} strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <span className={`block font-black text-base uppercase tracking-[0.1em] ${formData.lakumStatus === 'Has account' ? 'text-white' : 'text-indigo-900'}`}>Has Account</span>
                      <span className={`text-[8px] font-bold uppercase opacity-60 tracking-widest ${formData.lakumStatus === 'Has account' ? 'text-indigo-50' : 'text-indigo-600'}`}>Existing Member</span>
                    </div>
                  </div>
                  
                  {formData.lakumStatus === 'Has account' && (
                    <div className="absolute top-2 right-4 bg-white text-indigo-600 p-1 rounded-full shadow-sm animate-bounce">
                      <Check size={14} strokeWidth={4} />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-10 flex flex-col items-center">
            <button
              type="submit"
              disabled={isSyncing || !isFormValid}
              className={`w-full md:w-auto md:min-w-[400px] font-[800] py-7 px-14 rounded-[2.5rem] transition-all flex items-center justify-center gap-4 relative overflow-hidden group shadow-2xl ${
                isFormValid 
                ? 'bg-slate-950 text-white hover:bg-black active:scale-[0.98] shadow-slate-900/30' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200'
              }`}
            >
              <span className="relative z-10 flex items-center gap-4 text-xl tracking-tight">
                {isSyncing ? (
                  <>
                    <RefreshCw size={24} className="animate-spin" />
                    SYNCING TO CLOUD...
                  </>
                ) : (
                  <>
                    LOG REDEMPTION
                    {isFormValid && <Cloud size={24} className="group-hover:animate-bounce" />}
                  </>
                )}
                {!isFormValid && <AlertCircle size={20} className="opacity-50" />}
              </span>
            </button>
            <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {isOnline ? 'Data will sync immediately' : 'Data will sync once internet returns'}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
