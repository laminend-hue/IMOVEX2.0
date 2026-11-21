import React from 'react';
import { ShieldCheck, MapPin, Mail, FileText, Building2, Shield, User, Link2, Globe, Sun, Moon } from 'lucide-react';
import { useThemeLanguage } from '../../lib/i18n/ThemeLanguageContext.tsx';
import { ThemeLanguageSwitcher } from './ThemeLanguageSwitcher.tsx';
import { ImovexLogo } from '../common/ImovexLogo.tsx';

interface FooterProps {
  onOpenLegal: (type: 'mentions' | 'cgu' | 'confidentialite') => void;
  onNavigate?: (view: string) => void;
  onOpenTenantAuth?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal, onNavigate, onOpenTenantAuth }) => {
  const { t, theme, isRTL } = useThemeLanguage();

  return (
    <footer className="bg-slate-900 dark:bg-[#05070d] text-slate-400 text-xs border-t border-slate-800 dark:border-slate-850 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Top bar with Theme and Language switcher quick access in footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between pb-8 mb-8 border-b border-slate-800/80 gap-4">
          <div className="flex items-center gap-3">
            <ImovexLogo size="md" />
            <div>
              <span className="text-lg font-bold text-white tracking-tight">{t('brandName')}</span>
              <span className="text-xs text-sky-400 mx-2">·</span>
              <span className="text-xs text-slate-400">{t('dakarSenegal')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-xs hidden sm:inline">{t('languageSelect')} & {t('themeToggle')} :</span>
            <ThemeLanguageSwitcher />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1 : Brand & Mission */}
          <div>
            <p className="text-slate-400 text-xs max-w-sm leading-relaxed mb-4">
              {t('footerAbout')}
            </p>
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{t('footerCdpLaw')}</span>
            </div>
          </div>

          {/* Col 2 : Portails d'accès par lien direct */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('footerDirectLinksTitle')}</span>
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('agency_dashboard')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{t('navAgencyPortal')} (<code className="text-slate-300 font-mono text-[11px]">/espace-agence</code>)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('admin_dashboard')}
                  className="hover:text-purple-400 transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>{t('navAdminPortal')} (<code className="text-slate-300 font-mono text-[11px]">/admin</code>)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenTenantAuth && onOpenTenantAuth()}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{t('tenantModalTitle')}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 : Quartiers Dakar */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
              {t('footerNeighborhoodsTitle')}
            </h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li>Almadies & Ngor</li>
              <li>Mermoz & Sacré-Cœur</li>
              <li>Fann Résidence & Point E</li>
              <li>Plateau (Centre-ville)</li>
              <li>Mamelles & Ouakam</li>
              <li>Yoff (Virage, Tonghor)</li>
            </ul>
          </div>

          {/* Col 4 : Légal & Contact */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
              {t('footerLegalTitle')}
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onOpenLegal('mentions')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {t('footerMentions')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('cgu')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {t('footerCGU')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('confidentialite')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {t('footerPrivacy')}
                </button>
              </li>
              <li className="pt-2 text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-[11px]">laminend2462@gmail.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <div>
            © {new Date().getFullYear()} {t('brandName')}.sn — {t('footerRights')}
          </div>
          <div className="text-center sm:text-right text-[11px]">
            {t('footerDisclaimer')}
          </div>
        </div>
      </div>
    </footer>
  );
};
