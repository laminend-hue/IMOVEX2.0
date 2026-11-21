import React from 'react';
import { ArrowRight, MapPin, ShieldCheck } from 'lucide-react';
import { Listing } from '../../types/database.ts';
import { useApp } from '../../lib/store/appStore.tsx';
import { useThemeLanguage } from '../../lib/i18n/ThemeLanguageContext.tsx';
import { SearchBar } from '../listings/SearchBar.tsx';
import { ListingCard } from '../listings/ListingCard.tsx';

interface HomeViewProps {
  onSearch: (params: { neighborhoodSlug: string; propertyType: string; maxRent: number | '' }) => void;
  onSelectListing: (listing: Listing) => void;
  onExploreAll: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSearch,
  onSelectListing,
  onExploreAll,
}) => {
  const { listings, neighborhoods } = useApp();
  const { t, isRTL } = useThemeLanguage();

  // Annonces récentes disponibles uniquement (exclure loué/masqué de l'accueil)
  const recentAvailableListings = listings
    .filter((l) => l.status === 'disponible' || l.status === 'reserve')
    .slice(0, 6);

  const popularNeighborhoods = neighborhoods.filter((n) => n.isPopular).slice(0, 8);

  return (
    <div className="space-y-16 pb-12 transition-colors">
      
      {/* 1. Accueil et recherche */}
      <section className="relative isolate overflow-hidden bg-[#0b162c] text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_72%_28%,rgba(14,165,122,0.18),transparent_38%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-8 lg:py-20">
          <div className="relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
              <MapPin className="h-3.5 w-3.5" />
              <span>{t('dakarSenegal')}</span>
            </div>
            <h1 className="max-w-2xl text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-balance sm:text-5xl lg:text-6xl">
              {t('heroTitle')}
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              {t('heroSubtitle')}
            </p>

            <div className="mt-8 max-w-2xl rounded-2xl bg-white p-2 text-slate-900 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-3">
              <SearchBar onSearch={onSearch} />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-300">
              <span className="font-semibold text-white">{t('heroPopularNeighborhoods')}</span>
              {popularNeighborhoods.slice(0, 5).map((n) => (
                <button
                  key={n.id}
                  onClick={() => onSearch({ neighborhoodSlug: n.slug, propertyType: 'all', maxRent: '' })}
                  className="rounded-full border border-white/15 px-3 py-1.5 transition-colors hover:border-emerald-300/60 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                >
                  {n.name}
                </button>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[560px] lg:max-w-none">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-emerald-300/10 blur-2xl" />
            <img
              src="/assets/hero-dakar.svg"
              alt="Illustration des immeubles et du littoral de Dakar"
              className="aspect-[1.13/1] w-full rounded-[1.5rem] object-cover shadow-2xl sm:rounded-[2rem]"
              fetchPriority="high"
            />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl border border-white/20 bg-[#0b162c]/85 px-4 py-3 text-white shadow-lg backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-6 sm:px-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">Dakar, Sénégal</p>
                <p className="mt-1 text-sm font-semibold">Un logement à votre rythme</p>
              </div>
              <MapPin className="h-5 w-5 text-emerald-300" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. ANNONCES RÉCENTES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {t('cardAvailable')}
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              {t('searchTitle')}
            </h2>
          </div>

          <button
            onClick={onExploreAll}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors group cursor-pointer"
          >
            <span>{t('navExplore')}</span>
            <ArrowRight className={`w-4 h-4 group-hover:translate-x-0.5 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentAvailableListings.length ? recentAvailableListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onClick={() => onSelectListing(listing)}
            />
          )) : (
            <p className="col-span-full rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
              Les annonces seront affichées ici dès que les agences partenaires auront publié leurs biens.
            </p>
          )}
        </div>
      </section>

      {/* 3. QUARTIERS POPULAIRES DE DAKAR */}
      <section className="bg-white dark:bg-slate-900/60 py-12 border-y border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {t('dakarSenegal')}
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              {t('heroNeighborhoodLabel')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('heroPopularNeighborhoods')}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {popularNeighborhoods.map((neighborhood) => {
              const count = listings.filter(
                (l) => l.neighborhoodName.toLowerCase().includes(neighborhood.name.toLowerCase()) && l.status === 'disponible'
              ).length;

              return (
                <button
                  key={neighborhood.id}
                  onClick={() => onSearch({ neighborhoodSlug: neighborhood.slug, propertyType: 'all', maxRent: '' })}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Dakar</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {neighborhood.name}
                  </h3>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    {count > 0 ? `${count} ${t('heroPropertiesAvailable')}` : t('heroOnDemand')}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. ENGAGEMENT & PRINCIPE DE FONCTIONNEMENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 dark:bg-slate-950 rounded-3xl text-white p-8 sm:p-12 border border-slate-800 transition-colors shadow-sm">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-md mb-4">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('dakarSenegal')}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t('detailPrivacyProtected')}
            </h2>
            
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              {t('detailPrivacyProtectedDesc')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h4 className="text-sm font-bold text-white">{t('navExplore')}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t('searchSearchPlaceholder')}
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h4 className="text-sm font-bold text-white">{t('reqModalTitle')}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t('reqModalSubtitle')}
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h4 className="text-sm font-bold text-white">{t('detailAvailableNow')}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t('confirmSuccessSubtitle')}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
