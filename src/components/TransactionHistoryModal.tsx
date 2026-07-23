import React, { useState } from 'react';
import { 
  History, 
  X, 
  Search, 
  FileText, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Smartphone, 
  Cpu, 
  Gift, 
  CheckCircle2,
  Filter
} from 'lucide-react';
import { Currency, Language, WalletTransaction } from '../types';
import { formatPrice } from '../data/countriesAndServices';
import { ReceiptModal } from './ReceiptModal';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: WalletTransaction[];
  lang: Language;
  currency: Currency;
}

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  isOpen,
  onClose,
  transactions,
  lang,
  currency
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'deposit' | 'number_rental' | 'esim_purchase' | 'referral_bonus'>('all');
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<WalletTransaction | null>(null);

  if (!isOpen) return null;

  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter = selectedFilter === 'all' || tx.type === selectedFilter;
    const matchesSearch = 
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.paymentMethod && tx.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getTxIcon = (type: WalletTransaction['type']) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
      case 'number_rental':
        return <Smartphone className="w-4 h-4 text-cyan-400" />;
      case 'esim_purchase':
        return <Cpu className="w-4 h-4 text-blue-400" />;
      case 'referral_bonus':
        return <Gift className="w-4 h-4 text-amber-400" />;
      default:
        return <CreditCard className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 animate-scaleUp max-h-[85vh] flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {lang === 'ha' ? 'Tarihin Biya & Shaidar Receipt (Transactions)' : 'Transaction History & Digital Receipts'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    TEMP VPN • {transactions.length} Total Records
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

            {/* Filters and Search Bar */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={lang === 'ha' ? 'Bincika tarihin biya ko lambar REF...' : 'Search description or reference...'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
                {[
                  { id: 'all', label: lang === 'ha' ? 'Duka (All)' : 'All' },
                  { id: 'deposit', label: lang === 'ha' ? 'Kudin Shiga' : 'Deposits' },
                  { id: 'number_rental', label: lang === 'ha' ? 'Lambobin Waya' : 'Virtual Numbers' },
                  { id: 'esim_purchase', label: 'eSIM Plans' },
                  { id: 'referral_bonus', label: lang === 'ha' ? 'Kyautar Gayyata' : 'Referral Rewards' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition border ${
                      selectedFilter === f.id
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction List Cards */}
            <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
              {filteredTransactions.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <History className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs font-semibold">
                    {lang === 'ha' ? 'Babu tarihin biya da aka samu.' : 'No transaction records found.'}
                  </p>
                </div>
              ) : (
                filteredTransactions.map((tx) => {
                  const isDeposit = tx.type === 'deposit' || tx.type === 'referral_bonus';
                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl border mt-0.5 ${
                          isDeposit
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}>
                          {getTxIcon(tx.type)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-snug">{tx.description}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                            <span>REF: {tx.reference}</span>
                            <span>•</span>
                            <span>{tx.timestamp}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                        <div className="text-left sm:text-right">
                          <p className={`text-xs font-mono font-bold ${isDeposit ? 'text-emerald-400' : 'text-slate-200'}`}>
                            {isDeposit ? '+' : '-'}{formatPrice(tx.amountUsd, currency)}
                          </p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 uppercase border border-slate-800 font-medium">
                            {tx.paymentMethod || 'Wallet'}
                          </span>
                        </div>

                        <button
                          onClick={() => setSelectedReceiptTx(tx)}
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 transition text-xs font-semibold flex items-center gap-1 shrink-0"
                          title="View & Download PDF Receipt"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{lang === 'ha' ? 'Receipt' : 'Receipt'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
          >
            {lang === 'ha' ? 'Rufe' : 'Close'}
          </button>
        </div>
      </div>

      {/* Selected Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedReceiptTx}
        onClose={() => setSelectedReceiptTx(null)}
        transaction={selectedReceiptTx}
        lang={lang}
        currency={currency}
      />
    </>
  );
};
