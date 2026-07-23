import React from 'react';
import { 
  Cpu, 
  Smartphone, 
  PhoneCall, 
  ShieldCheck, 
  TrendingUp, 
  Wallet, 
  Globe, 
  PlusCircle, 
  Sparkles,
  Layers,
  History,
  Gift
} from 'lucide-react';
import { Currency, Language } from '../types';
import { translations } from '../utils/translations';
import { formatPrice, CURRENCY_RATES } from '../data/countriesAndServices';

interface HeaderProps {
  activeTab: 'virtual_numbers' | 'esim' | 'voip' | 'vpn' | 'rates';
  setActiveTab: (tab: 'virtual_numbers' | 'esim' | 'voip' | 'vpn' | 'rates') => void;
  lang: Language;
  setLang: (lang: Language) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  walletBalanceUsd: number;
  openWalletModal: () => void;
  openAssetsModal: () => void;
  openHistoryModal: () => void;
  openReferralModal: () => void;
  activeEsimCount: number;
  activeNumberCount: number;
  vpnConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  currency,
  setCurrency,
  walletBalanceUsd,
  openWalletModal,
  openAssetsModal,
  openHistoryModal,
  openReferralModal,
  activeEsimCount,
  activeNumberCount,
  vpnConnected
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-xl">
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Brand Title: TEMP VPN */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-400/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                TEMP<span className="text-cyan-400">VPN</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  <Sparkles className="w-3 h-3 mr-1 text-cyan-400" /> eSIM + Virtual SMS + VPN
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden md:block">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Top Controls: Balance, Language, History, Referrals */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
          {/* Referral System Button */}
          <button
            onClick={openReferralModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition shadow-sm"
            title="Tsarin Gayyata & Samun Kyauta"
          >
            <Gift className="w-4 h-4 text-amber-400 animate-bounce" />
            <span className="hidden xs:inline">{lang === 'ha' ? 'Gayyata & Kyauta' : 'Refer & Earn'}</span>
          </button>

          {/* Transaction History & Receipt Button */}
          <button
            onClick={openHistoryModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700/80 transition"
            title="Tarihin Biya & Receipt PDF"
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xs:inline">{lang === 'ha' ? 'Tarihin Biya' : 'History'}</span>
          </button>

          {/* Quick Assets Badge */}
          <button
            onClick={openAssetsModal}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-xs text-slate-300 border border-slate-700/80 transition"
            title="Duba eSIM da Lambobinka"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              eSIM: <strong className="text-white">{activeEsimCount}</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span>
              Lamba: <strong className="text-white">{activeNumberCount}</strong>
            </span>
          </button>

          {/* Wallet Balance Button */}
          <button
            onClick={openWalletModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-900/30 transition border border-emerald-400/30"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-100" />
            <span>{formatPrice(walletBalanceUsd, currency)}</span>
            <PlusCircle className="w-3.5 h-3.5 text-emerald-200" />
          </button>

          {/* Currency Switcher */}
          <div className="relative flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
            {Object.keys(CURRENCY_RATES).map((currKey) => (
              <button
                key={currKey}
                onClick={() => setCurrency(currKey as Currency)}
                className={`px-1.5 sm:px-2 py-1 rounded-md transition font-medium ${
                  currency === currKey
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {currKey}
              </button>
            ))}
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setLang('ha')}
              className={`px-2 py-1 rounded-md transition flex items-center gap-1 font-semibold ${
                lang === 'ha'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Hausa"
            >
              🇳🇬 Hausa
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded-md transition flex items-center gap-1 font-semibold ${
                lang === 'en'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="English"
            >
              🌐 EN
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2 no-scrollbar scroll-smooth" aria-label="Tabs">
          {/* Virtual Numbers */}
          <button
            onClick={() => setActiveTab('virtual_numbers')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'virtual_numbers'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>{t.tabVirtualNumbers}</span>
            {activeNumberCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                {activeNumberCount}
              </span>
            )}
          </button>

          {/* eSIM Data */}
          <button
            onClick={() => setActiveTab('esim')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'esim'
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>{t.tabEsim}</span>
            {activeEsimCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                {activeEsimCount}
              </span>
            )}
          </button>

          {/* VOIP Calls */}
          <button
            onClick={() => setActiveTab('voip')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'voip'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <span>{t.tabVoip}</span>
          </button>

          {/* VPN Security */}
          <button
            onClick={() => setActiveTab('vpn')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'vpn'
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>{t.tabVpn}</span>
          </button>

          {/* Rate Comparison */}
          <button
            onClick={() => setActiveTab('rates')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'rates'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>{t.tabRates}</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
