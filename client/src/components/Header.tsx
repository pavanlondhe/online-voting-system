import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Vote,
  Sun,
  Moon,
  Globe,
  User,
  LogOut,
  Shield,
  Smartphone,
  ChevronDown,
  Layers,
  CheckCircle,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Language } from '../utils/translations';
import { OtpSimulatorModal } from './OtpSimulatorModal';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme, setFontScale, fontScale } = useTheme();
  const { user, logout, switchDemoAccount } = useAuth();
  const location = useLocation();

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      {/* Top Tricolor Bar */}
      <div className="gov-tricolor-bar" />

      {/* Top Gov Accessibility & Tools Ribbon */}
      <div className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs py-1.5 px-4 text-slate-600 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Government Demonstration Notice */}
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">
              Government of Maharashtra Educational Prototype • EVM Management System Layout
            </span>
            <span className="sm:hidden">Gov. of Maharashtra Demo</span>
          </div>

          {/* Quick Tools: Font size, Language, Theme, Demo OTP Simulator, Quick Demo Login */}
          <div className="flex items-center gap-3">
            {/* Font scaling accessibility */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-700 pr-2">
              <button
                onClick={() => setFontScale('normal')}
                title="Default Font Size"
                className={`px-1.5 py-0.5 rounded ${
                  fontScale === 'normal'
                    ? 'font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                A-
              </button>
              <button
                onClick={() => setFontScale('large')}
                title="Larger Font Size"
                className={`px-1.5 py-0.5 rounded ${
                  fontScale === 'large'
                    ? 'font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                A
              </button>
              <button
                onClick={() => setFontScale('larger')}
                title="Largest Font Size"
                className={`px-1.5 py-0.5 rounded ${
                  fontScale === 'larger'
                    ? 'font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                A+
              </button>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <select
                aria-label="Select Portal Language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-xs font-medium cursor-pointer text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="en" className="dark:bg-slate-900">English</option>
                <option value="mr" className="dark:bg-slate-900">मराठी (Marathi)</option>
                <option value="hi" className="dark:bg-slate-900">हिंदी (Hindi)</option>
              </select>
            </div>

            {/* Dark/Light mode toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              className="p-1 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>

            {/* Development OTP Simulator Trigger Button */}
            <button
              onClick={() => setIsOtpModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded font-medium shadow-xs transition-colors"
              title="Inspect simulated OTP inbox"
            >
              <Smartphone className="w-3 h-3" />
              <span>OTP Simulator</span>
            </button>

            {/* Quick Demo Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsDemoMenuOpen(!isDemoMenuOpen)}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded font-medium transition-colors"
              >
                <Layers className="w-3 h-3" />
                <span className="hidden md:inline">Demo Switcher</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isDemoMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 z-50 text-slate-800 dark:text-slate-200 animate-in fade-in"
                  onMouseLeave={() => setIsDemoMenuOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    Switch Test Persona
                  </div>
                  <button
                    onClick={() => {
                      switchDemoAccount('VOTER');
                      setIsDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>Voter (Aarav Kulkarni)</span>
                    <span className="text-[10px] text-blue-500 font-medium">VOTER</span>
                  </button>
                  <button
                    onClick={() => {
                      switchDemoAccount('CANDIDATE');
                      setIsDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>Candidate (Ananya Deshmukh)</span>
                    <span className="text-[10px] text-emerald-500 font-medium">CANDIDATE</span>
                  </button>
                  <button
                    onClick={() => {
                      switchDemoAccount('RO');
                      setIsDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>Returning Officer (Kasba)</span>
                    <span className="text-[10px] text-purple-500 font-medium">RO</span>
                  </button>
                  <button
                    onClick={() => {
                      switchDemoAccount('DEO');
                      setIsDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>District Officer (Dr. Diwase)</span>
                    <span className="text-[10px] text-amber-500 font-medium">DEO</span>
                  </button>
                  <button
                    onClick={() => {
                      switchDemoAccount('SUPER_ADMIN');
                      setIsDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between font-medium"
                  >
                    <span>Super Admin (State Sec.)</span>
                    <span className="text-[10px] text-red-500 font-semibold">ADMIN</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Brand & Emblem Row */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3.5 group">
          {/* Emblem Icon Motif */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 flex items-center justify-center text-white shadow-md border border-orange-500/30 group-hover:scale-105 transition-transform">
            <Vote className="w-6 h-6 text-orange-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white font-sans">
                {t.portalName}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 uppercase tracking-wider border border-orange-200 dark:border-orange-800/60">
                Demo
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              {t.portalSubTitle}
            </p>
          </div>
        </Link>

        {/* User Account / Login State */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-bold">
                  {user.fullName.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                    {user.fullName}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    {user.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50 text-slate-800 dark:text-slate-200 animate-in fade-in"
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Signed in as</p>
                    <p className="text-xs font-semibold truncate text-slate-900 dark:text-white">
                      {user.email}
                    </p>
                  </div>

                  {user.role === 'VOTER' && (
                    <Link
                      to="/voter/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      <span>Voter Dashboard</span>
                    </Link>
                  )}

                  {user.role === 'CANDIDATE' && (
                    <Link
                      to="/candidate/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Candidate Dashboard</span>
                    </Link>
                  )}

                  {['SUPER_ADMIN', 'STATE_ELECTION_ADMIN', 'DISTRICT_ELECTION_OFFICER', 'RETURNING_OFFICER', 'AUDITOR'].includes(
                    user.role
                  ) && (
                    <Link
                      to="/admin/portal"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Shield className="w-3.5 h-3.5 text-purple-500" />
                      <span>Official Admin Portal</span>
                    </Link>
                  )}

                  <button
                    onClick={async () => {
                      await logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-t border-slate-100 dark:border-slate-800"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t.navLogout}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {t.navLogin}
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-semibold bg-blue-950 dark:bg-blue-600 hover:bg-blue-900 dark:hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors"
              >
                {t.navRegister}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Menu Bar */}
      <nav className="bg-blue-950 text-white dark:bg-slate-950 border-t border-blue-900 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex items-center overflow-x-auto whitespace-nowrap text-xs font-medium">
          <Link
            to="/"
            className={`py-3 px-3.5 transition-colors border-b-2 ${
              isActive('/')
                ? 'border-orange-500 text-white font-semibold bg-blue-900/60 dark:bg-slate-900'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-blue-900/40'
            }`}
          >
            {t.navHome}
          </Link>
          <Link
            to="/elections"
            className={`py-3 px-3.5 transition-colors border-b-2 ${
              isActive('/elections')
                ? 'border-orange-500 text-white font-semibold bg-blue-900/60 dark:bg-slate-900'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-blue-900/40'
            }`}
          >
            {t.navElections}
          </Link>
          <Link
            to="/candidates"
            className={`py-3 px-3.5 transition-colors border-b-2 ${
              isActive('/candidates')
                ? 'border-orange-500 text-white font-semibold bg-blue-900/60 dark:bg-slate-900'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-blue-900/40'
            }`}
          >
            {t.navCandidates}
          </Link>
          <Link
            to="/voter/services"
            className={`py-3 px-3.5 transition-colors border-b-2 ${
              isActive('/voter/services')
                ? 'border-orange-500 text-white font-semibold bg-blue-900/60 dark:bg-slate-900'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-blue-900/40'
            }`}
          >
            {t.navVoterServices}
          </Link>
          <Link
            to="/results"
            className={`py-3 px-3.5 transition-colors border-b-2 ${
              isActive('/results')
                ? 'border-orange-500 text-white font-semibold bg-blue-900/60 dark:bg-slate-900'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-blue-900/40'
            }`}
          >
            {t.navResults}
          </Link>
          <Link
            to="/receipt/verify"
            className={`py-3 px-3.5 transition-colors border-b-2 ${
              isActive('/receipt/verify')
                ? 'border-orange-500 text-white font-semibold bg-blue-900/60 dark:bg-slate-900'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-blue-900/40'
            }`}
          >
            Verify Receipt
          </Link>
          <Link
            to="/help"
            className={`py-3 px-3.5 transition-colors border-b-2 ${
              isActive('/help')
                ? 'border-orange-500 text-white font-semibold bg-blue-900/60 dark:bg-slate-900'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-blue-900/40'
            }`}
          >
            {t.navHelp}
          </Link>

          <div className="ml-auto flex items-center">
            <Link
              to="/admin/portal"
              className="py-1 px-3 my-1 rounded bg-orange-600/90 hover:bg-orange-600 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Shield className="w-3 h-3" />
              <span>Official Admin Portal</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* OTP Simulator Modal */}
      <OtpSimulatorModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
      />
    </header>
  );
};
