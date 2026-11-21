export type Language = 'fr' | 'en' | 'ar' | 'es';
export type Theme = 'light' | 'dark'; // 'light' = Blanc, 'dark' = Noir

export interface TranslationDictionary {
  // Brand & General
  brandName: string;
  brandTagline: string;
  dakarSenegal: string;
  themeWhite: string;
  themeBlack: string;
  themeToggle: string;
  languageSelect: string;
  close: string;
  cancel: string;
  confirm: string;
  save: string;
  delete: string;
  edit: string;
  actions: string;
  status: string;
  date: string;
  reference: string;
  loading: string;
  copySuccess: string;
  directLinkCopied: string;

  // Navigation
  navHome: string;
  navExplore: string;
  navProPortals: string;
  navBackToPublic: string;
  navPublishListing: string;
  navFindRental: string;
  navAgencyPortal: string;
  navAdminPortal: string;
  navTenantLogin: string;
  navTenantAccount: string;
  navCopyDirectLink: string;

  // Hero & Search
  heroCertifiedBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroNeighborhoodLabel: string;
  heroAllNeighborhoods: string;
  heroPropertyTypeLabel: string;
  heroAllTypes: string;
  heroBudgetLabel: string;
  heroNoLimit: string;
  heroSearchButton: string;
  heroPopularNeighborhoods: string;
  heroPropertiesAvailable: string;
  heroOnDemand: string;

  // Property types
  typeApartment: string;
  typeVilla: string;
  typeStudio: string;
  typeHouse: string;
  typeRoom: string;

  // Listing Cards
  cardPerMonth: string;
  cardBedrooms: string;
  cardBathrooms: string;
  cardFurnished: string;
  cardChargesIncluded: string;
  cardRented: string;
  cardReserved: string;
  cardAvailable: string;
  cardCertifiedAgency: string;
  cardMonthlyRent: string;
  cardPhotos: string;
  cardViewDetails: string;

  // Search Results
  searchTitle: string;
  searchResultsCount: string;
  searchFilterNeighborhood: string;
  searchFilterType: string;
  searchFilterMinRent: string;
  searchFilterMaxRent: string;
  searchFilterBedrooms: string;
  searchFilterFurnished: string;
  searchFilterAll: string;
  searchFilterYes: string;
  searchFilterNo: string;
  searchSortBy: string;
  searchSortRecent: string;
  searchSortPriceAsc: string;
  searchSortPriceDesc: string;
  searchResetFilters: string;
  searchNoResults: string;
  searchNoResultsTip: string;
  searchSearchQuery: string;
  searchSearchPlaceholder: string;

  // Listing Details
  detailBackToList: string;
  detailShare: string;
  shareWhatsApp: string;
  shareWhatsAppTooltip: string;
  detailMonthlyRent: string;
  detailDepositAdvance: string;
  detailTotalMoveIn: string;
  detailKeySpecs: string;
  detailSurface: string;
  detailDescription: string;
  detailAmenities: string;
  detailAmenityAC: string;
  detailAmenityWater: string;
  detailAmenityGenerator: string;
  detailAmenityParking: string;
  detailAmenityGuard: string;
  detailAmenityWifi: string;
  detailAmenityBalcony: string;
  detailRequestVisitBtn: string;
  detailAvailableNow: string;
  detailPartnerAgency: string;
  detailPrivacyProtected: string;
  detailPrivacyProtectedDesc: string;

  // Rental Request Modal
  reqModalTitle: string;
  reqModalSubtitle: string;
  reqFullName: string;
  reqFullNamePlaceholder: string;
  reqPhone: string;
  reqPhonePlaceholder: string;
  reqEmail: string;
  reqEmailPlaceholder: string;
  reqDesiredDate: string;
  reqMessage: string;
  reqMessagePlaceholder: string;
  reqCdpConsent: string;
  reqSubmitButton: string;
  reqSubmitting: string;
  reqErrName: string;
  reqErrPhone: string;
  reqErrConsent: string;

  // Confirmation View
  confirmSuccessTitle: string;
  confirmSuccessSubtitle: string;
  confirmDossierRef: string;
  confirmProperty: string;
  confirmNeighborhood: string;
  confirmCandidate: string;
  confirmContactPhone: string;
  confirmExploreMoreBtn: string;

  // Tenant In-App Direct Login
  tenantModalTitle: string;
  tenantModalSubtitle: string;
  tenantTabProfile: string;
  tenantTabRequests: string;
  tenantDirectNotice: string;
  tenantNameLabel: string;
  tenantPhoneLabel: string;
  tenantEmailLabel: string;
  tenantLoginDirectBtn: string;
  tenantLoginGoogleBtn: string;
  tenantOrSeparator: string;
  tenantConnectedAs: string;
  tenantActiveSession: string;
  tenantLogoutBtn: string;
  tenantMyRequestsTitle: string;
  tenantNoRequests: string;
  tenantFindListingCTA: string;
  tenantPendingStatus: string;
  tenantContactedStatus: string;
  tenantScheduledStatus: string;
  tenantCompletedStatus: string;
  tenantCancelledStatus: string;

  // Pro Portals (Direct Links)
  proPortalsMenu: string;
  proPortalsDirectTitle: string;
  proAgencyTitle: string;
  proAgencyPath: string;
  proAdminTitle: string;
  proAdminPath: string;
  proCopyTooltip: string;
  proAgencyBadge: string;
  proAdminBadge: string;

  // Agency Dashboard
  agencyDashboardTitle: string;
  agencyWelcome: string;
  agencyPublishBtn: string;
  agencyStatsListings: string;
  agencyStatsViews: string;
  agencyStatsRequests: string;
  agencyMyListings: string;
  agencyConfirmAvailability: string;

  // Admin Dashboard
  adminDashboardTitle: string;
  adminSupervision: string;
  adminTabRequests: string;
  adminTabAgencies: string;
  adminTabListings: string;
  adminTabNeighborhoods: string;
  adminTabAiSentinel: string;
  adminHealthOptimal: string;

  // Footer & Legal
  footerAbout: string;
  footerCdpLaw: string;
  footerDirectLinksTitle: string;
  footerNeighborhoodsTitle: string;
  footerLegalTitle: string;
  footerMentions: string;
  footerCGU: string;
  footerPrivacy: string;
  footerRights: string;
  footerDisclaimer: string;

