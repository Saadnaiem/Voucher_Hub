
import { VoucherEntry } from "./types";
import { DEFAULT_VOUCHERS, DEFAULT_PHARMACIES } from "./constants";
import { getSupabaseClient } from "./supabaseClient";

const HUB_STORAGE_KEY = 'voucher_hub_cloud_sync';
const SETTINGS_VOUCHERS_KEY = 'voucher_hub_settings_vouchers';
const SETTINGS_PHARMACIES_KEY = 'voucher_hub_settings_pharmacies';
const ADMIN_PASSWORD_KEY = 'voucher_hub_admin_password';
const LAST_BACKUP_KEY = 'voucher_hub_last_backup';

export const SyncService = {
  async pushEntry(entry: VoucherEntry): Promise<boolean> {
    const supabase = getSupabaseClient();
    
    // Default to unsynced for local storage
    const entryToSave = { ...entry, isSynced: false };
    const currentLocal = JSON.parse(localStorage.getItem(HUB_STORAGE_KEY) || '[]');
    
    if (supabase) {
      try {
        const { error } = await supabase
          .from('voucher_entries')
          .insert([{
            id: entry.id,
            voucher_name: entry.voucherName,
            date: entry.date,
            pharmacy_name: entry.pharmacyName,
            pharmacist_id: entry.pharmacistId,
            customer_phone_number: entry.customerPhoneNumber,
            lakum_status: entry.lakumStatus,
            timestamp: entry.timestamp,
            user_id: entry.userId
          }]);
        
        if (!error) {
          entryToSave.isSynced = true;
          localStorage.setItem(LAST_BACKUP_KEY, new Date().toLocaleString());
        }
      } catch (e) {
        console.error("Supabase Push Error (Offline Mode):", e);
      }
    }

    localStorage.setItem(HUB_STORAGE_KEY, JSON.stringify([entryToSave, ...currentLocal]));
    return entryToSave.isSynced || false;
  },

  async syncPendingEntries(): Promise<number> {
    const supabase = getSupabaseClient();
    if (!supabase) return 0;

    const currentLocal: VoucherEntry[] = JSON.parse(localStorage.getItem(HUB_STORAGE_KEY) || '[]');
    const pending = currentLocal.filter(e => !e.isSynced);
    
    if (pending.length === 0) return 0;

    let successCount = 0;
    for (const entry of pending) {
      try {
        const { error } = await supabase
          .from('voucher_entries')
          .upsert([{
            id: entry.id,
            voucher_name: entry.voucherName,
            date: entry.date,
            pharmacy_name: entry.pharmacyName,
            pharmacist_id: entry.pharmacistId,
            customer_phone_number: entry.customerPhoneNumber,
            lakum_status: entry.lakumStatus,
            timestamp: entry.timestamp,
            user_id: entry.userId
          }]);
        
        if (!error) {
          entry.isSynced = true;
          successCount++;
        }
      } catch (e) {
        break; // Stop if still offline
      }
    }

    if (successCount > 0) {
      localStorage.setItem(HUB_STORAGE_KEY, JSON.stringify(currentLocal));
    }
    
    return successCount;
  },

  async fetchMasterData(): Promise<VoucherEntry[]> {
    const supabase = getSupabaseClient();
    const localData: VoucherEntry[] = JSON.parse(localStorage.getItem(HUB_STORAGE_KEY) || '[]');

    if (supabase) {
      try {
        await this.syncPendingEntries();

        const { data, error } = await supabase
          .from('voucher_entries')
          .select('*')
          .order('timestamp', { ascending: false });
        
        if (!error && data) {
          const cloudEntries: VoucherEntry[] = data.map(d => ({
            id: d.id,
            voucherName: d.voucher_name,
            date: d.date,
            pharmacyName: d.pharmacy_name,
            pharmacistId: d.pharmacist_id,
            customerPhoneNumber: d.customer_phone_number,
            lakumStatus: d.lakum_status,
            timestamp: d.timestamp,
            userId: d.user_id,
            isSynced: true
          }));

          const localUnsynced = localData.filter(le => !le.isSynced && !cloudEntries.find(ce => ce.id === le.id));
          const merged = [...localUnsynced, ...cloudEntries];
          
          localStorage.setItem(HUB_STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
      } catch (e) {
        console.error("Supabase Fetch Error:", e);
      }
    }
    return localData;
  },

  async fetchVoucherList(): Promise<string[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('app_config').select('value').eq('key', 'voucher_list').single();
        if (!error && data) return data.value as string[];
      } catch (e) {}
    }
    const list = localStorage.getItem(SETTINGS_VOUCHERS_KEY);
    return list ? JSON.parse(list) : DEFAULT_VOUCHERS;
  },

  async updateVoucherList(newList: string[]): Promise<boolean> {
    localStorage.setItem(SETTINGS_VOUCHERS_KEY, JSON.stringify(newList));
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('app_config').upsert({ key: 'voucher_list', value: newList }, { onConflict: 'key' });
        return !error;
      } catch (e) {
        return false;
      }
    }
    return true;
  },

  async fetchPharmacyList(): Promise<string[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('app_config').select('value').eq('key', 'pharmacy_list').single();
        if (!error && data) return data.value as string[];
      } catch (e) {}
    }
    const list = localStorage.getItem(SETTINGS_PHARMACIES_KEY);
    return list ? JSON.parse(list) : DEFAULT_PHARMACIES;
  },

  async updatePharmacyList(newList: string[]): Promise<boolean> {
    localStorage.setItem(SETTINGS_PHARMACIES_KEY, JSON.stringify(newList));
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('app_config').upsert({ key: 'pharmacy_list', value: newList }, { onConflict: 'key' });
        return !error;
      } catch (e) {
        return false;
      }
    }
    return true;
  },

  async fetchAdminPassword(): Promise<string> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('app_config')
          .select('value')
          .eq('key', 'admin_password')
          .single();
        
        if (!error && data && data.value !== null) {
          // Robust string conversion for JSONB
          let cloudPin = typeof data.value === 'string' ? data.value : JSON.stringify(data.value);
          
          // Clean up extra quotes if they exist
          if (cloudPin.startsWith('"') && cloudPin.endsWith('"')) {
            cloudPin = cloudPin.substring(1, cloudPin.length - 1);
          }
          
          if (cloudPin && cloudPin !== 'undefined') {
            localStorage.setItem(ADMIN_PASSWORD_KEY, cloudPin);
            return cloudPin;
          }
        }
      } catch (e) {
        console.warn("Cloud password fetch failed, using local fallback.");
      }
    }
    return localStorage.getItem(ADMIN_PASSWORD_KEY) || 'saad183664#';
  },

  async updateAdminPassword(newPassword: string): Promise<boolean> {
    localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase
          .from('app_config')
          .upsert({ 
            key: 'admin_password', 
            value: newPassword 
          }, { 
            onConflict: 'key' 
          });
        return !error;
      } catch (e) {
        console.error("Supabase PIN sync failed:", e);
        return false;
      }
    }
    return true; 
  },

  async wipeCloudDatabase(): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase
          .from('voucher_entries')
          .delete()
          .not('id', 'is', null);
        
        if (error) throw error;
      } catch (e) {
        console.error("Cloud Wipe Failed:", e);
        return false;
      }
    }
    localStorage.removeItem(HUB_STORAGE_KEY);
    return true;
  },

  clearCloudHub(): Promise<void> {
    localStorage.removeItem(HUB_STORAGE_KEY);
    return Promise.resolve();
  }
};
