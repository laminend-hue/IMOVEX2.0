import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AppProvider, useApp } from './lib/store/appStore.tsx';
import { ThemeLanguageProvider } from './lib/i18n/ThemeLanguageContext.tsx';
import { Header } from './components/layout/Header.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { LegalModal } from './components/layout/LegalModal.tsx';
import { HomeView } from './components/home/HomeView.tsx';
import { MobileNavBar } from './components/layout/MobileNavBar.tsx';
import { TenantAuthModal } from './components/auth/TenantAuthModal.tsx';
import { ImovexLoader } from './components/common/ImovexLogo.tsx';
import { Listing } from './types/database.ts';

// Lazy-loaded views — only downloaded when actually visited
const SearchResultsView = lazy(() =>
  import('./components/listings/SearchResultsView.tsx').then((m) => ({ default: m.SearchResultsView }))
);
const ListingDetailView = lazy(() =>
  import('./components/listings/ListingDetailView.tsx').then((m) => ({ default: m.ListingDetailView }))
);
const ConfirmationView = lazy(() =>
  import('./components/listings/ConfirmationView.tsx').then((m) => ({ default: m.ConfirmationView }))
);
const AgencyDashboardView = lazy(() =>
  import('./components/agency/AgencyDashboardView.tsx').then((m) => ({ default: m.AgencyDashboardView }))
);
const AdminDashboardView = lazy(() =>
  import('./components/admin/AdminDashboardView.tsx').then((m) => ({ default: m.AdminDashboardView }))
);

const ViewLoader = () => (
  <ImovexLoader message="Chargement…" submessage="Préparation de la vue" />
);


function getInitialViewFromUrl(): string {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
  const hash = window.location.hash.toLowerCase();
  const search = new URLSearchParams(window.location.search);
  const portal = search.get('portal') || search.get('view');

  if (
    path === '/admin' || 
    path.startsWith('/admin') || 
    hash === '#admin' || 
    hash.startsWith('#/admin') || 
    hash.startsWith('#admin') || 
    portal === 'admin' || 
    portal === 'admin_dashboard'
  ) {
    return 'admin_dashboard';
  }
  if (
    path === '/espace-agence' || 
    path.startsWith('/espace-agence') || 
    path === '/agence' || 
    path.startsWith('/agence') || 
    hash === '#agence' || 
    hash === '#espace-agence' || 
    hash.startsWith('#/agence') || 
    hash.startsWith('#/espace-agence') || 
    portal === 'agence' || 
    portal === 'agency' || 
    portal === 'agency_dashboard'
  ) {
    return 'agency_dashboard';
  }
  if (path === '/recherche' || path === '/search' || hash === '#search' || hash.startsWith('#/search') || portal === 'search') {
    return 'search';
  }
  return 'home';
}

