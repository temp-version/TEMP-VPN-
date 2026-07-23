import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Copy, 
  Check, 
  RefreshCw, 
  Send, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  MessageSquare, 
  Facebook as FacebookIcon, 
  Video, 
  Mail, 
  Camera, 
  ShieldCheck,
  Phone,
  Info,
  Trash2,
  Globe,
  Search,
  BotMessageSquare,
  Volume2
} from 'lucide-react';
import { Currency, Language, VirtualNumberActive, SmsMessage } from '../types';
import { POPULAR_COUNTRIES, APP_SERVICES, formatPrice } from '../data/countriesAndServices';
import { translations } from '../utils/translations';
import { playSmsChime } from '../utils/audio';

interface VirtualNumbersTabProps {
  lang: Language;
  currency: Currency;
  walletBalanceUsd: number;
  activeNumbers: VirtualNumberActive[];
  setActiveNumbers: React.Dispatch<React.SetStateAction<VirtualNumberActive[]>>;
  deductBalance: (amountUsd: number, description: string) => boolean;
  openWalletModal: () => void;
}

export const VirtualNumbersTab: React.FC<VirtualNumbersTabProps> = ({
  lang,
  currency,
  walletBalanceUsd,
  activeNumbers,
  setActiveNumbers,
  deductBalance,
  openWalletModal
}) => {
  const t = translations[lang];

  // Region & Country Search State
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [countrySearchQuery, setCountrySearchQuery] = useState<string>('');

  // Form State
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('US');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('whatsapp');
  const [rentalType, setRentalType] = useState<'otp_single' | 'rental_30d'>('otp_single');
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
  const [copiedOtpId, setCopiedOtpId] = useState<string | null>(null);
  const [copiedNumberId, setCopiedNumberId] = useState<string | null>(null);
  const [selectedActiveNumberId, setSelectedActiveNumberId] = useState<string | null>(null);

  // Gemini AI Assistant State
  const [showAiAdvisor, setShowAiAdvisor] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Filter countries by region and search
  const filteredCountries = POPULAR_COUNTRIES.filter((country) => {
    const matchesRegion = selectedRegion === 'All' || country.region === selectedRegion;
    const searchLower = countrySearchQuery.toLowerCase();
    const matchesSearch =
      country.nameEn.toLowerCase().includes(searchLower) ||
      country.nameHa.toLowerCase().includes(searchLower) ||
      country.dialCode.includes(searchLower) ||
      country.code.toLowerCase().includes(searchLower);
    return matchesRegion && matchesSearch;
  });

  const selectedCountry = POPULAR_COUNTRIES.find(c => c.code === selectedCountryCode) || POPULAR_COUNTRIES[0];
  const selectedService = APP_SERVICES.find(s => s.id === selectedServiceId) || APP_SERVICES[0];

  // Pricing calculation
  const basePriceUsd = selectedCountry.virtualNumberStartingPriceUsd;
  const finalPriceUsd = rentalType === 'otp_single' ? basePriceUsd : Math.max(2.50, basePriceUsd * 4.5);

  // Load Active Numbers from Backend API on mount
  useEffect(() => {
    const fetchActiveNumbers = async () => {
      try {
        const res = await fetch('/api/virtual-numbers/active');
        const data = await res.json();
        if (data.success && data.numbers && data.numbers.length > 0) {
          setActiveNumbers(data.numbers);
          if (!selectedActiveNumberId) {
            setSelectedActiveNumberId(data.numbers[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch numbers from server:', err);
      }
    };
    fetchActiveNumbers();
  }, []);

  // Poll SMS Inbox for active selected line
  useEffect(() => {
    if (!selectedActiveNumberId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/virtual-numbers/inbox/${selectedActiveNumberId}`);
        const data = await res.json();
        if (data.success && data.messages) {
          setActiveNumbers(prev =>
            prev.map(num => {
              if (num.id === selectedActiveNumberId) {
                // If new message arrived play sound
                if (data.messages.length > num.messages.length) {
                  playSmsChime();
                }
                return { ...num, messages: data.messages };
              }
              return num;
            })
          );
        }
      } catch (err) {
        // silent polling error
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedActiveNumberId]);

  const handlePurchase = async () => {
    if (walletBalanceUsd < finalPriceUsd) {
      alert(lang === 'ha' ? 'Kudinka bai kai ba! Tura kudi a cikin Wallet dinka.' : 'Insufficient wallet balance! Please top up your wallet.');
      openWalletModal();
      return;
    }

    setIsPurchasing(true);

    try {
      const response = await fetch('/api/virtual-numbers/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode: selectedCountry.code,
          countryName: lang === 'ha' ? selectedCountry.nameHa : selectedCountry.nameEn,
          flag: selectedCountry.flag,
          dialCode: selectedCountry.dialCode,
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          type: rentalType,
          priceUsd: finalPriceUsd
        })
      });

      const data = await response.json();

      if (data.success && data.number) {
        const description = `${selectedService.name} Virtual Number (${selectedCountry.flag} ${data.number.phoneNumber})`;
        const success = deductBalance(finalPriceUsd, description);

        if (success) {
          setActiveNumbers(prev => [data.number, ...prev]);
          setSelectedActiveNumberId(data.number.id);
        }
      }
    } catch (err) {
      console.error('Error ordering virtual number:', err);
    } finally {
      setIsPurchasing(false);
    }
  };

  // Trigger test verification SMS via Server API
  const handleSimulateTestSms = async (numId: string) => {
    const target = activeNumbers.find(n => n.id === numId);
    if (!target) return;

    try {
      const response = await fetch('/api/virtual-numbers/simulate-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numberId: numId,
          sender: target.serviceName,
          text: `Your ${target.serviceName} verification OTP code is ${Math.floor(100000 + Math.random() * 900000)}. Do not share with anyone.`
        })
      });

      const data = await response.json();
      if (data.success && data.incomingSms) {
        playSmsChime();
        setActiveNumbers(prev =>
          prev.map(num => {
            if (num.id === numId) {
              return {
                ...num,
                status: 'active',
                messages: [data.incomingSms, ...num.messages]
              };
            }
            return num;
          })
        );
      }
    } catch (err) {
      console.error('Simulation SMS failed:', err);
    }
  };

  const handleAskGeminiAi = async () => {
    setIsAiLoading(true);
    setAiResponse(null);

    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt || `Which virtual number country is best for ${selectedService.name} verification?`,
          lang
        })
      });

      const data = await response.json();
      if (data.success) {
        setAiResponse(data.recommendation);
      }
    } catch (err) {
      console.error('AI query error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopy = (text: string, type: 'otp' | 'num', id: string) => {
    navigator.clipboard.writeText(text);
    if (type === 'otp') {
      setCopiedOtpId(id);
      setTimeout(() => setCopiedOtpId(null), 2000);
    } else {
      setCopiedNumberId(id);
      setTimeout(() => setCopiedNumberId(null), 2000);
    }
  };

  const handleDeleteNumber = (id: string) => {
    setActiveNumbers(prev => prev.filter(n => n.id !== id));
    if (selectedActiveNumberId === id) {
      setSelectedActiveNumberId(null);
    }
  };

  // Helper for service icon
  const renderServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquare': return <MessageSquare className="w-5 h-5 text-emerald-400" />;
      case 'Facebook': return <FacebookIcon className="w-5 h-5 text-blue-400" />;
      case 'Video': return <Video className="w-5 h-5 text-pink-500" />;
      case 'Send': return <Send className="w-5 h-5 text-sky-400" />;
      case 'Mail': return <Mail className="w-5 h-5 text-red-400" />;
      case 'Camera': return <Camera className="w-5 h-5 text-amber-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
      default: return <Smartphone className="w-5 h-5 text-cyan-400" />;
    }
  };

  const activeNum = activeNumbers.find(n => n.id === selectedActiveNumberId) || activeNumbers[0];

  return (
    <div className="space-y-8">
      {/* Top Hero / Intro Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 border border-cyan-500/30 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            {lang === 'ha' ? 'Sayan Lambobi & SMS Live Webhook API' : 'Production Virtual Numbers & Live SMS Webhook API'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {lang === 'ha'
              ? 'Bude Lambar Waya don WhatsApp, TikTok, Facebook da Banki'
              : 'Activate Virtual Numbers for WhatsApp, TikTok, Facebook & SMS'}
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            {lang === 'ha'
              ? 'Zabi lamba daga Amurka, UK, Najeriya, Saudiyya ko kowace kasa a duniya. Karbi lambar OTP ta tabbatarwa nan take a cikakken akwatin sakonni.'
              : 'Get non-VoIP virtual numbers from 60+ countries worldwide. Receive real SMS verification codes instantly in your live web inbox.'}
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setShowAiAdvisor(!showAiAdvisor)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center gap-2 transition"
            >
              <BotMessageSquare className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'ha' ? 'Tambayi Gemini AI' : 'Ask Gemini AI Advisor'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gemini AI Advisor Drawer */}
      {showAiAdvisor && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/40 shadow-xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BotMessageSquare className="w-4 h-4 text-cyan-400" />
              {lang === 'ha' ? 'Gemini AI Shawarwari game da Lambobin Waya' : 'Gemini AI Telecommunication Advisor'}
            </h4>
            <button onClick={() => setShowAiAdvisor(false)} className="text-xs text-slate-400 hover:text-white">
              Close
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder={lang === 'ha' ? 'Misali: Wace kasa ce tafi kyau don karbar OTP na WhatsApp?' : 'e.g., Which country is best for WhatsApp OTP verification?'}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleAskGeminiAi}
              disabled={isAiLoading}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {isAiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{lang === 'ha' ? 'Tambaya' : 'Ask AI'}</span>
            </button>
          </div>

          {aiResponse && (
            <div className="p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-xs text-indigo-200 leading-relaxed font-sans">
              <strong>{lang === 'ha' ? 'Shawarar AI:' : 'AI Advice:'}</strong> {aiResponse}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Number Order Configurator */}
        <div className="lg:col-span-5 space-y-6 bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            {t.getNewNumber}
          </h3>

          {/* Region Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              1. {lang === 'ha' ? 'Zabi Yankin Kasa' : 'Select World Region'}
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {['All', 'Africa', 'Americas', 'Europe', 'Asia', 'Middle East'].map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                    selectedRegion === reg
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {reg === 'All' ? '🌐 All' : reg}
                </button>
              ))}
            </div>

            {/* Country Search Filter */}
            <div className="relative mt-2">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={countrySearchQuery}
                onChange={(e) => setCountrySearchQuery(e.target.value)}
                placeholder={lang === 'ha' ? 'Bincika kasa ko lambar kasa (+234, +1...)' : 'Search country or code (+1, +234, +44...)'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Countries Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1 mt-2">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => setSelectedCountryCode(country.code)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs transition ${
                    selectedCountryCode === country.code
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500/50 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg shrink-0">{country.flag}</span>
                  <div className="truncate">
                    <p className="font-semibold text-white truncate">
                      {lang === 'ha' ? country.nameHa : country.nameEn}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">{country.dialCode}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Service / App Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              2. {t.selectService}
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {APP_SERVICES.map((srv) => (
                <button
                  key={srv.id}
                  onClick={() => setSelectedServiceId(srv.id)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs font-medium text-left transition ${
                    selectedServiceId === srv.id
                      ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/50 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="p-1 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                    {renderServiceIcon(srv.iconName)}
                  </div>
                  <span className="truncate">{srv.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Activation Duration */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              3. {lang === 'ha' ? 'Tsawon Amfani da Lamba' : 'Rental Duration'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setRentalType('otp_single')}
                className={`p-3 rounded-xl border text-left transition ${
                  rentalType === 'otp_single'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{t.otpSingle}</span>
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {lang === 'ha' ? 'Minti 20 don OTP nan take' : '20-min SMS window'}
                </p>
                <p className="text-xs font-bold text-emerald-400 mt-2 font-mono">
                  {formatPrice(basePriceUsd, currency)}
                </p>
              </button>

              <button
                onClick={() => setRentalType('rental_30d')}
                className={`p-3 rounded-xl border text-left transition ${
                  rentalType === 'rental_30d'
                    ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/50'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{t.rental30d}</span>
                  <Phone className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {lang === 'ha' ? 'Kwana 30 da Kira & SMS' : '30-day dedicated line'}
                </p>
                <p className="text-xs font-bold text-indigo-400 mt-2 font-mono">
                  {formatPrice(Math.max(2.50, basePriceUsd * 4.5), currency)}
                </p>
              </button>
            </div>
          </div>

          {/* Checkout Action Button */}
          <div className="pt-2">
            <button
              onClick={handlePurchase}
              disabled={isPurchasing}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isPurchasing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>{lang === 'ha' ? 'Ana Bude Lamba...' : 'Assigning Line...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>
                    {t.getNewNumber} — {formatPrice(finalPriceUsd, currency)}
                  </span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2 flex items-center justify-center gap-1">
              <ShieldAlert className="w-3 h-3 text-emerald-400" />
              {lang === 'ha' ? 'Miyagun kudi na komawa idan sakon bai iso ba.' : 'Auto-refund guarantee if SMS code is not received.'}
            </p>
          </div>
        </div>

        {/* Right Column: Active Inboxes & Messages Dashboard */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl min-h-[520px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-400" />
                  {t.activeInboxes}
                </h3>
                {activeNumbers.length > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    {activeNumbers.length} {lang === 'ha' ? 'Masu Aiki' : 'Active'}
                  </span>
                )}
              </div>

              {/* List of Active Virtual Numbers Selector Tabs */}
              {activeNumbers.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-500">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto">
                    <p className="text-slate-300 font-semibold">{t.noActiveNumbers}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {lang === 'ha'
                        ? 'Idan ka bude lamba, sakonnin SMS za su dinga isowa nan da nan.'
                        : 'Select a country and app on the left to instantly generate a line and receive SMS codes.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-6">
                  {/* Select active line chip bar */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {activeNumbers.map((num) => {
                      const isSelected = activeNum?.id === num.id;
                      return (
                        <button
                          key={num.id}
                          onClick={() => setSelectedActiveNumberId(num.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition border ${
                            isSelected
                              ? 'bg-cyan-950 text-cyan-200 border-cyan-500 ring-1 ring-cyan-500/40'
                              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          <span>{num.flag}</span>
                          <span className="font-mono font-bold text-white">{num.phoneNumber}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-cyan-400">
                            {num.serviceName}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Line Card */}
                  {activeNum && (
                    <div className="bg-slate-950/80 rounded-2xl p-5 border border-cyan-500/30 shadow-lg space-y-4">
                      {/* Top Header of Selected Line */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{activeNum.flag}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-mono font-bold text-white tracking-wider">
                                {activeNum.phoneNumber}
                              </span>
                              <button
                                onClick={() => handleCopy(activeNum.phoneNumber, 'num', activeNum.id)}
                                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                                title="Copy Phone Number"
                              >
                                {copiedNumberId === activeNum.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            <p className="text-xs text-slate-400 flex items-center gap-2">
                              <span className="text-cyan-400 font-semibold">{activeNum.serviceName}</span>
                              <span>•</span>
                              <span>{activeNum.countryName}</span>
                            </p>
                          </div>
                        </div>

                        {/* Actions: Test SMS & Delete */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSimulateTestSms(activeNum.id)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow flex items-center gap-1.5 transition"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{t.simulatedTestSms}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteNumber(activeNum.id)}
                            className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-400 border border-red-800/40 transition"
                            title="Remove line"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Live SMS Message List */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                            {t.waitingForSms}
                          </span>
                          <span>{activeNum.messages.length} {lang === 'ha' ? 'Sakonni' : 'messages'}</span>
                        </div>

                        {activeNum.messages.length === 0 ? (
                          <div className="p-8 text-center bg-slate-900/60 rounded-xl border border-dashed border-slate-800 space-y-2">
                            <p className="text-xs text-slate-300 font-medium">
                              {lang === 'ha'
                                ? 'Shigar da wannan lambar a cikin WhatsApp ko TikTok. Da zarar sakon OTP ya iso, za ka gani a nan nan take!'
                                : 'Enter this phone number into WhatsApp, Facebook or TikTok. As soon as the SMS is sent, it will appear here immediately!'}
                            </p>
                            <button
                              onClick={() => handleSimulateTestSms(activeNum.id)}
                              className="mt-2 text-xs text-cyan-400 hover:underline font-semibold inline-flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3" />
                              {t.simulatedTestSms}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                            {activeNum.messages.map((msg) => (
                              <div
                                key={msg.id}
                                className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 shadow-md space-y-2 animate-fadeIn"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    {msg.sender}
                                  </span>
                                  <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                                </div>
                                <p className="text-xs text-slate-200 leading-relaxed font-mono">
                                  {msg.text}
                                </p>

                                {msg.otpCode && (
                                  <div className="pt-2 flex items-center justify-between bg-indigo-950/60 p-2.5 rounded-lg border border-indigo-500/40">
                                    <div>
                                      <span className="text-[10px] text-indigo-300 block uppercase font-semibold">
                                        {lang === 'ha' ? 'Lambar Sirri (OTP)' : 'Verification Code'}
                                      </span>
                                      <span className="text-lg font-mono font-extrabold text-amber-300 tracking-widest">
                                        {msg.otpCode}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleCopy(msg.otpCode!, 'otp', msg.id)}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
                                    >
                                      {copiedOtpId === msg.id ? (
                                        <>
                                          <Check className="w-3.5 h-3.5 text-emerald-200" />
                                          <span>{t.copied}</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3.5 h-3.5" />
                                          <span>{t.copyOtp}</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Webhook Info */}
            <div className="mt-6 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <Globe className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'ha'
                  ? 'Gidan sadarwar mu na dauke da Webhook Endpoint mai haɗa gaske da sadarwar SMS. Kuna samun sakonni ba tare da jinkiri ba.'
                  : 'Live SMS Webhook receiver is operational on /api/webhooks/sms. Real incoming carrier SMS notifications will populate instantly.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
