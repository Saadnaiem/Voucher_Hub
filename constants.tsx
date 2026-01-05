
import React from 'react';
import { UserRole } from './types';
import { 
  LayoutDashboard,
  PlusCircle,
  History,
  Settings as SettingsIcon
} from 'lucide-react';

export const DEFAULT_VOUCHERS = [
  'Huggies Voucher',
  'Kotex Voucher',
  'Blevit Voucher',
  'Vitafos Voucher'
];

export const LAKUM_STATUS_OPTIONS = [
  "New Enrollment",
  "Has account"
];

// Initial baseline for pharmacies
export const DEFAULT_PHARMACIES = [
  "Rayan Main", "Sahafa-ER", "Narjis MP", "Sewedi Main", "Sahafa-MP",
  "Takhas Main", "Khobar-ER", "Khobar-MP", "Takhas OB", "Qasm-XP",
  "Fayha Main", "Olaya Main", "Sewedi Hamza", "Olaya Derma", "Takhas P Surgery",
  "Rayan OBGYN", "Hamra-ER", "Sewedi ER", "Ghadeer MP", "Burd-P-Clinic",
  "Olaya Neuro", "Qassim_Main", "Takhas Basement", "Hamra-MP", "Rayan ST",
  "Qasm-ST", "Rayan ER", "Diplomatic QP", "Olaya Ortho", "Kharj-MP",
  "Fayha ER", "Moham-MP", "Khobar-MC", "Moham-ER", "Sahafa-FF",
  "Khobar-FF", "Rabigh", "Airport-T3", "DigitalCity", "Bustan"
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: [UserRole.ADMIN] },
  { id: 'entry', label: 'New Entry', icon: <PlusCircle size={20} />, roles: [UserRole.ADMIN, UserRole.BRAND_AGENT] },
  { id: 'history', label: 'History', icon: <History size={20} />, roles: [UserRole.ADMIN, UserRole.BRAND_AGENT] },
  { id: 'settings', label: 'Master Lists', icon: <SettingsIcon size={20} />, roles: [UserRole.ADMIN] }
];