  // Mobile Navigation & UX
  mobileNavHome: string;
  mobileNavExplore: string;
  mobileNavAgency: string;
  mobileNavAdmin: string;
  mobileNavAccount: string;
  mobileFiltersBtn: string;
  mobileFiltersTitle: string;
  mobileApplyFilters: string;
  mobileMenu: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  fr: {
    brandName: 'imovex',
    brandTagline: 'Location Immobilière à Dakar',
    dakarSenegal: 'Dakar · Sénégal',
    themeWhite: 'Blanc',
    themeBlack: 'Noir',
    themeToggle: 'Changer le thème',
    languageSelect: 'Langue',
    close: 'Fermer',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    save: 'Enregistrer',
    delete: 'Supprimer',
    edit: 'Modifier',
    actions: 'Actions',
    status: 'Statut',
    date: 'Date',
    reference: 'Référence',
    loading: 'Chargement en cours...',
    copySuccess: 'Copié dans le presse-papier !',
    directLinkCopied: 'Lien direct copié !',

    navHome: 'Accueil',
    navExplore: 'Explorer les locations',
    navProPortals: 'Portails Pro',
    navBackToPublic: 'Retour au catalogue public',
    navPublishListing: 'Publier un bien',
    navFindRental: 'Trouver un logement',
    navAgencyPortal: 'Espace Agences',
    navAdminPortal: 'Administration',
    navTenantLogin: 'Connexion Locataire',
    navTenantAccount: 'Mon Compte',
    navCopyDirectLink: 'Copier le lien direct',

    heroCertifiedBadge: 'Locations immobilières certifiées à Dakar',
    heroTitle: 'Trouvez votre prochain appartement ou villa à Dakar',
    heroSubtitle: 'Des agences partenaires vérifiées, des annonces disponibles en temps réel et un accompagnement fluide jusqu\'à la signature de votre bail.',
    heroNeighborhoodLabel: 'Quartier de Dakar',
    heroAllNeighborhoods: 'Tous les quartiers',
    heroPropertyTypeLabel: 'Type de bien',
    heroAllTypes: 'Tous types',
    heroBudgetLabel: 'Budget Max (FCFA)',
    heroNoLimit: 'Sans limite',
    heroSearchButton: 'Chercher',
    heroPopularNeighborhoods: 'Quartiers prisés :',
    heroPropertiesAvailable: 'biens disponibles',
    heroOnDemand: 'Biens sur demande',

    typeApartment: 'Appartement',
    typeVilla: 'Villa',
    typeStudio: 'Studio',
    typeHouse: 'Maison',
    typeRoom: 'Chambre',

    cardPerMonth: '/mois',
    cardBedrooms: 'ch.',
    cardBathrooms: 'sdb.',
    cardFurnished: 'Meublé',
    cardChargesIncluded: 'Charges comprises',
    cardRented: 'Déjà loué',
    cardReserved: 'Réservé',
    cardAvailable: 'Disponible',
    cardCertifiedAgency: 'Agence certifiée',
    cardMonthlyRent: 'Loyer mensuel',
    cardPhotos: 'photos',
    cardViewDetails: 'Voir les détails',

    searchTitle: 'Toutes les offres disponibles à Dakar',
    searchResultsCount: 'biens trouvés',
    searchFilterNeighborhood: 'Quartier',
    searchFilterType: 'Type',
    searchFilterMinRent: 'Loyer Min',
    searchFilterMaxRent: 'Budget Max',
    searchFilterBedrooms: 'Chambres min.',
    searchFilterFurnished: 'Mobilier',
    searchFilterAll: 'Tous',
    searchFilterYes: 'Meublé uniquement',
    searchFilterNo: 'Non meublé',
    searchSortBy: 'Trier par',
    searchSortRecent: 'Plus récentes',
    searchSortPriceAsc: 'Prix croissant',
    searchSortPriceDesc: 'Prix décroissant',
    searchResetFilters: 'Réinitialiser les filtres',
    searchNoResults: 'Aucun logement ne correspond à vos critères.',
    searchNoResultsTip: 'Essayez d\'élargir vos critères ou de supprimer certains filtres.',
    searchSearchQuery: 'Recherche libre',
    searchSearchPlaceholder: 'Ex: Almadies vue mer, piscine, terrasse...',

    detailBackToList: 'Toutes les annonces',
    detailShare: 'Partager cette annonce',
    shareWhatsApp: 'Partager sur WhatsApp',
    shareWhatsAppTooltip: 'Partager cette annonce sur WhatsApp',
    detailMonthlyRent: 'Loyer mensuel',
    detailDepositAdvance: 'Caution & avance',
    detailTotalMoveIn: 'Frais d\'entrée estimés',
    detailKeySpecs: 'Caractéristiques principales',
    detailSurface: 'Surface habitable',
    detailDescription: 'Description du bien',
    detailAmenities: 'Équipements & Commodités',
    detailAmenityAC: 'Climatisation',
    detailAmenityWater: 'Réserve d\'eau / Surpresseur',
    detailAmenityGenerator: 'Groupe électrogène',
    detailAmenityParking: 'Place de parking',
    detailAmenityGuard: 'Gardiennage 24h/24',
    detailAmenityWifi: 'Fibre Internet / Wi-Fi',
    detailAmenityBalcony: 'Balcon / Terrasse',
    detailRequestVisitBtn: 'Planifier une visite',
    detailAvailableNow: 'Bien disponible immédiatement',
    detailPartnerAgency: 'Géré par une agence partenaire vérifiée',
    detailPrivacyProtected: 'Protection des données garantie',
    detailPrivacyProtectedDesc: 'Vos coordonnées sont transmises en toute sécurité uniquement au gestionnaire de ce bien conformément aux normes CDP.',

    reqModalTitle: 'Planifier une visite',
    reqModalSubtitle: 'Remplissez le formulaire en 30 secondes. L\'agence partenaire vous contactera directement pour convenir du créneau.',
    reqFullName: 'Nom complet',
    reqFullNamePlaceholder: 'Ex: Amadou Diallo',
    reqPhone: 'Téléphone (WhatsApp)',
    reqPhonePlaceholder: '+221 77 000 00 00',
    reqEmail: 'Adresse e-mail (facultatif)',
    reqEmailPlaceholder: 'votre.email@exemple.com',
    reqDesiredDate: 'Date de visite souhaitée',
    reqMessage: 'Précisions complémentaires (facultatif)',
    reqMessagePlaceholder: 'Ex: Disponible de préférence en fin d\'après-midi...',
    reqCdpConsent: 'J\'accepte que mes coordonnées soient transmises à l\'agence gestionnaire pour organiser la visite (Loi CDP n° 2008-12).',
    reqSubmitButton: 'Confirmer ma demande de visite',
    reqSubmitting: 'Envoi en cours...',
    reqErrName: 'Veuillez renseigner votre nom complet.',
    reqErrPhone: 'Veuillez renseigner un numéro de téléphone valide avec indicatif.',
    reqErrConsent: 'Veuillez accepter les conditions de transmission des coordonnées.',

    confirmSuccessTitle: 'Votre demande a bien été transmise',
    confirmSuccessSubtitle: 'Vous serez recontacté très vite par téléphone ou WhatsApp par le gestionnaire de visite pour organiser votre rendez-vous.',
    confirmDossierRef: 'Référence du dossier',
    confirmProperty: 'Logement :',
    confirmNeighborhood: 'Quartier :',
    confirmCandidate: 'Candidat :',
    confirmContactPhone: 'Téléphone de contact :',
    confirmExploreMoreBtn: 'Découvrir d\'autres logements à Dakar',

    tenantModalTitle: 'Connexion Directe Locataire',
    tenantModalSubtitle: 'Accédez instantanément à votre espace personnel sans redirection externe ni lien tiers.',
    tenantTabProfile: 'Mes Informations',
    tenantTabRequests: 'Mes Demandes de Visite',
    tenantDirectNotice: 'Connexion sécurisée directe dans l\'application pour gérer vos demandes de visite et vos favoris.',
    tenantNameLabel: 'Nom et Prénom',
    tenantPhoneLabel: 'Numéro de téléphone / WhatsApp',
    tenantEmailLabel: 'E-mail (facultatif)',
    tenantLoginDirectBtn: 'Se connecter directement',
    tenantLoginGoogleBtn: 'Continuer sans mot de passe',
    tenantOrSeparator: 'ou',
    tenantConnectedAs: 'Connecté en tant que',
    tenantActiveSession: 'Session active',
    tenantLogoutBtn: 'Se déconnecter',
    tenantMyRequestsTitle: 'Historique de mes demandes',
    tenantNoRequests: 'Vous n\'avez pas encore envoyé de demande de visite.',
    tenantFindListingCTA: 'Rechercher un logement maintenant',
    tenantPendingStatus: 'En attente de prise en charge',
    tenantContactedStatus: 'Contacté par l\'agence',
    tenantScheduledStatus: 'Visite programmée',
    tenantCompletedStatus: 'Visite effectuée',
    tenantCancelledStatus: 'Annulée',

    proPortalsMenu: 'Portails Pro',
    proPortalsDirectTitle: 'Accès directs par lien',
    proAgencyTitle: 'Espace Agences Partenaires',
    proAgencyPath: '/espace-agence',
    proAdminTitle: 'Administration imovex',
    proAdminPath: '/admin',
    proCopyTooltip: 'Copier le lien direct',
    proAgencyBadge: 'Portail Agences Partenaires',
    proAdminBadge: 'Portail Administrateur',

    agencyDashboardTitle: 'Espace Agences Partenaires',
    agencyWelcome: 'Bienvenue sur votre espace de gestion locative',
    agencyPublishBtn: 'Publier un bien',
    agencyStatsListings: 'Biens en gestion',
    agencyStatsViews: 'Vues cumulées',
    agencyStatsRequests: 'Demandes de visite',
    agencyMyListings: 'Mes annonces',
    agencyConfirmAvailability: 'Confirmer la disponibilité',

    adminDashboardTitle: 'Supervision & Administration',
    adminSupervision: 'Contrôle global de la plateforme imovex',
    adminTabRequests: 'Demandes de visite',
    adminTabAgencies: 'Agences partenaires',
    adminTabListings: 'Toutes les annonces',
    adminTabNeighborhoods: 'Quartiers de Dakar',
    adminTabAiSentinel: 'Supervision & Sécurité',
    adminHealthOptimal: 'Système Opérationnel · Haute Disponibilité',

    footerAbout: 'La plateforme de référence pour la location immobilière au Sénégal (Dakar). Nous mettons en relation des locataires sérieux et des agences certifiées, dans la transparence et le respect des normes CDP.',
    footerCdpLaw: 'Conformité Loi sénégalaise n° 2008-12',
    footerDirectLinksTitle: 'Accès Directs par Lien',
    footerNeighborhoodsTitle: 'Quartiers à Dakar',
    footerLegalTitle: 'Informations & Conformité',
    footerMentions: 'Mentions Légales',
    footerCGU: 'Conditions Générales (CGU)',
    footerPrivacy: 'Politique de Confidentialité (CDP)',
    footerRights: 'Tous droits réservés. Dakar, Sénégal.',
    footerDisclaimer: 'Flux de demandes sécurisé : aucune coordonnée d\'agence n\'est divulguée publiquement.',

    // Mobile Navigation & UX
    mobileNavHome: 'Accueil',
    mobileNavExplore: 'Rechercher',
    mobileNavAgency: 'Agence',
    mobileNavAdmin: 'Admin',
    mobileNavAccount: 'Compte',
    mobileFiltersBtn: 'Filtres',
    mobileFiltersTitle: 'Filtrer les annonces',
    mobileApplyFilters: 'Afficher les logements',
    mobileMenu: 'Menu',
  },

