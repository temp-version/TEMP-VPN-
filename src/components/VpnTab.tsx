import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Globe, 
  Zap, 
  Activity, 
  Lock, 
  Unlock, 
  Server, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Language, VpnServer, VpnState } from '../types';
import { VPN_SERVERS } from '../data/countriesAndServices';
import { translations } from '../utils/translations';
import { playVpnConnectSound } from '../utils/audio';

interface VpnTabProps {
  lang: Language;
  vpnState: VpnState;
  setVpnState: React.Dispatch<React.SetStateAction<VpnState>>;
}

export const VpnTab: React.FC<VpnTabProps> = ({
  lang,
  vpnState,
  setVpnState
}) => {
  const t = translations[lang];

  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [activeServerId, setActiveServerId] = useState<string>(VPN_SERVERS[0].id);

  // Bandwidth simulation effect when connected
  useEffect(() => {
    let timer: number;
    if (vpnState.isConnected) {
      timer = window.setInterval(() => {
        setVpnState(prev => ({
          ...prev,
          bytesUploaded: prev.bytesUploaded + Math.floor(150 + Math.random() * 400),
          bytesDownloaded: prev.bytesDownloaded + Math.floor(800 + Math.random() * 1800)
        }));
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [vpnState.isConnected, setVpnState]);

  const handleToggleVpn = () => {
    if (vpnState.isConnected) {
      // Disconnect
      setVpnState(prev => ({
        ...prev,
        isConnected: false,
        activeServer: null,
        connectTime: null
      }));
    } else {
      // Connect
      setIsConnecting(true);
      setTimeout(() => {
        const server = VPN_SERVERS.find(s => s.id === activeServerId) || VPN_SERVERS[0];
        playVpnConnectSound();
        setVpnState(prev => ({
          ...prev,
          isConnected: true,
          activeServer: server,
          connectTime: Date.now(),
          ipAddress: server.ipAddress
        }));
        setIsConnecting(false);
      }, 1000);
    }
  };

  const handleServerSelect = (server: VpnServer) => {
    setActiveServerId(server.id);
    if (vpnState.isConnected) {
      setIsConnecting(true);
      setTimeout(() => {
        playVpnConnectSound();
        setVpnState(prev => ({
          ...prev,
          activeServer: server,
          ipAddress: server.ipAddress
        }));
        setIsConnecting(false);
      }, 800);
    }
  };

  const currentServer = vpnState.activeServer || VPN_SERVERS.find(s => s.id === activeServerId) || VPN_SERVERS[0];

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 p-6 sm:p-8 border border-indigo-500/20 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            {lang === 'ha' ? 'Tsaron Intanet na Karfe' : 'High-Speed Encrypted Proxy'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t.vpnTitle}
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            {t.vpnDesc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: VPN Power Switch & Connection Gauge */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl p-8 border border-slate-800 shadow-xl text-center space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Status Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider uppercase border ${
              vpnState.isConnected
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {vpnState.isConnected ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t.vpnStatusConnected}</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>{t.vpnStatusDisconnected}</span>
                </>
              )}
            </div>

            {/* Giant Circular Power Switch */}
            <div className="relative py-4">
              <button
                onClick={handleToggleVpn}
                disabled={isConnecting}
                className={`relative w-44 h-44 mx-auto rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl ${
                  vpnState.isConnected
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 ring-8 ring-emerald-500/20 shadow-emerald-500/30 scale-105'
                    : 'bg-gradient-to-tr from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 ring-8 ring-slate-800/50 shadow-slate-900'
                }`}
              >
                {isConnecting ? (
                  <div className="space-y-2 text-white">
                    <Zap className="w-12 h-12 mx-auto animate-spin text-cyan-300" />
                    <span className="text-xs font-bold block">{lang === 'ha' ? 'Ana Haɗawa...' : 'Connecting...'}</span>
                  </div>
                ) : (
                  <div className="space-y-2 text-white">
                    <ShieldCheck className={`w-14 h-14 mx-auto ${vpnState.isConnected ? 'text-white' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold block tracking-wider uppercase">
                      {vpnState.isConnected ? t.clickToDisconnect : t.clickToConnect}
                    </span>
                  </div>
                )}
              </button>
            </div>

            {/* IP Address & Protocol Info */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">{t.selectedLocation}:</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <span>{currentServer.flag}</span> {currentServer.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.ipAddress}:</span>
                <span className="font-mono font-bold text-cyan-400">{vpnState.ipAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.ping}:</span>
                <span className="font-bold text-emerald-400">{currentServer.pingMs} ms</span>
              </div>
            </div>
          </div>

          {/* Kill Switch Toggle */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold">{t.killSwitch}</span>
            <button
              onClick={() => setVpnState(prev => ({ ...prev, killSwitch: !prev.killSwitch }))}
              className="text-indigo-400 hover:text-indigo-300"
            >
              {vpnState.killSwitch ? (
                <ToggleRight className="w-7 h-7 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-7 h-7 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Server Locations & Unblock Services */}
        <div className="lg:col-span-7 space-y-6">
          {/* Server Selector */}
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Server className="w-5 h-5 text-indigo-400" />
              {lang === 'ha' ? 'Nomi Taron Server Na Kasa-Kasa' : 'VPN Server Locations'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {VPN_SERVERS.map((server) => {
                const isSelected = activeServerId === server.id;
                return (
                  <button
                    key={server.id}
                    onClick={() => handleServerSelect(server)}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/50 shadow-md'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{server.flag}</span>
                      <div>
                        <p className="font-bold text-white text-xs">{server.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{server.ipAddress}</p>
                      </div>
                    </div>
                    <div className="text-right text-[11px]">
                      <span className="text-emerald-400 font-bold block">{server.pingMs} ms</span>
                      <span className="text-slate-500 block">{server.loadPercent}% load</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unblocked Apps & Live Traffic */}
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              {t.unblockStatus}
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {['WhatsApp Calls', 'TikTok Live', 'Facebook', 'Telegram'].map((app) => (
                <div key={app} className="p-3 rounded-xl bg-slate-950 border border-emerald-500/20 flex items-center gap-2 text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">{app}</span>
                </div>
              ))}
            </div>

            {/* Live Traffic Counters */}
            {vpnState.isConnected && (
              <div className="pt-3 grid grid-cols-2 gap-4 border-t border-slate-800 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Downloaded</span>
                    <span className="font-mono font-bold text-white">{formatBytes(vpnState.bytesDownloaded)}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <ArrowUpRight className="w-5 h-5 text-cyan-400" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Uploaded</span>
                    <span className="font-mono font-bold text-white">{formatBytes(vpnState.bytesUploaded)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
