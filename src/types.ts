export type Currency = 'USD' | 'NGN' | 'EUR' | 'GBP' | 'CFA' | 'KES' | 'GHS';
export type Language = 'ha' | 'en'; // Hausa or English

export interface Country {
  code: string;
  nameEn: string;
  nameHa: string;
  flag: string;
  dialCode: string;
  region: 'Africa' | 'Middle East' | 'Europe' | 'Americas' | 'Asia';
  esimAvailable: boolean;
  virtualNumberAvailable: boolean;
  esimStartingPriceUsd: number;
  virtualNumberStartingPriceUsd: number;
  voipRateUsdPerMin: number;
  featured?: boolean;
}

export interface AppService {
  id: string;
  name: string;
  iconName: string;
  category: 'social' | 'messaging' | 'entertainment' | 'finance' | 'other';
  color: string;
  popularInAfrica?: boolean;
}

export interface VirtualNumberOption {
  id: string;
  countryCode: string;
  serviceId: string;
  phoneNumber: string;
  priceUsd: number;
  type: 'otp_single' | 'rental_30d';
  provider: string;
  reliabilityScore: number; // e.g. 98%
}

export interface VirtualNumberActive {
  id: string;
  countryCode: string;
  countryName: string;
  flag: string;
  phoneNumber: string;
  serviceName: string;
  serviceId: string;
  type: 'otp_single' | 'rental_30d';
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'waiting_sms';
  messages: SmsMessage[];
}

export interface SmsMessage {
  id: string;
  sender: string;
  text: string;
  otpCode?: string;
  timestamp: string;
  isRead: boolean;
}

export interface EsimPlan {
  id: string;
  countryCode: string;
  countryName: string;
  flag: string;
  title: string;
  dataAmountGb: number; // e.g. 1, 3, 5, 10, 20, 999 (unlimited)
  durationDays: number; // e.g. 7, 15, 30
  priceUsd: number;
  networkPartners: string[]; // e.g. ['MTN 5G', 'Airtel 4G']
  isUnlimited?: boolean;
  coverage: string;
}

export interface EsimActive {
  id: string;
  planId: string;
  countryName: string;
  flag: string;
  title: string;
  dataTotalGb: number;
  dataUsedGb: number;
  durationDays: number;
  activatedAt: string;
  expiresAt: string;
  iccid: string;
  smdpAddress: string;
  activationCode: string;
  qrCodeSvg: string;
  status: 'active' | 'expired' | 'depleted';
}

export interface VpnServer {
  id: string;
  name: string;
  countryCode: string;
  flag: string;
  city: string;
  pingMs: number;
  loadPercent: number;
  ipAddress: string;
  premiumOnly?: boolean;
}

export interface VpnState {
  isConnected: boolean;
  activeServer: VpnServer | null;
  connectTime: number | null; // timestamp
  bytesUploaded: number;
  bytesDownloaded: number;
  ipAddress: string;
  protocol: 'WireGuard' | 'OpenVPN' | 'Shadowsocks';
  killSwitch: boolean;
}

export interface CallLog {
  id: string;
  phoneNumber: string;
  countryCode: string;
  type: 'incoming' | 'outgoing' | 'missed';
  durationSeconds: number;
  timestamp: string;
  costUsd: number;
}

export interface WalletTransaction {
  id: string;
  reference: string;
  type: 'deposit' | 'esim_purchase' | 'number_rental' | 'voip_call' | 'referral_bonus';
  amountUsd: number;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod?: string;
  itemDetails?: {
    countryFlag?: string;
    phoneNumber?: string;
    planTitle?: string;
    gatewayRef?: string;
  };
}

export interface ReferralFriend {
  id: string;
  name: string;
  avatar: string;
  joinedDate: string;
  status: 'active' | 'purchased';
  bonusEarnedUsd: number;
}

export interface ReferralData {
  referralCode: string;
  referralLink: string;
  totalFriendsInvited: number;
  totalBonusEarnedUsd: number;
  claimableBonusUsd: number;
  invitedFriends: ReferralFriend[];
}