  en: {
    brandName: 'imovex',
    brandTagline: 'Real Estate Rentals in Dakar',
    dakarSenegal: 'Dakar · Senegal',
    themeWhite: 'White',
    themeBlack: 'Black',
    themeToggle: 'Toggle theme',
    languageSelect: 'Language',
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    actions: 'Actions',
    status: 'Status',
    date: 'Date',
    reference: 'Reference',
    loading: 'Loading...',
    copySuccess: 'Copied to clipboard!',
    directLinkCopied: 'Direct link copied!',

    navHome: 'Home',
    navExplore: 'Explore Rentals',
    navProPortals: 'Pro Portals',
    navBackToPublic: 'Back to public catalog',
    navPublishListing: 'Post a Property',
    navFindRental: 'Find a Home',
    navAgencyPortal: 'Agency Portal',
    navAdminPortal: 'Admin Portal',
    navTenantLogin: 'Tenant Login',
    navTenantAccount: 'My Account',
    navCopyDirectLink: 'Copy direct link',

    heroCertifiedBadge: 'Certified property rentals in Dakar',
    heroTitle: 'Find your next apartment or villa in Dakar',
    heroSubtitle: 'Verified partner agencies, real-time availability and smooth support right through to your lease signing.',
    heroNeighborhoodLabel: 'Dakar Neighborhood',
    heroAllNeighborhoods: 'All neighborhoods',
    heroPropertyTypeLabel: 'Property Type',
    heroAllTypes: 'All types',
    heroBudgetLabel: 'Max Budget (FCFA)',
    heroNoLimit: 'No limit',
    heroSearchButton: 'Search',
    heroPopularNeighborhoods: 'Popular areas:',
    heroPropertiesAvailable: 'properties available',
    heroOnDemand: 'Properties on demand',

    typeApartment: 'Apartment',
    typeVilla: 'Villa',
    typeStudio: 'Studio',
    typeHouse: 'House',
    typeRoom: 'Room',

    cardPerMonth: '/mo',
    cardBedrooms: 'bd.',
    cardBathrooms: 'ba.',
    cardFurnished: 'Furnished',
    cardChargesIncluded: 'Charges included',
    cardRented: 'Already rented',
    cardReserved: 'Reserved',
    cardAvailable: 'Available',
    cardCertifiedAgency: 'Certified agency',
    cardMonthlyRent: 'Monthly rent',
    cardPhotos: 'photos',
    cardViewDetails: 'View details',

    searchTitle: 'All available rentals in Dakar',
    searchResultsCount: 'properties found',
    searchFilterNeighborhood: 'Neighborhood',
    searchFilterType: 'Type',
    searchFilterMinRent: 'Min Rent',
    searchFilterMaxRent: 'Max Budget',
    searchFilterBedrooms: 'Min Bedrooms',
    searchFilterFurnished: 'Furnishing',
    searchFilterAll: 'All',
    searchFilterYes: 'Furnished only',
    searchFilterNo: 'Unfurnished',
    searchSortBy: 'Sort by',
    searchSortRecent: 'Newest',
    searchSortPriceAsc: 'Price: Low to High',
    searchSortPriceDesc: 'Price: High to Low',
    searchResetFilters: 'Reset filters',
    searchNoResults: 'No properties match your search criteria.',
    searchNoResultsTip: 'Try broadening your criteria or clearing some filters.',
    searchSearchQuery: 'Keyword search',
    searchSearchPlaceholder: 'Ex: Almadies sea view, pool, terrace...',

    detailBackToList: 'All listings',
    detailShare: 'Share this property',
    shareWhatsApp: 'Share on WhatsApp',
    shareWhatsAppTooltip: 'Share this listing on WhatsApp',
    detailMonthlyRent: 'Monthly rent',
    detailDepositAdvance: 'Deposit & advance',
    detailTotalMoveIn: 'Estimated move-in cost',
    detailKeySpecs: 'Key Features',
    detailSurface: 'Floor area',
    detailDescription: 'Property Description',
    detailAmenities: 'Amenities & Facilities',
    detailAmenityAC: 'Air Conditioning',
    detailAmenityWater: 'Water Reserve / Booster',
    detailAmenityGenerator: 'Power Generator',
    detailAmenityParking: 'Dedicated Parking',
    detailAmenityGuard: '24/7 Security Guard',
    detailAmenityWifi: 'High-speed Fiber / Wi-Fi',
    detailAmenityBalcony: 'Balcony / Terrace',
    detailRequestVisitBtn: 'Schedule a Visit',
    detailAvailableNow: 'Available for immediate move-in',
    detailPartnerAgency: 'Managed by a verified partner agency',
    detailPrivacyProtected: 'Guaranteed Data Protection',
    detailPrivacyProtectedDesc: 'Your contact details are securely transmitted solely to the property manager in compliance with CDP regulations.',

    reqModalTitle: 'Schedule a Visit',
    reqModalSubtitle: 'Fill out the form in 30 seconds. The partner agency will contact you directly to confirm a time.',
    reqFullName: 'Full Name',
    reqFullNamePlaceholder: 'Ex: Amadou Diallo',
    reqPhone: 'Phone (WhatsApp)',
    reqPhonePlaceholder: '+221 77 000 00 00',
    reqEmail: 'Email address (optional)',
    reqEmailPlaceholder: 'your.email@example.com',
    reqDesiredDate: 'Preferred Visit Date',
    reqMessage: 'Additional details (optional)',
    reqMessagePlaceholder: 'Ex: Available preferably in late afternoons...',
    reqCdpConsent: 'I consent to my details being sent to the managing agency to arrange the visit (Senegalese CDP Law n° 2008-12).',
    reqSubmitButton: 'Submit Visit Request',
    reqSubmitting: 'Submitting...',
    reqErrName: 'Please enter your full name.',
    reqErrPhone: 'Please provide a valid phone number with country code.',
    reqErrConsent: 'Please accept the data processing terms.',

    confirmSuccessTitle: 'Your request has been submitted',
    confirmSuccessSubtitle: 'The visit coordinator will reach out to you shortly via phone or WhatsApp to schedule your appointment.',
    confirmDossierRef: 'File Reference',
    confirmProperty: 'Property:',
    confirmNeighborhood: 'Area:',
    confirmCandidate: 'Applicant:',
    confirmContactPhone: 'Contact phone:',
    confirmExploreMoreBtn: 'Explore more properties in Dakar',

    tenantModalTitle: 'Direct Tenant Login',
    tenantModalSubtitle: 'Instantly access your personal space without external redirects or third-party links.',
    tenantTabProfile: 'My Profile',
    tenantTabRequests: 'My Visit Requests',
    tenantDirectNotice: 'Secure in-app login to manage your visit appointments and favorite properties directly.',
    tenantNameLabel: 'Full Name',
    tenantPhoneLabel: 'Phone number / WhatsApp',
    tenantEmailLabel: 'Email (optional)',
    tenantLoginDirectBtn: 'Sign In Directly',
    tenantLoginGoogleBtn: 'Continue without password',
    tenantOrSeparator: 'or',
    tenantConnectedAs: 'Signed in as',
    tenantActiveSession: 'Active session',
    tenantLogoutBtn: 'Log out',
    tenantMyRequestsTitle: 'My Request History',
    tenantNoRequests: 'You haven\'t sent any visit requests yet.',
    tenantFindListingCTA: 'Browse available rentals now',
    tenantPendingStatus: 'Pending review',
    tenantContactedStatus: 'Contacted by agency',
    tenantScheduledStatus: 'Visit scheduled',
    tenantCompletedStatus: 'Visit completed',
    tenantCancelledStatus: 'Cancelled',

    proPortalsMenu: 'Pro Portals',
    proPortalsDirectTitle: 'Direct link access',
    proAgencyTitle: 'Partner Agency Portal',
    proAgencyPath: '/espace-agence',
    proAdminTitle: 'imovex Administration',
    proAdminPath: '/admin',
    proCopyTooltip: 'Copy direct link',
    proAgencyBadge: 'Partner Agency Portal',
    proAdminBadge: 'Administrator Portal',

    agencyDashboardTitle: 'Partner Agency Portal',
    agencyWelcome: 'Welcome to your rental management hub',
    agencyPublishBtn: 'Post a Property',
    agencyStatsListings: 'Managed Properties',
    agencyStatsViews: 'Total Views',
    agencyStatsRequests: 'Visit Requests',
    agencyMyListings: 'My Listings',
    agencyConfirmAvailability: 'Confirm Availability',

    adminDashboardTitle: 'Supervision & Administration',
    adminSupervision: 'Global control center of the imovex platform',
    adminTabRequests: 'Visit Requests',
    adminTabAgencies: 'Partner Agencies',
    adminTabListings: 'All Properties',
    adminTabNeighborhoods: 'Dakar Areas',
    adminTabAiSentinel: 'Supervision & Security',
    adminHealthOptimal: 'System Operational · High Availability',

    footerAbout: 'The premier real estate rental platform in Senegal (Dakar). We connect serious tenants with certified agencies with full transparency and CDP compliance.',
    footerCdpLaw: 'Compliant with Senegalese Law n° 2008-12',
    footerDirectLinksTitle: 'Direct Link Access',
    footerNeighborhoodsTitle: 'Dakar Areas',
    footerLegalTitle: 'Legal & Compliance',
    footerMentions: 'Legal Notice',
    footerCGU: 'Terms of Service',
    footerPrivacy: 'Privacy Policy (CDP)',
    footerRights: 'All rights reserved. Dakar, Senegal.',
    footerDisclaimer: 'Secure inquiry workflow: no agency contact details are publicly disclosed.',

    // Mobile Navigation & UX
    mobileNavHome: 'Home',
    mobileNavExplore: 'Search',
    mobileNavAgency: 'Agency',
    mobileNavAdmin: 'Admin',
    mobileNavAccount: 'Account',
    mobileFiltersBtn: 'Filters',
    mobileFiltersTitle: 'Filter properties',
    mobileApplyFilters: 'Show properties',
    mobileMenu: 'Menu',
  },

