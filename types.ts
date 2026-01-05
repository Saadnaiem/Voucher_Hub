
export enum LakumStatus {
  NEW_ENROLLMENT = 'New Enrollment',
  HAS_ACCOUNT = 'Has account'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  BRAND_AGENT = 'BRAND_AGENT'
}

export interface UserSession {
  id: string;
  name: string;
  role: UserRole;
  pharmacyName?: string; // Specific pharmacy assigned to this session
}

export interface VoucherEntry {
  id: string;
  voucherName: string;
  date: string;
  pharmacyName: string;
  pharmacistId: string;
  customerPhoneNumber: string;
  lakumStatus: LakumStatus;
  timestamp: number;
  userId: string;
  isSynced?: boolean; 
}

export interface AppSettings {
  voucherList: string[];
}
