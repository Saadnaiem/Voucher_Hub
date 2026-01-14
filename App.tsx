
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { EntryForm } from './components/EntryForm';
import { HistoryList } from './components/HistoryList';
import { Settings } from './components/Settings';
import { VoucherEntry, UserSession, UserRole } from './types';
import { SyncService } from './syncService';
import { Key, ArrowRight, Users, ShieldAlert, RefreshCw, Store, Search, X, ChevronLeft } from 'lucide-react';

const App: React.FC = () => {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [entries, setEntries] = useState<VoucherEntry[]>([]);
  const [voucherList, setVoucherList] = useState<string[]>([]);
  const [pharmacyList, setPharmacyList] = useState<string[]>([]);
  const [adminPassword, setAdminPassword] = useState('saad183664#');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Login States
  const [loginView, setLoginView] = useState<'selection' | 'admin-login' | 'branch-select'>('selection');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [pharmacySearch, setPharmacySearch] = useState('');
  const [error, setError] = useState('');

  const pullFromCloud = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsSyncing(true);
    const [cloudData, cloudVouchers, cloudPharmacies, globalPassword] = await Promise.all([
      SyncService.fetchMasterData(),
      SyncService.fetchVoucherList(),
      SyncService.fetchPharmacyList(),
      SyncService.fetchAdminPassword()
    ]);
    
    setEntries(cloudData);
    setVoucherList(cloudVouchers);
    setPharmacyList(cloudPharmacies);
    setAdminPassword(globalPassword);
    setIsSyncing(false);
  }, []);

  useEffect(() => {
    const savedSession = localStorage.getItem('user_session');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      setUserSession(session);
      setActiveTab(session.role === UserRole.ADMIN ? 'dashboard' : 'entry');
    }
    pullFromCloud();
  }, [pullFromCloud]);

  // STRICT DATA FILTERING: Branches only see their own pharmacy's data
  const visibleEntries = useMemo(() => {
    if (!userSession) return [];
    if (userSession.role === UserRole.ADMIN) return entries;
    return entries.filter(e => e.pharmacyName === userSession.pharmacyName);
  }, [entries, userSession]);

  const handleAddEntry = async (entry: VoucherEntry) => {
    setEntries(prev => [entry, ...prev]);
    await SyncService.pushEntry(entry);
  };

  const handleUpdateVouchers = async (newList: string[]) => {
    setVoucherList(newList);
    await SyncService.updateVoucherList(newList);
  };

  const handleUpdatePharmacies = async (newList: string[]) => {
    setPharmacyList(newList);
    await SyncService.updatePharmacyList(newList);
  };

  const handleUpdateAdminPassword = async (newPass: string) => {
    setAdminPassword(newPass);
    await SyncService.updateAdminPassword(newPass);
  };

  const handleWipeCloud = async () => {
    await SyncService.wipeCloudDatabase();
    setEntries([]);
    await pullFromCloud(true);
  };

  const handleAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setIsSyncing(true);

    const currentPass = await SyncService.fetchAdminPassword();
    setAdminPassword(currentPass);
    
    if (adminPasswordInput === currentPass) {
      const session: UserSession = { id: 'admin-1', name: 'Master Admin', role: UserRole.ADMIN };
      setUserSession(session);
      localStorage.setItem('user_session', JSON.stringify(session));
      setActiveTab('dashboard');
      setLoginView('selection');
      setAdminPasswordInput('');
      pullFromCloud();
    } else {
      setError('Invalid administrator password');
      setAdminPasswordInput('');
    }
    setIsSyncing(false);
  };

  const handleBranchSelect = (pharmacyName: string) => {
    const session: UserSession = { 
      id: `branch-${Math.random().toString(36).substr(2, 9)}`, 
      name: `Branch: ${pharmacyName}`, 
      role: UserRole.BRAND_AGENT,
      pharmacyName: pharmacyName
    };
    setUserSession(session);
    localStorage.setItem('user_session', JSON.stringify(session));
    setActiveTab('entry');
    setLoginView('selection');
    pullFromCloud();
  };

  const filteredPharmacies = pharmacyList.filter(p => 
    p.toLowerCase().includes(pharmacySearch.toLowerCase())
  );

  if (!userSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
        <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl border border-white/20">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-12 text-white relative">
            <h1 className="text-4xl font-black tracking-tighter mb-2">Voucher Hub</h1>
            <p className="text-indigo-100/70 font-medium text-sm">Immediate Sync Distribution Portal</p>
          </div>
          
          <div className="p-10 space-y-6">
            {loginView === 'selection' && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <button 
                  onClick={() => setLoginView('admin-login')}
                  className="w-full flex items-center gap-5 p-6 rounded-[2rem] border-2 border-slate-50 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all group"
                >
                  <div className="bg-indigo-600 p-4 rounded-2xl text-white group-hover:scale-110 transition-transform">
                    <Key size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-slate-800 text-lg">Master Admin</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Network Authority</p>
                  </div>
                </button>

                <button 
                  onClick={() => setLoginView('branch-select')}
                  className="w-full flex items-center gap-5 p-6 rounded-[2rem] border-2 border-slate-50 hover:border-emerald-600 hover:bg-emerald-50/50 transition-all group"
                >
                  <div className="bg-emerald-500 p-4 rounded-2xl text-white group-hover:scale-110 transition-transform">
                    <Users size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-slate-800 text-lg">Branches</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Location Specific Access</p>
                  </div>
                </button>
              </div>
            )}

            {loginView === 'admin-login' && (
              <form onSubmit={handleAdminLogin} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <button type="button" onClick={() => setLoginView('selection')} className="p-2 text-slate-400 hover:text-slate-600"><ChevronLeft size={20}/></button>
                  <h3 className="font-black text-slate-800">Admin Authentication</h3>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Credentials Required</label>
                  <div className="relative">
                    <input 
                      autoFocus
                      type="password"
                      placeholder="Enter Admin PIN"
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      disabled={isSyncing}
                      className={`w-full bg-slate-50 border-2 rounded-3xl px-8 py-5 text-slate-800 font-black text-xl outline-none transition-all ${
                        error ? 'border-rose-400 bg-rose-50/50' : 'border-slate-100 focus:border-indigo-600'
                      }`}
                    />
                    <button 
                      type="submit" 
                      disabled={isSyncing}
                      className="absolute right-3 top-3 bottom-3 bg-indigo-600 text-white rounded-2xl px-5 hover:bg-indigo-700 transition-all"
                    >
                      {isSyncing ? <RefreshCw className="animate-spin" size={24} /> : <ArrowRight size={24} />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-xs font-bold text-rose-500 px-4">{error}</p>}
              </form>
            )}

            {loginView === 'branch-select' && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300 flex flex-col h-[400px]">
                <div className="flex items-center gap-2 mb-2">
                  <button type="button" onClick={() => setLoginView('selection')} className="p-2 text-slate-400 hover:text-slate-600"><ChevronLeft size={20}/></button>
                  <h3 className="font-black text-slate-800">Select Your Branch</h3>
                </div>
                
                <div className="relative mb-2">
                  <input 
                    type="text"
                    placeholder="Search branch name..."
                    value={pharmacySearch}
                    onChange={(e) => setPharmacySearch(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-12 py-4 font-bold text-slate-700 focus:border-emerald-500 outline-none"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  {pharmacySearch && <button onClick={() => setPharmacySearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"><X size={16}/></button>}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
                  {filteredPharmacies.length > 0 ? (
                    filteredPharmacies.map((name) => (
                      <button 
                        key={name}
                        onClick={() => handleBranchSelect(name)}
                        className="w-full text-left p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all font-bold text-slate-700 flex items-center gap-3 group"
                      >
                        <Store size={16} className="text-slate-300 group-hover:text-emerald-500" />
                        {name}
                      </button>
                    ))
                  ) : (
                    <p className="text-center text-slate-400 py-10 italic font-medium">No branches found</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      user={userSession} 
      onLogout={() => {setUserSession(null); localStorage.removeItem('user_session');}}
    >
      {activeTab === 'dashboard' && userSession.role === UserRole.ADMIN && (
        <Dashboard 
          entries={visibleEntries} 
          onClearData={() => {SyncService.clearCloudHub(); setEntries([]);}} 
          onImportData={pullFromCloud}
          pharmacyCount={pharmacyList.length}
          voucherList={voucherList}
        />
      )}
      {activeTab === 'entry' && <EntryForm onSubmit={handleAddEntry} user={userSession} />}
      {activeTab === 'history' && <HistoryList entries={visibleEntries} onDelete={(id) => setEntries(e => e.filter(x => x.id !== id))} user={userSession} />}
      {activeTab === 'settings' && userSession.role === UserRole.ADMIN && (
        <Settings 
          voucherList={voucherList} 
          onUpdateVouchers={handleUpdateVouchers} 
          pharmacyList={pharmacyList}
          onUpdatePharmacies={handleUpdatePharmacies}
          adminPassword={adminPassword}
          onUpdateAdminPassword={handleUpdateAdminPassword}
          onRefreshAll={pullFromCloud}
          onWipeDatabase={handleWipeCloud}
        />
      )}
    </Layout>
  );
};

export default App;
