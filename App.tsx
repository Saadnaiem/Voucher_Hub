
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { EntryForm } from './components/EntryForm';
import { HistoryList } from './components/HistoryList';
import { Settings } from './components/Settings';
import { VoucherEntry, UserSession, UserRole } from './types';
import { SyncService } from './syncService';
import { Key, ArrowRight, Users, ShieldAlert } from 'lucide-react';

const App: React.FC = () => {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [entries, setEntries] = useState<VoucherEntry[]>([]);
  const [voucherList, setVoucherList] = useState<string[]>([]);
  const [pharmacyList, setPharmacyList] = useState<string[]>([]);
  const [adminPassword, setAdminPassword] = useState('admin');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAdminPasswordPrompt, setIsAdminPasswordPrompt] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [error, setError] = useState('');

  const pullFromCloud = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsSyncing(true);
    const [cloudData, cloudVouchers, cloudPharmacies, localPassword] = await Promise.all([
      SyncService.fetchMasterData(),
      SyncService.fetchVoucherList(),
      SyncService.fetchPharmacyList(),
      SyncService.fetchAdminPassword()
    ]);
    
    setEntries(cloudData);
    setVoucherList(cloudVouchers);
    setPharmacyList(cloudPharmacies);
    setAdminPassword(localPassword);
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

  const handleAdminLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (adminPasswordInput === adminPassword) {
      const session = { id: 'admin-1', name: 'Master Admin', role: UserRole.ADMIN };
      setUserSession(session);
      localStorage.setItem('user_session', JSON.stringify(session));
      setActiveTab('dashboard');
      setError('');
      setIsAdminPasswordPrompt(false);
      setAdminPasswordInput('');
      pullFromCloud();
    } else {
      setError('Invalid administrator password');
      setAdminPasswordInput('');
    }
  };

  const handleAgentLogin = () => {
    const session = { 
      id: `agent-${Math.random().toString(36).substr(2, 9)}`, 
      name: 'Branch Agent', 
      role: UserRole.BRAND_AGENT
    };
    setUserSession(session);
    localStorage.setItem('user_session', JSON.stringify(session));
    setActiveTab('entry');
    pullFromCloud();
  };

  if (!userSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
        <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl border border-white/20">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-12 text-white relative">
            <h1 className="text-4xl font-black tracking-tighter mb-2">Voucher Hub</h1>
            <p className="text-indigo-100/70 font-medium">Immediate Sync Distribution Portal</p>
          </div>
          <div className="p-10 space-y-6">
            {!isAdminPasswordPrompt ? (
              <button 
                onClick={() => setIsAdminPasswordPrompt(true)}
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
            ) : (
              <form onSubmit={handleAdminLogin} className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Credentials Required</label>
                  <div className="relative">
                    <input 
                      autoFocus
                      type="password"
                      placeholder="Enter Admin PIN"
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      className={`w-full bg-slate-50 border-2 rounded-3xl px-8 py-5 text-slate-800 font-black text-xl outline-none transition-all ${
                        error ? 'border-rose-400 bg-rose-50/50' : 'border-slate-100 focus:border-indigo-600'
                      }`}
                    />
                    <button type="submit" className="absolute right-3 top-3 bottom-3 bg-indigo-600 text-white rounded-2xl px-5 hover:bg-indigo-700 transition-all">
                      <ArrowRight size={24} />
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 px-4 text-rose-500 animate-in slide-in-from-top-2">
                    <ShieldAlert size={14} />
                    <p className="text-xs font-bold">{error}</p>
                  </div>
                )}
                <button 
                  type="button" 
                  onClick={() => {
                    setIsAdminPasswordPrompt(false);
                    setError('');
                    setAdminPasswordInput('');
                  }} 
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest text-center w-full py-2 transition-colors"
                >
                  Back to selection
                </button>
              </form>
            )}
            <button 
              onClick={handleAgentLogin}
              className="w-full flex items-center gap-5 p-6 rounded-[2rem] border-2 border-slate-50 hover:border-emerald-600 hover:bg-emerald-50/50 transition-all group"
            >
              <div className="bg-emerald-500 p-4 rounded-2xl text-white group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <div className="text-left">
                <p className="font-black text-slate-800 text-lg">Branch Agent</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Immediate Sync Enabled</p>
              </div>
            </button>
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
          entries={entries} 
          onClearData={() => {SyncService.clearCloudHub(); setEntries([]);}} 
          onImportData={pullFromCloud}
          pharmacyCount={pharmacyList.length}
        />
      )}
      {activeTab === 'entry' && <EntryForm onSubmit={handleAddEntry} user={userSession} />}
      {activeTab === 'history' && <HistoryList entries={entries} onDelete={(id) => setEntries(e => e.filter(x => x.id !== id))} user={userSession} />}
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
