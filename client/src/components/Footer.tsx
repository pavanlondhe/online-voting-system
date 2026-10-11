import React from 'react';
import { Link } from 'react-router-dom';
import { Vote, Phone, Mail, MapPin, ShieldAlert, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 dark:bg-slate-950 border-t border-slate-800 transition-colors mt-auto">
      {/* Top Banner Ribbon */}
      <div className="bg-slate-950 py-3 px-4 border-b border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0" />
            <span>
              <strong>Educational Demonstration Platform:</strong> This software is an independent university & open civic-tech simulation prototype.
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>Toll-Free Demo Helpline: 1800-DEMO-VOTE</span>
            <span>State Prototype Cell: Pune / Mumbai</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        {/* Brand & Purpose */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">MahaVote</span>
              <p className="text-xs text-slate-400">{t.portalSubTitle}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Inspired by the Election Commission of India EVM Management System layout.
            Designed to demonstrate modern election information architecture, voter authentication workflows, and ballot privacy preservation.
          </p>
          <div className="pt-2 text-xs text-orange-400 font-medium">
            Not an Official Election Commission Service
          </div>
        </div>

        {/* Voter Quick Services */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-100 border-b border-slate-800 pb-2">
            Voter Services
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <Link to="/voter/services" className="hover:text-white transition-colors">
                Check Voter Eligibility
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-white transition-colors">
                New Voter Demo Registration
              </Link>
            </li>
            <li>
              <Link to="/elections" className="hover:text-white transition-colors">
                Active Demo Elections
              </Link>
            </li>
            <li>
              <Link to="/receipt/verify" className="hover:text-white transition-colors">
                Digital Receipt Verification
              </Link>
            </li>
            <li>
              <Link to="/help" className="hover:text-white transition-colors">
                Ballot Privacy Architecture
              </Link>
            </li>
          </ul>
        </div>

        {/* Candidate & Administrative Links */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-100 border-b border-slate-800 pb-2">
            Candidates & Administration
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <Link to="/candidates" className="hover:text-white transition-colors">
                Candidate Directory
              </Link>
            </li>
            <li>
              <Link to="/register?type=candidate" className="hover:text-white transition-colors">
                Candidate Nomination Form
              </Link>
            </li>
            <li>
              <Link to="/admin/portal" className="hover:text-white transition-colors">
                Returning Officer Login
              </Link>
            </li>
            <li>
              <Link to="/admin/portal" className="hover:text-white transition-colors">
                District Election Officer (DEO)
              </Link>
            </li>
            <li>
              <Link to="/results" className="hover:text-white transition-colors">
                Simulated Election Results
              </Link>
            </li>
          </ul>
        </div>

        {/* Reference & Transparency */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-100 border-b border-slate-800 pb-2">
            Transparency & Reference
          </h4>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-start gap-2">
              <ExternalLink className="w-3.5 h-3.5 mt-0.5 text-blue-400 shrink-0" />
              <a
                href="https://www.eci.gov.in/evm-management-system"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors text-blue-300"
              >
                ECI EVM Reference Layout
              </a>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
              <span>Maharashtra State Prototype Simulation Hub</span>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
              <span>demo-support@mahavote.internal</span>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
              <span>1800-DEMO-VOTE (Toll Free Demo)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Disclaimer */}
      <div className="bg-black/50 py-4 px-4 text-center text-xs text-slate-500 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 MahaVote Educational Demonstration System. All rights reserved.</p>
          <p className="text-[11px] text-slate-400">
            Strictly for technical & academic demonstration. No legal or official electoral validity.
          </p>
        </div>
      </div>
    </footer>
  );
};
