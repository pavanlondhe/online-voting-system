import React, { useState } from 'react';
import {
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  Phone,
  Mail,
  Lock,
  Vote,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

export const HelpFaq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      q: 'What is MahaVote and what is its objective?',
      a: 'MahaVote is an independent educational and technical demonstration portal showcasing how modern electronic voting management systems work. It is inspired by the clean layout and information architecture of the Election Commission of India EVM Management System. It allows students, civic tech researchers, and election enthusiasts to explore candidate nomination workflows, voter authentication, and privacy-preserving ballot counting.',
    },
    {
      q: 'Is this an official election portal of the Government of India or Maharashtra?',
      a: 'No. This is strictly an independent educational demonstration project. It is not affiliated with, nor endorsed by, the Election Commission of India (ECI) or the Maharashtra State Election Commission. All candidate names, symbols, and elections on this platform are simulated demo data.',
    },
    {
      q: 'How does the platform preserve ballot secrecy while issuing receipts?',
      a: 'The system uses architectural separation of concerns. When a voter submits a vote, the backend commits two completely separate records in an atomic transaction: 1) A voter participation record that registers the voter has cast their single ballot (preventing duplicate votes), and 2) An anonymous ballot record stored in a separate table with a cryptographically generated salt token without any voter ID link. The receipt reference verifies submission without exposing your candidate choice.',
    },
    {
      q: 'Can a voter vote more than once in the same election?',
      a: 'No. The system enforces strict database-level unique constraints and atomic ACID transactions on (voterId, electionId). Any subsequent vote attempt from the same voter account is immediately rejected by the server with a 409 Conflict error and logged in the security audit trail.',
    },
    {
      q: 'How does the OTP simulator work in this prototype?',
      a: 'For educational testing without requiring real SMS credits or phone carriers, MahaVote includes a Development OTP Simulator. When you request an OTP during login or voting, the backend generates a valid 6-digit code with a 5-minute expiry, delivers it to the simulator inbox, and allows you to copy or auto-fill it directly from the simulator modal.',
    },
    {
      q: 'Does MahaVote collect real Aadhaar, Voter ID (EPIC), or biometrics?',
      a: 'No. MahaVote strictly prohibits collecting real Aadhaar numbers, real government voter IDs, biometric templates, or sensitive identity documents. The platform generates synthetic demo IDs (e.g., MH-VTR-2026-A101) for simulated testing.',
    },
    {
      q: 'How are candidates and election results managed?',
      a: 'Candidates can register, upload simulated manifestos, and submit nominations to specific assembly or municipal elections. Returning Officers (ROs) review nominations and record approval or rejection reasons. Results are computed strictly from anonymous ballot records and can only be published once the configured voting window closes.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 font-semibold uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          <span>Voter Education & Knowledge Base</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
          Help, Guidelines & FAQs
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Understand electronic voting principles, ballot secrecy architecture, and how to use the demonstration platform.
        </p>
      </div>

      {/* Educational Banner */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        <span>
          <strong>Notice:</strong> This knowledge base is for academic demonstration. For official voting queries in India, please visit the official Election Commission of India portal at <a href="https://eci.gov.in" target="_blank" rel="noreferrer" className="underline font-bold">eci.gov.in</a>.
        </span>
      </div>

      {/* Accordion FAQ List */}
      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs transition-colors"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Helpdesk Contact Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
            Demo Support Desk
          </span>
          <h3 className="text-xl font-bold">Have technical questions or need demonstration assistance?</h3>
          <p className="text-xs text-slate-300 max-w-lg">
            Our educational prototype technical cell is available to assist university researchers, developers, and educators.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-2 text-xs font-semibold">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>1800-DEMO-VOTE</span>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-2 text-xs font-semibold">
            <Mail className="w-4 h-4 text-orange-400" />
            <span>demo@mahavote.internal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
