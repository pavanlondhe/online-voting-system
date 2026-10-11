import React, { useState } from 'react';
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Download,
  Lock,
} from 'lucide-react';
import { api } from '../services/api';
import { ReceiptModal } from '../components/ReceiptModal';
import { VoteReceipt } from '../types';

export const VerifyReceipt: React.FC = () => {
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [verifiedData, setVerifiedData] = useState<any | null>(null);

  const [modalReceipt, setModalReceipt] = useState<VoteReceipt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptNumber.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setVerifiedData(null);

    try {
      const res = await api.get<{ success: boolean; verified: boolean; data?: any; message?: string }>(
        `/ballot/receipt/verify/${encodeURIComponent(receiptNumber.trim())}`
      );

      if (res.success && res.verified && res.data) {
        setVerifiedData(res.data);
      } else {
        setErrorMsg(res.message || 'Receipt reference not found in the demonstration registry.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please check the receipt reference number.');
    } finally {
      setLoading(false);
    }
  };

  const openPdfModal = () => {
    if (!verifiedData) return;
    setModalReceipt({
      receiptNumber: verifiedData.receiptNumber,
      electionTitle: verifiedData.electionTitle,
      electionType: verifiedData.electionType,
      timestamp: verifiedData.timestamp,
      verificationHash: verifiedData.verificationHash,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 mx-auto flex items-center justify-center font-bold">
          <QrCode className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Digital Vote Receipt Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Cryptographically verify that your simulated vote was safely registered in the election ledger without compromising your ballot privacy.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Enter Receipt Reference Number:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="e.g. MV-2026-A1B2-C3D4"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2.5 font-mono text-sm tracking-wider uppercase rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-md transition-colors flex items-center justify-center gap-2 shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? 'Verifying...' : 'Verify Cryptographic Slip'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Tip: You receive a unique receipt code immediately after casting a vote in the simulated booth.
            </p>
          </div>
        </form>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center gap-2 text-xs text-red-800 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Verification Result Card */}
      {verifiedData && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-300 dark:border-emerald-800/80 p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Verified Official Record
                </span>
                <h3 className="font-mono text-xl font-black text-slate-900 dark:text-white">
                  {verifiedData.receiptNumber}
                </h3>
              </div>
            </div>

            <button
              onClick={openPdfModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400">Election:</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                {verifiedData.electionTitle}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400">Election Type:</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                {verifiedData.electionType}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400">Submission Timestamp:</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                {new Date(verifiedData.timestamp).toLocaleString()}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400">Cryptographic Integrity:</span>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SHA-256 Validated & Committed</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 text-[11px] block mb-1">
              Cryptographic Hash (SHA-256 Signature):
            </span>
            <code className="text-[11px] text-slate-700 dark:text-slate-300 font-mono break-all">
              {verifiedData.verificationHash}
            </code>
          </div>

          {/* Privacy Note */}
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-semibold block mb-0.5">Zero-Knowledge Privacy:</strong>
              {verifiedData.privacyNotice}
            </div>
          </div>
        </div>
      )}

      {/* PDF Export Modal */}
      <ReceiptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        receipt={modalReceipt}
      />
    </div>
  );
};
