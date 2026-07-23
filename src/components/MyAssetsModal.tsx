import React, { useState } from 'react';
import { 
  Cpu, 
  Smartphone, 
  X, 
  Layers, 
  Copy, 
  Check, 
  Download, 
  MessageSquare,
  Clock
} from 'lucide-react';
import { Currency, Language, EsimActive, VirtualNumberActive } from '../types';
import { translations } from '../utils/translations';

interface MyAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currency: Currency;
  activeEsims: EsimActive[];
  activeNumbers: VirtualNumberActive[];
}

export const MyAssetsModal: React.FC<MyAssetsModalProps> = ({
  isOpen,
  onClose,
  lang,
  currency,
  activeEsims,
  activeNumbers
}) => {
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'esims' | 'numbers'>('esims');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 animate-scaleUp max-h-[85vh] flex flex-col justify-between">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {lang === 'ha' ? 'Sadarwarka & Lambobinka' : 'My Active Subscriptions & Lines'}
                </h3>
                <p className="text-xs text-slate-400">
                  {activeEsims.length} eSIMs • {activeNumbers.length} Virtual Numbers
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub-tabs */}
          <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('esims')}
              className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'esims' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>eSIM ({activeEsims.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('numbers')}
              className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'numbers' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{lang === 'ha' ? 'Lambobi' : 'Numbers'} ({activeNumbers.length})</span>
            </button>
          </div>

          {/* List Content */}
          <div className="space-y-4 overflow-y-auto max-h-[420px] pr-1">
            {activeTab === 'esims' ? (
              activeEsims.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <Cpu className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-xs font-semibold">Babu eSIM mai aiki a yanzu.</p>
                </div>
              ) : (
                activeEsims.map((esim) => (
                  <div key={esim.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{esim.flag}</span>
                        <div>
                          <h4 className="font-bold text-white text-sm">{esim.title}</h4>
                          <p className="text-[10px] text-slate-400">{esim.countryName}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        5G Active
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">SM-DP+:</span>
                        <span>{esim.smdpAddress}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-sans">Activation Code:</span>
                        <div className="flex items-center gap-1">
                          <span className="truncate max-w-[180px]">{esim.activationCode}</span>
                          <button
                            onClick={() => handleCopy(esim.activationCode, esim.id)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            {copiedId === esim.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              activeNumbers.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <Smartphone className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-xs font-semibold">Babu lambar waya mai aiki a yanzu.</p>
                </div>
              ) : (
                activeNumbers.map((num) => (
                  <div key={num.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{num.flag}</span>
                        <div>
                          <h4 className="font-mono font-bold text-white text-sm">{num.phoneNumber}</h4>
                          <p className="text-[10px] text-cyan-400 font-bold">{num.serviceName} • {num.countryName}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopy(num.phoneNumber, num.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
                      >
                        {copiedId === num.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{num.messages.length} {lang === 'ha' ? 'Sakonnin SMS sun iso' : 'messages received'}</span>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
        >
          {t.close}
        </button>
      </div>
    </div>
  );
};
