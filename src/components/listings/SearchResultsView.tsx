import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown, Search, RefreshCw, X } from 'lucide-react';
import { Listing, PropertyType } from '../../types/database.ts';
import { useApp } from '../../lib/store/appStore.tsx';
import { useThemeLanguage } from '../../lib/i18n/ThemeLanguageContext.tsx';
import { ListingCard } from './ListingCard.tsx';
import { ImovexLogo } from '../common/ImovexLogo.tsx';

interface SearchResultsViewProps {
  initialNeighborhoodSlug?: string;
  initialType?: string;
  initialMaxRent?: number | '';
  onSelectListing: (listing: Listing) => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  initialNeighborhoodSlug = '',
  initialType = 'all',
  initialMaxRent = '',
  onSelectListing,
}) => {
  const { listings, neighborhoods } = useApp();
  const { t, isRTL } = useThemeLanguage();

  // Filters state
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(initialNeighborhoodSlug);
  const [selectedType, setSelectedType] = useState<PropertyType | 'all'>(
    initialType === 'all' || !initialType ? 'all' : (initialType as PropertyType)
  );
  const [minRent, setMinRent] = useState<number | ''>('');
  const [maxRent, setMaxRent] = useState<number | ''>(initialMaxRent);
  const [bedrooms, setBedrooms] = useState<number | 'all'>('all');
  const [isFurnished, setIsFurnished] = useState<'all' | 'true' | 'false'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc'>('recent');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Filter logic: Règle d'or : Annonces « Loué » et « Masqué » masquées de la recherche publique
  const filteredListings = useMemo(() => {
    return listings
      .filter((item) => {
        // Exclure 'loue' et 'masque' de la recherche publique
        if (item.status === 'loue' || item.status === 'masque') {
          return false;
        }

        // Quartier
        if (selectedNeighborhood && item.neighborhoodName.toLowerCase() !== selectedNeighborhood.toLowerCase()) {
          const matchSlug = neighborhoods.find(n => n.slug === selectedNeighborhood)?.name;
          if (matchSlug && item.neighborhoodName !== matchSlug) {
            return false;
          }
        }

        // Type
        if (selectedType !== 'all' && item.propertyType !== selectedType) {
          return false;
        }

        // Loyer min
        if (minRent !== '' && item.monthlyRent < minRent) {
          return false;
        }

        // Loyer max
        if (maxRent !== '' && item.monthlyRent > maxRent) {
          return false;
        }

        // Chambres
        if (bedrooms !== 'all' && item.bedrooms < bedrooms) {
          return false;
        }

        // Meublé
        if (isFurnished === 'true' && !item.isFurnished) return false;
        if (isFurnished === 'false' && item.isFurnished) return false;

        // Texte recherche libre
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchQuartier = item.neighborhoodName.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchQuartier) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.monthlyRent - b.monthlyRent;
        if (sortBy === 'price_desc') return b.monthlyRent - a.monthlyRent;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [listings, selectedNeighborhood, selectedType, minRent, maxRent, bedrooms, isFurnished, searchQuery, sortBy, neighborhoods]);

  // Paginated items
  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE) || 1;
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredListings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredListings, currentPage]);

  const handleResetFilters = () => {
    setSelectedNeighborhood('');
    setSelectedType('all');
    setMinRent('');
    setMaxRent('');
    setBedrooms('all');
    setIsFurnished('all');
    setSearchQuery('');
    setSortBy('recent');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    selectedNeighborhood ||
    selectedType !== 'all' ||
    minRent !== '' ||
    maxRent !== '' ||
    bedrooms !== 'all' ||
    isFurnished !== 'all' ||
    searchQuery
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      
      {/* En-tête de résultats & recherche textuelle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('searchTitle')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{filteredListings.length}</span> {t('searchResultsCount')}
          </p>
        </div>

        {/* Barre de filtre texte et tri */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className={`w-4 h-4 text-slate-400 absolute top-2.5 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              placeholder={t('searchSearchPlaceholder')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'
              }`}
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="recent">{t('searchSortRecent')}</option>
              <option value="price_asc">{t('searchSortPriceAsc')}</option>
              <option value="price_desc">{t('searchSortPriceDesc')}</option>
            </select>
          </div>
        </div>
      </div>
      {/* Barre de filtres mobiles rapide (< lg) */}
      <div className="lg:hidden mt-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-98 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{t('mobileFiltersBtn')}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-amber-300" />
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t('searchResetFilters')}</span>
            </button>
          )}
        </div>

        {/* Chips horizontaux déroulants par type de bien sur mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {(['all', 'appartement', 'villa', 'studio', 'maison', 'chambre'] as const).map((typeItem) => {
            const label = typeItem === 'all' ? t('searchFilterAll')
              : typeItem === 'appartement' ? t('typeApartment')
              : typeItem === 'villa' ? t('typeVilla')
              : typeItem === 'studio' ? t('typeStudio')
              : typeItem === 'maison' ? t('typeHouse')
              : t('typeRoom');
            return (
              <button
                key={typeItem}
                onClick={() => {
                  setSelectedType(typeItem);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  selectedType === typeItem
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6 lg:mt-8 items-start">
        
        {/* Colonne latérale Filtres Desktop uniquement (1 colonne) */}
        <aside className="hidden lg:block lg:col-span-1 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6 transition-colors sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('searchSortBy')}</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>{t('searchResetFilters')}</span>
              </button>
            )}
          </div>

          {/* Quartier */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              {t('searchFilterNeighborhood')} (Dakar)
            </label>
            <select
              value={selectedNeighborhood}
              onChange={(e) => {
                setSelectedNeighborhood(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">{t('heroAllNeighborhoods')}</option>
              {neighborhoods.filter(n => n.isActive).map((n) => (
                <option key={n.id} value={n.slug}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type de bien */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              {t('searchFilterType')}
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['all', 'appartement', 'villa', 'studio', 'maison', 'chambre'] as const).map((typeItem) => {
                const label = typeItem === 'all' ? t('searchFilterAll')
                  : typeItem === 'appartement' ? t('typeApartment')
                  : typeItem === 'villa' ? t('typeVilla')
                  : typeItem === 'studio' ? t('typeStudio')
                  : typeItem === 'maison' ? t('typeHouse')
                  : t('typeRoom');

                return (
                  <button
                    key={typeItem}
                    type="button"
                    onClick={() => {
                      setSelectedType(typeItem);
                      setCurrentPage(1);
                    }}
                    className={`px-2 py-1.5 text-xs rounded-xl font-medium text-center transition-colors cursor-pointer ${
                      selectedType === typeItem
                        ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget Min / Max (FCFA) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              {t('cardMonthlyRent')} (FCFA)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="number"
                  placeholder="Min"
                  value={minRent}
                  onChange={(e) => {
                    setMinRent(e.target.value ? Number(e.target.value) : '');
                    setCurrentPage(1);
                  }}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-800 dark:text-slate-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxRent}
                  onChange={(e) => {
                    setMaxRent(e.target.value ? Number(e.target.value) : '');
                    setCurrentPage(1);
                  }}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-800 dark:text-slate-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Chambres minimum */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              {t('searchFilterBedrooms')}
            </label>
            <div className="flex gap-1.5">
              {(['all', 1, 2, 3, 4] as const).map((c) => (
                <button
                  key={String(c)}
                  type="button"
                  onClick={() => {
                    setBedrooms(c);
                    setCurrentPage(1);
                  }}
                  className={`flex-1 py-1.5 text-xs rounded-xl font-medium text-center transition-colors cursor-pointer ${
                    bedrooms === c
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {c === 'all' ? t('searchFilterAll') : `${c}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Meublé */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              {t('searchFilterFurnished')}
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { value: 'all', label: t('searchFilterAll') },
                { value: 'true', label: t('cardFurnished') },
                { value: 'false', label: t('searchFilterNo') },
              ].map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => {
                    setIsFurnished(m.value as any);
                    setCurrentPage(1);
                  }}
                  className={`py-1.5 text-xs rounded-xl font-medium text-center transition-colors cursor-pointer ${
                    isFurnished === m.value
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

        </aside>

        {/* Colonne principale : Grille des annonces (3 colonnes) */}
        <div className="lg:col-span-3 space-y-6">
          {filteredListings.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center transition-colors">
              <ImovexLogo size="lg" className="mx-auto mb-4 shadow-sm border-slate-700/40" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('searchNoResults')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5">
                {t('searchNoResultsTip')}
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {t('searchResetFilters')}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onClick={() => onSelectListing(listing)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Page <strong className="text-slate-800 dark:text-slate-200">{currentPage}</strong> / {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                    >
                      {isRTL ? '→' : '←'}
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                    >
                      {isRTL ? '←' : '→'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* MODAL / BOTTOM SHEET FILTRES MOBILES (< lg) */}
      {isMobileFilterOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end justify-center animate-in fade-in duration-200 lg:hidden"
          onClick={() => setIsMobileFilterOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 w-full rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[88vh] animate-in slide-in-from-bottom duration-250 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Poignée tactile & En-tête */}
            <div className="pt-2.5 pb-2 px-5 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-2" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('mobileFiltersTitle')}
                  </h3>
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  aria-label={t('close')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Corps défilable des filtres */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Quartier */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {t('searchFilterNeighborhood')} (Dakar)
                </label>
                <select
                  value={selectedNeighborhood}
                  onChange={(e) => {
                    setSelectedNeighborhood(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="">{t('heroAllNeighborhoods')}</option>
                  {neighborhoods.filter(n => n.isActive).map((n) => (
                    <option key={n.id} value={n.slug}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type de bien */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {t('searchFilterType')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['all', 'appartement', 'villa', 'studio', 'maison', 'chambre'] as const).map((typeItem) => {
                    const label = typeItem === 'all' ? t('searchFilterAll')
                      : typeItem === 'appartement' ? t('typeApartment')
                      : typeItem === 'villa' ? t('typeVilla')
                      : typeItem === 'studio' ? t('typeStudio')
                      : typeItem === 'maison' ? t('typeHouse')
                      : t('typeRoom');

                    return (
                      <button
                        key={typeItem}
                        type="button"
                        onClick={() => {
                          setSelectedType(typeItem);
                          setCurrentPage(1);
                        }}
                        className={`py-2 px-3 text-xs rounded-xl font-medium text-center transition-colors cursor-pointer ${
                          selectedType === typeItem
                            ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Budget Min / Max */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {t('cardMonthlyRent')} (FCFA)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minRent}
                    onChange={(e) => {
                      setMinRent(e.target.value === '' ? '' : Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxRent}
                    onChange={(e) => {
                      setMaxRent(e.target.value === '' ? '' : Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Nombre de chambres */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {t('cardBedrooms')}
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['all', 1, 2, 3, 4] as const).map((b) => (
                    <button
                      key={String(b)}
                      type="button"
                      onClick={() => {
                        setBedrooms(b as any);
                        setCurrentPage(1);
                      }}
                      className={`py-2 text-xs rounded-xl font-medium text-center transition-colors cursor-pointer ${
                        bedrooms === b
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {b === 'all' ? t('searchFilterAll') : `${b}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meublé */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {t('searchFilterFurnished')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'all', label: t('searchFilterAll') },
                    { value: 'true', label: t('cardFurnished') },
                    { value: 'false', label: t('searchFilterNo') },
                  ].map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => {
                        setIsFurnished(m.value as any);
                        setCurrentPage(1);
                      }}
                      className={`py-2 text-xs rounded-xl font-medium text-center transition-colors cursor-pointer ${
                        isFurnished === m.value
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pied fixe du tiroir avec actions */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/80 dark:bg-slate-900/80 pb-safe">
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-3 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-xl cursor-pointer"
                >
                  {t('searchResetFilters')}
                </button>
              )}
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer text-center"
              >
                {t('mobileApplyFilters')} ({filteredListings.length})
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
