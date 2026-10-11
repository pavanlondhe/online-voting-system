import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  BarChart3,
  Award,
  Users,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { api } from '../services/api';
import { Election } from '../types';

export const Results: React.FC = () => {
  const [searchParams] = useSearchParams();
  const requestedElectionId = searchParams.get('electionId');

  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<string>(requestedElectionId || '');
  const [resultsData, setResultsData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await api.get<{ success: boolean; data: Election[] }>('/elections');
        if (res.success && res.data) {
          setElections(res.data);
          // Auto select first closed election or results declared election
          if (!selectedElectionId) {
            const closed = res.data.find(
              (e) => e.status === 'RESULTS_DECLARED' || e.status === 'CLOSED'
            );
            if (closed) {
              setSelectedElectionId(closed.id);
            } else if (res.data.length > 0) {
              setSelectedElectionId(res.data[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch elections:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, []);

  useEffect(() => {
    if (!selectedElectionId) return;

    const fetchResults = async () => {
      setLoading(true);
      setErrorMsg('');
      setResultsData(null);

      try {
        const res = await api.get<{ success: boolean; data?: any; message?: string }>(
          `/results/election/${selectedElectionId}`
        );

        if (res.success && res.data) {
          setResultsData(res.data);
        } else {
          setErrorMsg(res.message || 'Results are not yet published for this election.');
        }
      } catch (err: any) {
        setErrorMsg(
          err.message ||
            'Results are not yet published for this election. Results become public once the election officially closes.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [selectedElectionId]);

  const COLORS = ['#ea580c', '#2563eb', '#16a34a', '#9333ea', '#0284c7', '#64748b'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider">
          <BarChart3 className="w-4 h-4" />
          <span>Electoral Audit & Counting Cell</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
          Public Simulated Election Results
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Official tabulation reports and turnout percentages for closed demonstration polls.
        </p>
      </div>

      {/* Prominent Educational Notice */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        <span>
          <strong>SIMULATED DEMONSTRATION RESULTS ONLY:</strong> These tallies represent test data deposited in our simulated election database. They have no affiliation with any actual government vote count.
        </span>
      </div>

      {/* Election Selector Dropdown */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Select Election:
        </label>
        <select
          aria-label="Select Election to view results"
          value={selectedElectionId}
          onChange={(e) => setSelectedElectionId(e.target.value)}
          className="w-full sm:w-auto flex-1 max-w-lg px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
        >
          {elections.map((elec) => (
            <option key={elec.id} value={elec.id}>
              {elec.title} [{elec.status}]
            </option>
          ))}
        </select>
      </div>

      {/* Results View */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading election results...</div>
      ) : errorMsg ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Results Not Yet Declared
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">{errorMsg}</p>
        </div>
      ) : resultsData ? (
        <div className="space-y-8 animate-in fade-in">
          {/* Winner Banner */}
          {resultsData.summary?.winnerSummary && (
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5" />
                  <span>Simulated Election Winner Declared</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black">
                  {resultsData.summary.winnerSummary}
                </h2>
                <p className="text-xs text-emerald-100">
                  Certified on {new Date(resultsData.summary.declaredAt).toLocaleDateString()}
                </p>
              </div>

              <div className="p-4 bg-white/10 rounded-xl backdrop-blur-xs text-center shrink-0">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-200 block">
                  Turnout Rate
                </span>
                <span className="text-3xl font-black text-white">
                  {resultsData.summary.turnoutPercentage}%
                </span>
              </div>
            </div>
          )}

          {/* Key KPI Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Total Valid Votes Cast</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {resultsData.summary.totalVotesCast.toLocaleString()}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Turnout Percentage</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {resultsData.summary.turnoutPercentage}%
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">NOTA (Rejection) Votes</span>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                {resultsData.summary.notaCount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Graphical Visualization Bar Chart */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Candidate Vote Share Distribution (Interactive Chart)
            </h3>

            <div className="h-64 sm:h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resultsData.tallies} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="candidateName" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
                    {resultsData.tallies.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabular Tallies Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-white">
              Official Candidate Vote Tally
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Candidate / Option</th>
                    <th className="py-3 px-4">Party Affiliation</th>
                    <th className="py-3 px-4">Symbol</th>
                    <th className="py-3 px-4 text-right">Votes Polled</th>
                    <th className="py-3 px-4 text-right">Percentage</th>
                    <th className="py-3 px-4 text-center">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {resultsData.tallies.map((item: any, i: number) => (
                    <tr
                      key={i}
                      className={
                        item.isWinner
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 font-semibold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }
                    >
                      <td className="py-3.5 px-4 text-slate-900 dark:text-white font-medium">
                        {item.candidateName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {item.party}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {item.symbol}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        {item.votes.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-orange-600 dark:text-orange-400 font-bold">
                        {item.percentage}%
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {item.isWinner ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 text-[10px] font-bold uppercase">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Winner</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
