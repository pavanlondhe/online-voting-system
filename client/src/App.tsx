import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DisclaimerBanner } from './components/DisclaimerBanner';

import { Home } from './pages/Home';
import { Elections } from './pages/Elections';
import { Candidates } from './pages/Candidates';
import { VoterServices } from './pages/VoterServices';
import { VoteBallot } from './pages/VoteBallot';
import { Results } from './pages/Results';
import { VerifyReceipt } from './pages/VerifyReceipt';
import { HelpFaq } from './pages/HelpFaq';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { VoterDashboard } from './pages/VoterDashboard';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { AdminPortal } from './pages/AdminPortal';

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
              {/* Educational Disclaimer Banner */}
              <DisclaimerBanner />

              {/* Main Navigation Header */}
              <Header />

              {/* Dynamic Content */}
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/elections" element={<Elections />} />
                  <Route path="/candidates" element={<Candidates />} />
                  <Route path="/voter/services" element={<VoterServices />} />
                  <Route path="/vote/ballot/:electionId" element={<VoteBallot />} />
                  <Route path="/results" element={<Results />} />
                  <Route path="/receipt/verify" element={<VerifyReceipt />} />
                  <Route path="/help" element={<HelpFaq />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/voter/dashboard" element={<VoterDashboard />} />
                  <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
                  <Route path="/admin/portal" element={<AdminPortal />} />
                </Routes>
              </main>

              {/* Portal Footer */}
              <Footer />
            </div>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
