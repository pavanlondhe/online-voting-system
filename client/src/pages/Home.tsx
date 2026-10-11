import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Vote,
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  FileCheck,
  BarChart3,
  Building2,
  MapPin,
  Lock,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Election, District } from '../types';

export const Home: React.FC = () => {
  const { t } = useLanguage();
  const [elections, setElections] = useState<Election[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [electionsRes, districtsRes] = await Promise.all([
          api.get<{ success: boolean; data: Election[] }>('/elections'),
          api.get<{ success: boolean; data: District[] }>('/elections/districts'),
        ]);

        if (electionsRes.success && electionsRes.data) {
          setElections(electionsRes.data);
        }
        if (districtsRes.success && districtsRes.data) {
          setDistricts(districtsRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredElections = selectedDistrict
    ? elections.filter((e) => e.districtId === selectedDistrict)
    : elections;

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section with Indian Public Service Aesthetic */}
      <section className="relative bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 text-white py-16 px-4 overflow-hidden border-b border-blue-900/50">
        {/* Subtle Decorative Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(234,88,12,0.12),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(22,163,74,0.12),transparent_50%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center space-y-6">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>State Electoral Simulation Prototype</span>
            <span className="text-slate-500">•</span>
            <span className="text-orange-400 font-medium">Maharashtra Demo</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl">
            {t.heroTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/elections"
              className="px-6 py-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Vote className="w-4 h-4" />
              <span>{t.btnExploreElections}</span>
            </Link>

            <Link
              to="/voter/services"
              className="px-6 py-3 rounded-lg bg-blue-900/80 hover:bg-blue-800 text-white font-semibold text-sm border border-blue-700/60 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{t.btnCheckEligibility}</span>
            </Link>

            <Link
              to="/results"
              className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>{t.btnViewResults}</span>
            </Link>
          </div>

          {/* Quick Notice */}
          <div className="pt-4 text-xs text-slate-400 max-w-xl">
            Simulated demonstration with fictional candidates and anonymized ballot deposition. No real voter credentials or biometrics required.
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        {/* Quick Service Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 -mt-8 relative z-20">
          <Link
            to="/voter/services"
            className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg hover:border-orange-500/50 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Voter Services</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verify eligibility, inspect demo voter ID, and check constituency allocation.
            </p>
          </Link>

          <Link
            to="/elections"
            className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg hover:border-orange-500/50 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Vote className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Active Elections</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              View active assembly, municipal, and gram panchayat demo elections.
            </p>
          </Link>

          <Link
            to="/candidates"
            className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg hover:border-orange-500/50 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Candidate Directory</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Inspect manifestos, election symbols, and candidate qualifications.
            </p>
          </Link>

          <Link
            to="/results"
            className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg hover:border-orange-500/50 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Public Results</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Live aggregate counts, turnout statistics, and NOTA counts for closed polls.
            </p>
          </Link>
        </section>

        {/* Active & Scheduled Demo Elections Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Demo Elections & Schedules
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Filter by Maharashtra administrative district to view localized elections
              </p>
            </div>

            {/* District Selector Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                District:
              </span>
              <select
                aria-label="Filter elections by Maharashtra district"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">All Maharashtra Districts</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.division})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Elections Grid */}
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Loading demonstration elections...
            </div>
          ) : filteredElections.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
              No elections found for the selected filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredElections.map((election) => (
                <div
                  key={election.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="p-5 space-y-3">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          election.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                            : election.status === 'SCHEDULED'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {election.status === 'ACTIVE'
                          ? t.statusActive
                          : election.status === 'SCHEDULED'
                          ? t.statusScheduled
                          : election.status === 'RESULTS_DECLARED'
                          ? t.statusDeclared
                          : election.status}
                      </span>

                      <span className="text-[11px] font-medium text-slate-400">
                        {election.electionType}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {election.title}
                    </h3>

                    {/* Constituency / District details */}
                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      {election.constituency && (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Constituency: {election.constituency.name}</span>
                        </div>
                      )}
                      {election.district && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>District: {election.district.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Timeline */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Ends: {new Date(election.endDate).toLocaleDateString()}</span>
                      <span>Votes: {election._count?.participations || 0}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                    {election.status === 'ACTIVE' ? (
                      <Link
                        to={`/vote/ballot/${election.id}`}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        <Vote className="w-3.5 h-3.5" />
                        <span>Cast Simulated Vote</span>
                      </Link>
                    ) : election.status === 'RESULTS_DECLARED' ? (
                      <Link
                        to={`/results?electionId=${election.id}`}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>View Official Results</span>
                      </Link>
                    ) : (
                      <Link
                        to={`/elections?id=${election.id}`}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-medium transition-colors"
                      >
                        <span>View Schedule Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Educational Architecture Spotlight: How EVM & Ballot Secrecy Work */}
        <section className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-2xl p-8 sm:p-10 border border-blue-800/60 shadow-xl space-y-6">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/80 border border-blue-700/60 text-xs text-blue-200">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Cybersecurity & Architectural Principles</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Privacy-Preserving Electronic Voting Architecture
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              How does the MahaVote demonstration platform ensure one-person-one-vote while protecting absolute voter anonymity?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-orange-600/30 text-orange-400 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">Separation of Concerns</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Voter participation records (tracking that a voter voted) are stored in an entirely separate table from anonymous ballot choices, with no linking foreign keys.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">Cryptographic Receipt</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Voters receive a unique receipt (MV-2026-XXXX-XXXX) with a SHA-256 integrity hash proving valid deposit, without revealing the candidate choice.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600/30 text-purple-400 flex items-center justify-center">
                <EyeOff className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">Duplicate Vote Immunity</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Database-level uniqueness constraints and atomic ACID transactions reject any duplicate vote attempts under high concurrent load.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
