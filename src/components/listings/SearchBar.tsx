import React, { useState } from 'react';
import { Search, MapPin, Home, Banknote } from 'lucide-react';
import { PropertyType } from '../../types/database.ts';
import { useApp } from '../../lib/store/appStore.tsx';
import { useThemeLanguage } from '../../lib/i18n/ThemeLanguageContext.tsx';

interface SearchBarProps {
  initialNeighborhoodSlug?: string;
  initialType?: string;
  initialMaxRent?: number | '';
  onSearch: (params: { neighborhoodSlug: string; propertyType: string; maxRent: number | '' }) => void;
  compact?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialNeighborhoodSlug = '',
  initialType = 'all',
  initialMaxRent = '',
  onSearch,
  compact = false,
}) => {
  const { neighborhoods } = useApp();
  const { t } = useThemeLanguage();

  const [neighborhoodSlug, setNeighborhoodSlug] = useState(initialNeighborhoodSlug);
  const [propertyType, setPropertyType] = useState(initialType);
  const [maxRent, setMaxRent] = useState<number | ''>(initialMaxRent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      neighborhoodSlug,
      propertyType,
      maxRent,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200/80 dark:border-slate-800 p-2.5 sm:p-3 transition-colors ${
        compact ? 'w-full' : 'max-w-4xl mx-auto'
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-7 gap-2 items-center">
        
        {/* Champ 1: Quartier */}
        <div className="lg:col-span-2 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-left">
          <label htmlFor="search-neighborhood" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
            {t('heroNeighborhoodLabel')}
          </label>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <select
              id="search-neighborhood"
              value={neighborhoodSlug}
              onChange={(e) => setNeighborhoodSlug(e.target.value)}
              className="w-full text-sm font-medium text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none cursor-pointer truncate"
            >
              <option value="" className="dark:bg-slate-900 dark:text-white">{t('heroAllNeighborhoods')}</option>
              {neighborhoods
                .filter((n) => n.isActive)
                .map((n) => (
                  <option key={n.id} value={n.slug} className="dark:bg-slate-900 dark:text-white">
                    {n.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Champ 2: Type de bien */}
        <div className="lg:col-span-2 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-left">
          <label htmlFor="search-type" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
            {t('heroPropertyTypeLabel')}
          </label>
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <select
              id="search-type"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full text-sm font-medium text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none cursor-pointer capitalize"
            >
              <option value="all" className="dark:bg-slate-900 dark:text-white">{t('heroAllTypes')}</option>
              <option value="appartement" className="dark:bg-slate-900 dark:text-white">{t('typeApartment')}</option>
              <option value="villa" className="dark:bg-slate-900 dark:text-white">{t('typeVilla')}</option>
              <option value="studio" className="dark:bg-slate-900 dark:text-white">{t('typeStudio')}</option>
              <option value="maison" className="dark:bg-slate-900 dark:text-white">{t('typeHouse')}</option>
              <option value="chambre" className="dark:bg-slate-900 dark:text-white">{t('typeRoom')}</option>
            </select>
          </div>
        </div>

        {/* Champ 3: Budget Max */}
        <div className="lg:col-span-2 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-left">
          <label htmlFor="search-budget" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
            {t('heroBudgetLabel')}
          </label>
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <select
              id="search-budget"
              value={maxRent === '' ? '' : String(maxRent)}
              onChange={(e) => setMaxRent(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full text-sm font-medium text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none cursor-pointer tabular-nums"
            >
              <option value="" className="dark:bg-slate-900 dark:text-white">{t('heroNoLimit')}</option>
              <option value="150000" className="dark:bg-slate-900 dark:text-white">150 000 FCFA</option>
              <option value="300000" className="dark:bg-slate-900 dark:text-white">300 000 FCFA</option>
              <option value="500000" className="dark:bg-slate-900 dark:text-white">500 000 FCFA</option>
              <option value="800000" className="dark:bg-slate-900 dark:text-white">800 000 FCFA</option>
              <option value="1200000" className="dark:bg-slate-900 dark:text-white">1 200 000 FCFA</option>
              <option value="2000000" className="dark:bg-slate-900 dark:text-white">2 000 000 FCFA</option>
              <option value="3500000" className="dark:bg-slate-900 dark:text-white">3 500 000 FCFA</option>
            </select>
          </div>
        </div>

        {/* Bouton Action */}
        <div className="lg:col-span-1 p-1">
          <button
            type="submit"
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span className="sm:inline">{t('heroSearchButton')}</span>
          </button>
        </div>

      </div>
    </form>
  );
};
