import React, { useState } from 'react';
import { Currency, Language, EsimActive, VirtualNumberActive, CallLog, VpnState, WalletTransaction, ReferralData } from './types';
import { Header } from './components/Header';
import { VirtualNumbersTab } from './components/VirtualNumbersTab';
import { EsimTab } from './components/EsimTab';
import { VoipDialerTab } from './components/VoipDialerTab';
import { VpnTab } from './components/VpnTab';
import { RateCalculatorTab } from './components/RateCalculatorTab';
import { WalletModal } from './components/WalletModal';
import { MyAssetsModal } from './components/MyAssetsModal';
import { TransactionHistoryModal } from './components/TransactionHistoryModal';
import { ReferralModal } from './components/ReferralModal';
import { generateEsimQrSvg } from './utils/qr';
import { VPN_SERVERS } from './data/countriesAndServices';
import { translations } from './utils/translations';
import { Sparkles, Globe, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  // Navigation & Language
  const [activeTab, setActiveTab] = useState<'virtual_numbers' | 'esim' | 'voip' | 'vpn' | 'rates'>('virtual_numbers');
  const [lang, setLang] = useState<Language>('ha'); // Hausa by default for prompt alignment
  const [currency, setCurrency] = useState<Currency>('NGN');

  // Wallet State
  const [walletBalanceUsd, setWalletBalanceUsd] = useState<number>(25.00);

  // Transactions State
  const [transactions, setTransactions] = useState<WalletTransaction[]>([
    {
      id: 'tx_init_1',
      reference: 'TXN-TVPN-98214',
      type: 'deposit',
      amountUsd: 25.00,
      description: 'Wallet Deposit (Paystack / Cards)',
      timestamp: new Date(Date.now() - 3600000 * 24).toLocaleString(),
      status: 'completed',
      paymentMethod: 'Paystack Gateway'
    },
    {
      id: 'tx_init_2',
      reference: 'TXN-TVPN-84210',
      type: 'number_rental',
      amountUsd: 1.50,
      description: 'WhatsApp Virtual Number (+1 202 555-0148)',
      timestamp: new Date(Date.now() - 3600000 * 5).toLocaleString(),
      status: 'completed',
      paymentMethod: 'Wallet Balance',
      itemDetails: {
        countryFlag: '🇺🇸',
        phoneNumber: '+1 (202) 555-0148'
      }
    },
    {
      id: 'tx_init_3',
      reference: 'TXN-TVPN-74109',
      type: 'esim_purchase',
      amountUsd: 12.00,
      description: 'Nigeria Pro 5GB eSIM Activation',
      timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString(),
      status: 'completed',
      paymentMethod: 'Wallet Balance',
      itemDetails: {
        countryFlag: '🇳🇬',
        planTitle: 'Nigeria Pro 5GB'
      }
    },
    {
      id: 'tx_init_4',
      reference: 'TXN-TVPN-61028',
      type: 'referral_bonus',
      amountUsd: 2.50,
      description: 'Referral Bonus Claimed (Amina Bello purchase)',
      timestamp: new Date(Date.now() - 1800000).toLocaleString(),
      status: 'completed',
      paymentMethod: 'Referral System'
    }
  ]);

  // Referral System State
  const [referralData, setReferralData] = useState<ReferralData>({
    referralCode: 'TEMP-VIP-8920',
    referralLink: 'https://tempvpn.app/?ref=TEMP-VIP-8920',
    totalFriendsInvited: 2,
    totalBonusEarnedUsd: 7.50,
    claimableBonusUsd: 5.00,
    invitedFriends: [
      {
        id: 'friend_1',
        name: 'Ibrahim Sani',
        avatar: '👤',
        joinedDate: 'Jiya (Yesterday)',
        status: 'purchased',
        bonusEarnedUsd: 2.50
      },
      {
        id: 'friend_2',
        name: 'Amina Bello',
        avatar: '👤',
        joinedDate: '2 hours ago',
        status: 'purchased',
        bonusEarnedUsd: 2.50
      }
    ]
  });

  // Initial Sample Active Virtual Numbers
  const [activeNumbers, setActiveNumbers] = useState<VirtualNumberActive[]>([
    {
      id: 'num_init_1',
      countryCode: 'US',
      countryName: 'United States',
      flag: '🇺🇸',
      phoneNumber: '+1 (202) 555-0148',
      serviceName: 'WhatsApp',
      serviceId: 'whatsapp',
      type: 'otp_single',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      status: 'active',
      messages: [
        {
          id: 'msg_1',
          sender: 'WhatsApp',
          text: 'Your WhatsApp registration code is 849-201. Do not share this code with anyone.',
          otpCode: '849201',
          timestamp: '10:02 AM',
          isRead: false
        }
      ]
    }
  ]);

  // Initial Sample Active eSIM
  const initialQrSvg = generateEsimQrSvg('LPA:1$rsp.global-esim.net$898824012948102', 200);
  const [activeEsims, setActiveEsims] = useState<EsimActive[]>([
    {
      id: 'esim_init_1',
      planId: 'ng-5gb-30d',
      countryName: 'Nigeria',
      flag: '🇳🇬',
      title: 'Nigeria Pro 5GB',
      dataTotalGb: 5,
      dataUsedGb: 1.2,
      durationDays: 30,
      activatedAt: new Date().toLocaleDateString(),
      expiresAt: new Date(Date.now() + 30 * 86400000).toLocaleDateString(),
      iccid: '898824098124910284',
      smdpAddress: 'rsp.global-esim.net',
      activationCode: 'LPA:1$rsp.global-esim.net$898824098124',
      qrCodeSvg: initialQrSvg,
      status: 'active'
    }
  ]);

  // Call Logs
  const [callLogs, setCallLogs] = useState<CallLog[]>([
    {
      id: 'call_init_1',
      phoneNumber: '+1 (202) 555-0199',
      countryCode: 'US',
      type: 'outgoing',
      durationSeconds: 142,
      timestamp: '09:45 AM',
      costUsd: 0.03
    }
  ]);

  // VPN State
  const [vpnState, setVpnState] = useState<VpnState>({
    isConnected: false,
    activeServer: null,
    connectTime: null,
    bytesUploaded: 1420,
    bytesDownloaded: 8900,
    ipAddress: '198.51.100.45',
    protocol: 'WireGuard',
    killSwitch: true
  });

  // Modal Controls
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [isAssetsOpen, setIsAssetsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isReferralOpen, setIsReferralOpen] = useState<boolean>(false);

  // Wallet Helpers
  const deductBalance = (amountUsd: number, description: string, category: WalletTransaction['type'] = 'number_rental', itemDetails?: any): boolean => {
    if (walletBalanceUsd < amountUsd) return false;
    setWalletBalanceUsd(prev => parseFloat((prev - amountUsd).toFixed(2)));

    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      reference: `TXN-TVPN-${Math.floor(10000 + Math.random() * 90000)}`,
      type: category,
      amountUsd: amountUsd,
      description: description,
      timestamp: new Date().toLocaleString(),
      status: 'completed',
      paymentMethod: 'TEMP VPN Wallet',
      itemDetails
    };
    setTransactions(prev => [newTx, ...prev]);
    return true;
  };

  const addBalance = (amountUsd: number, description: string, method: string) => {
    setWalletBalanceUsd(prev => parseFloat((prev + amountUsd).toFixed(2)));
    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      reference: `TXN-TVPN-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'deposit',
      amountUsd: amountUsd,
      description: description || 'Wallet Top-Up Deposit',
      timestamp: new Date().toLocaleString(),
      status: 'completed',
      paymentMethod: method || 'Payment Gateway'
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const claimReferralBonus = (amountUsd: number) => {
    setWalletBalanceUsd(prev => parseFloat((prev + amountUsd).toFixed(2)));
    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      reference: `TXN-TVPN-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'referral_bonus',
      amountUsd: amountUsd,
      description: 'Referral Bonus Claimed to Wallet',
      timestamp: new Date().toLocaleString(),
      status: 'completed',
      paymentMethod: 'TEMP VPN Referral Engine'
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col justify-between">
      <div>
        {/* Navigation Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lang={lang}
          setLang={setLang}
          currency={currency}
          setCurrency={setCurrency}
          walletBalanceUsd={walletBalanceUsd}
          openWalletModal={() => setIsWalletOpen(true)}
          openAssetsModal={() => setIsAssetsOpen(true)}
          openHistoryModal={() => setIsHistoryOpen(true)}
          openReferralModal={() => setIsReferralOpen(true)}
          activeEsimCount={activeEsims.length}
          activeNumberCount={activeNumbers.length}
          vpnConnected={vpnState.isConnected}
        />

        {/* Main Workspace Body */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'virtual_numbers' && (
            <VirtualNumbersTab
              lang={lang}
              currency={currency}
              walletBalanceUsd={walletBalanceUsd}
              activeNumbers={activeNumbers}
              setActiveNumbers={setActiveNumbers}
              deductBalance={(amt, desc) => deductBalance(amt, desc, 'number_rental')}
              openWalletModal={() => setIsWalletOpen(true)}
            />
          )}

          {activeTab === 'esim' && (
            <EsimTab
              lang={lang}
              currency={currency}
              walletBalanceUsd={walletBalanceUsd}
              activeEsims={activeEsims}
              setActiveEsims={setActiveEsims}
              deductBalance={(amt, desc) => deductBalance(amt, desc, 'esim_purchase')}
              openWalletModal={() => setIsWalletOpen(true)}
            />
          )}

          {activeTab === 'voip' && (
            <VoipDialerTab
              lang={lang}
              currency={currency}
              walletBalanceUsd={walletBalanceUsd}
              callLogs={callLogs}
              setCallLogs={setCallLogs}
              deductBalance={(amt, desc) => deductBalance(amt, desc, 'voip_call')}
              openWalletModal={() => setIsWalletOpen(true)}
            />
          )}

          {activeTab === 'vpn' && (
            <VpnTab
              lang={lang}
              vpnState={vpnState}
              setVpnState={setVpnState}
            />
          )}

          {activeTab === 'rates' && (
            <RateCalculatorTab
              lang={lang}
              currency={currency}
              setActiveTab={setActiveTab}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        lang={lang}
        currency={currency}
        walletBalanceUsd={walletBalanceUsd}
        addBalance={addBalance}
      />

      <MyAssetsModal
        isOpen={isAssetsOpen}
        onClose={() => setIsAssetsOpen(false)}
        lang={lang}
        currency={currency}
        activeEsims={activeEsims}
        activeNumbers={activeNumbers}
      />

      <TransactionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        transactions={transactions}
        lang={lang}
        currency={currency}
      />

      <ReferralModal
        isOpen={isReferralOpen}
        onClose={() => setIsReferralOpen(false)}
        referralData={referralData}
        setReferralData={setReferralData}
        lang={lang}
        currency={currency}
        claimReferralBonus={claimReferralBonus}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-6 text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">TEMP VPN</span>
            <span className="font-semibold text-slate-300">• Global Connectivity & Security Platform</span>
            <span>•</span>
            <span className="text-slate-400">eSIM + Virtual SMS + VOIP + VPN</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setLang(lang === 'ha' ? 'en' : 'ha')}
              className="hover:text-white transition underline font-semibold"
            >
              {lang === 'ha' ? 'Switch to English (EN)' : 'Koma zuwa Hausa (HA)'}
            </button>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Secure 256-Bit SSL
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
