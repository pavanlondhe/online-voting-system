import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  BookOpen,
  Award,
  Building2,
  FileText,
  ShieldAlert,
  Sparkles,
  TreePine,
  Flame,
  Sun,
  PenTool,
  Flag,
} from 'lucide-react';
import { api } from '../services/api';
import { CandidateProfile } from '../types';

export const Candidates: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedParty, setSelectedParty] = useState<string>('');

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const res = await api.get<{ success: boolean; data: CandidateProfile[] }>('/candidates');
        if (res.success && res.data) {
          setCandidates(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch candidates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const getSymbolIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('tree')) return <TreePine className="w-4 h-4 text-emerald-600" />;
    if (n.includes('book')) return <BookOpen className="w-4 h-4 text-blue-600" />;
    if (n.includes('lamp') || n.includes('flame')) return <Flame className="w-4 h-4 text-amber-600" />;
    if (n.includes('sun')) return <Sun className="w-4 h-4 text-orange-600" />;
    if (n.includes('pen')) return <PenTool className="w-4 h-4 text-purple-600" />;
    return <Flag className="w-4 h-4 text-slate-600" />;
  };

  const filteredCandidates = candidates.filter((c) => {
    if (selectedParty && c.partyAffiliation !== selectedParty) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = c.user.fullName.toLowerCase().includes(q);
      const matchSymbol = c.symbolName.toLowerCase().includes(q);
      const matchParty = c.partyAffiliation.toLowerCase().includes(q);
      if (!matchName && !matchSymbol && !matchParty) return false;
    }
    return true;
  });

  const parties = Array.from(new Set(candidates.map((c) => c.partyAffiliation)));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 font-semibold uppercase tracking-wider">
          <Users className="w-4 h-4" />
          <span>Contesting Profiles</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
          Maharashtra Candidate Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Demonstration profiles with neutral biographies, election symbols, educational qualifications, and public manifestos.
        </p>
      </div>

      {/* Disclaimers Bar */}
      <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
        <ShieldAlert className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0" />
        <span>
          <strong>Sample Candidates Only:</strong> The names, affiliations, symbols, and asset disclosures shown below are strictly fictional sample data for educational demonstration purposes.
        </span>
      </div>

      {/* Search and Party Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search candidate name or symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div>
          <select
            aria-label="Filter by Party Affiliation"
            value={selectedParty}
            onChange={(e) => setSelectedParty(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="">All Affiliations / Parties</option>
            {parties.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidates Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading candidates...</div>
      ) : filteredCandidates.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
          No candidates found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 space-y-4">
                {/* Photo and Identity */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                    {candidate.photoUrl ? (
                      <img
                        src={candidate.photoUrl}
                        alt={candidate.user.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-lg text-slate-400">
                        {candidate.user.fullName.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                      {candidate.user.fullName}
                    </h3>
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold truncate">
                      {candidate.partyAffiliation}
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-1.5">
                      {getSymbolIcon(candidate.symbolName)}
                      <span>Symbol: {candidate.symbolName}</span>
                    </div>
                  </div>
                </div>

                {/* Constituency and Education */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {candidate.constituency && (
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{candidate.constituency.name}</span>
                    </div>
                  )}
                  {candidate.education && (
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{candidate.education}</span>
                    </div>
                  )}
                </div>

                {/* Manifesto Snippet */}
                {candidate.manifesto && (
                  <div className="pt-2">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      <FileText className="w-3 h-3" />
                      <span>Manifesto Summary</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      "{candidate.manifesto}"
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Educational Sample</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Contesting Demo Status: Approved
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
