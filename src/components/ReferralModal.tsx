import React, { useState } from 'react';
import { 
  Gift, 
  X, 
  Copy, 
  Check, 
  Users, 
  Coins, 
  Share2, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { Currency, Language, ReferralData } from '../types';
import { formatPrice } from '../data/countriesAndServices';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralData: ReferralData;
  setReferralData: React.Dispatch<React.SetStateAction<ReferralData>>;
  lang: Language;
  currency: Currency;
  claimReferralBonus: (amountUsd: number) => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  onClose,
  referralData,
  setReferralData,
  lang,
  currency,
  claimReferralBonus
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimedSuccess, setClaimedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralData.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralData.referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleClaim = () => {
    if (referralData.claimableBonusUsd <= 0) return;

    setIsClaiming(true);
    const amountToClaim = referralData.claimableBonusUsd;

    setTimeout(() => {
      claimReferralBonus(amountToClaim);
      setReferralData(prev => ({
        ...prev,
        claimableBonusUsd: 0,
        totalBonusEarnedUsd: prev.totalBonusEarnedUsd + amountToClaim
      }));
      setIsClaiming(false);
      setClaimedSuccess(true);
      setTimeout(() => setClaimedSuccess(false), 3000);
    }, 800);
  };

  // Simulate a friend joining & buying a plan
  const handleSimulateFriendJoin = () => {
    const friendNames = ['Musa Ibrahim', 'Fatima Bello', 'Usman Garba', 'Aisha Abubakar', 'Kabiru Sanusi'];
    const randomName = friendNames[Math.floor(Math.random() * friendNames.length)];
    const bonusAmount = 2.50; // $2.50 per referral purchase

    const newFriend = {
      id: `friend_${Date.now()}`,
      name: randomName,
      avatar: '👤',
      joinedDate: 'Yanzu (Just now)',
      status: 'purchased' as const,
      bonusEarnedUsd: bonusAmount
    };

    setReferralData(prev => ({
      ...prev,
      totalFriendsInvited: prev.totalFriendsInvited + 1,
      claimableBonusUsd: prev.claimableBonusUsd + bonusAmount,
      invitedFriends: [newFriend, ...prev.invitedFriends]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-scaleUp max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {lang === 'ha' ? 'Tsarin Gayyata & Samun Kyauta (Referral System)' : 'TEMP VPN Refer & Earn Rewards'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ha' ? 'Gayyaci abokanka ka sami kyautar kudi a Wallet dinka' : 'Invite friends and earn cash bonuses directly in your wallet!'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'ha' ? 'Abokan da aka Gayyata' : 'Friends Invited'}</p>
            <p className="text-lg font-bold font-mono text-cyan-400">{referralData.totalFriendsInvited}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'ha' ? 'Cikakken Kyauta' : 'Total Earned'}</p>
            <p className="text-lg font-bold font-mono text-emerald-400">{formatPrice(referralData.totalBonusEarnedUsd, currency)}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/40 text-center space-y-1">
            <p className="text-[10px] text-amber-400 font-bold uppercase">{lang === 'ha' ? 'Kudin Karba' : 'Claimable'}</p>
            <p className="text-lg font-bold font-mono text-amber-300">{formatPrice(referralData.claimableBonusUsd, currency)}</p>
          </div>
        </div>

        {/* Referral Code & Link Box */}
        <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {lang === 'ha' ? 'Lambar Gayyatar Ka (Referral Code):' : 'Your Unique Referral Code:'}
            </label>
            <div className="flex items-center gap-2">
              <span className="flex-1 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 font-mono font-extrabold text-white text-sm tracking-wider">
                {referralData.referralCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? (lang === 'ha' ? 'An Kwafa' : 'Copied') : (lang === 'ha' ? 'Kwafi Code' : 'Copy Code')}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {lang === 'ha' ? 'Hanyar Raba Sako (Referral Link):' : 'Sharable Referral Link:'}
            </label>
            <div className="flex items-center gap-2">
              <span className="flex-1 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 font-mono text-slate-300 text-xs truncate">
                {referralData.referralLink}
              </span>
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? (lang === 'ha' ? 'An Kwafa' : 'Copied') : (lang === 'ha' ? 'Kwafi Link' : 'Copy Link')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Claim Bonus Button */}
        <div className="space-y-2">
          {claimedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                {lang === 'ha'
                  ? 'Nasarar tura kyautar kudi zuwa wallet dinka!'
                  : 'Referral bonus successfully claimed and credited to your wallet!'}
              </span>
            </div>
          )}

          <button
            onClick={handleClaim}
            disabled={isClaiming || referralData.claimableBonusUsd <= 0}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-amber-900/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isClaiming ? (
              <span>{lang === 'ha' ? 'Ana Tura Kudi...' : 'Claiming Bonus...'}</span>
            ) : (
              <>
                <Coins className="w-4 h-4 text-amber-200" />
                <span>
                  {lang === 'ha'
                    ? `Tura Kyauta (${formatPrice(referralData.claimableBonusUsd, currency)}) zuwa Wallet`
                    : `Claim ${formatPrice(referralData.claimableBonusUsd, currency)} Bonus to Wallet`}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Demo Simulation Action Button */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              {lang === 'ha' ? 'Gwada Tsarin Gayyata (Demo Test):' : 'Demo Test Referral Engine:'}
            </span>
            <button
              onClick={handleSimulateFriendJoin}
              className="px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{lang === 'ha' ? '+ Gwada Abokin da Ya Saya' : '+ Simulate Friend Purchase'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            {lang === 'ha'
              ? 'Danna maballin don gwada samun aboki da ke siyan abu, sannan ka ga kyautar $2.50 tana karuwa nan take.'
              : 'Click to simulate a friend joining with your code and buying a plan to watch your bonus increase live.'}
          </p>
        </div>

        {/* Invited Friends List */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {lang === 'ha' ? 'Tarihin Abokan da Suka Yi Rajista' : 'Invited Friends History'} ({referralData.invitedFriends.length})
          </h4>
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {referralData.invitedFriends.map((f) => (
              <div
                key={f.id}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{f.avatar}</span>
                  <div>
                    <p className="font-bold text-white">{f.name}</p>
                    <p className="text-[10px] text-slate-400">{f.joinedDate}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  +{formatPrice(f.bonusEarnedUsd, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* How it Works steps */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
          <p className="font-bold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            {lang === 'ha' ? 'Yadda Tsarin Gayyatar Yake Aiki:' : 'How Referral Bonus Works:'}
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
            <li>{lang === 'ha' ? 'Tura lambar gayyatarka ko link dinka zuwa ga abokanka.' : 'Share your referral link or unique code with friends.'}</li>
            <li>{lang === 'ha' ? 'Duk lokacin da suka bude lamba ko sayi eSIM, za ka samu karin kyauta.' : 'Whenever they activate a virtual line or eSIM, you get a 10% commission.'}</li>
            <li>{lang === 'ha' ? 'Zaka iya tura kudin kyautar kai tsaye zuwa cikin asusunka na Wallet.' : 'Claim your accumulated rewards directly into your TEMP VPN wallet anytime.'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