  ar: {
    brandName: 'imovex',
    brandTagline: 'عقارات للإيجار في دكار',
    dakarSenegal: 'دكار · السنغال',
    themeWhite: 'أبيض',
    themeBlack: 'أسود',
    themeToggle: 'تغيير المظهر',
    languageSelect: 'اللغة',
    close: 'إغلاق',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    save: 'حفظ',
    delete: 'حذف',
    edit: 'تعديل',
    actions: 'الإجراءات',
    status: 'الحالة',
    date: 'التاريخ',
    reference: 'المرجع',
    loading: 'جار التحميل...',
    copySuccess: 'تم النسخ إلى الحافظة!',
    directLinkCopied: 'تم نسخ الرابط المباشر!',

    navHome: 'الرئيسية',
    navExplore: 'استكشف الإيجارات',
    navProPortals: 'بوابات المهنيين',
    navBackToPublic: 'العودة للدليل العام',
    navPublishListing: 'نشر عقار',
    navFindRental: 'ابحث عن سكن',
    navAgencyPortal: 'بوابة الوكالات',
    navAdminPortal: 'لوحة الإدارة',
    navTenantLogin: 'دخول المستأجر',
    navTenantAccount: 'حسابي',
    navCopyDirectLink: 'نسخ الرابط المباشر',

    heroCertifiedBadge: 'عقارات موثقة للإيجار في دكار',
    heroTitle: 'اعثر على شقتك أو فيلتك القادمة في دكار',
    heroSubtitle: 'وكالات شريكة معتمدة، إعلانات متاحة في الوقت الفعلي، ومرافقة شاملة حتى توقيع عقد الإيجار.',
    heroNeighborhoodLabel: 'حي دكار',
    heroAllNeighborhoods: 'جميع الأحياء',
    heroPropertyTypeLabel: 'نوع العقار',
    heroAllTypes: 'جميع الأنواع',
    heroBudgetLabel: 'الميزانية القصوى (فرنك)',
    heroNoLimit: 'بدون حد',
    heroSearchButton: 'بحث',
    heroPopularNeighborhoods: 'الأحياء الأكثر طلباً:',
    heroPropertiesAvailable: 'عقارات متاحة',
    heroOnDemand: 'عقارات عند الطلب',

    typeApartment: 'شقة',
    typeVilla: 'فيلا',
    typeStudio: 'استوديو',
    typeHouse: 'منزل',
    typeRoom: 'غرفة',

    cardPerMonth: '/شهرياً',
    cardBedrooms: 'غرف',
    cardBathrooms: 'حمامات',
    cardFurnished: 'مفروش',
    cardChargesIncluded: 'شامل الخدمات',
    cardRented: 'تم التأجير',
    cardReserved: 'محجوز',
    cardAvailable: 'متاح',
    cardCertifiedAgency: 'وكالة معتمدة',
    cardMonthlyRent: 'الإيجار الشهري',
    cardPhotos: 'صور',
    cardViewDetails: 'عرض التفاصيل',

    searchTitle: 'جميع العروض المتاحة في دكار',
    searchResultsCount: 'عقارات متطابقة',
    searchFilterNeighborhood: 'الحي',
    searchFilterType: 'النوع',
    searchFilterMinRent: 'الحد الأدنى للإيجار',
    searchFilterMaxRent: 'الميزانية القصوى',
    searchFilterBedrooms: 'عدد الغرف الأدنى',
    searchFilterFurnished: 'الأثاث',
    searchFilterAll: 'الكل',
    searchFilterYes: 'مفروش فقط',
    searchFilterNo: 'غير مفروش',
    searchSortBy: 'ترتيب حسب',
    searchSortRecent: 'الأحدث أولاً',
    searchSortPriceAsc: 'السعر: من الأقل للأعلى',
    searchSortPriceDesc: 'السعر: من الأعلى للأقل',
    searchResetFilters: 'إعادة ضبط الفلاتر',
    searchNoResults: 'لم يتم العثور على عقارات تطابق معاييرك.',
    searchNoResultsTip: 'يرجى توسيع خيارات البحث أو تقليل الفلاتر المحددة.',
    searchSearchQuery: 'بحث نصي',
    searchSearchPlaceholder: 'مثال: الماديز إطلالة بحر، مسبح، شرفة...',

    detailBackToList: 'جميع الإعلانات',
    detailShare: 'مشاركة العقار',
    shareWhatsApp: 'مشاركة عبر واتساب',
    shareWhatsAppTooltip: 'مشاركة هذا الإعلان عبر واتساب',
    detailMonthlyRent: 'الإيجار الشهري',
    detailDepositAdvance: 'التأمين والمقدم',
    detailTotalMoveIn: 'تكلفة الدخول التقديرية',
    detailKeySpecs: 'المواصفات الرئيسية',
    detailSurface: 'المساحة',
    detailDescription: 'وصف العقار',
    detailAmenities: 'المزايا والمرافق',
    detailAmenityAC: 'تكييف هواء',
    detailAmenityWater: 'خزان ماء ومضخة',
    detailAmenityGenerator: 'مولد كهرباء',
    detailAmenityParking: 'موقف سيارات خاص',
    detailAmenityGuard: 'حراسة وأمن 24/7',
    detailAmenityWifi: 'إنترنت فايبر / واي فاي',
    detailAmenityBalcony: 'شرفة / تراس',
    detailRequestVisitBtn: 'طلب حجز موعد زيارة',
    detailAvailableNow: 'جاهز للسكن الفوري',
    detailPartnerAgency: 'يُدار بواسطة وكالة شريكة معتمدة',
    detailPrivacyProtected: 'حماية كاملة للبيانات',
    detailPrivacyProtectedDesc: 'تُرسل بياناتك بأمان تام حصراً للجهة المسؤولة عن هذا العقار وفقاً لقوانين حماية البيانات.',

    reqModalTitle: 'طلب زيارة العقار',
    reqModalSubtitle: 'املأ الاستمارة خلال 30 ثانية. ستتواصل معك الوكالة الشريكة مباشرة لتحديد موعد الزيارة.',
    reqFullName: 'الاسم الكامل',
    reqFullNamePlaceholder: 'مثال: أمادو ديالو',
    reqPhone: 'رقم الهاتف (واتساب)',
    reqPhonePlaceholder: '+221 77 000 00 00',
    reqEmail: 'البريد الإلكتروني (اختياري)',
    reqEmailPlaceholder: 'your.email@example.com',
    reqDesiredDate: 'تاريخ الزيارة المفضل',
    reqMessage: 'ملاحظات إضافية (اختياري)',
    reqMessagePlaceholder: 'مثال: أفضل الزيارة في أواخر فترة ما بعد الظهر...',
    reqCdpConsent: 'أوافق على نقل معلومات الاتصال الخاصة بي للوكالة المعنية لتنظيم الزيارة (قانون حماية البيانات السنغالي 2008-12).',
    reqSubmitButton: 'تأكيد طلب الزيارة',
    reqSubmitting: 'جار الإرسال...',
    reqErrName: 'يرجى إدخال اسمك الكامل.',
    reqErrPhone: 'يرجى إدخال رقم هاتف صحيح مع الرمز الدولي.',
    reqErrConsent: 'يرجى الموافقة على شروط نقل البيانات.',

    confirmSuccessTitle: 'تم إرسال طلبك بنجاح',
    confirmSuccessSubtitle: 'سيتواصل معك منسق الزيارات قريباً عبر الهاتف أو الواتساب لتحديد الموعد بدقة.',
    confirmDossierRef: 'رقم الملف المرجعي',
    confirmProperty: 'العقار:',
    confirmNeighborhood: 'الحي:',
    confirmCandidate: 'مقدم الطلب:',
    confirmContactPhone: 'رقم الاتصال:',
    confirmExploreMoreBtn: 'استكشاف المزيد من العقارات في دكار',

    tenantModalTitle: 'تسجيل دخول المستأجر المباشر',
    tenantModalSubtitle: 'ادخل مباشرة لمساحتك الشخصية داخل التطبيق دون أي روابط خارجية أو إعادة توجيه.',
    tenantTabProfile: 'بياناتي',
    tenantTabRequests: 'طلبات الزيارة الخاصة بي',
    tenantDirectNotice: 'تسجيل دخول مباشر وآمن لمتابعة طلبات الزيارات والعقارات المفضلة.',
    tenantNameLabel: 'الاسم الكامل',
    tenantPhoneLabel: 'رقم الهاتف / واتساب',
    tenantEmailLabel: 'البريد الإلكتروني (اختياري)',
    tenantLoginDirectBtn: 'تسجيل الدخول المباشر',
    tenantLoginGoogleBtn: 'المتابعة المباشرة بدون كلمة مرور',
    tenantOrSeparator: 'أو',
    tenantConnectedAs: 'متصل كـ',
    tenantActiveSession: 'الجلسة نشطة',
    tenantLogoutBtn: 'تسجيل الخروج',
    tenantMyRequestsTitle: 'سجل طلباتي',
    tenantNoRequests: 'لم تقم بإرسال أي طلب زيارة حتى الآن.',
    tenantFindListingCTA: 'ابحث عن مسكن متاح الآن',
    tenantPendingStatus: 'قيد المراجعة',
    tenantContactedStatus: 'تم الاتصال من الوكالة',
    tenantScheduledStatus: 'تمت جدولة الزيارة',
    tenantCompletedStatus: 'تمت الزيارة بنجاح',
    tenantCancelledStatus: 'ملغى',

    proPortalsMenu: 'بوابات المهنيين',
    proPortalsDirectTitle: 'الوصول المباشر عبر الرابط',
    proAgencyTitle: 'بوابة الوكالات الشريكة',
    proAgencyPath: '/espace-agence',
    proAdminTitle: 'إدارة منصة imovex',
    proAdminPath: '/admin',
    proCopyTooltip: 'نسخ الرابط المباشر',
    proAgencyBadge: 'بوابة الوكالات الشريكة',
    proAdminBadge: 'بوابة الإدارة المركزية',

    agencyDashboardTitle: 'بوابة الوكالات الشريكة',
    agencyWelcome: 'مرحباً بك في مركز إدارة العقارات والإيجارات',
    agencyPublishBtn: 'نشر عقار جديد',
    agencyStatsListings: 'عقارات تحت الإدارة',
    agencyStatsViews: 'إجمالي المشاهدات',
    agencyStatsRequests: 'طلبات الزيارة',
    agencyMyListings: 'إعلاناتي',
    agencyConfirmAvailability: 'تأكيد التوفر',

    adminDashboardTitle: 'الإشراف والإدارة المركزية',
    adminSupervision: 'لوحة التحكم والرقابة الشاملة لمنصة imovex',
    adminTabRequests: 'طلبات الزيارة',
    adminTabAgencies: 'الوكالات الشريكة',
    adminTabListings: 'كافة العقارات',
    adminTabNeighborhoods: 'أحياء دكار',
    adminTabAiSentinel: 'الإشراف والأمان',
    adminHealthOptimal: 'النظام يعمل بكفاءة قصوى · توفر مستمر',

    footerAbout: 'المنصة الرائدة للإيجار العقاري في السنغال (دكار). نربط المستأجرين الجادين بالوكالات المعتمدة بشفافية وامتثال تام للمعايير القانونية.',
    footerCdpLaw: 'متوافق مع القانون السنغالي رقم 2008-12',
    footerDirectLinksTitle: 'روابط الوصول المباشر',
    footerNeighborhoodsTitle: 'أحياء دكار',
    footerLegalTitle: 'القانون والمعلومات',
    footerMentions: 'الإشعارات القانونية',
    footerCGU: 'الشروط العامة للاستخدام',
    footerPrivacy: 'سياسة الخصوصية وحماية البيانات',
    footerRights: 'جميع الحقوق محفوظة. دكار، السنغال.',
    footerDisclaimer: 'نظام طلبات آمن: لا يتم نشر أي أرقام هواتف خاصة بالوكالات للعامة.',

    // Mobile Navigation & UX
    mobileNavHome: 'الرئيسية',
    mobileNavExplore: 'بحث',
    mobileNavAgency: 'الوكالة',
    mobileNavAdmin: 'الإدارة',
    mobileNavAccount: 'الحساب',
    mobileFiltersBtn: 'تصفية',
    mobileFiltersTitle: 'تصفية العقارات',
    mobileApplyFilters: 'عرض العقارات',
    mobileMenu: 'القائمة',
  },

