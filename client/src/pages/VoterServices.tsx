import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Vote,
  ShieldCheck,
  History,
  QrCode,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const VoterServices: React.FC = () => {
  const { user } = useAuth();
  const [voterUidInput, setVoterUidInput] = useState<string>('');
  const [eligibilityResult, setEligibilityResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [checking, setChecking] = useState<boolean>(false);

  const checkEligibility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterUidInput.trim()) return;

    setChecking(true);
    setErrorMsg('');
    setEligibilityResult(null);

    try {
      // Fetch users list or check current session
      const res = await api.get<{ success: boolean; data: any[] }>(
        `/admin/users?search=${encodeURIComponent(voterUidInput.trim())}`
      );

      if (res.success && res.data && res.data.length > 0) {
        const found = res.data[0];
        if (found.voterProfile) {
          setEligibilityResult(found);
        } else {
          setErrorMsg('Account found, but no demo voter profile is attached.');
        }
      } else {
        setErrorMsg('Voter UID not found in demo registry. Try "MH-VTR-2026-A101" or register a new demo account.');
      }
    } catch {
      setErrorMsg('Failed to verify eligibility. Please ensure backend server is reachable.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 font-semibold uppercase tracking-wider">
          <FileCheck className="w-4 h-4" />
          <span>Voter Facilitation Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
          Maharashtra Voter Services
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Verify simulated electoral roll eligibility, cast anonymous ballots, and verify digital voting slips.
        </p>
      </div>

      {/* Grid of Key Voter Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Check Roll Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Check Electoral Roll Status
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Verify your demo voter registration status and allocated assembly/municipal constituency.
            </p>
          </div>
          <a
            href="#eligibility-check"
            className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            <span>Proceed to Search</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Cast Simulated Vote Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 flex items-center justify-center font-bold">
              <Vote className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Access Simulated Voting Booth
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Experience the 4-step EVM simulated voting journey with privacy receipts and NOTA choice.
            </p>
          </div>
          <Link
            to="/elections"
            className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
          >
            <span>Choose Active Election</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Verify Receipt Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Verify Digital Vote Receipt
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Authenticate your receipt reference number (MV-2026-XXXX-XXXX) against SHA-256 records.
            </p>
          </div>
          <Link
            to="/receipt/verify"
            className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            <span>Verify Receipt Integrity</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Interactive Eligibility Search Section */}
      <section
        id="eligibility-check"
        className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
      >
        <div className="max-w-2xl space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Search Electoral Roll Status (Demo)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your Demo Voter ID (e.g., <code className="text-orange-600 font-mono">MH-VTR-2026-A101</code> or <code className="text-orange-600 font-mono">MH-VTR-2026-B202</code>) to check your registration and eligible voting districts.
          </p>
        </div>

        <form onSubmit={checkEligibility} className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <input
            type="text"
            placeholder="Enter Demo Voter UID (e.g. MH-VTR-2026-A101)"
            value={voterUidInput}
            onChange={(e) => setVoterUidInput(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            disabled={checking}
            className="px-6 py-2.5 rounded-xl bg-blue-950 dark:bg-blue-600 hover:bg-blue-900 text-white font-semibold text-xs transition-colors shrink-0 flex items-center justify-center gap-2"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{checking ? 'Checking...' : 'Check Status'}</span>
          </button>
        </form>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-3 text-xs text-red-800 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {eligibilityResult && (
          <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Voter Registration Confirmed & Verified</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900">
                <span className="text-slate-500">Full Name</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {eligibilityResult.fullName}
                </p>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900">
                <span className="text-slate-500">Demo Voter UID</span>
                <p className="font-mono font-bold text-orange-600 mt-0.5">
                  {eligibilityResult.voterProfile?.voterUid}
                </p>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900">
                <span className="text-slate-500">District & Constituency</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {eligibilityResult.voterProfile?.district?.name} • {eligibilityResult.voterProfile?.constituency?.name}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Link
                to="/elections"
                className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Vote className="w-3.5 h-3.5" />
                <span>Go to Active Ballots</span>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Voter Privacy Guarantee Notice */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Absolute Ballot Confidentiality</span>
          </div>
          <h3 className="text-lg font-bold">Never reveal your ballot to anyone.</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The MahaVote demo application enforces full ballot anonymity. Receipts only confirm participation and can never be decrypted to prove which candidate you selected.
          </p>
        </div>

        <Link
          to="/register"
          className="px-6 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs shadow-md transition-colors shrink-0"
        >
          Register New Demo Voter Account
        </Link>
      </div>
    </div>
  );
};
