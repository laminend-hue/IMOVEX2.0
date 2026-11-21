import React, { useState } from 'react';
import { 
  Shield, Building2, User, Search, LogOut, 
  ExternalLink, ArrowLeft, ChevronDown, Check, Link2 
} from 'lucide-react';
import { useApp } from '../../lib/store/appStore.tsx';
import { useThemeLanguage } from '../../lib/i18n/ThemeLanguageContext.tsx';
import { ThemeLanguageSwitcher } from './ThemeLanguageSwitcher.tsx';
import { ImovexLogo } from '../common/ImovexLogo.tsx';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenTenantAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onOpenTenantAuth }) => {
  const {
    tenantProfile,
  } = useApp();
  const { t, theme, isRTL } = useThemeLanguage();

  const [proDropdownOpen, setProDropdownOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const copyDirectLink = (path: string, label: string) => {
    const fullUrl = `${window.location.origin}${path}`;
    navigator.clipboard?.writeText(fullUrl);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const isProView = currentView === 'agency_dashboard' || currentView === 'admin_dashboard';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Zone 1: Logo & Titre */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-1.5 sm:gap-2 group text-left cursor-pointer focus:outline-none shrink-0"
            >
              <ImovexLogo size="sm" className="sm:hidden group-hover:scale-105 transition-transform" />
              <ImovexLogo size="md" className="hidden sm:block group-hover:scale-105 transition-transform" />
              <div className="flex flex-col">
                <span className="text-base sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors">
                  {t('brandName')}
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-sky-600 dark:text-sky-400 -mt-0.5 sm:-mt-1">
                  {t('dakarSenegal')}
                </span>
              </div>
            </button>

            {/* Badge de vue actuelle si portail spécifique */}
            {currentView === 'admin_dashboard' && (
              <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-[11px] font-bold">
                <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>{t('navAdminPortal')}</span>
              </span>
            )}

            {currentView === 'agency_dashboard' && (
              <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t('navAgencyPortal')}</span>
              </span>
            )}
          </div>

          {/* Zone 2: Navigation principale publique */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => onNavigate('home')}
              className={`hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap cursor-pointer ${
                currentView === 'home' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
              }`}
            >
              {t('navHome')}
            </button>
            <button
              onClick={() => onNavigate('search')}
              className={`hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap cursor-pointer ${
                currentView === 'search' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
              }`}
            >
              {t('navExplore')}
            </button>

            {/* Si l'utilisateur est sur un portail pro, bouton retour direct au site public */}
            {isProView && (
              <button
                onClick={() => onNavigate('search')}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                <span>{t('navBackToPublic')}</span>
              </button>
            )}
          </nav>

          {/* Zone 3: Commandes Droite (Langues, Thème Blanc/Noir, Locataire, Portails Pro) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* SÉLECTEUR DE THÈME (NOIR/BLANC) & LANGUE (FR/EN/AR/ES) */}
            <ThemeLanguageSwitcher />

            {/* 1. CONNEXION DIRECTE LOCATAIRE (In-app, sans redirection externe) */}
            {tenantProfile ? (
              <button
                onClick={onOpenTenantAuth}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-emerald-900 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-all shadow-2xs cursor-pointer"
                title={t('tenantTabProfile')}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="max-w-[100px] sm:max-w-[140px] truncate">
                  {tenantProfile.fullName.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenTenantAuth}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-700/60 rounded-xl transition-all shadow-2xs cursor-pointer"
                title={t('tenantModalTitle')}
              >
                <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">{t('navTenantLogin')}</span>
                <span className="sm:hidden">{t('tenantTabProfile')}</span>
              </button>
            )}

            {/* 2. LIENS DIRECTS PORTAILS PAR LIEN */}
            <div className="relative">
              <button
                onClick={() => setProDropdownOpen(!proDropdownOpen)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                  isProView 
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white border-slate-900 dark:border-emerald-600 shadow-xs' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
                title={t('proPortalsMenu')}
              >
                <span className="hidden sm:inline">{t('navProPortals')}</span>
                <span className="sm:hidden">Pro</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {proDropdownOpen && (
                <div 
                  className={`absolute mt-2 w-72 rounded-2xl shadow-xl border p-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                    isRTL ? 'left-0' : 'right-0'
                  } ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-slate-100 shadow-black/80'
                      : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    {t('proPortalsDirectTitle')}
                  </div>

                  {/* Lien Espace Agence */}
                  <div className="p-1">
                    <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <button
                        onClick={() => {
                          setProDropdownOpen(false);
                          onNavigate('agency_dashboard');
                        }}
                        className="flex items-center gap-2 text-left flex-1 cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {t('navAgencyPortal')}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {t('proAgencyPath')}
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => copyDirectLink('/espace-agence', 'agence')}
                        title={t('navCopyDirectLink')}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors cursor-pointer"
                      >
                        {copiedLink === 'agence' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Link2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Lien Portail Admin */}
                  <div className="p-1">
                    <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <button
                        onClick={() => {
                          setProDropdownOpen(false);
                          onNavigate('admin_dashboard');
                        }}
                        className="flex items-center gap-2 text-left flex-1 cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {t('navAdminPortal')}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {t('proAdminPath')}
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => copyDirectLink('/admin', 'admin')}
                        title={t('navCopyDirectLink')}
                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-lg transition-colors cursor-pointer"
                      >
                        {copiedLink === 'admin' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Link2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {copiedLink && (
                    <div className="text-[10px] text-center py-1 text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/60 rounded-lg mx-1 mt-1">
                      {t('directLinkCopied')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick CTA */}
            <button
              onClick={() => {
                if (currentView === 'agency_dashboard') {
                  onNavigate('agency_dashboard', { openCreateModal: true });
                } else {
                  onNavigate('search');
                }
              }}
              className="hidden xl:inline-flex px-3 py-1.5 text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 rounded-xl transition-colors whitespace-nowrap cursor-pointer shadow-2xs items-center gap-1.5"
            >
              {currentView === 'agency_dashboard' ? (
                <>
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{t('navPublishListing')}</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>{t('navFindRental')}</span>
                </>
              )}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
