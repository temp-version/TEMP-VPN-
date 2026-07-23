import React, { useState } from 'react';
import { 
  FileText, 
  X, 
  Printer, 
  Share2, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  Copy, 
  Check, 
  QrCode,
  Calendar,
  CreditCard,
  Download
} from 'lucide-react';
import { Currency, Language, WalletTransaction } from '../types';
import { formatPrice } from '../data/countriesAndServices';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: WalletTransaction | null;
  lang: Language;
  currency: Currency;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  lang,
  currency
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyReceiptText = () => {
    const text = `=== TEMP VPN OFFICIAL RECEIPT ===
Receipt Ref: ${transaction.reference}
Date: ${transaction.timestamp}
Description: ${transaction.description}
Amount Paid: ${formatPrice(transaction.amountUsd, currency)} ($${transaction.amountUsd.toFixed(2)} USD)
Status: ${transaction.status.toUpperCase()}
Payment Gateway: ${transaction.paymentMethod || 'TEMP VPN Wallet'}
Thank you for using TEMP VPN!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDeposit = transaction.type === 'deposit' || transaction.type === 'referral_bonus';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-scaleUp my-8 printable-receipt">
        {/* Receipt Header Actions */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 no-print">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-white">
              {lang === 'ha' ? 'Takardar Shaidar Biya (Receipt)' : 'Digital Payment Receipt'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Official Printable Receipt Document Canvas */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6 relative overflow-hidden">
          {/* Subtle Background Watermark Logo */}
          <div className="absolute right-4 bottom-4 text-slate-900 font-black text-7xl select-none opacity-30 pointer-events-none tracking-tighter">
            TEMP VPN
          </div>

          {/* Top Brand Banner */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white text-sm shadow">
                  TV
                </div>
                <h2 className="text-xl font-black tracking-wider text-white">
                  TEMP<span className="text-cyan-400">VPN</span>
                </h2>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Global Connectivity & Virtual Telecom Services
              </p>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/40">
                <CheckCircle2 className="w-3.5 h-3.5" />
                VERIFIED PAID
              </span>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                REF: {transaction.reference}
              </p>
            </div>
          </div>

          {/* Transaction Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">{lang === 'ha' ? 'Kwanan Wata / Lokaci' : 'Date & Timestamp'}</p>
              <p className="font-medium text-slate-200 mt-0.5 font-mono">{transaction.timestamp}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">{lang === 'ha' ? 'Hanyar Biya' : 'Payment Method'}</p>
              <p className="font-medium text-slate-200 mt-0.5 capitalize flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                {transaction.paymentMethod || 'TEMP VPN Wallet'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">{lang === 'ha' ? 'Asusun Mai Sayayya' : 'Account Email'}</p>
              <p className="font-medium text-slate-200 mt-0.5 font-mono">user@tempvpn.app</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">{lang === 'ha' ? 'Nau\'in Biya' : 'Category'}</p>
              <p className="font-medium text-cyan-300 mt-0.5 capitalize">{transaction.type.replace('_', ' ')}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-800">
              <span>{lang === 'ha' ? 'Bayanin Sayan Abu' : 'Description / Item'}</span>
              <span>{lang === 'ha' ? 'Adadin Kudi' : 'Amount'}</span>
            </div>

            <div className="flex justify-between items-center text-xs py-2 border-b border-slate-800/60">
              <div className="space-y-0.5">
                <p className="font-bold text-white">{transaction.description}</p>
                {transaction.itemDetails?.phoneNumber && (
                  <p className="text-[10px] text-cyan-400 font-mono">
                    Number: {transaction.itemDetails.phoneNumber}
                  </p>
                )}
                {transaction.itemDetails?.planTitle && (
                  <p className="text-[10px] text-blue-400 font-mono">
                    Plan: {transaction.itemDetails.planTitle}
                  </p>
                )}
              </div>
              <span className={`font-mono font-bold ${isDeposit ? 'text-emerald-400' : 'text-slate-100'}`}>
                {isDeposit ? '+' : ''}{formatPrice(transaction.amountUsd, currency)}
              </span>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-1.5 pt-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>{lang === 'ha' ? 'Kudin Abu (Subtotal):' : 'Subtotal:'}</span>
              <span className="font-mono">{formatPrice(transaction.amountUsd, currency)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>{lang === 'ha' ? 'Kudin Aiki (VAT & Gateway Fee):' : 'Processing Fee (0%):'}</span>
              <span className="font-mono text-emerald-400">$0.00</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-800">
              <span>{lang === 'ha' ? 'Gimshikin Kudi (Total Paid):' : 'Total Amount Paid:'}</span>
              <span className="font-mono text-cyan-300">{formatPrice(transaction.amountUsd, currency)}</span>
            </div>
          </div>

          {/* Footer Digital Signature & QR Code */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <div className="space-y-0.5">
              <p className="font-bold text-slate-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                TEMP VPN Digital Verification System
              </p>
              <p className="font-mono text-slate-500">Hash: 0x{transaction.reference.substring(4)}89a2b</p>
            </div>

            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <QrCode className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 no-print">
          <button
            onClick={handleCopyReceiptText}
            className="flex-1 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? (lang === 'ha' ? 'An kwafa' : 'Copied Text') : (lang === 'ha' ? 'Kwafi Bayani' : 'Copy Text')}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 transition"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === 'ha' ? 'Buga / Sauke PDF' : 'Print / Download PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