  es: {
    brandName: 'imovex',
    brandTagline: 'Alquiler Inmobiliario en Dakar',
    dakarSenegal: 'Dakar · Senegal',
    themeWhite: 'Blanco',
    themeBlack: 'Negro',
    themeToggle: 'Cambiar tema',
    languageSelect: 'Idioma',
    close: 'Cerrar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    actions: 'Acciones',
    status: 'Estado',
    date: 'Fecha',
    reference: 'Referencia',
    loading: 'Cargando...',
    copySuccess: '¡Copiado al portapapeles!',
    directLinkCopied: '¡Enlace directo copiado!',

    navHome: 'Inicio',
    navExplore: 'Explorar alquileres',
    navProPortals: 'Portales Pro',
    navBackToPublic: 'Volver al catálogo público',
    navPublishListing: 'Publicar inmueble',
    navFindRental: 'Buscar vivienda',
    navAgencyPortal: 'Portal de Agencias',
    navAdminPortal: 'Administración',
    navTenantLogin: 'Acceso Inquilino',
    navTenantAccount: 'Mi Cuenta',
    navCopyDirectLink: 'Copiar enlace directo',

    heroCertifiedBadge: 'Alquileres inmobiliarios certificados en Dakar',
    heroTitle: 'Encuentre su próximo apartamento o chalet en Dakar',
    heroSubtitle: 'Agencias asociadas verificadas, inmuebles disponibles en tiempo real y acompañamiento fluido hasta la firma de su contrato.',
    heroNeighborhoodLabel: 'Barrio de Dakar',
    heroAllNeighborhoods: 'Todos los barrios',
    heroPropertyTypeLabel: 'Tipo de inmueble',
    heroAllTypes: 'Todos los tipos',
    heroBudgetLabel: 'Presupuesto Máx (FCFA)',
    heroNoLimit: 'Sin límite',
    heroSearchButton: 'Buscar',
    heroPopularNeighborhoods: 'Barrios más buscados:',
    heroPropertiesAvailable: 'inmuebles disponibles',
    heroOnDemand: 'Inmuebles bajo demanda',

    typeApartment: 'Apartamento',
    typeVilla: 'Chalet / Villa',
    typeStudio: 'Estudio',
    typeHouse: 'Casa',
    typeRoom: 'Habitación',

    cardPerMonth: '/mes',
    cardBedrooms: 'hab.',
    cardBathrooms: 'bañ.',
    cardFurnished: 'Amueblado',
    cardChargesIncluded: 'Gastos incluidos',
    cardRented: 'Ya alquilado',
    cardReserved: 'Reservado',
    cardAvailable: 'Disponible',
    cardCertifiedAgency: 'Agencia certificada',
    cardMonthlyRent: 'Alquiler mensual',
    cardPhotos: 'fotos',
    cardViewDetails: 'Ver detalles',

    searchTitle: 'Todas las ofertas disponibles en Dakar',
    searchResultsCount: 'inmuebles encontrados',
    searchFilterNeighborhood: 'Barrio',
    searchFilterType: 'Tipo',
    searchFilterMinRent: 'Alquiler Mín.',
    searchFilterMaxRent: 'Presupuesto Máx.',
    searchFilterBedrooms: 'Habitaciones mín.',
    searchFilterFurnished: 'Mobiliario',
    searchFilterAll: 'Todos',
    searchFilterYes: 'Solo amueblado',
    searchFilterNo: 'Sin amueblar',
    searchSortBy: 'Ordenar por',
    searchSortRecent: 'Más recientes',
    searchSortPriceAsc: 'Precio: menor a mayor',
    searchSortPriceDesc: 'Precio: mayor a menor',
    searchResetFilters: 'Restablecer filtros',
    searchNoResults: 'Ningún inmueble coincide con sus criterios de búsqueda.',
    searchNoResultsTip: 'Pruebe ampliando los criterios o eliminando algunos filtros.',
    searchSearchQuery: 'Búsqueda por texto',
    searchSearchPlaceholder: 'Ej: Almadies vista al mar, piscina, terraza...',

    detailBackToList: 'Todas las propiedades',
    detailShare: 'Compartir esta propiedad',
    shareWhatsApp: 'Compartir por WhatsApp',
    shareWhatsAppTooltip: 'Compartir este inmueble por WhatsApp',
    detailMonthlyRent: 'Alquiler mensual',
    detailDepositAdvance: 'Fianza y fianza anticipada',
    detailTotalMoveIn: 'Coste total de entrada estimado',
    detailKeySpecs: 'Características principales',
    detailSurface: 'Superficie habitable',
    detailDescription: 'Descripción de la propiedad',
    detailAmenities: 'Equipamiento y Comodidades',
    detailAmenityAC: 'Aire acondicionado',
    detailAmenityWater: 'Depósito de agua y bomba',
    detailAmenityGenerator: 'Generador eléctrico',
    detailAmenityParking: 'Plaza de aparcamiento',
    detailAmenityGuard: 'Vigilancia 24h/24',
    detailAmenityWifi: 'Fibra / Wi-Fi de alta velocidad',
    detailAmenityBalcony: 'Balcón / Terraza',
    detailRequestVisitBtn: 'Programar una visita',
    detailAvailableNow: 'Disponible de inmediato',
    detailPartnerAgency: 'Gestionado por una agencia asociada verificada',
    detailPrivacyProtected: 'Protección de datos garantizada',
    detailPrivacyProtectedDesc: 'Sus datos se transmiten de forma totalmente segura únicamente al gestor de esta propiedad según la ley CDP.',

    reqModalTitle: 'Programar una visita',
    reqModalSubtitle: 'Complete el formulario en 30 segundos. La agencia asociada se pondrá en contacto con usted directamente.',
    reqFullName: 'Nombre completo',
    reqFullNamePlaceholder: 'Ej: Amadou Diallo',
    reqPhone: 'Teléfono (WhatsApp)',
    reqPhonePlaceholder: '+221 77 000 00 00',
    reqEmail: 'Correo electrónico (opcional)',
    reqEmailPlaceholder: 'su.correo@ejemplo.com',
    reqDesiredDate: 'Fecha deseada de visita',
    reqMessage: 'Detalles adicionales (opcional)',
    reqMessagePlaceholder: 'Ej: Disponible preferentemente por la tarde...',
    reqCdpConsent: 'Acepto que mis datos de contacto sean transmitidos a la agencia para organizar la visita (Ley CDP de Senegal n° 2008-12).',
    reqSubmitButton: 'Confirmar mi solicitud de visita',
    reqSubmitting: 'Enviando solicitud...',
    reqErrName: 'Por favor, introduzca su nombre completo.',
    reqErrPhone: 'Por favor, introduzca un número de teléfono válido con prefijo.',
    reqErrConsent: 'Debe aceptar los términos de tratamiento de datos.',

    confirmSuccessTitle: 'Su solicitud ha sido enviada con éxito',
    confirmSuccessSubtitle: 'El responsable de visitas se comunicará muy pronto por teléfono o WhatsApp para coordinar su cita.',
    confirmDossierRef: 'Referencia del expediente',
    confirmProperty: 'Vivienda:',
    confirmNeighborhood: 'Barrio:',
    confirmCandidate: 'Candidato:',
    confirmContactPhone: 'Teléfono de contacto:',
    confirmExploreMoreBtn: 'Descubrir otras viviendas en Dakar',

    tenantModalTitle: 'Acceso Directo Inquilino',
    tenantModalSubtitle: 'Acceda inmediatamente a su espacio personal sin redirecciones externas ni enlaces de terceros.',
    tenantTabProfile: 'Mis Datos',
    tenantTabRequests: 'Mis Solicitudes de Visita',
    tenantDirectNotice: 'Inicio de sesión directo y seguro en la aplicación para gestionar sus visitas y favoritos.',
    tenantNameLabel: 'Nombre y Apellidos',
    tenantPhoneLabel: 'Número de teléfono / WhatsApp',
    tenantEmailLabel: 'Correo electrónico (opcional)',
    tenantLoginDirectBtn: 'Conectarse directamente',
    tenantLoginGoogleBtn: 'Continuar sin contraseña',
    tenantOrSeparator: 'o',
    tenantConnectedAs: 'Conectado como',
    tenantActiveSession: 'Sesión activa',
    tenantLogoutBtn: 'Cerrar sesión',
    tenantMyRequestsTitle: 'Historial de mis solicitudes',
    tenantNoRequests: 'Aún no ha enviado ninguna solicitud de visita.',
    tenantFindListingCTA: 'Buscar viviendas disponibles ahora',
    tenantPendingStatus: 'Pendiente de gestión',
    tenantContactedStatus: 'Contactado por la agencia',
    tenantScheduledStatus: 'Visita programada',
    tenantCompletedStatus: 'Visita realizada',
    tenantCancelledStatus: 'Cancelada',

    proPortalsMenu: 'Portales Pro',
    proPortalsDirectTitle: 'Accesos directos por enlace',
    proAgencyTitle: 'Portal Agencias Asociadas',
    proAgencyPath: '/espace-agence',
    proAdminTitle: 'Administración imovex',
    proAdminPath: '/admin',
    proCopyTooltip: 'Copiar enlace directo',
    proAgencyBadge: 'Portal Agencias Asociadas',
    proAdminBadge: 'Portal de Administración',

    agencyDashboardTitle: 'Portal Agencias Asociadas',
    agencyWelcome: 'Bienvenido a su centro de gestión de alquileres',
    agencyPublishBtn: 'Publicar un inmueble',
    agencyStatsListings: 'Inmuebles en gestión',
    agencyStatsViews: 'Visitas acumuladas',
    agencyStatsRequests: 'Solicitudes de visita',
    agencyMyListings: 'Mis inmuebles',
    agencyConfirmAvailability: 'Confirmar disponibilidad',

    adminDashboardTitle: 'Supervisión y Administración',
    adminSupervision: 'Centro de control global de la plataforma imovex',
    adminTabRequests: 'Solicitudes de visita',
    adminTabAgencies: 'Agencias asociadas',
    adminTabListings: 'Todos los inmuebles',
    adminTabNeighborhoods: 'Barrios de Dakar',
    adminTabAiSentinel: 'Supervisión y Seguridad',
    adminHealthOptimal: 'Sistema Operativo · Alta Disponibilidad',

    footerAbout: 'La plataforma de referencia para el alquiler inmobiliario en Senegal (Dakar). Conectamos a inquilinos serios con agencias certificadas con total transparencia y cumplimiento de las normativas CDP.',
    footerCdpLaw: 'Conformidad con la Ley senegalesa n° 2008-12',
    footerDirectLinksTitle: 'Accesos Directos por Enlace',
    footerNeighborhoodsTitle: 'Barrios de Dakar',
    footerLegalTitle: 'Información y Cumplimiento',
    footerMentions: 'Aviso Legal',
    footerCGU: 'Condiciones Generales (CGU)',
    footerPrivacy: 'Política de Privacidad (CDP)',
    footerRights: 'Todos los derechos reservados. Dakar, Senegal.',
    footerDisclaimer: 'Gestión segura de solicitudes: ningún dato de contacto de agencia se divulga públicamente.',

    // Mobile Navigation & UX
    mobileNavHome: 'Inicio',
    mobileNavExplore: 'Buscar',
    mobileNavAgency: 'Agencia',
    mobileNavAdmin: 'Admin',
    mobileNavAccount: 'Cuenta',
    mobileFiltersBtn: 'Filtros',
    mobileFiltersTitle: 'Filtrar propiedades',
    mobileApplyFilters: 'Mostrar propiedades',
    mobileMenu: 'Menú',
  },
};
