import React, { useState } from 'react';
import { 
  MapPin, Check, ShieldCheck, Clock, Share2, 
  ArrowLeft, Bed, Bath, Maximize, AlertTriangle, Building, Send,
  Zap, Droplets, Car, Shield, Wifi, Home
} from 'lucide-react';
import { Listing } from '../../types/database.ts';
import { formatFCFA, formatDateFR, calculateTotalMoveInCost, getWhatsAppListingShareUrl } from '../../lib/utils/formatters.ts';
import { useThemeLanguage } from '../../lib/i18n/ThemeLanguageContext.tsx';
import { WhatsAppIcon } from '../common/WhatsAppIcon.tsx';
import { ListingGallery } from './ListingGallery.tsx';
import { RentalRequestModal } from './RentalRequestModal.tsx';

interface ListingDetailViewProps {
  listing: Listing;
  onBack: () => void;
  onRequestSuccess: (requestId: string) => void;
}

export const ListingDetailView: React.FC<ListingDetailViewProps> = ({
  listing,
  onBack,
  onRequestSuccess,
}) => {
  const { t, language, isRTL } = useThemeLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const isRented = listing.status === 'loue';
  const isReserved = listing.status === 'reserve';

  const moveInCost = calculateTotalMoveInCost(listing.monthlyRent, listing.depositAdvance);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `${listing.title} à ${listing.neighborhoodName} (${formatFCFA(listing.monthlyRent, true)})`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const typeKey = listing.propertyType === 'appartement' ? 'typeApartment'
    : listing.propertyType === 'villa' ? 'typeVilla'
    : listing.propertyType === 'studio' ? 'typeStudio'
    : listing.propertyType === 'maison' ? 'typeHouse'
    : listing.propertyType === 'chambre' ? 'typeRoom'
    : 'typeApartment';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-colors">
      
      {/* Bouton retour et barre d'actions supérieure */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          <span>{t('detailBackToList')}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Partage direct WhatsApp */}
          <a
            href={getWhatsAppListingShareUrl(listing, language)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-[#25D366] hover:text-white dark:bg-emerald-950/50 dark:hover:bg-[#25D366] dark:hover:text-white border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl shadow-2xs transition-colors cursor-pointer"
            title={t('shareWhatsAppTooltip')}
          >
            <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
            <span>WhatsApp</span>
          </a>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>{copiedShare ? t('copySuccess') : t('detailShare')}</span>
          </button>
        </div>
      </div>

      {/* Bandeau « Déjà loué » si l'annonce est au statut 'loue' */}
      {isRented && (
        <div className="mb-6 p-4 rounded-2xl bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between gap-4 shadow-sm border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              !
            </div>
            <div>
              <h4 className="text-sm font-bold">{t('cardRented')}</h4>
              <p className="text-xs text-slate-400">
                {t('searchNoResultsTip')}
              </p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="hidden sm:block text-xs font-semibold text-emerald-400 hover:underline shrink-0 cursor-pointer"
          >
            {t('detailBackToList')}
          </button>
        </div>
      )}

      {/* Bandeau « Réservé » */}
      {isReserved && (
        <div className="mb-6 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="text-xs">
            <strong className="font-semibold">{t('cardReserved')} :</strong> {t('detailPrivacyProtectedDesc')}
          </div>
        </div>
      )}

      {/* Grille principale : Galerie à gauche, Panneau de décision à droite */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Colonne gauche (8 colonnes) : Galerie + Descriptif + Caractéristiques */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Galerie photos */}
          <ListingGallery photos={listing.photos} title={listing.title} />

          {/* En-tête de l'annonce */}
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span className="capitalize font-semibold text-emerald-700 dark:text-emerald-400">{t(typeKey as any)}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {listing.neighborhoodName}, Dakar
              </span>
              <span aria-hidden="true">·</span>
              <span>{listing.isFurnished ? t('cardFurnished') : t('searchFilterNo')}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {listing.title}
            </h1>

            {/* Rangée métriques d'espace */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-5 p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 transition-colors">
              <div>
                <div className="text-[11px] text-slate-400 font-semibold uppercase">{t('cardBedrooms')}</div>
                <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                  <Bed className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{listing.bedrooms}</span>
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-semibold uppercase">{t('cardBathrooms')}</div>
                <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                  <Bath className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{listing.bathrooms}</span>
                </div>
              </div>
              {listing.surfaceArea && (
                <div>
                  <div className="text-[11px] text-slate-400 font-semibold uppercase">{t('detailSurface')}</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                    <Maximize className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{listing.surfaceArea} m²</span>
                  </div>
                </div>
              )}
              <div>
                <div className="text-[11px] text-slate-400 font-semibold uppercase">{t('status')}</div>
                <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-1 capitalize">
                  {listing.status === 'loue' ? t('cardRented') : listing.status === 'reserve' ? t('cardReserved') : t('cardAvailable')}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
              {t('detailDescription')}
            </h2>
            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {listing.description}
            </div>
          </div>

          {/* Caractéristiques & Équipements */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
              {t('detailAmenities')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {listing.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <div className="w-5 h-5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Agence partenaire */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {t('detailPartnerAgency')}
            </h2>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
                  <Building className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{listing.agencyName}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('cardCertifiedAgency')} · {t('dakarSenegal')}
                  </p>
                </div>
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 font-semibold px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                {t('cardCertifiedAgency')}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
              {t('detailPrivacyProtectedDesc')}
            </p>
          </div>

          {/* Fraîcheur de l'annonce */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {t('date')} : {formatDateFR(listing.lastAvailabilityConfirmedAt)}
            </span>
            <span>{listing.viewsCount} {t('cardPhotos')}</span>
          </div>

        </div>

        {/* Colonne droite (4 colonnes) : Module de Loyer Contigu & Bouton d'action Sticky */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-md transition-colors">
            
            {/* Loyer mensuel principal */}
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="text-xs uppercase tracking-wider font-bold text-slate-400">
                {t('detailMonthlyRent')}
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums mt-1">
                {formatFCFA(listing.monthlyRent, false)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {listing.chargesIncluded ? t('cardChargesIncluded') : t('cardPerMonth')}
              </div>
            </div>

            {/* Conditions financières détaillées */}
            <div className="py-4 space-y-2 text-xs border-b border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>{t('detailDepositAdvance')} :</span>
                <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                  {listing.depositAdvance > 0 ? formatFCFA(listing.depositAdvance) : t('heroOnDemand')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Bail standard :</span>
                <span className="font-semibold text-slate-900 dark:text-white">1 an</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-white">
                <span>{t('detailTotalMoveIn')} :</span>
                <span className="tabular-nums text-emerald-700 dark:text-emerald-400">
                  {formatFCFA(moveInCost.total)}
                </span>
              </div>
            </div>

            {/* Bouton principal de demande */}
            <div className="pt-5">
              {isRented ? (
                <button
                  disabled
                  className="w-full py-3.5 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-sm rounded-xl cursor-not-allowed text-center"
                >
                  {t('cardRented')}
                </button>
              ) : (
                <button
                  onClick={() => setModalOpen(true)}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  <span>{t('detailRequestVisitBtn')}</span>
                </button>
              )}

              {/* Bouton de partage direct WhatsApp */}
              <a
                href={getWhatsAppListingShareUrl(listing, language)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-2.5 py-3 bg-emerald-50 hover:bg-[#25D366] text-emerald-800 hover:text-white dark:bg-slate-800 dark:hover:bg-[#25D366] dark:text-emerald-300 dark:hover:text-white font-semibold text-xs rounded-xl border border-emerald-200/80 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <WhatsAppIcon className="w-4 h-4 fill-current" />
                <span>{t('shareWhatsApp')}</span>
              </a>

              <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-3 leading-tight">
                {t('reqModalSubtitle')}
              </p>
            </div>

            {/* Garanties et sécurité */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t('heroCertifiedBadge')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t('detailAvailableNow')}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Barre d'action collante pour téléphone mobile (Sticky Mobile Action Bar) */}
      <div className="fixed bottom-14 sm:hidden inset-x-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3 transition-colors">
        <div className="min-w-0">
          <div className="text-[10px] uppercase font-bold text-slate-400 truncate">
            {listing.chargesIncluded ? t('cardChargesIncluded') : t('cardPerMonth')}
          </div>
          <div className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums leading-tight">
            {formatFCFA(listing.monthlyRent, true)}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={getWhatsAppListingShareUrl(listing, language)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-800"
            aria-label="WhatsApp"
          >
            <WhatsAppIcon className="w-4 h-4 fill-current" />
          </a>

          {isRented ? (
            <button
              disabled
              className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed"
            >
              {t('cardRented')}
            </button>
          ) : (
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-98 transition-all"
            >
              <Send className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
              <span>{t('detailRequestVisitBtn')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal de demande locataire */}
      <RentalRequestModal
        listing={listing}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(reqId) => {
          setModalOpen(false);
          onRequestSuccess(reqId);
        }}
      />

    </div>
  );
};
