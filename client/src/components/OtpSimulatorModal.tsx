import React, { useState, useEffect } from 'react';
import { Smartphone, RefreshCw, X, Copy, Check, Clock, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { OtpSimulatorEntry } from '../types';

interface OtpSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOtp?: (code: string) => void;
}

export const OtpSimulatorModal: React.FC<OtpSimulatorModalProps> = ({
  isOpen,
  onClose,
  onSelectOtp,
}) => {
  const [inbox, setInbox] = useState<OtpSimulatorEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: OtpSimulatorEntry[] }>(
        '/auth/otp/simulator-inbox'
      );
      if (res.success && res.data) {
        setInbox(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch simulator inbox:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInbox();
      const interval = setInterval(fetchInbox, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    if (onSelectOtp) {
      onSelectOtp(code);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Development OTP Simulator</h3>
              <p className="text-xs text-slate-400">Educational SMS & Email Simulation Inbox</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchInbox}
              title="Refresh inbox"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notice */}
        <div className="bg-amber-50 dark:bg-amber-950/40 px-4 py-2 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2 border-b border-amber-200 dark:border-amber-800/50">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>This simulator delivers generated demo OTPs without sending real SMS messages.</span>
        </div>

        {/* Inbox List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {inbox.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
              <Smartphone className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No active OTP challenges found.</p>
              <p className="text-xs text-slate-400 mt-1">
                Request an OTP from the login or verification screen to view it here.
              </p>
            </div>
          ) : (
            inbox.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold tracking-wider text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-700 px-2.5 py-0.5 rounded">
                      {item.code}
                    </span>
                    <span className="text-[11px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                      {item.purpose}
                    </span>
                  </div>
                  <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                    Recipient: <strong className="font-medium text-slate-800 dark:text-slate-200">{item.identifier}</strong>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>Expires: {new Date(item.expiresAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(item.code)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-orange-600 hover:bg-orange-700 text-white transition-colors shrink-0"
                >
                  {copiedCode === item.code ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Use Code</span>
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md transition-colors"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