function MainApp() {
  const { listings, incrementListingViews, isFirestoreSyncing } = useApp();

  const [currentView, setCurrentView] = useState<string>(getInitialViewFromUrl);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [lastRequestId, setLastRequestId] = useState<string>('');
  const [legalModalType, setLegalModalType] = useState<'mentions' | 'cgu' | 'confidentialite' | null>(null);
  const [isTenantAuthModalOpen, setIsTenantAuthModalOpen] = useState(false);

  // Search initial parameters
  const [searchParams, setSearchParams] = useState<{
    neighborhoodSlug: string;
    propertyType: string;
    maxRent: number | '';
  }>({
    neighborhoodSlug: '',
    propertyType: 'all',
    maxRent: '',
  });

  const [openAgencyCreateModal, setOpenAgencyCreateModal] = useState(false);

  // Synchronize browser history and popstate for direct link support
  useEffect(() => {
    const handleUrlChange = () => {
      const v = getInitialViewFromUrl();
      setCurrentView(v);
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedListing]);

  const handleNavigate = (view: string, params?: any) => {
    setCurrentView(view);
    if (params?.openCreateModal) {
      setOpenAgencyCreateModal(true);
    } else {
      setOpenAgencyCreateModal(false);
    }

    // Update browser URL path so that direct links can be copied/shared
    let targetPath = '/';
    if (view === 'admin_dashboard') targetPath = '/admin';
    else if (view === 'agency_dashboard') targetPath = '/espace-agence';
    else if (view === 'search') targetPath = '/recherche';
    else if (view === 'confirmation') targetPath = '/confirmation';

    if (window.location.pathname !== targetPath) {
      try {
        window.history.pushState({ view }, '', targetPath);
      } catch {
        // Fallback for strict iframe permissions
        if (view === 'admin_dashboard') window.location.hash = 'admin';
        else if (view === 'agency_dashboard') window.location.hash = 'espace-agence';
      }
    }
  };

  const handleHeroSearch = (params: { neighborhoodSlug: string; propertyType: string; maxRent: number | '' }) => {
    setSearchParams(params);
    handleNavigate('search');
  };

  const handleSelectListing = (listing: Listing) => {
    setSelectedListing(listing);
    incrementListingViews(listing.id);
    setCurrentView('listing_detail');
  };

  const handleRequestSuccess = (requestId: string) => {
    setLastRequestId(requestId);
    handleNavigate('confirmation');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b12] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      
      {/* Barre de navigation Top Bar avec connexion directe locataire & liens directs */}
      <Header 
        currentView={currentView} 
        onNavigate={handleNavigate} 
        onOpenTenantAuth={() => setIsTenantAuthModalOpen(true)}
      />

      {/* Contenu principal selon la vue active */}
      <main className="flex-1 pb-20 md:pb-0">
        {currentView === 'home' && (
          <HomeView
            onSearch={handleHeroSearch}
            onSelectListing={handleSelectListing}
            onExploreAll={() => handleNavigate('search')}
          />
        )}

        {currentView === 'search' && (
          <Suspense fallback={<ViewLoader />}>
            <SearchResultsView
              initialNeighborhoodSlug={searchParams.neighborhoodSlug}
              initialType={searchParams.propertyType}
              initialMaxRent={searchParams.maxRent}
              onSelectListing={handleSelectListing}
            />
          </Suspense>
        )}

        {currentView === 'listing_detail' && (
          selectedListing ? (
            <Suspense fallback={<ViewLoader />}>
              <ListingDetailView
                listing={selectedListing}
                onBack={() => handleNavigate('search')}
                onRequestSuccess={handleRequestSuccess}
              />
            </Suspense>
          ) : (
            <ImovexLoader message="Chargement du logement..." submessage="Préparation de la fiche et des photos" />
          )
        )}

        {currentView === 'confirmation' && (
          <Suspense fallback={<ViewLoader />}>
            <ConfirmationView
              requestId={lastRequestId}
              onExploreMore={() => handleNavigate('search')}
            />
          </Suspense>
        )}

        {currentView === 'agency_dashboard' && (
          <Suspense fallback={<ViewLoader />}>
            <AgencyDashboardView
              onOpenCreateModal={openAgencyCreateModal}
              onNavigate={handleNavigate}
            />
          </Suspense>
        )}

        {currentView === 'admin_dashboard' && (
          <Suspense fallback={<ViewLoader />}>
            <AdminDashboardView
              onNavigate={handleNavigate}
            />
          </Suspense>
        )}
      </main>


      {/* Footer avec conformité sénégalaise et liens d'accès direct */}
      <Footer 
        onOpenLegal={(type) => setLegalModalType(type)} 
        onNavigate={handleNavigate}
        onOpenTenantAuth={() => setIsTenantAuthModalOpen(true)}
      />

      {/* Barre de navigation inférieure dédiée aux smartphones & tablettes */}
      <MobileNavBar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenTenantAuth={() => setIsTenantAuthModalOpen(true)}
      />

      {/* Modale de connexion directe locataire (sans redirection externe) */}
      <TenantAuthModal
        isOpen={isTenantAuthModalOpen}
        onClose={() => setIsTenantAuthModalOpen(false)}
        onNavigateToSearch={() => handleNavigate('search')}
      />

      {/* Modale d'informations légales & CDP */}
      <LegalModal type={legalModalType} onClose={() => setLegalModalType(null)} />

    </div>
  );
}

export default function App() {
  return (
    <ThemeLanguageProvider>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </ThemeLanguageProvider>
  );
}
