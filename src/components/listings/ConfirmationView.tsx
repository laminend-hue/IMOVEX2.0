import React from 'react';
import { CheckCircle2, Home, ArrowRight, ShieldCheck, Mail, PhoneCall } from 'lucide-react';
import { useApp } from '../../lib/store/appStore.tsx';
import { useThemeLanguage } from '../../lib/i18n/ThemeLanguageContext.tsx';
import { ImovexLogo } from '../common/ImovexLogo.tsx';

interface ConfirmationViewProps {
  requestId: string;
  onExploreMore: () => void;
}

export const ConfirmationView: React.FC<ConfirmationViewProps> = ({ requestId, onExploreMore }) => {
  const { requests } = useApp();
  const { t, isRTL } = useThemeLanguage();
  const request = requests.find(r => r.id === requestId);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center transition-colors">
      
      {/* Logo officiel Imovex avec badge de validation */}
      <div className="relative w-24 h-24 mx-auto mb-6">
        <ImovexLogo size="xl" className="w-24 h-24 shadow-lg border-emerald-500/30" />
        <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-600 text-white rounded-full p-2 shadow-md">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        {t('confirmSuccessTitle')}
      </h1>
      
      <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto">
        {t('confirmSuccessSubtitle')}
      </p>

      {/* Carte récapitulative */}
      {request && (
        <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-left shadow-xs transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t('confirmDossierRef')}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
              {request.id}
            </span>
          </div>

          <div className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">{t('confirmProperty')}</span>
              <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[280px]">
                {request.listingTitle}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">{t('confirmNeighborhood')}</span>
              <span className="font-semibold text-slate-900 dark:text-white">{request.listingNeighborhood}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">{t('confirmCandidate')}</span>
              <span className="font-semibold text-slate-900 dark:text-white">{request.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">{t('confirmContactPhone')}</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">{request.phone}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bouton d'action retour */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={onExploreMore}
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <span>{t('confirmExploreMoreBtn')}</span>
          <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
        </button>
      </div>

    </div>
  );
};
