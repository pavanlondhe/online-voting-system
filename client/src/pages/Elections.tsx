import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Vote,
  Search,
  Filter,
  Calendar,
  Building2,
  Users,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { Election, District, Constituency } from '../types';
import { useLanguage } from '../context/LanguageContext';

export const Elections: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialElectionId = searchParams.get('id');

  const [elections, setElections] = useState<Election[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Selected Election for Detail Modal
  const [activeElection, setActiveElection] = useState<Election | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [elecRes, distRes] = await Promise.all([
          api.get<{ success: boolean; data: Election[] }>('/elections'),
          api.get<{ success: boolean; data: District[] }>('/elections/districts'),
        ]);

        if (elecRes.success && elecRes.data) {
          setElections(elecRes.data);
          if (initialElectionId) {
            const found = elecRes.data.find((e) => e.id === initialElectionId);
            if (found) setActiveElection(found);
          }
        }
        if (distRes.success && distRes.data) {
          setDistricts(distRes.data);
        }
      } catch (err) {
        console.error('Failed to load elections:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [initialElectionId]);

  const filteredElections = elections.filter((e) => {
    if (selectedDistrict && e.districtId !== selectedDistrict) return false;
    if (selectedType && e.electionType !== selectedType) return false;
    if (selectedStatus && e.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchConst = e.constituency?.name.toLowerCase().includes(q);
      const matchDist = e.district?.name.toLowerCase().includes(q);
      if (!matchTitle && !matchConst && !matchDist) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 font-semibold uppercase tracking-wider">
          <Calendar className="w-4 h-4" />
          <span>Electoral Schedules & Ballots</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
          Maharashtra Demonstration Elections
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Explore simulated parliamentary, assembly, municipal corporation, and gram panchayat elections.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by title or constituency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* District Filter */}
          <div>
            <select
              aria-label="Filter by Maharashtra District"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="">All Maharashtra Districts</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.division})
                </option>
              ))}
            </select>
          </div>

          {/* Election Type */}
          <div>
            <select
              aria-label="Filter by Election Type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="">All Election Types</option>
              <option value="ASSEMBLY">Legislative Assembly</option>
              <option value="PARLIAMENTARY">Parliamentary (Lok Sabha)</option>
              <option value="MUNICIPAL_CORP">Municipal Corporation</option>
              <option value="MUNICIPAL_COUNCIL">Municipal Council</option>
              <option value="GRAM_PANCHAYAT">Gram Panchayat</option>
              <option value="STUDENT">Student Council</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              aria-label="Filter by Election Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active & Voting Open</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="CLOSED">Voting Closed</option>
              <option value="RESULTS_DECLARED">Results Declared</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchQuery || selectedDistrict || selectedType || selectedStatus) && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDistrict('');
                setSelectedType('');
                setSelectedStatus('');
              }}
              className="text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Elections Results Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading elections...</div>
      ) : filteredElections.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
          No demonstration elections matched your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredElections.map((election) => (
            <div
              key={election.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 space-y-3">
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      election.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                        : election.status === 'SCHEDULED'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                        : election.status === 'RESULTS_DECLARED'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {election.status === 'ACTIVE'
                      ? 'Voting Open'
                      : election.status === 'RESULTS_DECLARED'
                      ? 'Results Published'
                      : election.status}
                  </span>

                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {election.electionType}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                  {election.title}
                </h3>

                {/* Location details */}
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 pt-1">
                  {election.constituency && (
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{election.constituency.name}</span>
                    </div>
                  )}
                  {election.district && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {election.district.name} ({election.district.division} Division)
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Eligible Demo Voters: {election.totalEligibleVoters.toLocaleString()}</span>
                  </div>
                </div>

                {/* Date range */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Start: {new Date(election.startDate).toLocaleDateString()}</span>
                  <span>End: {new Date(election.endDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => setActiveElection(election)}
                  className="flex-1 py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
                >
                  View Details
                </button>

                {election.status === 'ACTIVE' && (
                  <Link
                    to={`/vote/ballot/${election.id}`}
                    className="py-1.5 px-4 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 shrink-0"
                  >
                    <Vote className="w-3.5 h-3.5" />
                    <span>Vote Now</span>
                  </Link>
                )}

                {election.status === 'RESULTS_DECLARED' && (
                  <Link
                    to={`/results?electionId=${election.id}`}
                    className="py-1.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 shrink-0"
                  >
                    <span>Results</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Election Detail Modal */}
      {activeElection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div>
                <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
                  Election Specifications
                </span>
                <h3 className="font-bold text-base">{activeElection.title}</h3>
              </div>
              <button
                onClick={() => setActiveElection(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Basic Overview */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-400">Election Type:</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {activeElection.electionType}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Current Status:</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {activeElection.status}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">District:</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {activeElection.district?.name || 'All Maharashtra'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Constituency:</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {activeElection.constituency?.name || 'Statewide'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Voting Window:</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {new Date(activeElection.startDate).toLocaleDateString()} to{' '}
                    {new Date(activeElection.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Ballots Cast:</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {activeElection._count?.participations || 0}
                  </p>
                </div>
              </div>

              {/* Description */}
              {activeElection.description && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Official Notice Summary
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                    {activeElection.description}
                  </p>
                </div>
              )}

              {/* Contesting Candidates */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Contesting Candidates (Neutral Demo Profiles)
                </h4>
                {activeElection.candidates && activeElection.candidates.length > 0 ? (
                  <div className="space-y-2">
                    {activeElection.candidates.map((c, i) => (
                      <div
                        key={c.id || i}
                        className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-slate-400 w-5">
                            {c.ballotOrder || i + 1}.
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {c.candidate.user.fullName}
                            </p>
                            <p className="text-slate-500">{c.candidate.partyAffiliation}</p>
                          </div>
                        </div>
                        <div className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-[11px]">
                          Symbol: {c.candidate.symbolName}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Candidate nominations are currently under review by the Returning Officer.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setActiveElection(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                Close
              </button>
              {activeElection.status === 'ACTIVE' && (
                <Link
                  to={`/vote/ballot/${activeElection.id}`}
                  className="px-4 py-2 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Vote className="w-4 h-4" />
                  <span>Access Electronic Ballot</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
