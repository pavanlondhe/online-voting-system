import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  FileText,
  Award,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Building2,
  Upload,
  Lock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CandidateProfile, Election, Nomination } from '../types';

export const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Nomination Submission Form
  const [selectedElectionId, setSelectedElectionId] = useState<string>('');
  const [affidavitSummary, setAffidavitSummary] = useState<string>(
    'I solemnly declare that all personal disclosures, qualifications, and demonstration assets submitted herein are accurate according to educational election guidelines.'
  );
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formMsg, setFormMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Profile Editor Mode
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [manifestoText, setManifestoText] = useState<string>('');
  const [bioText, setBioText] = useState<string>('');
  const [savingProfile, setSavingProfile] = useState<boolean>(false);

  const fetchProfileAndElections = async () => {
    setLoading(true);
    try {
      const [profRes, elecRes] = await Promise.all([
        api.get<{ success: boolean; data: CandidateProfile }>('/candidates/me/profile'),
        api.get<{ success: boolean; data: Election[] }>('/elections'),
      ]);

      if (profRes.success && profRes.data) {
        setProfile(profRes.data);
        setManifestoText(profRes.data.manifesto || '');
        setBioText(profRes.data.biography || '');
      }

      if (elecRes.success && elecRes.data) {
        setElections(elecRes.data);
        if (elecRes.data.length > 0) {
          setSelectedElectionId(elecRes.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load candidate dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'CANDIDATE') {
      fetchProfileAndElections();
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put<{ success: boolean; message: string; data: CandidateProfile }>(
        '/candidates/me/profile',
        {
          manifesto: manifestoText,
          biography: bioText,
        }
      );
      if (res.success && res.data) {
        setProfile(res.data);
        setIsEditing(false);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleApplyNomination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedElectionId) return;

    setSubmitting(true);
    setFormMsg(null);

    try {
      const res = await api.post<{ success: boolean; message: string; data: Nomination }>(
        '/candidates/nominations',
        {
          electionId: selectedElectionId,
          affidavitSummary,
        }
      );

      if (res.success) {
        setFormMsg({
          type: 'success',
          text: 'Nomination submitted successfully! It is now pending review by the Returning Officer.',
        });
        fetchProfileAndElections();
      } else {
        setFormMsg({ type: 'error', text: res.message || 'Failed to submit nomination' });
      }
    } catch (err: any) {
      setFormMsg({ type: 'error', text: err.message || 'Nomination submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || user.role !== 'CANDIDATE') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm text-slate-500">Only registered candidates can access this dashboard.</p>
        <Link
          to="/login?role=CANDIDATE"
          className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-semibold"
        >
          Candidate Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 font-semibold uppercase tracking-wider">
          <Award className="w-4 h-4" />
          <span>Candidate Administration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
          Candidate Portal: {user.fullName}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your election manifesto, submit nomination applications, and track Returning Officer review decisions.
        </p>
      </div>

      {/* Security Warning Notice */}
      <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex items-start gap-3 text-xs">
        <Lock className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
        <div className="text-slate-300 leading-relaxed">
          <strong className="text-white font-semibold">Strict Electoral Privacy Boundary:</strong> In accordance with constitutional electoral laws, candidate accounts have strictly zero access to voter identity records, individual ballot choices, OTP codes, or internal turnout IPs.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Candidate Profile Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                {profile?.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">
                    {user.fullName.charAt(0)}
                  </div>
                )}
              </div>

              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 uppercase">
                {profile?.partyAffiliation || 'Independent'}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{user.fullName}</h3>
              <p className="text-xs text-orange-600 font-semibold">Symbol: {profile?.symbolName}</p>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Education</span>
                <p className="font-medium text-slate-800 dark:text-slate-200">{profile?.education || 'N/A'}</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Allocated Constituency</span>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {profile?.constituency?.name || 'Kasba Peth (Assembly AC-215)'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="w-full py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
            >
              {isEditing ? 'Cancel Editing' : 'Edit Manifesto & Biography'}
            </button>
          </div>

          {/* Edit Form Modal/Drawer */}
          {isEditing && (
            <form
              onSubmit={handleUpdateProfile}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 animate-in fade-in"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Update Candidate Details
              </h4>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Biography
                </label>
                <textarea
                  rows={3}
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Manifesto Declaration
                </label>
                <textarea
                  rows={4}
                  value={manifestoText}
                  onChange={(e) => setManifestoText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg transition-colors"
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>

        {/* Right: Nominations Tracking & Submission */}
        <div className="lg:col-span-2 space-y-8">
          {/* Submit New Nomination Card */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Submit Nomination Application
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Apply to contest an active or scheduled Maharashtra demonstration election.
              </p>
            </div>

            {formMsg && (
              <div
                className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs ${
                  formMsg.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-800 dark:text-red-300'
                }`}
              >
                {formMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{formMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleApplyNomination} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Election to Contest:
                </label>
                <select
                  aria-label="Select Election to Contest"
                  value={selectedElectionId}
                  onChange={(e) => setSelectedElectionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  {elections.map((elec) => (
                    <option key={elec.id} value={elec.id}>
                      {elec.title} [{elec.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Affidavit & Disclosure Declaration:
                </label>
                <textarea
                  rows={2}
                  required
                  value={affidavitSummary}
                  onChange={(e) => setAffidavitSummary(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>{submitting ? 'Submitting Nomination...' : 'Submit Nomination Application'}</span>
              </button>
            </form>
          </section>

          {/* Submitted Nominations Tracking */}
          <section className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              My Nomination Applications & Review Status
            </h2>

            {profile?.nominations && profile.nominations.length > 0 ? (
              <div className="space-y-3">
                {profile.nominations.map((nom) => (
                  <div
                    key={nom.id}
                    className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {nom.election?.electionType}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {nom.election?.title}
                        </h4>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          nom.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : nom.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {nom.status === 'APPROVED'
                          ? 'Approved (Contesting)'
                          : nom.status === 'REJECTED'
                          ? 'Rejected'
                          : 'Pending Review'}
                      </span>
                    </div>

                    {/* Returning Officer Review Remarks */}
                    {nom.reviewRemarks && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs space-y-0.5 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">
                          Returning Officer Review Remarks:
                        </span>
                        <p className="text-slate-800 dark:text-slate-200 font-medium">
                          "{nom.reviewRemarks}"
                        </p>
                        {nom.reviewedBy && (
                          <span className="text-[10px] text-slate-500 block pt-1">
                            Reviewed by: {nom.reviewedBy.fullName}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400">
                      Applied on: {new Date(nom.nominationDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                You have not submitted any nomination applications yet. Use the form above to apply.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
