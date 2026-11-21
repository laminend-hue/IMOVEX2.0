import React from 'react';
import { Home, Search, Building2, Shield, User } from 'lucide-react';
import { useThemeLanguage } from '../../lib/i18n/ThemeLanguageContext.tsx';
import { useApp } from '../../lib/store/appStore.tsx';

interface MobileNavBarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenTenantAuth: () => void;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({
  currentView,
  onNavigate,
  onOpenTenantAuth,
}) => {
  const { t } = useThemeLanguage();
  const { listings, tenantProfile } = useApp();

  const availableListingsCount = listings.filter((l) => l.status === 'disponible').length;

  const isHome = currentView === 'home';
  const isSearch = currentView === 'search' || currentView === 'listing_detail' || currentView === 'confirmation';
  const isAgency = currentView === 'agency_dashboard';
  const isAdmin = currentView === 'admin_dashboard';

  return (
    <nav
      aria-label="Navigation mobile"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))] pt-1 transition-colors"
    >
      <div className="grid grid-cols-5 h-14 max-w-md mx-auto items-center px-1">
        
        {/* 1. ACCUEIL */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center h-full py-1 rounded-xl transition-all relative cursor-pointer ${
            isHome
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 transition-transform ${isHome ? 'scale-110' : ''}`} />
            {isHome && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[56px]">
            {t('mobileNavHome')}
          </span>
        </button>

        {/* 2. RECHERCHER / EXPLORER */}
        <button
          onClick={() => onNavigate('search')}
          className={`flex flex-col items-center justify-center h-full py-1 rounded-xl transition-all relative cursor-pointer ${
            isSearch
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Search className={`w-5 h-5 transition-transform ${isSearch ? 'scale-110' : ''}`} />
            {availableListingsCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold bg-emerald-600 text-white rounded-full leading-tight min-w-[14px] text-center">
                {availableListingsCount}
              </span>
            )}
            {isSearch && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[56px]">
            {t('mobileNavExplore')}
          </span>
        </button>

        {/* 3. ESPACE AGENCE */}
        <button
          onClick={() => onNavigate('agency_dashboard')}
          className={`flex flex-col items-center justify-center h-full py-1 rounded-xl transition-all relative cursor-pointer ${
            isAgency
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Building2 className={`w-5 h-5 transition-transform ${isAgency ? 'scale-110' : ''}`} />
            {isAgency && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[56px]">
            {t('mobileNavAgency')}
          </span>
        </button>

        {/* 4. ADMIN */}
        <button
          onClick={() => onNavigate('admin_dashboard')}
          className={`flex flex-col items-center justify-center h-full py-1 rounded-xl transition-all relative cursor-pointer ${
            isAdmin
              ? 'text-purple-600 dark:text-purple-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Shield className={`w-5 h-5 transition-transform ${isAdmin ? 'scale-110 text-purple-600 dark:text-purple-400' : ''}`} />
            {isAdmin && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-600 dark:bg-purple-400" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[56px]">
            {t('mobileNavAdmin')}
          </span>
        </button>

        {/* 5. MON COMPTE / LOCATAIRE */}
        <button
          onClick={onOpenTenantAuth}
          className="flex flex-col items-center justify-center h-full py-1 rounded-xl transition-all relative text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
        >
          <div className="relative">
            <User className="w-5 h-5" />
            {tenantProfile && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[56px]">
            {tenantProfile ? tenantProfile.fullName.split(' ')[0] : t('mobileNavAccount')}
          </span>
        </button>

      </div>
    </nav>
  );
};
