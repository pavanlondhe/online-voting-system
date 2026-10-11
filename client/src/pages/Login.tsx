import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Vote,
  Shield,
  Smartphone,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { OtpSimulatorModal } from '../components/OtpSimulatorModal';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'VOTER';

  const { login, loginWithOtp } = useAuth();

  // Active Tab: 'VOTER' | 'CANDIDATE' | 'ADMIN'
  const [activeTab, setActiveTab] = useState<'VOTER' | 'CANDIDATE' | 'ADMIN'>(
    initialRole === 'ADMIN' ? 'ADMIN' : initialRole === 'CANDIDATE' ? 'CANDIDATE' : 'VOTER'
  );

  // Voter sub-mode: 'OTP' | 'PASSWORD'
  const [voterAuthMode, setVoterAuthMode] = useState<'OTP' | 'PASSWORD'>('OTP');

  // Form Fields
  const [identifier, setIdentifier] = useState<string>('9876543210');
  const [password, setPassword] = useState<string>('Voter@12345');
  const [otpCode, setOtpCode] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpLoading, setOtpLoading] = useState<boolean>(false);

  // States
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState<boolean>(false);

  // Quick Account Fill
  const setQuickAccount = (id: string, pass: string, tab: 'VOTER' | 'CANDIDATE' | 'ADMIN') => {
    setActiveTab(tab);
    setIdentifier(id);
    setPassword(pass);
    setVoterAuthMode('PASSWORD');
    setErrorMsg('');
  };

  const handleRequestOtp = async () => {
    if (!identifier.trim()) {
      setErrorMsg('Please enter your mobile number or email address');
      return;
    }

    setOtpLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post<{
        success: boolean;
        message: string;
        data: { simulatorOtp: string };
      }>('/auth/otp/request', {
        identifier: identifier.trim(),
        purpose: 'LOGIN',
      });

      if (res.success) {
        setOtpSent(true);
        setSuccessMsg(
          `Demo OTP generated: ${res.data?.simulatorOtp}. (You can also open the OTP Simulator to inspect it)`
        );
        setOtpCode(res.data?.simulatorOtp || '');
      } else {
        setErrorMsg(res.message || 'Failed to request OTP');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (activeTab === 'VOTER' && voterAuthMode === 'OTP') {
        if (!otpSent) {
          await handleRequestOtp();
          setLoading(false);
          return;
        }

        const res = await loginWithOtp(identifier.trim(), otpCode.trim());
        if (res.success) {
          navigate('/voter/dashboard');
        } else {
          setErrorMsg(res.message || 'Invalid OTP code');
        }
      } else {
        // Password login
        const res = await login(identifier.trim(), password);
        if (res.success) {
          if (activeTab === 'ADMIN') {
            navigate('/admin/portal');
          } else if (activeTab === 'CANDIDATE') {
            navigate('/candidate/dashboard');
          } else {
            navigate('/voter/dashboard');
          }
        } else {
          setErrorMsg(res.message || 'Invalid credentials');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-950 to-slate-900 border border-orange-500/30 text-orange-400 mx-auto flex items-center justify-center font-bold shadow-md">
          <Vote className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Sign In to MahaVote
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Educational Demonstration Portal • Select your role below
        </p>
      </div>

      {/* Role Tabs */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setActiveTab('VOTER');
            setIdentifier('9876543210');
            setPassword('Voter@12345');
            setErrorMsg('');
          }}
          className={`flex-1 py-2 rounded-lg transition-all ${
            activeTab === 'VOTER'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Voter
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('CANDIDATE');
            setIdentifier('ananya@candidate.demo');
            setPassword('Candidate@12345');
            setVoterAuthMode('PASSWORD');
            setErrorMsg('');
          }}
          className={`flex-1 py-2 rounded-lg transition-all ${
            activeTab === 'CANDIDATE'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Candidate
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('ADMIN');
            setIdentifier('admin@mahavote.gov.in');
            setPassword('Admin@12345');
            setVoterAuthMode('PASSWORD');
            setErrorMsg('');
          }}
          className={`flex-1 py-2 rounded-lg transition-all ${
            activeTab === 'ADMIN'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Official Admin
        </button>
      </div>

      {/* Main Login Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        {/* Voter Auth Mode Sub-Switch (OTP vs Password) */}
        {activeTab === 'VOTER' && (
          <div className="flex items-center justify-center gap-4 text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
            <button
              type="button"
              onClick={() => {
                setVoterAuthMode('OTP');
                setIdentifier('9876543210');
              }}
              className={`flex items-center gap-1 font-semibold ${
                voterAuthMode === 'OTP'
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Demo OTP Mode</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              type="button"
              onClick={() => {
                setVoterAuthMode('PASSWORD');
                setIdentifier('voter1@mahavote.demo');
              }}
              className={`flex items-center gap-1 font-semibold ${
                voterAuthMode === 'PASSWORD'
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Password Mode</span>
            </button>
          </div>
        )}

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center gap-2 text-xs text-red-800 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {activeTab === 'VOTER' && voterAuthMode === 'OTP'
                ? 'Registered Mobile Number (or Email)'
                : 'Email Address or Mobile Number'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 9876543210 or user@mahavote.demo"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Conditional: OTP or Password */}
          {activeTab === 'VOTER' && voterAuthMode === 'OTP' ? (
            <div>
              {otpSent ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Enter 6-Digit Demo OTP
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsOtpModalOpen(true)}
                      className="text-[11px] text-orange-600 hover:underline font-medium"
                    >
                      Open Simulator
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="e.g. 123456"
                    className="w-full px-4 py-2.5 font-mono text-center tracking-widest text-base font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <div className="flex justify-between items-center mt-2 text-[11px] text-slate-400">
                    <span>Valid for 5 minutes</span>
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={otpLoading}
                      className="text-orange-600 hover:underline"
                    >
                      Resend Code
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={otpLoading}
                  className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{otpLoading ? 'Generating Demo OTP...' : 'Send Demo OTP'}</span>
                </button>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}

          {/* Submit Button */}
          {(! (activeTab === 'VOTER' && voterAuthMode === 'OTP') || otpSent) && (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-950 dark:bg-blue-600 hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Quick Demo Credentials Assistant */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block text-center">
            One-Click Demo Credentials
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => setQuickAccount('9876543210', 'Voter@12345', 'VOTER')}
              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-left border border-slate-200 dark:border-slate-700"
            >
              <span className="font-bold text-slate-800 dark:text-white block">Voter (Aarav)</span>
              <span className="text-slate-400 text-[10px]">9876543210</span>
            </button>

            <button
              type="button"
              onClick={() => setQuickAccount('ananya@candidate.demo', 'Candidate@12345', 'CANDIDATE')}
              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-left border border-slate-200 dark:border-slate-700"
            >
              <span className="font-bold text-slate-800 dark:text-white block">Candidate (Ananya)</span>
              <span className="text-slate-400 text-[10px]">Independent</span>
            </button>

            <button
              type="button"
              onClick={() => setQuickAccount('ro.kasba@mahavote.gov.in', 'RoKasba@12345', 'ADMIN')}
              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-left border border-slate-200 dark:border-slate-700"
            >
              <span className="font-bold text-slate-800 dark:text-white block">Returning Officer</span>
              <span className="text-slate-400 text-[10px]">Kasba Peth</span>
            </button>

            <button
              type="button"
              onClick={() => setQuickAccount('admin@mahavote.gov.in', 'Admin@12345', 'ADMIN')}
              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-left border border-slate-200 dark:border-slate-700"
            >
              <span className="font-bold text-slate-800 dark:text-white block">Super Admin</span>
              <span className="text-slate-400 text-[10px]">State Sec.</span>
            </button>
          </div>
        </div>
      </div>

      {/* Registration Link */}
      <div className="text-center text-xs text-slate-500">
        Don't have a demonstration account?{' '}
        <Link to="/register" className="text-orange-600 dark:text-orange-400 font-bold hover:underline">
          Register Here
        </Link>
      </div>

      {/* OTP Simulator Modal */}
      <OtpSimulatorModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onSelectOtp={(code) => setOtpCode(code)}
      />
    </div>
  );
};
