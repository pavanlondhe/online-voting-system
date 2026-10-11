import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Vote,
  History,
  CheckCircle2,
  Download,
  Building2,
  MapPin,
  Calendar,
  Lock,
  ArrowRight,
  ShieldCheck,
  QrCode,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Election, VoteReceipt } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';

export const VoterDashboard: React.FC = () => {
  const { user } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [modalReceipt, setModalReceipt] = useState<VoteReceipt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [elecRes, histRes] = await Promise.all([
          api.get<{ success: boolean; data: Election[] }>('/elections?status=ACTIVE'),
          api.get<{ success: boolean; data: any[] }>('/ballot/voter/history'),
        ]);

        if (elecRes.success && elecRes.data) {
          setElections(elecRes.data);
        }
        if (histRes.success && histRes.data) {
          setHistory(histRes.data);
        }
      } catch (err) {
        console.error('Failed to load voter dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openPdfForHistoryItem = (item: any) => {
    setModalReceipt({
      receiptNumber: item.receiptNumber,
      electionTitle: item.electionTitle,
      electionType: item.electionType,
      timestamp: item.votedAt,
      verificationHash: item.verificationHash,
    });
    setIsModalOpen(true);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm text-slate-500">Please sign in to access your voter dashboard.</p>
        <Link
          to="/login?role=VOTER"
          className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-semibold"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 font-semibold uppercase tracking-wider">
          <User className="w-4 h-4" />
          <span>Voter Profile & Records</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
          Welcome, {user.fullName}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review your official demonstration voter identity card, active elections, and participation history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Digital Voter ID Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-white rounded-2xl p-6 border border-blue-800/80 shadow-md relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between border-b border-blue-800/60 pb-3">
              <div>
                <span className="text-[10px] tracking-widest uppercase font-bold text-orange-400">
                  Government of Maharashtra Demo
                </span>
                <h3 className="font-bold text-sm tracking-tight">DEMONSTRATION ELECTOR PHOTO ID</h3>
              </div>
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-xs">
                MH
              </div>
            </div>

            {/* Voter Card Details */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Demo Voter ID</span>
                <p className="font-mono text-base font-bold text-orange-400 tracking-wider">
                  {user.voterProfile?.voterUid || 'MH-VTR-2026-DEMO'}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Name</span>
                <p className="font-bold text-sm text-white">{user.fullName}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-blue-900/60">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">District</span>
                  <p className="text-white font-medium">
                    {user.voterProfile?.district?.name || 'Pune'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Constituency</span>
                  <p className="text-white font-medium">
                    {user.voterProfile?.constituency?.name || 'Kasba Peth'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-emerald-400 font-semibold border-t border-blue-800/60">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Elector Roll Verified</span>
              </span>
              <span className="text-slate-400 font-mono">SEC-MH-2026</span>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <Lock className="w-4 h-4 text-orange-600" />
              <span>Ballot Anonymity Guarantee</span>
            </div>
            <p className="leading-relaxed">
              Your voting records below prove that you participated in an election. For your privacy and constitutional ballot secrecy, the system never displays which candidate you voted for.
            </p>
          </div>
        </div>

        {/* Right Column: Active Elections & Voting History */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Demo Elections Available to Vote */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Vote className="w-5 h-5 text-orange-600" />
                <span>Active Elections Available to Vote</span>
              </h2>
              <span className="text-xs text-slate-400">1 simulated vote per election</span>
            </div>

            {loading ? (
              <div className="text-xs text-slate-400 py-6 text-center">Loading elections...</div>
            ) : elections.length === 0 ? (
              <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                No active elections currently open for voting.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {elections.map((elec) => {
                  const alreadyVotedInThis = history.some((h) => h.electionId === elec.id);
                  return (
                    <div
                      key={elec.id}
                      className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase">
                            Voting Open
                          </span>
                          <span className="text-[11px] text-slate-400">{elec.electionType}</span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                          {elec.title}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Ends: {new Date(elec.endDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                        {alreadyVotedInThis ? (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Ballot Already Cast</span>
                          </div>
                        ) : (
                          <Link
                            to={`/vote/ballot/${elec.id}`}
                            className="w-full flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold transition-colors"
                          >
                            <Vote className="w-3.5 h-3.5" />
                            <span>Enter Voting Booth</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Privacy-Preserving Personal Voting History */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <span>Personal Voting History</span>
              </h2>
              <span className="text-xs text-slate-400">Zero-Knowledge Receipts</span>
            </div>

            {history.length === 0 ? (
              <div className="p-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <History className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  You have not cast any simulated votes yet.
                </p>
                <Link
                  to="/elections"
                  className="inline-block text-xs text-orange-600 font-bold hover:underline"
                >
                  Browse active elections to cast your first ballot
                </Link>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
                {history.map((item, idx) => (
                  <div key={idx} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 uppercase">
                          {item.electionType}
                        </span>
                        <span className="font-mono text-xs font-bold text-orange-600">
                          {item.receiptNumber}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.electionTitle}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Voted on: {new Date(item.votedAt).toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => openPdfForHistoryItem(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Receipt</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* PDF Receipt Modal */}
      <ReceiptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        receipt={modalReceipt}
      />
    </div>
  );
};
