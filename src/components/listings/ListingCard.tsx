import React from 'react';
import { Listing } from '../../types/database.ts';
import { formatFCFA, getWhatsAppListingShareUrl } from '../../lib/utils/formatters.ts';
import { useThemeLanguage } from '../../lib/i18n/ThemeLanguageContext.tsx';
import { WhatsAppIcon } from '../common/WhatsAppIcon.tsx';
import { Camera, MapPin, Building, BedDouble, Bath, Maximize2 } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
  onClick: () => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onClick }) => {
  const { t, language } = useThemeLanguage();
  const primaryPhoto = listing.photos[0]?.publicUrl || '';
  const isRented = listing.status === 'loue';
  const isReserved = listing.status === 'reserve';

  // Translate property type
  const typeKey = listing.propertyType === 'appartement' ? 'typeApartment'
    : listing.propertyType === 'villa' ? 'typeVilla'
    : listing.propertyType === 'studio' ? 'typeStudio'
    : listing.propertyType === 'maison' ? 'typeHouse'
    : listing.propertyType === 'chambre' ? 'typeRoom'
    : 'typeApartment';

  return (
    <article
      onClick={onClick}
      className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 overflow-hidden hover:shadow-md dark:hover:shadow-slate-950/50 transition-all duration-200 cursor-pointer flex flex-col h-full"
    >
      {/* Photo Container */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {primaryPhoto ? (
          <img
            src={primaryPhoto}
            alt={listing.title}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              isRented ? 'grayscale opacity-75' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
            <Building className="w-8 h-8 mb-1" />
            <span className="text-xs">Photo</span>
          </div>
        )}

        {/* Quiet status or photo counter */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {isRented && (
            <span className="bg-slate-900/90 text-white text-xs font-semibold px-2.5 py-1 rounded">
              {t('cardRented')}
            </span>
          )}
          {isReserved && (
            <span className="bg-amber-600/90 text-white text-xs font-semibold px-2.5 py-1 rounded">
              {t('cardReserved')}
            </span>
          )}
          {listing.isFurnished && (
            <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded">
              {t('cardFurnished')}
            </span>
          )}
        </div>

        {/* Bouton de partage rapide WhatsApp */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const url = getWhatsAppListingShareUrl(listing, language);
            window.open(url, '_blank', 'noopener,noreferrer');
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 dark:bg-slate-900/95 hover:bg-[#25D366] text-[#25D366] hover:text-white dark:text-[#25D366] dark:hover:text-white shadow-md flex items-center justify-center transition-all duration-200 z-10 cursor-pointer group/wa"
          title={t('shareWhatsAppTooltip')}
          aria-label={t('shareWhatsAppTooltip')}
        >
          <WhatsAppIcon className="w-4 h-4 fill-current group-hover/wa:scale-110 transition-transform" />
        </button>

        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded flex items-center gap-1">
          <Camera className="w-3 h-3" />
          <span>{listing.photos.length || 1}</span>
        </div>
      </div>

      {/* Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Unboxed Metadata with Typographic Separator */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1.5 capitalize">
            <span className="font-semibold text-slate-700 dark:text-slate-200">{t(typeKey as any)}</span>
            <span aria-hidden="true">·</span>
            <span>{listing.neighborhoodName}</span>
            {listing.surfaceArea && (
              <>
                <span aria-hidden="true">·</span>
                <span>{listing.surfaceArea} m²</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-2">
            {listing.title}
          </h3>

          {/* Key Specs Icons */}
          <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300 mb-3">
            <span className="flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5 text-slate-400" />
              <span>{listing.bedrooms} {t('cardBedrooms')}</span>
            </span>
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5 text-slate-400" />
              <span>{listing.bathrooms} {t('cardBathrooms')}</span>
            </span>
            {listing.chargesIncluded && (
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">{t('cardChargesIncluded')}</span>
            )}
          </div>
        </div>

        {/* Footer: Price in FCFA and Attributed Agency Name */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between gap-2">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t('cardMonthlyRent')}</div>
            <div className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
              {formatFCFA(listing.monthlyRent, true)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate max-w-[130px]">
              {listing.agencyName}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
