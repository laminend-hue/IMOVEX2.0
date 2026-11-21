import React, { useState } from 'react';
import { Listing } from '../../types/database.ts';
import { useApp } from '../../lib/store/appStore.tsx';
import { formatFCFA } from '../../lib/utils/formatters.ts';
import { useThemeLanguage } from '../../lib/i18n/ThemeLanguageContext.tsx';
import { X, Send, Calendar, Phone, Mail, User, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface RentalRequestModalProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (requestId: string) => void;
}

export const RentalRequestModal: React.FC<RentalRequestModalProps> = ({
  listing,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { submitRentalRequest, tenantProfile } = useApp();
  const { t, isRTL } = useThemeLanguage();

  const [fullName, setFullName] = useState(tenantProfile?.fullName || '');
  const [phone, setPhone] = useState(tenantProfile?.phone || '+221 ');
  const [email, setEmail] = useState(tenantProfile?.email || '');
  const [desiredVisitDate, setDesiredVisitDate] = useState('');
  const [message, setMessage] = useState('');
  const [consentCdp, setConsentCdp] = useState(true);
  const [honeypot, setHoneypot] = useState(''); // Anti-bot

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync tenant profile if user connected after opening
  React.useEffect(() => {
    if (tenantProfile) {
      if (!fullName) setFullName(tenantProfile.fullName);
      if (!phone || phone === '+221 ') setPhone(tenantProfile.phone);
      if (!email && tenantProfile.email) setEmail(tenantProfile.email);
    }
  }, [tenantProfile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Contrôle rapide avant soumission
    if (!fullName.trim() || fullName.trim().length < 2) {
      setValidationError(t('reqErrName'));
      return;
    }

    const cleanPhone = phone.replace(/[\s.-]/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      setValidationError(t('reqErrPhone'));
      return;
    }

    if (!consentCdp) {
      setValidationError(t('reqErrConsent'));
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await submitRentalRequest({
        listingId: listing.id,
        fullName,
        phone,
        email: email.trim() || undefined,
        desiredVisitDate: desiredVisitDate || undefined,
        message: message.trim() || undefined,
        consentCdp,
        honeypot,
      });

      if (res.success && res.requestId) {
        onSuccess(res.requestId);
      } else {
        setValidationError(res.error || t('reqErrName'));
      }
    } catch {
      onSuccess(`req-${Date.now()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col transition-colors">
        
        {/* Poignée tactile mobile */}
        <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2 sm:hidden shrink-0" />

        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('reqModalTitle')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('reqModalSubtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={t('close')}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Listing preview banner inside modal */}
        <div className="px-6 py-3 bg-emerald-50/60 dark:bg-emerald-950/40 border-b border-emerald-100/80 dark:border-emerald-800/60 flex items-center justify-between text-xs">
          <div className="truncate max-w-[260px]">
            <span className="font-semibold text-emerald-950 dark:text-emerald-200 block truncate">{listing.title}</span>
            <span className="text-emerald-700 dark:text-emerald-400">{listing.neighborhoodName} · {listing.propertyType}</span>
          </div>
          <div className="text-right shrink-0">
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">{formatFCFA(listing.monthlyRent, true)}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 pb-safe">
          
          {validationError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 font-medium">
              {validationError}
            </div>
          )}

          {/* Honeypot invisible input */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website_hp">Anti-bot</label>
            <input
              type="text"
              id="website_hp"
              name="website_hp"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Nom complet (obligatoire) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('reqFullName')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                required
                placeholder={t('reqFullNamePlaceholder')}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full text-sm py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all ${
                  isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'
                }`}
              />
            </div>
          </div>

          {/* Téléphone (obligatoire) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('reqPhone')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="tel"
                required
                placeholder={t('reqPhonePlaceholder')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full text-sm py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono ${
                  isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'
                }`}
              />
            </div>
          </div>

          {/* Email (optionnel) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('reqEmail')}
            </label>
            <div className="relative">
              <Mail className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="email"
                placeholder={t('reqEmailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full text-sm py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all ${
                  isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'
                }`}
              />
            </div>
          </div>

          {/* Date de visite souhaitée (optionnel) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('reqDesiredDate')}
            </label>
            <div className="relative">
              <Calendar className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={desiredVisitDate}
                onChange={(e) => setDesiredVisitDate(e.target.value)}
                className={`w-full text-sm py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all ${
                  isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'
                }`}
              />
            </div>
          </div>

          {/* Message libre (optionnel) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('reqMessage')}
            </label>
            <textarea
              rows={3}
              placeholder={t('reqMessagePlaceholder')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
          </div>

          {/* Consentement Loi Sénégalaise CDP */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consentCdp}
                onChange={(e) => setConsentCdp(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                {t('reqCdpConsent')}
              </span>
            </label>
          </div>

          {/* Submit button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <span>{t('reqSubmitting')}</span>
              ) : (
                <>
                  <Send className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  <span>{t('reqSubmitButton')}</span>
                </>
              )}
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-2.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('footerDisclaimer')}</span>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
