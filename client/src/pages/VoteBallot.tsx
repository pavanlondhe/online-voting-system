import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Vote,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  TreePine,
  BookOpen,
  Flame,
  Sun,
  PenTool,
  Flag,
  XCircle,
  Download,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ReceiptModal } from '../components/ReceiptModal';
import { VoteReceipt } from '../types';

interface CandidateChoice {
  id: string | null; // null for NOTA
  fullName: string;
  partyAffiliation: string;
  symbolName: string;
  photoUrl?: string;
  biography?: string;
  isNota: boolean;
}

export const VoteBallot: React.FC = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const { user, switchDemoAccount } = useAuth();

  const [election, setElection] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [notaOption, setNotaOption] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [hasVoted, setHasVoted] = useState<boolean>(false);

  // Voting flow steps: 'SELECT' | 'REVIEW' | 'SUBMITTING' | 'SUCCESS'
  const [step, setStep] = useState<'SELECT' | 'REVIEW' | 'SUBMITTING' | 'SUCCESS'>('SELECT');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateChoice | null>(null);

  // Generated receipt
  const [receipt, setReceipt] = useState<VoteReceipt | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchBallot = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await api.get<{
          success: boolean;
          message?: string;
          hasAlreadyVoted?: boolean;
          data?: any;
        }>(`/ballot/election/${electionId}`);

        if (res.success && res.data) {
          setElection(res.data.election);
          setCandidates(res.data.candidates);
          setNotaOption(res.data.notaOption);
        } else {
          if (res.hasAlreadyVoted) {
            setHasVoted(true);
          }
          setErrorMsg(res.message || 'Unable to access ballot for this election.');
        }
      } catch (err: any) {
        if (err.message && err.message.includes('already submitted')) {
          setHasVoted(true);
        }
        setErrorMsg(err.message || 'Failed to retrieve ballot.');
      } finally {
        setLoading(false);
      }
    };

    fetchBallot();
  }, [electionId, user]);

  const handleSelectOption = (item: any, isNota: boolean = false) => {
    if (isNota) {
      setSelectedCandidate({
        id: null,
        fullName: 'None of the Above (NOTA)',
        partyAffiliation: 'None',
        symbolName: 'Crossed Ballot',
        isNota: true,
      });
    } else {
      setSelectedCandidate({
        id: item.id,
        fullName: item.fullName,
        partyAffiliation: item.partyAffiliation,
        symbolName: item.symbolName,
        photoUrl: item.photoUrl,
        biography: item.biography,
        isNota: false,
      });
    }
  };

  const handleProceedToReview = () => {
    if (!selectedCandidate) return;
    setStep('REVIEW');
  };

  const handleCastVote = async () => {
    if (!selectedCandidate) return;

    setStep('SUBMITTING');
    setErrorMsg('');

    try {
      const res = await api.post<{
        success: boolean;
        message: string;
        data: VoteReceipt;
      }>('/ballot/vote', {
        electionId,
        candidateId: selectedCandidate.isNota ? null : selectedCandidate.id,
        isNota: selectedCandidate.isNota,
      });

      if (res.success && res.data) {
        setReceipt(res.data);
        setStep('SUCCESS');
        setIsReceiptModalOpen(true);

        // Celebratory confetti effect
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore if canvas-confetti unsupported
        }
      } else {
        setErrorMsg(res.message || 'Failed to submit vote');
        setStep('REVIEW');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Vote submission failed');
      setStep('REVIEW');
    }
  };

  const getSymbolIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('tree')) return <TreePine className="w-6 h-6 text-emerald-600" />;
    if (n.includes('book')) return <BookOpen className="w-6 h-6 text-blue-600" />;
    if (n.includes('lamp') || n.includes('flame')) return <Flame className="w-6 h-6 text-amber-600" />;
    if (n.includes('sun')) return <Sun className="w-6 h-6 text-orange-600" />;
    if (n.includes('pen')) return <PenTool className="w-6 h-6 text-purple-600" />;
    if (n.includes('cross') || n.includes('ballot')) return <XCircle className="w-6 h-6 text-slate-500" />;
    return <Flag className="w-6 h-6 text-slate-600" />;
  };

  // 1. Not signed in state
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 mx-auto flex items-center justify-center">
          <Vote className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          Voter Authentication Required
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          To access the simulated electronic ballot booth, you must sign in as a verified voter. You can use 1-click test login below.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            onClick={() => switchDemoAccount('VOTER')}
            className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-md transition-colors"
          >
            1-Click Demo Voter Login (Aarav Kulkarni)
          </button>
          <Link
            to="/login"
            className="px-6 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors"
          >
            Sign In with OTP / Password
          </Link>
        </div>
      </div>
    );
  }

  // 2. Loading state
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-slate-400 text-sm">
        Preparing secure electronic ballot booth...
      </div>
    );
  }

  // 3. Already Voted state
  if (hasVoted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Ballot Already Cast
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          You have already cast your vote for this demonstration election. In accordance with electoral integrity rules and duplicate vote prevention, only one ballot submission is permitted per voter account.
        </p>
        <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-xs text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-900/60">
          Your anonymized ballot has been counted. Check your personal voting history to view your receipt reference.
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/voter/dashboard"
            className="px-5 py-2.5 rounded-xl bg-blue-950 dark:bg-blue-600 hover:bg-blue-900 text-white font-semibold text-xs shadow-sm"
          >
            View Voting History
          </Link>
          <Link
            to="/elections"
            className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs"
          >
            Browse Other Elections
          </Link>
        </div>
      </div>
    );
  }

  // 4. Error state
  if (errorMsg && !election) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access Denied</h2>
        <p className="text-xs text-slate-500">{errorMsg}</p>
        <Link
          to="/elections"
          className="inline-block mt-4 px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-lg text-xs font-semibold"
        >
          Back to Elections
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Booth Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-orange-600/30 text-orange-400 border border-orange-500/30 text-[11px] font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span>Simulated EVM Voting Booth</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black">{election?.title}</h1>
            <p className="text-xs text-slate-400 mt-1">
              {election?.constituencyName} • {election?.districtName}
            </p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-right shrink-0">
            <span className="text-[11px] text-slate-400 block">Authenticated Voter</span>
            <span className="text-xs font-bold text-white block">{user.fullName}</span>
            <span className="font-mono text-[11px] text-orange-400 block">
              {user.voterProfile?.voterUid || 'MH-VTR-DEMO'}
            </span>
          </div>
        </div>
      </div>

      {/* Secrecy Assurance Banner */}
      <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 p-4 rounded-xl flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-semibold block mb-0.5">Strict Ballot Confidentiality:</strong>
          Your selected ballot choice is anonymized and unlinked from your voter identity upon submission.
          The generated receipt will only verify that you participated, without revealing your selection.
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: Electronic Ballot Unit (EVM Style) */}
      {step === 'SELECT' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Official Electronic Ballot Unit (Simulated)
            </h2>
            <span className="text-xs text-slate-400">
              Select one candidate or NOTA, then click Continue
            </span>
          </div>

          {/* Candidates EVM Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
            {candidates.map((c, idx) => {
              const isSelected = selectedCandidate?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectOption(c, false)}
                  className={`p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-orange-50/70 dark:bg-orange-950/30 border-l-4 border-l-orange-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Ballot Order Serial Number */}
                    <span className="font-mono text-sm sm:text-base font-bold text-slate-400 dark:text-slate-500 w-6 text-center">
                      {c.ballotOrder || idx + 1}
                    </span>

                    {/* Candidate Photo */}
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                      {c.photoUrl ? (
                        <img
                          src={c.photoUrl}
                          alt={c.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">
                          {c.fullName.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Name & Party */}
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {c.fullName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {c.partyAffiliation}
                      </p>
                    </div>
                  </div>

                  {/* Symbol Icon and EVM Button */}
                  <div className="flex items-center gap-4 shrink-0">
                    {/* Symbol Display */}
                    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {getSymbolIcon(c.symbolName)}
                      <span className="text-[10px] font-medium text-slate-500 mt-1">
                        {c.symbolName}
                      </span>
                    </div>

                    {/* EVM Style Blue Tactile Button */}
                    <button
                      type="button"
                      aria-label={`Select candidate ${c.fullName}`}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-all shadow-md ${
                        isSelected
                          ? 'bg-orange-600 ring-4 ring-orange-400/40 scale-105'
                          : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                      }`}
                    >
                      {isSelected ? <CheckCircle2 className="w-6 h-6" /> : <div className="w-3.5 h-3.5 rounded-full bg-white/80" />}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* NOTA Option */}
            {notaOption && (
              <div
                onClick={() => handleSelectOption(notaOption, true)}
                className={`p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer transition-all ${
                  selectedCandidate?.isNota
                    ? 'bg-orange-50/70 dark:bg-orange-950/30 border-l-4 border-l-orange-600'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm sm:text-base font-bold text-slate-400 w-6 text-center">
                    {candidates.length + 1}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold shrink-0">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      None of the Above (NOTA)
                    </h3>
                    <p className="text-xs text-slate-500">Formal rejection of all candidates</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <XCircle className="w-6 h-6 text-slate-500" />
                    <span className="text-[10px] font-medium text-slate-500 mt-1">NOTA</span>
                  </div>

                  <button
                    type="button"
                    aria-label="Select None of the Above (NOTA)"
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-all shadow-md ${
                      selectedCandidate?.isNota
                        ? 'bg-orange-600 ring-4 ring-orange-400/40 scale-105'
                        : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                    }`}
                  >
                    {selectedCandidate?.isNota ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full bg-white/80" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4">
            <Link
              to="/elections"
              className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Cancel & Exit Booth
            </Link>

            <button
              disabled={!selectedCandidate}
              onClick={handleProceedToReview}
              className={`px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-all ${
                selectedCandidate
                  ? 'bg-orange-600 hover:bg-orange-700 text-white cursor-pointer hover:scale-105'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Review Selection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: VVPAT-Style Verification & Confirmation Step */}
      {step === 'REVIEW' && selectedCandidate && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-md animate-in fade-in">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
              Step 2 of 2: VVPAT-Style Verification
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Confirm Your Ballot Selection
            </h2>
            <p className="text-xs text-slate-500">
              Please inspect the virtual slip below. Once confirmed, your ballot cannot be altered.
            </p>
          </div>

          {/* Simulated VVPAT Window Slip */}
          <div className="max-w-md mx-auto p-6 rounded-2xl bg-amber-50/80 dark:bg-slate-950 border-2 border-dashed border-amber-300 dark:border-slate-700 space-y-4 text-center">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
              • VVPAT VIRTUAL VERIFICATION WINDOW •
            </div>

            <div className="flex flex-col items-center justify-center space-y-3 py-2">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center border border-slate-200 dark:border-slate-700">
                {getSymbolIcon(selectedCandidate.symbolName)}
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {selectedCandidate.fullName}
                </h3>
                <p className="text-xs font-bold text-orange-600">
                  {selectedCandidate.partyAffiliation}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Symbol: {selectedCandidate.symbolName}
                </p>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 border-t border-dashed border-amber-200 dark:border-slate-800 pt-2">
              Electronically verified on {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setStep('SELECT')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Change Choice</span>
            </button>

            <button
              onClick={handleCastVote}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:scale-105"
            >
              <Vote className="w-4 h-4" />
              <span>Confirm & Cast Vote</span>
            </button>
          </div>
        </div>
      )}

      {/* Submitting State */}
      {step === 'SUBMITTING' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Committing Anonymized Ballot...
          </h3>
          <p className="text-xs text-slate-400">
            Executing atomic privacy transaction and computing receipt verification hash.
          </p>
        </div>
      )}

      {/* STEP 3: Success Screen */}
      {step === 'SUCCESS' && receipt && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-6 shadow-md animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Simulated Vote Cast Successfully!
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your ballot has been anonymously recorded in the database. A digital receipt has been generated below.
            </p>
          </div>

          {/* Quick receipt card */}
          <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700 text-left space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Receipt No.</span>
              <span className="font-mono font-bold text-orange-600">{receipt.receiptNumber}</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300">
              <span>Timestamp: {new Date(receipt.timestamp).toLocaleString()}</span>
            </div>
            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
              ✓ Zero-Knowledge Secrecy: Candidate selection is not exposed on this slip.
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() => setIsReceiptModalOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>View & Download PDF Receipt</span>
            </button>

            <Link
              to="/voter/dashboard"
              className="px-6 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-slate-300"
            >
              Return to Voter Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receipt={receipt}
      />
    </div>
  );
};
