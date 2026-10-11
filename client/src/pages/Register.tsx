import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  UserPlus,
  ShieldAlert,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Building2,
  Award,
} from 'lucide-react';
import { api } from '../services/api';
import { District, Constituency } from '../types';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'voter';

  const [registerType, setRegisterType] = useState<'voter' | 'candidate'>(
    initialType === 'candidate' ? 'candidate' : 'voter'
  );

  const [districts, setDistricts] = useState<District[]>([]);
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState<boolean>(true);

  // Common fields
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [selectedConstituencyId, setSelectedConstituencyId] = useState<string>('');

  // Voter specific
  const [dateOfBirth, setDateOfBirth] = useState<string>('1998-05-20');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [address, setAddress] = useState<string>('Pune, Maharashtra');

  // Candidate specific
  const [partyAffiliation, setPartyAffiliation] = useState<string>('Independent');
  const [symbolName, setSymbolName] = useState<string>('Rising Sun');
  const [education, setEducation] = useState<string>('Postgraduate Degree');
  const [biography, setBiography] = useState<string>(
    'Grassroots public worker with dedication towards local infrastructure, clean drinking water, and youth skill centers.'
  );
  const [manifesto, setManifesto] = useState<string>(
    'Commitment to transparent municipal budgeting, solar powered street illumination, and digital citizen grievance cells.'
  );

  // State
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await api.get<{ success: boolean; data: District[] }>('/elections/districts');
        if (res.success && res.data) {
          setDistricts(res.data);
          if (res.data.length > 0) {
            setSelectedDistrictId(res.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load districts:', err);
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, []);

  useEffect(() => {
    if (!selectedDistrictId) return;

    const fetchConstituencies = async () => {
      try {
        const res = await api.get<{ success: boolean; data: Constituency[] }>(
          `/elections/constituencies?districtId=${selectedDistrictId}`
        );
        if (res.success && res.data) {
          setConstituencies(res.data);
          if (res.data.length > 0) {
            setSelectedConstituencyId(res.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load constituencies:', err);
      }
    };

    fetchConstituencies();
  }, [selectedDistrictId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (registerType === 'voter') {
        const payload = {
          fullName,
          email,
          phone,
          password,
          districtId: selectedDistrictId,
          constituencyId: selectedConstituencyId,
          dateOfBirth,
          gender,
          address,
        };

        const res = await api.post<{ success: boolean; message: string; data: any }>(
          '/auth/register/voter',
          payload
        );

        if (res.success) {
          setSuccessMsg('Demo voter account registered successfully! You may now sign in.');
          setTimeout(() => navigate('/login?role=VOTER'), 1500);
        } else {
          setErrorMsg(res.message || 'Registration failed');
        }
      } else {
        const payload = {
          fullName,
          email,
          phone,
          password,
          partyAffiliation,
          symbolName,
          constituencyId: selectedConstituencyId || undefined,
          education,
          biography,
          manifesto,
          assetsDeclaration: 'Simulated declaration: Movable assets ₹15 Lakhs, Immovable assets ₹35 Lakhs.',
        };

        const res = await api.post<{ success: boolean; message: string; data: any }>(
          '/auth/register/candidate',
          payload
        );

        if (res.success) {
          setSuccessMsg('Candidate profile registered successfully! You may now sign in.');
          setTimeout(() => navigate('/login?role=CANDIDATE'), 1500);
        } else {
          setErrorMsg(res.message || 'Candidate registration failed');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 mx-auto flex items-center justify-center font-bold shadow-xs">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Create Demo Account
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Maharashtra Online Voting Management Simulation Prototype
        </p>
      </div>

      {/* Registration Type Switcher */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setRegisterType('voter')}
          className={`flex-1 py-2.5 rounded-lg transition-all ${
            registerType === 'voter'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Demo Voter Registration
        </button>

        <button
          type="button"
          onClick={() => setRegisterType('candidate')}
          className={`flex-1 py-2.5 rounded-lg transition-all ${
            registerType === 'candidate'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Candidate Registration & Nomination
        </button>
      </div>

      {/* Privacy Notice Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-semibold block mb-0.5">Privacy Notice:</strong>
          Never enter real Aadhaar numbers, real EPIC voter card numbers, or real government credentials.
          All accounts created here are purely demonstration profiles.
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Shankar Rao"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="e.g. ramesh@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                10-Digit Mobile Number
              </label>
              <input
                type="tel"
                required
                pattern="[6-9][0-9]{9}"
                placeholder="e.g. 9822123456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password (min 8 chars)
              </label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Maharashtra District and Constituency Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Maharashtra District
              </label>
              <select
                aria-label="Select Maharashtra District"
                value={selectedDistrictId}
                onChange={(e) => setSelectedDistrictId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.division})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Constituency Allocation
              </label>
              <select
                aria-label="Select Constituency Allocation"
                value={selectedConstituencyId}
                onChange={(e) => setSelectedConstituencyId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {constituencies.length === 0 ? (
                  <option value="">No constituencies found</option>
                ) : (
                  constituencies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Candidate-specific fields */}
          {registerType === 'candidate' && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Party Affiliation
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Independent or Fictional Party"
                    value={partyAffiliation}
                    onChange={(e) => setPartyAffiliation(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Demo Symbol Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tree, Book, Lamp, Sun"
                    value={symbolName}
                    onChange={(e) => setSymbolName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Educational Qualification
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. M.A. Public Policy / B.Tech"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Biography
                </label>
                <textarea
                  rows={2}
                  required
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Manifesto Declaration Summary
                </label>
                <textarea
                  rows={3}
                  required
                  value={manifesto}
                  onChange={(e) => setManifesto(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4"
          >
            <span>{loading ? 'Submitting...' : 'Register Profile'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="text-center text-xs text-slate-500">
        Already registered?{' '}
        <Link to="/login" className="text-orange-600 dark:text-orange-400 font-bold hover:underline">
          Sign In Here
        </Link>
      </div>
    </div>
  );
};
