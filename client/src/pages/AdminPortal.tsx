import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  Shield,
  Users,
  Vote,
  Award,
  AlertTriangle,
  FileText,
  Download,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Search,
  Building2,
  Calendar,
  Lock,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AuditLog, Election, Nomination, District, Constituency } from '../types';

export const AdminPortal: React.FC = () => {
  const { user, switchDemoAccount } = useAuth();

  // Active Admin Sub-View: 'ANALYTICS' | 'ELECTIONS' | 'NOMINATIONS' | 'AUDIT_LOGS' | 'USERS'
  const [activeTab, setActiveTab] = useState<
    'ANALYTICS' | 'ELECTIONS' | 'NOMINATIONS' | 'AUDIT_LOGS' | 'USERS'
  >('ANALYTICS');

  // Metrics Data
  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Elections Management
  const [elections, setElections] = useState<Election[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newType, setNewType] = useState<string>('ASSEMBLY');
  const [newStartDate, setNewStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [newEndDate, setNewEndDate] = useState<string>(
    new Date(Date.now() + 48 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [newDescription, setNewDescription] = useState<string>('');
  const [newEligibleVoters, setNewEligibleVoters] = useState<number>(50000);
  const [creatingElection, setCreatingElection] = useState<boolean>(false);

  // Nominations Management
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [reviewModalNom, setReviewModalNom] = useState<Nomination | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState<string>('');
  const [reviewing, setReviewing] = useState<boolean>(false);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [logFilterSeverity, setLogFilterSeverity] = useState<string>('');

  // Users Directory
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState<string>('');

  // Status message
  const [actionNotice, setActionNotice] = useState<string>('');

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [metRes, elecRes, nomRes, logRes, usrRes] = await Promise.all([
        api.get<{ success: boolean; data: any }>('/admin/metrics'),
        api.get<{ success: boolean; data: Election[] }>('/elections'),
        api.get<{ success: boolean; data: Nomination[] }>('/admin/nominations'),
        api.get<{ success: boolean; data: AuditLog[] }>(
          `/admin/audit-logs${logFilterSeverity ? `?severity=${logFilterSeverity}` : ''}`
        ),
        api.get<{ success: boolean; data: any[] }>(
          `/admin/users${userSearch ? `?search=${encodeURIComponent(userSearch)}` : ''}`
        ),
      ]);

      if (metRes.success && metRes.data) setMetrics(metRes.data);
      if (elecRes.success && elecRes.data) setElections(elecRes.data);
      if (nomRes.success && nomRes.data) setNominations(nomRes.data);
      if (logRes.success && logRes.data) setAuditLogs(logRes.data);
      if (usrRes.success && usrRes.data) setUsersList(usrRes.data);
    } catch (err) {
      console.error('Failed to load administrative portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'VOTER' && user.role !== 'CANDIDATE') {
      fetchAllData();
    }
  }, [user, logFilterSeverity, userSearch]);

  const handleUpdateElectionStatus = async (electionId: string, newStatus: string) => {
    try {
      const res = await api.patch<{ success: boolean; message: string }>(
        `/elections/${electionId}/status`,
        { status: newStatus }
      );
      if (res.success) {
        setActionNotice(`Election status updated to ${newStatus}`);
        setTimeout(() => setActionNotice(''), 3000);
        fetchAllData();
      }
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleDeclareResults = async (electionId: string) => {
    if (!confirm('Are you sure you want to tally votes and declare public results for this election?')) {
      return;
    }
    try {
      const res = await api.post<{ success: boolean; message: string }>(
        `/results/election/${electionId}/declare`
      );
      if (res.success) {
        setActionNotice('Results compiled and published successfully!');
        setTimeout(() => setActionNotice(''), 3000);
        fetchAllData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to declare results');
    }
  };

  const handleCreateElection = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingElection(true);
    try {
      const res = await api.post<{ success: boolean; message: string }>('/elections', {
        title: newTitle,
        electionType: newType,
        startDate: new Date(newStartDate).toISOString(),
        endDate: new Date(newEndDate).toISOString(),
        description: newDescription,
        totalEligibleVoters: Number(newEligibleVoters),
      });

      if (res.success) {
        setIsCreateModalOpen(false);
        setNewTitle('');
        setNewDescription('');
        setActionNotice('Demo election created successfully!');
        setTimeout(() => setActionNotice(''), 3000);
        fetchAllData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to schedule election');
    } finally {
      setCreatingElection(false);
    }
  };

  const handleReviewNomination = async (status: 'APPROVED' | 'REJECTED') => {
    if (!reviewModalNom) return;
    if (!reviewRemarks.trim()) {
      alert('Official review remarks are mandatory.');
      return;
    }

    setReviewing(true);
    try {
      const res = await api.post<{ success: boolean; message: string }>(
        `/admin/nominations/${reviewModalNom.id}/review`,
        {
          status,
          reviewRemarks: reviewRemarks.trim(),
        }
      );

      if (res.success) {
        setReviewModalNom(null);
        setReviewRemarks('');
        setActionNotice(`Nomination application has been ${status.toLowerCase()}!`);
        setTimeout(() => setActionNotice(''), 3000);
        fetchAllData();
      }
    } catch (err: any) {
      alert(err.message || 'Review action failed');
    } finally {
      setReviewing(false);
    }
  };

  const handleExportAuditCsv = () => {
    window.open('http://localhost:5000/api/admin/audit-logs/export', '_blank');
  };

  const COLORS = ['#ea580c', '#2563eb', '#16a34a', '#9333ea', '#c59b27'];

  // Check if user is an admin officer
  const isAuthorizedAdmin =
    user && ['SUPER_ADMIN', 'STATE_ELECTION_ADMIN', 'DISTRICT_ELECTION_OFFICER', 'RETURNING_OFFICER', 'AUDITOR'].includes(user.role);

  if (!isAuthorizedAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 mx-auto flex items-center justify-center font-bold">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          Election Official Authentication Required
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Access to the Election Commission administrative portal is restricted to authorized election officers. You can use 1-click test login below.
        </p>

        {/* 1-Click Persona Selector */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-w-md mx-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Demo Officer Persona
          </h3>
          <div className="space-y-2 text-left">
            <button
              onClick={() => switchDemoAccount('SUPER_ADMIN')}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Super Administrator</p>
                <p className="text-[11px] text-slate-400">Full statewide access, audit export, role control</p>
              </div>
              <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded">
                SUPER_ADMIN
              </span>
            </button>

            <button
              onClick={() => switchDemoAccount('RO')}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Returning Officer (Kasba Peth)</p>
                <p className="text-[11px] text-slate-400">Nomination review, constituency scrutiny</p>
              </div>
              <span className="text-[10px] font-bold text-purple-500 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded">
                RO
              </span>
            </button>

            <button
              onClick={() => switchDemoAccount('DEO')}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-bold text-slate-900 dark:text-white">District Election Officer (Pune)</p>
                <p className="text-[11px] text-slate-400">District turnout supervision, polling stations</p>
              </div>
              <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">
                DEO
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner with Officer Identity */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
              Official Election Administration Portal
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              {user.role}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">{user.fullName}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            MahaVote State Electoral Management & Scrutiny Headquarters
          </p>
        </div>

        {/* Quick actions in banner */}
        <div className="flex flex-wrap items-center gap-2">
          {user.role !== 'AUDITOR' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Schedule New Election</span>
            </button>
          )}

          <button
            onClick={handleExportAuditCsv}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit Trail (CSV)</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 text-xs font-semibold whitespace-nowrap">
        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`py-2 px-4 rounded-lg transition-colors ${
            activeTab === 'ANALYTICS'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Analytics Dashboard
        </button>

        <button
          onClick={() => setActiveTab('ELECTIONS')}
          className={`py-2 px-4 rounded-lg transition-colors ${
            activeTab === 'ELECTIONS'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Manage Elections ({elections.length})
        </button>

        <button
          onClick={() => setActiveTab('NOMINATIONS')}
          className={`py-2 px-4 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'NOMINATIONS'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Candidate Nominations</span>
          {metrics?.summary?.pendingNominationsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px]">
              {metrics.summary.pendingNominationsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('AUDIT_LOGS')}
          className={`py-2 px-4 rounded-lg transition-colors ${
            activeTab === 'AUDIT_LOGS'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Tamper-Evident Audit Logs
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          className={`py-2 px-4 rounded-lg transition-colors ${
            activeTab === 'USERS'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Electoral User Directory
        </button>
      </div>

      {/* VIEW 1: Analytics Dashboard */}
      {activeTab === 'ANALYTICS' && metrics && (
        <div className="space-y-8 animate-in fade-in">
          {/* Key KPI Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                Total Demo Voters
              </span>
              <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                {metrics.summary.totalRegisteredVoters}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                Active Elections
              </span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                {metrics.summary.activeElectionsCount}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                Approved Candidates
              </span>
              <span className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1 block">
                {metrics.summary.totalApprovedCandidates}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                Pending Nominations
              </span>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                {metrics.summary.pendingNominationsCount}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                Total Ballots Cast
              </span>
              <span className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1 block">
                {metrics.summary.totalBallotsCast}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                Total Schedules
              </span>
              <span className="text-xl font-black text-slate-700 dark:text-slate-300 mt-1 block">
                {metrics.summary.totalElectionsCount}
              </span>
            </div>
          </div>

          {/* Interactive Recharts Turnout & District Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: District-wise Voter Registration */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                District-wise Registered Demo Voters
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.districts} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="voterCount" fill="#ea580c" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Election Turnout Rates */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Election Ballots Cast Tally
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.elections} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="title" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="votesCast" fill="#16a34a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Security & Failure Alerts Box */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Security Alerts & Audit Warnings
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Live monitoring of duplicate votes and failed auth
              </span>
            </div>

            {metrics.securityAlerts && metrics.securityAlerts.length > 0 ? (
              <div className="space-y-2">
                {metrics.securityAlerts.map((alert: any) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-amber-900 dark:text-amber-300">
                        {alert.action}
                      </span>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                        Target: {alert.resource} • IP: {alert.ipAddress || '127.0.0.1'}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3 italic">
                No active security alerts or abnormal authentication patterns detected.
              </p>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: Elections Management */}
      {activeTab === 'ELECTIONS' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Election Lifecycle Management
              </h2>
              <p className="text-xs text-slate-500">
                Schedule, publish, pause, close, and declare simulated results.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Title & Type</th>
                    <th className="py-3 px-4">Constituency / District</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Votes Cast</th>
                    <th className="py-3 px-4 text-right">Administrative Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {elections.map((elec) => (
                    <tr key={elec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {elec.title}
                        </span>
                        <span className="text-[10px] text-slate-400">{elec.electionType}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {elec.constituency?.name || 'All'} • {elec.district?.name || 'Maharashtra'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            elec.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : elec.status === 'SCHEDULED'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : elec.status === 'RESULTS_DECLARED'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {elec.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        {elec._count?.participations || 0}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {elec.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleUpdateElectionStatus(elec.id, 'ACTIVE')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-[11px]"
                          >
                            Open Voting
                          </button>
                        )}

                        {elec.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleUpdateElectionStatus(elec.id, 'CLOSED')}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-medium text-[11px]"
                          >
                            Close Voting
                          </button>
                        )}

                        {elec.status === 'CLOSED' && (
                          <button
                            onClick={() => handleDeclareResults(elec.id)}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium text-[11px]"
                          >
                            Declare Results
                          </button>
                        )}

                        {elec.status === 'RESULTS_DECLARED' && (
                          <Link
                            to={`/results?electionId=${elec.id}`}
                            className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded font-medium text-[11px]"
                          >
                            View Results
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Candidate Nominations Review (Returning Officer / Admin) */}
      {activeTab === 'NOMINATIONS' && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Candidate Nomination Review & Scrutiny
            </h2>
            <p className="text-xs text-slate-500">
              Returning Officer judicial scrutiny: review affidavits, qualifications, and approve or reject candidates with formal recorded reasons.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Party & Symbol</th>
                    <th className="py-3 px-4">Contesting Election</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Official Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {nominations.map((nom) => (
                    <tr key={nom.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {nom.candidate?.user.fullName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {nom.candidate?.partyAffiliation} • Symbol: {nom.candidate?.symbolName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {nom.election?.title}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            nom.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : nom.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {nom.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setReviewModalNom(nom);
                            setReviewRemarks(
                              nom.reviewRemarks ||
                                'All educational demonstration documents and asset forms verified successfully.'
                            );
                          }}
                          className="px-3 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded font-medium text-[11px]"
                        >
                          Review Nomination
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: Tamper-Evident Audit Logs */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Tamper-Evident System Audit Trail
              </h2>
              <p className="text-xs text-slate-500">
                Immutable security logs recording logins, ballot depositions, nomination reviews, and status changes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                aria-label="Filter Audit Logs by Severity"
                value={logFilterSeverity}
                onChange={(e) => setLogFilterSeverity(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                <option value="">All Severities</option>
                <option value="INFO">INFO Only</option>
                <option value="WARNING">WARNING Only</option>
                <option value="CRITICAL">CRITICAL Only</option>
              </select>

              <button
                onClick={handleExportAuditCsv}
                className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider sticky top-0 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Action Event</th>
                    <th className="py-3 px-4">Target Resource</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.severity === 'CRITICAL'
                              ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                              : log.severity === 'WARNING'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {log.severity}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                        {log.resource}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {log.user?.email || 'SYSTEM'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 max-w-xs truncate">
                        {log.details || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: User Management Directory */}
      {activeTab === 'USERS' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Electoral Roll & Accounts Directory
              </h2>
              <p className="text-xs text-slate-500">
                Inspect registered voters, demo voter UIDs, and election administrative officers.
              </p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name, email, or UID..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Email / Phone</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Demo Voter UID / Profile</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {u.fullName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        <div>{u.email}</div>
                        <div className="text-[11px] text-slate-400">{u.phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {u.voterProfile?.voterUid ? (
                          <span className="font-mono text-orange-600 font-bold">
                            {u.voterProfile.voterUid}
                          </span>
                        ) : u.candidateProfile ? (
                          <span>
                            Candidate: {u.candidateProfile.partyAffiliation} ({u.candidateProfile.symbolName})
                          </span>
                        ) : (
                          <span>Administrative Official</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create New Election Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Schedule New Demonstration Election
            </h3>

            <form onSubmit={handleCreateElection} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Election Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune Cantonment Assembly By-Election 2026 (Demo)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Election Type:</label>
                <select
                  aria-label="Select New Election Type"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="ASSEMBLY">Legislative Assembly</option>
                  <option value="PARLIAMENTARY">Parliamentary (Lok Sabha)</option>
                  <option value="MUNICIPAL_CORP">Municipal Corporation</option>
                  <option value="MUNICIPAL_COUNCIL">Municipal Council</option>
                  <option value="GRAM_PANCHAYAT">Gram Panchayat</option>
                  <option value="STUDENT">Student Council</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Start Date:</label>
                  <input
                    type="date"
                    required
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">End Date:</label>
                  <input
                    type="date"
                    required
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Total Eligible Voters Estimate:</label>
                <input
                  type="number"
                  value={newEligibleVoters}
                  onChange={(e) => setNewEligibleVoters(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Official Notice Description:</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Demonstration election notification summary..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingElection}
                  className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold"
                >
                  {creatingElection ? 'Creating...' : 'Create Election'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Nomination Modal */}
      {reviewModalNom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Returning Officer Nomination Scrutiny
            </h3>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl text-xs space-y-2">
              <div>
                <span className="text-slate-400">Candidate:</span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {reviewModalNom.candidate?.user.fullName}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Election:</span>
                <p className="font-medium text-slate-900 dark:text-white">
                  {reviewModalNom.election?.title}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Affidavit Summary:</span>
                <p className="italic text-slate-700 dark:text-slate-300">
                  "{reviewModalNom.affidavitSummary}"
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Judicial Scrutiny Remarks (Mandatory):
              </label>
              <textarea
                rows={3}
                required
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                placeholder="Enter mandatory reason for approval or rejection..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewModalNom(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={reviewing}
                onClick={() => handleReviewNomination('REJECTED')}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                Reject Nomination
              </button>
              <button
                type="button"
                disabled={reviewing}
                onClick={() => handleReviewNomination('APPROVED')}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                Approve & Place on Ballot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
