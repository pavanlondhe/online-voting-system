import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const DisclaimerBanner: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs sm:text-sm py-2 px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong className="font-semibold uppercase tracking-wide">
              {t.disclaimerTitle}:
            </strong>{' '}
            {t.disclaimerBanner}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Fictional candidates & simulated voting only</span>
        </div>
      </div>
    </div>
  );
};
