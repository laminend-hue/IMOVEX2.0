import React, { useState } from 'react';
import { 
  X, User, Phone, Mail, ShieldCheck, CheckCircle2, 
  LogOut, Clock, Calendar, Building, Sparkles, AlertCircle 
} from 'lucide-react';
import { useApp } from '../../lib/store/appStore.tsx';
import { useThemeLanguage } from '../../lib/i18n/ThemeLanguageContext.tsx';
import { formatDateFR, formatFCFA } from '../../lib/utils/formatters.ts';
import { ImovexLogo } from '../common/ImovexLogo.tsx';

interface TenantAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSearch?: () => void;
}

export const TenantAuthModal: React.FC<TenantAuthModalProps> = ({
  isOpen,
  onClose,
  onNavigateToSearch,
}) => {
  const { 
    tenantProfile, 
    loginTenantDirect, 
    logoutTenant, 
    requests 
  } = useApp();
  const { t, isRTL } = useThemeLanguage();

  const [fullName, setFullName] = useState(tenantProfile?.fullName || '');
  const [phone, setPhone] = useState(tenantProfile?.phone || '+221 ');
  const [email, setEmail] = useState(tenantProfile?.email || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'requests'>('profile');

  if (!isOpen) return null;

  const handleDirectLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg(t('reqErrName'));
      return;
    }

    const cleanPhone = phone.replace(/[\s.-]/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      setErrorMsg(t('reqErrPhone'));
      return;
    }

    loginTenantDirect({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
    });
  };

  // Direct login without external dependencies
  // Find requests placed by this tenant
  const myRequests = requests.filter((r) => {
    if (!tenantProfile) return false;
    const matchPhone = tenantProfile.phone && r.phone && r.phone.replace(/[\s.-]/g, '') === tenantProfile.phone.replace(/[\s.-]/g, '');
    const matchEmail = tenantProfile.email && r.email && r.email.toLowerCase() === tenantProfile.email.toLowerCase();
    const matchName = tenantProfile.fullName && r.fullName.toLowerCase() === tenantProfile.fullName.toLowerCase();
    return matchPhone || matchEmail || matchName;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[92vh] sm:max-h-[90vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Poignée tactile mobile */}
        <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2 sm:hidden" />
        
        {/* Header de la modale */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <ImovexLogo size="md" />
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                {tenantProfile ? t('tenantConnectedAs') : t('tenantModalTitle')}
              </h3>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t('tenantDirectNotice')}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('close')}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps de la modale */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {tenantProfile ? (
            /* ==========================================================
               LOCATAIRE CONNECTÉ
               ========================================================== */
            <div className="space-y-5">
              {/* Carte profil connecté */}
              <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-emerald-600 text-white font-extrabold text-base flex items-center justify-center shadow-xs">
                    {tenantProfile.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{tenantProfile.fullName}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{tenantProfile.phone}</span>
                    </p>
                    {tenantProfile.email && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{tenantProfile.email}</span>
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    logoutTenant();
                    onClose();
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/50 px-2.5 py-1.5 rounded-lg shadow-2xs hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title={t('tenantLogoutBtn')}
                >
                  <LogOut className="w-3 h-3" />
                  <span>{t('tenantLogoutBtn')}</span>
                </button>
              </div>

              {/* Navigation interne onglets profil / demandes */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
                    activeTab === 'profile'
                      ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
                      : 'border-transparent hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {t('tenantTabProfile')}
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                    activeTab === 'requests'
                      ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
                      : 'border-transparent hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span>{t('tenantTabRequests')}</span>
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] px-1.5 py-0.2 rounded-full">
                    {myRequests.length}
                  </span>
                </button>
              </div>

              {activeTab === 'profile' ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      {t('tenantActiveSession')}
                    </p>
                    <p className="leading-relaxed">
                      {t('detailPrivacyProtectedDesc')}
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                    >
                      {t('close')}
                    </button>
                    {onNavigateToSearch && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateToSearch();
                        }}
                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                      >
                        {t('navExplore')}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {myRequests.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs space-y-2">
                      <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                      <p className="font-medium text-slate-700 dark:text-slate-200">{t('tenantNoRequests')}</p>
                      <p className="text-[11px] text-slate-400">
                        {t('searchNoResultsTip')}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {myRequests.map((req) => (
                        <div key={req.id} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs space-y-1 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-slate-900 dark:text-white truncate max-w-[240px]">
                              {req.listingTitle}
                            </h5>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                              {req.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                            <span>{req.listingNeighborhood}</span>
                            <span>{formatFCFA(req.listingRent, true)}/mois</span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700">
                            <span>{formatDateFR(req.createdAt)}</span>
                            {req.desiredVisitDate && (
                              <span>· {req.desiredVisitDate}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* ==========================================================
               NON CONNECTÉ : FORMULAIRE DE CONNEXION DIRECTE SÉCURISÉE
               ========================================================== */
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
                <p className="font-medium">Identifiez-vous directement avec vos coordonnées pour consulter l'avancement de vos demandes et vos logements favoris.</p>
              </div>

              {/* Formulaire Direct Téléphone / Nom */}
              <form onSubmit={handleDirectLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('tenantNameLabel')} <span className="text-emerald-600">*</span>
                  </label>
                  <div className="relative">
                    <User className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'}`} />
                    <input
                      type="text"
                      required
                      placeholder="Ex : Ousmane Ba"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`w-full py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                        isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('tenantPhoneLabel')} <span className="text-emerald-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'}`} />
                    <input
                      type="tel"
                      required
                      placeholder="+221 77 000 00 00"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono ${
                        isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('tenantEmailLabel')}
                  </label>
                  <div className="relative">
                    <Mail className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'}`} />
                    <input
                      type="email"
                      placeholder="votre.email@exemple.sn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                        isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'
                      }`}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('tenantLoginDirectBtn')}</span>
                  </button>
                </div>
              </form>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                🔒 <strong>100% In-App :</strong> {t('footerDisclaimer')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
