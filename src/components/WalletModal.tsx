import React, { useState } from 'react';
import { 
  Wallet, 
  CreditCard, 
  Building2, 
  Smartphone, 
  Coins, 
  CheckCircle2, 
  PlusCircle, 
  X,
  Copy,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Currency, Language } from '../types';
import { formatPrice } from '../data/countriesAndServices';
import { translations } from '../utils/translations';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currency: Currency;
  walletBalanceUsd: number;
  addBalance: (amountUsd: number, description: string, paymentMethod: string) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  lang,
  currency,
  walletBalanceUsd,
  addBalance
}) => {
  const t = translations[lang];

  const [selectedAmountUsd, setSelectedAmountUsd] = useState<number>(10);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('paystack');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Live Gateway Order Response State
  const [paymentDetails, setPaymentDetails] = useState<{
    reference: string;
    amountNgn: number;
    amountUsd: number;
    bankDetails?: {
      accountNumber: string;
      accountName: string;
      bankName: string;
      expiresInMinutes: number;
    };
  } | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleInitializePayment = async () => {
    setIsProcessing(true);
    setPaymentDetails(null);

    const amountNgn = Math.round(selectedAmountUsd * 1540);

    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountUsd: selectedAmountUsd,
          amountNgn,
          gateway: selectedPaymentMethod,
          email: 'user@roamflex.app'
        })
      });

      const data = await response.json();
      if (data.success) {
        setPaymentDetails({
          reference: data.reference,
          amountNgn: data.amountNgn,
          amountUsd: data.amountUsd,
          bankDetails: data.bankDetails
        });
      }
    } catch (err) {
      console.error('Payment initialization error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyAndTopUp = async () => {
    if (!paymentDetails) return;

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/payments/verify?reference=${paymentDetails.reference}`);
      const data = await res.json();

      if (data.success) {
        addBalance(paymentDetails.amountUsd, `Wallet Topup (${selectedPaymentMethod.toUpperCase()})`, selectedPaymentMethod);
        setSuccessMessage(true);
        setTimeout(() => {
          setSuccessMessage(false);
          setPaymentDetails(null);
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Payment verify error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-scaleUp">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t.topUpWallet}</h3>
              <p className="text-xs text-slate-400">
                Current Balance: <strong className="text-emerald-400 font-mono">{formatPrice(walletBalanceUsd, currency)}</strong>
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

        {!paymentDetails ? (
          <>
            {/* Step 1: Amount Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                1. {t.selectAmount}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 25, 50].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setSelectedAmountUsd(amt)}
                    className={`p-3 rounded-xl border text-center font-bold text-sm transition ${
                      selectedAmountUsd === amt
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/40 shadow-md'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {formatPrice(amt, currency)}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Payment Gateway Choice */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                2. {t.paymentMethod}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'paystack', name: 'Paystack Gateway', icon: CreditCard, desc: 'MasterCard, Visa, Verve & Bank' },
                  { id: 'monnify', name: 'Monnify Direct', icon: Building2, desc: 'Instant Bank Transfer & USSD' },
                  { id: 'opay', name: 'OPay / PalmPay', icon: Smartphone, desc: 'Mobile App Transfer & QR' },
                  { id: 'crypto', name: t.payWithCrypto, icon: Coins, desc: 'USDT TRC20 / Bitcoin' },
                ].map((method) => {
                  const IconComp = method.icon;
                  const isSelected = selectedPaymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`p-3 rounded-xl border text-left flex items-start gap-3 transition ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-500 text-cyan-200 ring-2 ring-cyan-500/40'
                          : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <IconComp className={`w-5 h-5 mt-0.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <div>
                        <p className="text-xs font-bold text-white">{method.name}</p>
                        <p className="text-[10px] text-slate-400">{method.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Button to Initialize Gateway */}
            <button
              onClick={handleInitializePayment}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isProcessing ? (
                <span>{lang === 'ha' ? 'Ana Shiya Biyan Kudi...' : 'Initializing Checkout...'}</span>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>
                    {t.confirmDeposit} — {formatPrice(selectedAmountUsd, currency)}
                  </span>
                </>
              )}
            </button>
          </>
        ) : (
          /* Live Paystack / Monnify Checkout Screen */
          <div className="space-y-5 animate-fadeIn">
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  {selectedPaymentMethod === 'monnify' ? 'Monnify Dynamic Checkout' : 'Paystack Secure Checkout'}
                </span>
                <span className="text-xs font-mono text-slate-400">{paymentDetails.reference}</span>
              </div>

              {/* Dynamic Account Transfer Card */}
              {paymentDetails.bankDetails && (
                <div className="space-y-2 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  <p className="text-xs text-slate-300 font-semibold">
                    {lang === 'ha' ? 'Tura kudin zuwa wannan asusun bankin:' : 'Transfer exact amount to this Bank Account:'}
                  </p>

                  <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">{paymentDetails.bankDetails.bankName}</p>
                      <p className="text-lg font-mono font-bold text-white tracking-wider">
                        {paymentDetails.bankDetails.accountNumber}
                      </p>
                      <p className="text-[10px] text-emerald-400">{paymentDetails.bankDetails.accountName}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(paymentDetails.bankDetails!.accountNumber, 'acc')}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/30 transition text-xs font-bold flex items-center gap-1"
                    >
                      {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'acc' ? (lang === 'ha' ? 'An kwafa' : 'Copied') : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="flex justify-between text-xs text-slate-300 font-semibold pt-1">
                    <span>{lang === 'ha' ? 'Adadin Kudi (NGN):' : 'Amount to Pay:'}</span>
                    <span className="font-mono text-emerald-400 font-bold">₦{paymentDetails.amountNgn.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Success Notification Alert */}
            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{t.depositSuccess}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => setPaymentDetails(null)}
                className="w-1/3 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                {lang === 'ha' ? 'Sake Zaba' : 'Back'}
              </button>
              <button
                onClick={handleVerifyAndTopUp}
                disabled={isProcessing || successMessage}
                className="w-2/3 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>{lang === 'ha' ? 'Tabbatar da Biyan Kudi...' : 'Verifying Payment...'}</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === 'ha' ? 'Na Bada Kudi (Verify Payment)' : 'I Have Paid (Verify)'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
