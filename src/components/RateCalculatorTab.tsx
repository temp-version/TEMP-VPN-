import React from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  Sparkles, 
  Globe, 
  Cpu, 
  Smartphone, 
  PhoneCall, 
  ShieldCheck 
} from 'lucide-react';
import { Currency, Language } from '../types';
import { POPULAR_COUNTRIES, formatPrice } from '../data/countriesAndServices';
import { translations } from '../utils/translations';

interface RateCalculatorTabProps {
  lang: Language;
  currency: Currency;
  setActiveTab: (tab: 'virtual_numbers' | 'esim' | 'voip' | 'vpn' | 'rates') => void;
}

export const RateCalculatorTab: React.FC<RateCalculatorTabProps> = ({
  lang,
  currency,
  setActiveTab
}) => {
  const t = translations[lang];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 p-6 sm:p-8 border border-amber-500/20 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            {lang === 'ha' ? 'Mafi Kyan Farashi da Tattalin Kudi' : 'Affordable Global Rates'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t.ratesTitle}
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            {t.ratesDesc}
          </p>
        </div>
      </div>

      {/* Comparison Callout Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border border-emerald-500/30 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block uppercase">
            {lang === 'ha' ? 'Sadarwa ta Baya (Old Roaming)' : 'Standard Telecom Roaming'}
          </span>
          <span className="text-2xl font-extrabold text-red-400 line-through">
            $15.00 / MB
          </span>
          <p className="text-[11px] text-slate-400">
            {lang === 'ha' ? 'Kudi mai yawa da kudin waya mai tsada' : 'Expensive carrier charges'}
          </p>
        </div>

        <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-emerald-500/50 ring-2 ring-emerald-500/30 relative">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase">
            {t.valueBadge}
          </span>
          <span className="text-xs text-emerald-400 font-semibold block uppercase mt-1">
            {lang === 'ha' ? 'RoamFlex eSIM Data' : 'RoamFlex eSIM Data'}
          </span>
          <span className="text-2xl font-extrabold text-emerald-300">
            $0.80 / GB
          </span>
          <p className="text-[11px] text-slate-300 font-semibold">
            {lang === 'ha' ? 'Maki 95% na sauqi da saurin 5G' : 'Save 95% on global internet'}
          </p>
        </div>

        <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block uppercase">
            {lang === 'ha' ? 'Virtual Numbers SMS/OTP' : 'Virtual Numbers SMS/OTP'}
          </span>
          <span className="text-2xl font-extrabold text-cyan-400">
            $0.40 / OTP
          </span>
          <p className="text-[11px] text-slate-400">
            {lang === 'ha' ? 'Tabbatar da WhatsApp & TikTok instant' : 'Instant WhatsApp & TikTok verification'}
          </p>
        </div>
      </div>

      {/* Country Rates Table */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-amber-400" />
          {lang === 'ha' ? 'Teburin Farashin Kowace Kasa' : 'Full Country Rate Directory'}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">{t.countryName}</th>
                <th className="py-3 px-4">{t.esimPriceGb}</th>
                <th className="py-3 px-4">{t.virtualNumPrice}</th>
                <th className="py-3 px-4">{t.callRate}</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {POPULAR_COUNTRIES.map((c) => (
                <tr key={c.code} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    <span className="text-xl">{c.flag}</span>
                    <div>
                      <p className="text-xs">{lang === 'ha' ? c.nameHa : c.nameEn}</p>
                      <p className="text-[10px] text-slate-400">{c.dialCode}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-blue-400">
                    {formatPrice(c.esimStartingPriceUsd, currency)}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-cyan-400">
                    {formatPrice(c.virtualNumberStartingPriceUsd, currency)}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-emerald-400">
                    {formatPrice(c.voipRateUsdPerMin, currency)} / min
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setActiveTab('virtual_numbers')}
                      className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] transition shadow"
                    >
                      {t.getNewNumber}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
