import React, { useState } from 'react';
import { 
  Cpu, 
  QrCode, 
  Download, 
  Wifi, 
  Globe, 
  CheckCircle2, 
  Search, 
  Sparkles, 
  Copy, 
  Check, 
  Zap, 
  Activity, 
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { Currency, Language, EsimPlan, EsimActive } from '../types';
import { POPULAR_COUNTRIES, SAMPLE_ESIM_PLANS, formatPrice } from '../data/countriesAndServices';
import { translations } from '../utils/translations';
import { generateEsimQrSvg } from '../utils/qr';

interface EsimTabProps {
  lang: Language;
  currency: Currency;
  walletBalanceUsd: number;
  activeEsims: EsimActive[];
  setActiveEsims: React.Dispatch<React.SetStateAction<EsimActive[]>>;
  deductBalance: (amountUsd: number, description: string) => boolean;
  openWalletModal: () => void;
}

export const EsimTab: React.FC<EsimTabProps> = ({
  lang,
  currency,
  walletBalanceUsd,
  activeEsims,
  setActiveEsims,
  deductBalance,
  openWalletModal
}) => {
  const t = translations[lang];

  // Filters
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEsimModalPlan, setSelectedEsimModalPlan] = useState<EsimPlan | null>(null);
  const [isActivating, setIsActivating] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [speedTestingId, setSpeedTestingId] = useState<string | null>(null);
  const [testSpeedMbps, setTestSpeedMbps] = useState<number | null>(null);

  // Filter eSIM plans
  const filteredPlans = SAMPLE_ESIM_PLANS.filter((plan) => {
    const country = POPULAR_COUNTRIES.find(c => c.code === plan.countryCode);
    if (selectedRegion !== 'All') {
      if (plan.countryCode === 'GLOBAL' && selectedRegion !== 'All') {
        // Keep global
      } else if (country && country.region !== selectedRegion) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = plan.countryName.toLowerCase().includes(q);
      const matchTitle = plan.title.toLowerCase().includes(q);
      const matchPartners = plan.networkPartners.some(p => p.toLowerCase().includes(q));
      return matchName || matchTitle || matchPartners;
    }
    return true;
  });

  const handleActivatePlan = (plan: EsimPlan) => {
    if (walletBalanceUsd < plan.priceUsd) {
      alert(lang === 'ha' ? 'Kudinka bai kai ba! Tura kudi a cikin Wallet dinka.' : 'Insufficient balance! Please top up your wallet.');
      openWalletModal();
      return;
    }

    setIsActivating(true);

    setTimeout(() => {
      const iccid = `8988240${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      const smdp = 'rsp.global-esim.net';
      const code = `LPA:1$${smdp}$${iccid.slice(-12)}`;
      const qrSvg = generateEsimQrSvg(code, 220);

      const newEsim: EsimActive = {
        id: `esim_${Date.now()}`,
        planId: plan.id,
        countryName: plan.countryName,
        flag: plan.flag,
        title: plan.title,
        dataTotalGb: plan.dataAmountGb,
        dataUsedGb: 0.1,
        durationDays: plan.durationDays,
        activatedAt: new Date().toLocaleDateString(),
        expiresAt: new Date(Date.now() + plan.durationDays * 86400000).toLocaleDateString(),
        iccid,
        smdpAddress: smdp,
        activationCode: code,
        qrCodeSvg: qrSvg,
        status: 'active'
      };

      const description = `eSIM ${plan.title} (${plan.flag} ${plan.dataAmountGb === 999 ? 'Unlimited' : plan.dataAmountGb + 'GB'})`;
      const success = deductBalance(plan.priceUsd, description);

      if (success) {
        setActiveEsims(prev => [newEsim, ...prev]);
        setSelectedEsimModalPlan(null);
      }
      setIsActivating(false);
    }, 700);
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRunSpeedTest = (esimId: string) => {
    setSpeedTestingId(esimId);
    setTestSpeedMbps(null);
    setTimeout(() => {
      const randomSpeed = Math.floor(85 + Math.random() * 180); // 85 - 265 Mbps
      setTestSpeedMbps(randomSpeed);
      setSpeedTestingId(null);
    }, 1200);
  };

  const handleConsumeData = (esimId: string) => {
    setActiveEsims(prev =>
      prev.map(e => {
        if (e.id === esimId) {
          const nextUsed = Math.min(e.dataTotalGb, e.dataUsedGb + 0.5);
          return { ...e, dataUsedGb: parseFloat(nextUsed.toFixed(1)) };
        }
        return e;
      })
    );
  };

  return (
    <div className="space-y-8">
      {/* eSIM Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 sm:p-8 border border-blue-500/20 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-3">
            <Cpu className="w-3.5 h-3.5" />
            {lang === 'ha' ? 'Hanyar Sadarwa ta Zamani' : 'Digital Cellular Roaming'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t.esimTitle}
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            {t.esimDesc}
          </p>
        </div>
      </div>

      {/* Active eSIM Profiles Section (if any exist) */}
      {activeEsims.length > 0 && (
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              {t.activeEsimsHeader}
            </h3>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              {activeEsims.length} Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeEsims.map((esim) => {
              const usedPercent = Math.min(100, Math.round((esim.dataUsedGb / esim.dataTotalGb) * 100));
              return (
                <div key={esim.id} className="p-5 rounded-2xl bg-slate-950 border border-blue-500/30 shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{esim.flag}</span>
                      <div>
                        <h4 className="font-bold text-white text-base">{esim.title}</h4>
                        <p className="text-xs text-slate-400">{esim.countryName}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                      {lang === 'ha' ? 'Kyakkyawan Sauri 5G' : 'Connected 5G'}
                    </span>
                  </div>

                  {/* QR Code & Installation Details */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <div 
                      className="shrink-0"
                      dangerouslySetInnerHTML={{ __html: esim.qrCodeSvg }} 
                    />
                    <div className="space-y-2 w-full text-xs text-slate-300 font-mono">
                      <p className="text-[10px] text-slate-400 uppercase font-sans font-bold">
                        {t.manualActivation}
                      </p>
                      <div>
                        <span className="text-slate-400 font-sans block">{t.smdpAddress}:</span>
                        <div className="flex items-center justify-between bg-slate-950 p-1.5 rounded border border-slate-800">
                          <span className="truncate text-cyan-300">{esim.smdpAddress}</span>
                          <button
                            onClick={() => handleCopy(esim.smdpAddress, `smdp_${esim.id}`)}
                            className="p-1 hover:text-white text-slate-400"
                          >
                            {copiedField === `smdp_${esim.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 font-sans block">{t.activationCode}:</span>
                        <div className="flex items-center justify-between bg-slate-950 p-1.5 rounded border border-slate-800">
                          <span className="truncate text-cyan-300">{esim.activationCode}</span>
                          <button
                            onClick={() => handleCopy(esim.activationCode, `code_${esim.id}`)}
                            className="p-1 hover:text-white text-slate-400"
                          >
                            {copiedField === `code_${esim.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Data Usage Progress Meter */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{t.dataUsage}</span>
                      <span className="font-bold text-white">
                        {esim.dataTotalGb === 999 ? 'Unlimited 5G Data' : `${esim.dataUsedGb} GB / ${esim.dataTotalGb} GB (${usedPercent}%)`}
                      </span>
                    </div>
                    {esim.dataTotalGb !== 999 && (
                      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${usedPercent}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Speed Test & Simulate Usage Controls */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleRunSpeedTest(esim.id)}
                      disabled={speedTestingId === esim.id}
                      className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Zap className={`w-3.5 h-3.5 text-blue-400 ${speedTestingId === esim.id ? 'animate-bounce' : ''}`} />
                      <span>
                        {speedTestingId === esim.id
                          ? (lang === 'ha' ? 'Ana Gwada Sauri...' : 'Testing Speed...')
                          : t.speedTest}
                      </span>
                    </button>

                    {testSpeedMbps !== null && speedTestingId === null && (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5" />
                        {testSpeedMbps} Mbps 5G
                      </span>
                    )}

                    {esim.dataTotalGb !== 999 && (
                      <button
                        onClick={() => handleConsumeData(esim.id)}
                        className="text-xs text-slate-400 hover:text-cyan-300 transition"
                      >
                        + 0.5GB Data
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available eSIM Plans Store */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
        {/* Controls: Region Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
          {/* Region Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
            {['All', 'Africa', 'Middle East', 'Europe', 'Americas', 'Asia'].map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedRegion === reg
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {reg === 'All' ? t.regionAll : reg}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchCountry}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="group p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-950 transition duration-200 shadow-lg flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{plan.flag}</span>
                    <div>
                      <h4 className="font-bold text-white text-sm group-hover:text-blue-300 transition">
                        {plan.countryName}
                      </h4>
                      <p className="text-[11px] text-slate-400">{plan.coverage}</p>
                    </div>
                  </div>
                  {plan.isUnlimited && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                      Unlimited
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-black text-white">
                      {plan.isUnlimited ? '∞ Data' : `${plan.dataAmountGb} GB`}
                    </span>
                    <span className="text-xs text-slate-400">
                      {plan.durationDays} {lang === 'ha' ? 'Kwana' : 'Days'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    Network: {plan.networkPartners.join(', ')}
                  </p>
                </div>
              </div>

              {/* Price & Activate Button */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">{t.price}</span>
                  <span className="text-base font-extrabold text-emerald-400">
                    {formatPrice(plan.priceUsd, currency)}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedEsimModalPlan(plan)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-900/30 transition flex items-center gap-1.5"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{t.buyEsimPlan}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation & Installation Modal */}
      {selectedEsimModalPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-400" />
                {selectedEsimModalPlan.title}
              </h3>
              <button
                onClick={() => setSelectedEsimModalPlan(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">{t.countryName}:</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <span>{selectedEsimModalPlan.flag}</span> {selectedEsimModalPlan.countryName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.dataUsage}:</span>
                <span className="font-bold text-white">
                  {selectedEsimModalPlan.isUnlimited ? 'Unlimited 5G Data' : `${selectedEsimModalPlan.dataAmountGb} GB`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.duration}:</span>
                <span className="font-bold text-white">{selectedEsimModalPlan.durationDays} Days</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 text-sm">
                <span className="font-bold text-slate-300">{t.price}:</span>
                <span className="font-extrabold text-emerald-400">
                  {formatPrice(selectedEsimModalPlan.priceUsd, currency)}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                {lang === 'ha' ? 'Tsarin Sakawa nan take (Instant QR Installation)' : 'Instant Digital Profile'}
              </p>
              <p className="text-[11px] text-blue-300/80 leading-relaxed">
                {lang === 'ha'
                  ? 'Bayan ka kammala, za ka samu hoton QR Code domin sacewa a wayarka (iPhone ko Android) sannan Data zata fara aiki nan take.'
                  : 'Scan the QR code directly from your smartphone settings (Cellular -> Add eSIM) to connect immediately.'}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSelectedEsimModalPlan(null)}
                className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => handleActivatePlan(selectedEsimModalPlan)}
                disabled={isActivating}
                className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isActivating ? (
                  <span>{lang === 'ha' ? 'Ana Buɗewa...' : 'Activating...'}</span>
                ) : (
                  <span>{t.buyEsimPlan}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
