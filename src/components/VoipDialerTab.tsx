import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneCall, 
  PhoneOff, 
  Mic, 
  MicOff, 
  PhoneIncoming, 
  Clock, 
  Globe, 
  Volume2, 
  Sparkles, 
  Delete, 
  CheckCircle2,
  PhoneForwarded,
  Info,
  Languages,
  Radio
} from 'lucide-react';
import { Currency, Language, CallLog } from '../types';
import { POPULAR_COUNTRIES, formatPrice } from '../data/countriesAndServices';
import { translations } from '../utils/translations';
import { playDtmfTone, startRingbackTone, stopRingbackTone, playIncomingRing } from '../utils/audio';

interface VoipDialerTabProps {
  lang: Language;
  currency: Currency;
  walletBalanceUsd: number;
  callLogs: CallLog[];
  setCallLogs: React.Dispatch<React.SetStateAction<CallLog[]>>;
  deductBalance: (amountUsd: number, description: string) => boolean;
  openWalletModal: () => void;
}

// Convert spoken voice transcript into standardized phone number digits
const parseSpokenToPhoneNumber = (text: string): string => {
  if (!text) return '';

  const words = text.toLowerCase().trim().split(/\s+/);
  let result = '';
  
  const digitMap: Record<string, string> = {
    'plus': '+',
    'zero': '0', 'oh': '0', 'sifili': '0', 'ziro': '0',
    'one': '1', 'daya': '1', 'ɗaya': '1',
    'two': '2', 'to': '2', 'too': '2', 'biyu': '2',
    'three': '3', 'uku': '3',
    'four': '4', 'for': '4', 'hudu': '4', 'huɗu': '4',
    'five': '5', 'biyar': '5',
    'six': '6', 'shida': '6',
    'seven': '7', 'bakwai': '7',
    'eight': '8', 'takwas': '8',
    'nine': '9', 'tara': '9',
    'star': '*', 'tauraro': '*',
    'hash': '#', 'pound': '#', 'chabi': '#', 'mabuɗi': '#'
  };

  let multiplier = 1;

  for (let i = 0; i < words.length; i++) {
    const rawWord = words[i].replace(/[^a-z0-9+#*]/gi, '');
    if (!rawWord) continue;

    if (rawWord === 'double' || rawWord === 'ninki') {
      multiplier = 2;
      continue;
    } else if (rawWord === 'triple') {
      multiplier = 3;
      continue;
    }

    // Direct digits or plus symbols in word
    if (/^[0-9+#*]+$/.test(rawWord)) {
      for (let m = 0; m < multiplier; m++) {
        result += rawWord;
      }
      multiplier = 1;
      continue;
    }

    if (digitMap[rawWord] !== undefined) {
      for (let m = 0; m < multiplier; m++) {
        result += digitMap[rawWord];
      }
      multiplier = 1;
      continue;
    }
  }

  // Fallback: extract digits and plus symbol if text didn't map word-by-word
  if (!result) {
    result = text.replace(/[^0-9+#*]/g, '');
  }

  // Preserve leading plus if text started with plus or +
  if ((text.trim().toLowerCase().startsWith('plus') || text.trim().startsWith('+')) && !result.startsWith('+')) {
    result = '+' + result.replace(/^\+/, '');
  }

  return result;
};

export const VoipDialerTab: React.FC<VoipDialerTabProps> = ({
  lang,
  currency,
  walletBalanceUsd,
  callLogs,
  setCallLogs,
  deductBalance,
  openWalletModal
}) => {
  const t = translations[lang];

  const [dialNumber, setDialNumber] = useState<string>('+1 ');
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('US');
  const [callState, setCallState] = useState<'idle' | 'dialing' | 'connected' | 'incoming'>('idle');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [incomingCallerNumber, setIncomingCallerNumber] = useState<string>('+1 (202) 555-0199');

  // Web Speech API States
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speechLang, setSpeechLang] = useState<'en-US' | 'ha-NG'>(lang === 'ha' ? 'ha-NG' : 'en-US');
  const recognitionRef = useRef<any>(null);

  const selectedCountry = POPULAR_COUNTRIES.find(c => c.code === selectedCountryCode) || POPULAR_COUNTRIES[0];

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  // Update speech lang when app language toggles
  useEffect(() => {
    setSpeechLang(lang === 'ha' ? 'ha-NG' : 'en-US');
  }, [lang]);

  // Call timer effect
  useEffect(() => {
    let timer: number;
    if (callState === 'connected') {
      timer = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callState]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Speech Dictation Handler
  const toggleDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        lang === 'ha'
          ? 'Binciken magana (Web Speech API) ba ya aiki a wannan burawsa ba.'
          : 'Web Speech API is not supported in this browser. You can still use manual typing or simulation.'
      );
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLang;

      setSpeechError(null);
      setRecognizedText('');

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const combined = finalTranscript || interimTranscript;
        setRecognizedText(combined);

        const parsedDigits = parseSpokenToPhoneNumber(combined);
        if (parsedDigits) {
          setDialNumber(parsedDigits);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError(
            lang === 'ha'
              ? 'An hana izinin maikurofo. Da fatan za ka ba da izini a burawsa.'
              : 'Microphone permission denied. Please allow microphone access.'
          );
        } else if (event.error === 'no-speech') {
          setSpeechError(
            lang === 'ha'
              ? 'Ba a ji magana ba. Da fatan za ka fada lambobin a fili.'
              : 'No speech detected. Please speak numbers clearly.'
          );
        } else {
          setSpeechError(`Speech error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setSpeechError(lang === 'ha' ? 'An samu kuskure wajen kunna dictation.' : 'Failed to start voice dictation.');
      setIsListening(false);
    }
  };

  // Simulated Voice Dictation for testing
  const handleSimulateVoiceDictation = (sampleText: string) => {
    setRecognizedText(sampleText);
    const parsed = parseSpokenToPhoneNumber(sampleText);
    if (parsed) {
      setDialNumber(parsed);
    }
  };

  // Keypad press handler
  const handleKeypadPress = (val: string) => {
    playDtmfTone(val);
    setDialNumber(prev => prev + val);
  };

  const handleBackspace = () => {
    setDialNumber(prev => prev.slice(0, -1));
  };

  const handleCountryChange = (code: string) => {
    setSelectedCountryCode(code);
    const country = POPULAR_COUNTRIES.find(c => c.code === code);
    if (country) {
      setDialNumber(`${country.dialCode} `);
    }
  };

  // Start Outgoing Call
  const handleStartCall = () => {
    const rawNumber = dialNumber.trim();
    if (rawNumber.length < 5) {
      alert(lang === 'ha' ? 'Shigar da lambar waya mai kyau!' : 'Please enter a valid phone number with country code!');
      return;
    }

    if (walletBalanceUsd < 0.10) {
      alert(lang === 'ha' ? 'Kudinka ya yi karanci wajen yin kira!' : 'Wallet balance too low for international call!');
      openWalletModal();
      return;
    }

    // Stop listening if dictation is on
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    }

    setCallState('dialing');
    startRingbackTone();

    // Auto connect after 3.5s
    setTimeout(() => {
      stopRingbackTone();
      setCallState('connected');
    }, 3500);
  };

  // End Call
  const handleEndCall = () => {
    stopRingbackTone();
    
    if (callState === 'connected' && callDuration > 0) {
      const minutes = Math.max(1, Math.ceil(callDuration / 60));
      const costUsd = minutes * selectedCountry.voipRateUsdPerMin;
      
      const newLog: CallLog = {
        id: `call_${Date.now()}`,
        phoneNumber: dialNumber,
        countryCode: selectedCountry.code,
        type: 'outgoing',
        durationSeconds: callDuration,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        costUsd
      };

      deductBalance(costUsd, `VOIP Call to ${dialNumber} (${minutes} min)`);
      setCallLogs(prev => [newLog, ...prev]);
    }

    setCallState('idle');
  };

  // Trigger Incoming Call Simulation
  const handleTriggerIncomingCall = () => {
    playIncomingRing();
    const randomCountry = POPULAR_COUNTRIES[Math.floor(Math.random() * POPULAR_COUNTRIES.length)];
    const randomDigits = Math.floor(100000000 + Math.random() * 900000000);
    setIncomingCallerNumber(`${randomCountry.dialCode} ${randomDigits}`);
    setCallState('incoming');
  };

  const handleAcceptIncomingCall = () => {
    setCallState('connected');
    setDialNumber(incomingCallerNumber);
  };

  const handleDeclineIncomingCall = () => {
    setCallState('idle');
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 sm:p-8 border border-emerald-500/20 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
            <PhoneCall className="w-3.5 h-3.5" />
            {lang === 'ha' ? 'Kiran Waya na Salula da VOIP' : 'Global Crystal-Clear VOIP Calling'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t.voipTitle}
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            {t.voipDesc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Web Phone Dialer with Web Speech API */}
        <div className="lg:col-span-6 bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              {lang === 'ha' ? 'Keypad din Dial Waya' : 'International Phone Dialer'}
            </h3>

            {/* Country Selector for Rate */}
            <select
              value={selectedCountryCode}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs font-semibold text-emerald-400 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              {POPULAR_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {lang === 'ha' ? c.nameHa : c.nameEn} ({c.dialCode})
                </option>
              ))}
            </select>
          </div>

          {/* Active Call Screen OR Phone Keypad */}
          {callState === 'dialing' || callState === 'connected' ? (
            <div className="p-8 rounded-2xl bg-slate-950 border border-emerald-500/40 shadow-2xl text-center space-y-6 animate-fadeIn">
              <div className="relative w-24 h-24 mx-auto rounded-full bg-emerald-950/80 border-2 border-emerald-400/60 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <PhoneCall className={`w-10 h-10 text-emerald-400 ${callState === 'dialing' ? 'animate-bounce' : ''}`} />
                {callState === 'connected' && (
                  <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 animate-ping" />
                )}
              </div>

              <div>
                <p className="text-2xl font-mono font-bold text-white tracking-widest">{dialNumber}</p>
                <p className="text-xs text-emerald-400 font-semibold mt-1">
                  {callState === 'dialing' ? t.calling : `${t.connected} (${formatTimer(callDuration)})`}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {selectedCountry.flag} {selectedCountry.nameEn} • {formatPrice(selectedCountry.voipRateUsdPerMin, currency)}/min
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3.5 rounded-full border transition ${
                    isMuted ? 'bg-red-600 text-white border-red-500' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                  title="Mute Mic"
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  onClick={handleEndCall}
                  className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-900/40 transition ring-4 ring-red-950"
                  title={t.endCall}
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </div>
            </div>
          ) : callState === 'incoming' ? (
            /* Incoming Call Screen */
            <div className="p-8 rounded-2xl bg-indigo-950/90 border border-indigo-500/50 shadow-2xl text-center space-y-6 animate-pulse">
              <div className="w-20 h-20 mx-auto rounded-full bg-indigo-900 border-2 border-indigo-400 flex items-center justify-center text-indigo-200">
                <PhoneIncoming className="w-9 h-9 animate-bounce" />
              </div>
              <div>
                <span className="px-3 py-1 rounded-full bg-indigo-800/80 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                  {lang === 'ha' ? 'Kira yana Isowa na Salula' : 'Incoming International Call'}
                </span>
                <p className="text-2xl font-mono font-bold text-white tracking-widest mt-2">
                  {incomingCallerNumber}
                </p>
              </div>

              <div className="flex items-center justify-center gap-6 pt-2">
                <button
                  onClick={handleDeclineIncomingCall}
                  className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg transition"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
                <button
                  onClick={handleAcceptIncomingCall}
                  className="p-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg transition animate-bounce"
                >
                  <PhoneCall className="w-6 h-6" />
                </button>
              </div>
            </div>
          ) : (
            /* Standard Keypad & Voice Dictation Area */
            <div className="space-y-5">
              {/* Number Display Input with Web Speech API Mic Dictation Button */}
              <div className="relative bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-2 shadow-inner">
                <input
                  type="text"
                  value={dialNumber}
                  onChange={(e) => setDialNumber(e.target.value)}
                  placeholder={t.enterNumber}
                  className="w-full bg-transparent text-xl sm:text-2xl font-mono font-bold text-white tracking-wider focus:outline-none"
                />

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Voice Dictation Button */}
                  <button
                    type="button"
                    onClick={toggleDictation}
                    className={`relative p-2.5 rounded-xl border transition flex items-center gap-1.5 font-semibold text-xs ${
                      isListening
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400 ring-2 ring-rose-500/40 animate-pulse'
                        : 'bg-slate-900 border-slate-700 text-cyan-400 hover:text-cyan-300 hover:bg-slate-800'
                    }`}
                    title={
                      isListening
                        ? (lang === 'ha' ? 'Tsayar da Dictation' : 'Stop Dictating')
                        : (lang === 'ha' ? 'Fadi Lambar Waya (Web Speech)' : 'Dictate Phone Number with Voice')
                    }
                  >
                    {isListening ? (
                      <>
                        <Mic className="w-5 h-5 text-rose-400 animate-spin" />
                        <span className="hidden sm:inline text-rose-300 font-bold">
                          {lang === 'ha' ? 'Sauraro...' : 'Listening...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5 text-cyan-400" />
                        <span className="hidden sm:inline text-cyan-300">
                          {lang === 'ha' ? 'Dictate' : 'Dictate'}
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBackspace}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
                    title="Backspace"
                  >
                    <Delete className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Web Speech Dictation Live Panel & Controls */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <Radio className={`w-3.5 h-3.5 ${isListening ? 'text-rose-400 animate-ping' : 'text-cyan-400'}`} />
                    {lang === 'ha' ? 'Binciken Magana (Web Speech Dictation)' : 'Web Speech Voice Dictation'}
                  </span>

                  {/* Speech Language Toggle */}
                  <button
                    onClick={() => setSpeechLang(prev => prev === 'en-US' ? 'ha-NG' : 'en-US')}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] text-slate-300 hover:text-white transition"
                  >
                    <Languages className="w-3 h-3 text-cyan-400" />
                    <span>{speechLang === 'en-US' ? 'English (en-US)' : 'Hausa (ha-NG)'}</span>
                  </button>
                </div>

                {isListening && (
                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span>
                        {lang === 'ha' 
                          ? 'Fadi lambar waya a fili (e.g., "plus one two zero two five five five..."): '
                          : 'Speak digits clearly (e.g., "plus 1 202 555 0199"): '}
                      </span>
                    </div>
                  </div>
                )}

                {/* Recognized Transcript Display */}
                {recognizedText && (
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-cyan-500/30 text-xs space-y-1">
                    <p className="text-[11px] text-slate-400">
                      {lang === 'ha' ? 'Abinda aka ji (Speech Text):' : 'Spoken Voice Transcript:'}
                    </p>
                    <p className="font-mono text-cyan-300 font-semibold italic">"{recognizedText}"</p>
                    <p className="text-[10px] text-emerald-400 font-bold">
                      ✓ {lang === 'ha' ? 'An juya zuwa lambar waya:' : 'Parsed to phone digits:'} {dialNumber}
                    </p>
                  </div>
                )}

                {speechError && (
                  <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs">
                    ⚠️ {speechError}
                  </div>
                )}

                {/* Voice Dictation Instructions & Quick Simulation Preset Chips */}
                <div className="pt-1 border-t border-slate-900 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-slate-400 font-medium mr-1">
                    {lang === 'ha' ? 'Gwada Fada:' : 'Dictation Test Presets:'}
                  </span>
                  <button
                    onClick={() => handleSimulateVoiceDictation('plus one two zero two five five five zero one nine nine')}
                    className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 transition font-mono"
                  >
                    +1 202 555 0199
                  </button>
                  <button
                    onClick={() => handleSimulateVoiceDictation('plus two three four eight zero three zero zero zero zero zero zero')}
                    className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 transition font-mono"
                  >
                    +234 803 000 0000
                  </button>
                  <button
                    onClick={() => handleSimulateVoiceDictation('plus four four two zero seven nine four six zero one two three')}
                    className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 transition font-mono"
                  >
                    +44 20 7946 0123
                  </button>
                </div>
              </div>

              {/* Dial Pad Grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  ['1', ''], ['2', 'ABC'], ['3', 'DEF'],
                  ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'],
                  ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'],
                  ['*', ''], ['0', '+'], ['#', '']
                ].map(([num, sub]) => (
                  <button
                    key={num}
                    onClick={() => handleKeypadPress(num)}
                    className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 active:bg-cyan-950 border border-slate-700/80 text-white transition text-center shadow-sm"
                  >
                    <span className="text-xl font-bold block">{num}</span>
                    {sub && <span className="text-[9px] text-slate-400 block font-mono">{sub}</span>}
                  </button>
                ))}
              </div>

              {/* Start Call & Trigger Incoming Controls */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleStartCall}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition"
                >
                  <PhoneCall className="w-5 h-5" />
                  <span>{t.callNow}</span>
                </button>

                <button
                  onClick={handleTriggerIncomingCall}
                  className="px-3.5 py-3.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 font-semibold text-xs flex items-center gap-1.5 transition"
                  title="Test Incoming Call"
                >
                  <PhoneIncoming className="w-4 h-4 text-indigo-400" />
                  <span className="hidden sm:inline">{t.simulateIncomingCall}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Call History & Rates */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Clock className="w-5 h-5 text-indigo-400" />
              {t.callLog}
            </h3>

            {callLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <PhoneForwarded className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs font-semibold">{t.noCallHistory}</p>
                <p className="text-[11px] text-slate-600">
                  {lang === 'ha' ? 'Kowane kira da ka yi ko ka karba za ka gani a nan.' : 'Recent voice call records and minute deductions will appear here.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {callLogs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400">
                        <PhoneCall className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-mono font-bold text-white">{log.phoneNumber}</p>
                        <p className="text-[10px] text-slate-400">
                          {log.timestamp} • {Math.ceil(log.durationSeconds / 60)} min
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-400">
                      -{formatPrice(log.costUsd, currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Call Rates Summary Card */}
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-cyan-400" />
              {lang === 'ha' ? 'Farashin Kiran Kasashe' : 'Popular Calling Rates'}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {POPULAR_COUNTRIES.slice(0, 6).map((c) => (
                <div key={c.code} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                  <span className="text-base mr-1.5">{c.flag}</span>
                  <span className="font-semibold text-white">{c.nameEn}</span>
                  <p className="text-[11px] font-bold text-emerald-400 mt-0.5">
                    {formatPrice(c.voipRateUsdPerMin, currency)}/min
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

