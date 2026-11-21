import { Agency, Listing, Neighborhood, RentalRequest } from '../../types/database.ts';

export const INITIAL_NEIGHBORHOODS: Neighborhood[] = [
  { id: 'n-1', name: 'Almadies', slug: 'almadies', city: 'Dakar', department: 'Dakar', isPopular: true, isActive: true, displayOrder: 1, createdAt: '2026-01-01' },
  { id: 'n-2', name: 'Ngor', slug: 'ngor', city: 'Dakar', department: 'Dakar', isPopular: true, isActive: true, displayOrder: 2, createdAt: '2026-01-01' },
  { id: 'n-3', name: 'Ouakam', slug: 'ouakam', city: 'Dakar', department: 'Dakar', isPopular: true, isActive: true, displayOrder: 3, createdAt: '2026-01-01' },
  { id: 'n-4', name: 'Mermoz', slug: 'mermoz', city: 'Dakar', department: 'Dakar', isPopular: true, isActive: true, displayOrder: 4, createdAt: '2026-01-01' },
  { id: 'n-5', name: 'Sacré-Cœur (1, 2, 3)', slug: 'sacre-coeur', city: 'Dakar', department: 'Dakar', isPopular: true, isActive: true, displayOrder: 5, createdAt: '2026-01-01' },
  { id: 'n-6', name: 'Fann Résidence / Point E', slug: 'fann-point-e', city: 'Dakar', department: 'Dakar', isPopular: true, isActive: true, displayOrder: 6, createdAt: '2026-01-01' },
  { id: 'n-7', name: 'Plateau (Centre-ville)', slug: 'plateau', city: 'Dakar', department: 'Dakar', isPopular: true, isActive: true, displayOrder: 7, createdAt: '2026-01-01' },
  { id: 'n-8', name: 'Yoff (Virage, Tonghor)', slug: 'yoff', city: 'Dakar', department: 'Dakar', isPopular: true, isActive: true, displayOrder: 8, createdAt: '2026-01-01' },
  { id: 'n-9', name: 'Mamelles', slug: 'mamelles', city: 'Dakar', department: 'Dakar', isPopular: true, isActive: true, displayOrder: 9, createdAt: '2026-01-01' },
  { id: 'n-10', name: 'Grand-Dakar / Sicap', slug: 'grand-dakar', city: 'Dakar', department: 'Dakar', isPopular: false, isActive: true, displayOrder: 10, createdAt: '2026-01-01' },
  { id: 'n-11', name: 'Hann Maristes', slug: 'hann-maristes', city: 'Dakar', department: 'Dakar', isPopular: true, isActive: true, displayOrder: 11, createdAt: '2026-01-01' },
  { id: 'n-12', name: 'Liberté (1 à 6)', slug: 'liberte', city: 'Dakar', department: 'Dakar', isPopular: false, isActive: true, displayOrder: 12, createdAt: '2026-01-01' },
  { id: 'n-13', name: 'Parcelles Assainies', slug: 'parcelles-assainies', city: 'Dakar', department: 'Dakar', isPopular: false, isActive: true, displayOrder: 13, createdAt: '2026-01-01' },
  { id: 'n-14', name: 'Guédiawaye', slug: 'guediawaye', city: 'Dakar', department: 'Pikine-Guédiawaye', isPopular: false, isActive: true, displayOrder: 14, createdAt: '2026-01-01' },
  { id: 'n-15', name: 'Rufisque', slug: 'rufisque', city: 'Dakar', department: 'Rufisque', isPopular: false, isActive: true, displayOrder: 15, createdAt: '2026-01-01' },
  { id: 'n-16', name: 'Diamniadio', slug: 'diamniadio', city: 'Dakar', department: 'Rufisque', isPopular: false, isActive: true, displayOrder: 16, createdAt: '2026-01-01' },
];

export const INITIAL_AGENCIES: Agency[] = [
  {
    id: 'agency-teranga',
    name: 'Teranga Immobilier Dakar',
    slug: 'teranga-immobilier',
    contactEmail: 'contact@terangaimmo.sn',
    phone: '+221 33 824 10 20',
    address: 'Route des Almadies, en face King Fahd Palace, Dakar',
    ninea: '005489214 2V3',
    status: 'approved',
    isAdmin: false,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'agency-dakar-prestige',
    name: 'Dakar Prestige Living',
    slug: 'dakar-prestige',
    contactEmail: 'locations@dakarprestige.com',
    phone: '+221 77 450 12 34',
    address: 'Avenue Pasteur, Plateau, Dakar',
    ninea: '006782319 1G4',
    status: 'approved',
    isAdmin: false,
    createdAt: '2026-01-12T14:30:00Z',
    updatedAt: '2026-01-12T14:30:00Z',
  },
  {
    id: 'agency-sahel-habitat',
    name: 'Sahel Habitat & Conseil',
    slug: 'sahel-habitat',
    contactEmail: 'info@sahelhabitat.sn',
    phone: '+221 78 901 23 45',
    address: 'Fann Résidence, Rue Léon Gontran Damas, Dakar',
    ninea: '007123984 3A1',
    status: 'approved',
    isAdmin: false,
    createdAt: '2026-01-15T09:15:00Z',
    updatedAt: '2026-01-15T09:15:00Z',
  },
  {
    id: 'agency-baobab-immo',
    name: 'Baobab Gestion Immobilière',
    slug: 'baobab-gestion',
    contactEmail: 'contact@baobab-immo.sn',
    phone: '+221 76 333 44 55',
    address: 'Sacré-Cœur 3 Pyrotechnie, Dakar',
    ninea: '008912456 2B8',
    status: 'pending', // En attente de validation
    isAdmin: false,
    createdAt: '2026-10-18T16:00:00Z',
    updatedAt: '2026-10-18T16:00:00Z',
  },
];

// Helper to generate elegant realistic SVG visual data for Dakar properties
function generatePropertySvgData(type: string, title: string, seed: number): string {
  const hues = [
    { bg1: '#064e3b', bg2: '#047857', accent: '#34d399', text: 'Villa Standing' },
    { bg1: '#1e293b', bg2: '#334155', accent: '#38bdf8', text: 'Appartement Moderne' },
    { bg1: '#312e81', bg2: '#4338ca', accent: '#a5b4fc', text: 'Résidence de Luxe' },
    { bg1: '#701a75', bg2: '#86198f', accent: '#f472b6', text: 'Studio Équipé' },
    { bg1: '#7c2d12', bg2: '#9a3412', accent: '#fb923c', text: 'Maison Familiale' },
  ];
  const choice = hues[seed % hues.length];
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <linearGradient id="grad-${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${choice.bg1}" />
          <stop offset="100%" stop-color="${choice.bg2}" />
        </linearGradient>
        <pattern id="grid-${seed}" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="800" height="600" fill="url(#grad-${seed})" />
      <rect width="800" height="600" fill="url(#grid-${seed})" />
      
      <!-- Architectural silhouettes -->
      <g opacity="0.15">
        <rect x="80" y="220" width="220" height="340" fill="#ffffff" />
        <rect x="330" y="160" width="260" height="400" fill="#ffffff" />
        <rect x="620" y="260" width="120" height="300" fill="#ffffff" />
      </g>
      
      <!-- Subtle modern geometric building contour -->
      <g stroke="${choice.accent}" stroke-width="2" fill="none" opacity="0.4">
        <polyline points="100,540 100,320 280,260 280,540" />
        <polyline points="280,260 520,180 520,540" />
        <polyline points="520,180 700,240 700,540" />
      </g>

      <!-- Windows warm glow -->
      <g fill="${choice.accent}" opacity="0.25">
        <rect x="130" y="360" width="30" height="45" rx="3" />
        <rect x="180" y="360" width="30" height="45" rx="3" />
        <rect x="340" y="240" width="40" height="60" rx="3" />
        <rect x="400" y="240" width="40" height="60" rx="3" />
        <rect x="460" y="240" width="40" height="60" rx="3" />
        <rect x="340" y="340" width="40" height="60" rx="3" />
        <rect x="400" y="340" width="40" height="60" rx="3" />
        <rect x="460" y="340" width="40" height="60" rx="3" />
      </g>

      <!-- Badge and Title -->
      <rect x="60" y="60" width="160" height="34" rx="6" fill="rgba(0,0,0,0.3)" />
      <text x="140" y="82" fill="#ffffff" font-family="system-ui, sans-serif" font-size="13" font-weight="600" text-anchor="middle" letter-spacing="1">
        ${choice.text.toUpperCase()}
      </text>

      <text x="60" y="510" fill="#ffffff" font-family="system-ui, sans-serif" font-size="28" font-weight="700">
        ${title}
      </text>
      <text x="60" y="540" fill="${choice.accent}" font-family="system-ui, sans-serif" font-size="16" font-weight="500">
        Dakar · Sénégal — Annonce certifiée imovex
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'list-1',
    agencyId: 'agency-teranga',
    agencyName: 'Teranga Immobilier Dakar',
    neighborhoodId: 'n-1',
    neighborhoodName: 'Almadies',
    title: 'Superbe Appartement F4 de Standing avec Vue Mer',
    slug: 'appartement-f4-standing-vue-mer-almadies-7k29',
    propertyType: 'appartement',
    city: 'Dakar',
    monthlyRent: 850000,
    depositAdvance: 1700000, // 2 mois de caution
    chargesIncluded: true,
    bedrooms: 3,
    bathrooms: 3,
    surfaceArea: 185,
    isFurnished: false,
    description: `Magnifique appartement F4 situé au 3ème étage d'un immeuble neuf de grand standing aux Almadies.
Il comprend un spacieux salon baigné de lumière ouvrant sur un grand balcon avec vue dégagée sur l'océan Atlantique, 3 chambres autonomes avec salles de bain privatives et placards intégrés, une cuisine moderne équipée (four, hotte, micro-ondes), une buanderie et des toilettes visiteurs.
Prestations de haute qualité : groupe électrogène automatique, réservoir d'eau avec surpresseur, ascenseur, gardiennage 24h/24 et place de parking réservée en sous-sol.`,
    features: [
      'Climatisation intégrale',
      'Groupe électrogène automatique',
      'Cuve d\'eau & surpresseur',
      'Gardiennage 24/7 & vidéosurveillance',
      'Ascenseur',
      'Parking sous-sol',
      'Balcon vue mer',
      'Cuisine équipée',
      'Chauffe-eau solaire',
    ],
    status: 'disponible',
    confirmationToken: 'token-almadies-1',
    lastAvailabilityConfirmedAt: '2026-10-18T12:00:00Z',
    viewsCount: 342,
    photos: [
      { id: 'p-1', listingId: 'list-1', storagePath: 'almadies-1.jpg', publicUrl: generatePropertySvgData('appartement', 'Salon F4 Almadies Vue Mer', 1), position: 0, isPrimary: true },
      { id: 'p-2', listingId: 'list-1', storagePath: 'almadies-2.jpg', publicUrl: generatePropertySvgData('appartement', 'Suite Parentale Spacieuse', 2), position: 1, isPrimary: false },
      { id: 'p-3', listingId: 'list-1', storagePath: 'almadies-3.jpg', publicUrl: generatePropertySvgData('appartement', 'Cuisine Américaine Neuve', 3), position: 2, isPrimary: false },
      { id: 'p-4', listingId: 'list-1', storagePath: 'almadies-4.jpg', publicUrl: generatePropertySvgData('appartement', 'Terrasse Balcon Océan', 0), position: 3, isPrimary: false },
    ],
    createdAt: '2026-10-10T08:00:00Z',
    updatedAt: '2026-10-18T12:00:00Z',
  },
  {
    id: 'list-2',
    agencyId: 'agency-dakar-prestige',
    agencyName: 'Dakar Prestige Living',
    neighborhoodId: 'n-2',
    neighborhoodName: 'Ngor',
    title: 'Somptueuse Villa Contemporaine avec Piscine & Jardin',
    slug: 'somptueuse-villa-piscine-jardin-ngor-4m12',
    propertyType: 'villa',
    city: 'Dakar',
    monthlyRent: 2200000,
    depositAdvance: 4400000,
    chargesIncluded: false,
    bedrooms: 5,
    bathrooms: 5,
    surfaceArea: 420,
    isFurnished: true,
    description: `Splendide villa d'architecte contemporaine située dans un quartier calme et sécurisé à Ngor, à 2 minutes de la plage et des restaurants réputés.
Cette villa d'exception offre de très beaux volumes : double séjour avec baies vitrées donnant sur la piscine et le jardin arboré, salle à manger, 5 suites spacieuses dont une master suite avec dressing et jacuzzi, cuisine professionnelle avec îlot central, quartier domestique indépendant, garage fermé pour 2 véhicules.
Idéal pour diplomates, cadres de multinationales ou familles recherchant un cadre de vie paisible et prestigieux.`,
    features: [
      'Piscine privée',
      'Jardin paysager',
      'Groupe électrogène 30 kVA',
      'Climatisation inverter',
      'Réserve d\'eau 3000L',
      'Logement gardien / personnel',
      'Garage fermé 2 voitures',
      'Meublé grand standing',
      'Alarme & caméras',
    ],
    status: 'disponible',
    confirmationToken: 'token-ngor-1',
    lastAvailabilityConfirmedAt: '2026-10-19T09:30:00Z',
    viewsCount: 512,
    photos: [
      { id: 'p-5', listingId: 'list-2', storagePath: 'ngor-1.jpg', publicUrl: generatePropertySvgData('villa', 'Façade Villa Ngor Piscine', 0), position: 0, isPrimary: true },
      { id: 'p-6', listingId: 'list-2', storagePath: 'ngor-2.jpg', publicUrl: generatePropertySvgData('villa', 'Grand Salon Ouvert sur Jardin', 1), position: 1, isPrimary: false },
      { id: 'p-7', listingId: 'list-2', storagePath: 'ngor-3.jpg', publicUrl: generatePropertySvgData('villa', 'Chambre Master Suite', 2), position: 2, isPrimary: false },
    ],
    createdAt: '2026-10-08T11:00:00Z',
    updatedAt: '2026-10-19T09:30:00Z',
  },
  {
    id: 'list-3',
    agencyId: 'agency-sahel-habitat',
    agencyName: 'Sahel Habitat & Conseil',
    neighborhoodId: 'n-4',
    neighborhoodName: 'Mermoz',
    title: 'Appartement F3 Moderne & Meublé proche VDN',
    slug: 'appartement-f3-moderne-meuble-vdn-mermoz-9b43',
    propertyType: 'appartement',
    city: 'Dakar',
    monthlyRent: 550000,
    depositAdvance: 1100000,
    chargesIncluded: true,
    bedrooms: 2,
    bathrooms: 2,
    surfaceArea: 110,
    isFurnished: true,
    description: `Idéalement situé à Mermoz, à proximité immédiate de la VDN, de l'université et des centres d'affaires.
Cet appartement F3 au 2ème étage est entièrement meublé et décoré avec raffinement. Il dispose d'un salon confortable avec Smart TV et canapé d'angle, d'une cuisine américaine toute équipée (réfrigérateur, plaques à induction, micro-ondes, machine à laver), de 2 chambres climatisées avec literie orthopédique et rangements, 2 salles d'eau modernes et un balcon.
Immeuble propre et sécurisé avec gardiennage de jour comme de nuit.`,
    features: [
      'Entièrement meublé',
      'Climatisation split',
      'Machine à laver le linge',
      'Fibre optique disponible',
      'Groupe électrogène parties communes',
      'Surpresseur d\'eau',
      'Gardien 24h/24',
      'Accès facile VDN & Corniche',
    ],
    status: 'disponible',
    confirmationToken: 'token-mermoz-1',
    lastAvailabilityConfirmedAt: '2026-10-17T15:20:00Z',
    viewsCount: 289,
    photos: [
      { id: 'p-8', listingId: 'list-3', storagePath: 'mermoz-1.jpg', publicUrl: generatePropertySvgData('appartement', 'Salon F3 Meublé Mermoz', 2), position: 0, isPrimary: true },
      { id: 'p-9', listingId: 'list-3', storagePath: 'mermoz-2.jpg', publicUrl: generatePropertySvgData('appartement', 'Cuisine Équipée & Bar', 3), position: 1, isPrimary: false },
      { id: 'p-10', listingId: 'list-3', storagePath: 'mermoz-3.jpg', publicUrl: generatePropertySvgData('appartement', 'Chambre Principale', 4), position: 2, isPrimary: false },
    ],
    createdAt: '2026-10-12T14:00:00Z',
    updatedAt: '2026-10-17T15:20:00Z',
  },
  {
    id: 'list-4',
    agencyId: 'agency-teranga',
    agencyName: 'Teranga Immobilier Dakar',
    neighborhoodId: 'n-7',
    neighborhoodName: 'Plateau (Centre-ville)',
    title: 'Studio Cosy Équipé au Cœur du Plateau',
    slug: 'studio-cosy-equipe-plateau-dakar-3w88',
    propertyType: 'studio',
    city: 'Dakar',
    monthlyRent: 320000,
    depositAdvance: 640000,
    chargesIncluded: true,
    bedrooms: 1,
    bathrooms: 1,
    surfaceArea: 48,
    isFurnished: true,
    description: `Parfait pour jeune professionnel ou consultant en mission à Dakar !
Charmant studio au 4ème étage avec ascenseur en plein centre-ville de Dakar (Plateau), à 5 minutes de la Place de l'Indépendance et des banques et ministères.
Composé d'une pièce principale lumineuse avec coin nuit et bureau de travail, une kitchenette moderne équipée et une salle de bain avec cabine de douche à l'italienne. Climatisation, chauffe-eau électrique et connexion sécurisée.`,
    features: [
      'Centre-ville Plateau',
      'Ascenseur',
      'Meublé & équipé',
      'Climatisation',
      'Gardiennage permanent',
      'Proche commerces et transports',
    ],
    status: 'disponible',
    confirmationToken: 'token-plateau-1',
    lastAvailabilityConfirmedAt: '2026-10-15T18:00:00Z',
    viewsCount: 198,
    photos: [
      { id: 'p-11', listingId: 'list-4', storagePath: 'plateau-1.jpg', publicUrl: generatePropertySvgData('studio', 'Studio Cosy Plateau', 3), position: 0, isPrimary: true },
      { id: 'p-12', listingId: 'list-4', storagePath: 'plateau-2.jpg', publicUrl: generatePropertySvgData('studio', 'Kitchenette Moderne', 4), position: 1, isPrimary: false },
      { id: 'p-13', listingId: 'list-4', storagePath: 'plateau-3.jpg', publicUrl: generatePropertySvgData('studio', 'Coin Nuit & Bureau', 1), position: 2, isPrimary: false },
    ],
    createdAt: '2026-10-14T10:00:00Z',
    updatedAt: '2026-10-15T18:00:00Z',
  },
  {
    id: 'list-5',
    agencyId: 'agency-dakar-prestige',
    agencyName: 'Dakar Prestige Living',
    neighborhoodId: 'n-5',
    neighborhoodName: 'Sacré-Cœur (1, 2, 3)',
    title: 'Maison R+1 avec Cour et Garage à Sacré-Cœur 3',
    slug: 'maison-r1-cour-garage-sacre-coeur-3-5t66',
    propertyType: 'maison',
    city: 'Dakar',
    monthlyRent: 750000,
    depositAdvance: 1500000,
    chargesIncluded: false,
    bedrooms: 4,
    bathrooms: 3,
    surfaceArea: 210,
    isFurnished: false,
    description: `Maison familiale R+1 située dans un secteur résidentiel et très recherché de Sacré-Cœur 3 Pyrotechnie.
Au rez-de-chaussée : salon lumineux, salle à manger, cuisine avec placards et réserve, chambre d'ami avec salle de bain, cour avant arborée et garage avec portail motorisé.
À l'étage : 3 chambres confortables dont la suite parentale avec terrasse privative, 2 salles de bain, et accès au toit-terrasse aménageable.`,
    features: [
      'Cour privative',
      'Garage motorisé',
      'Toit-terrasse',
      'Réservoir d\'eau avec pompe',
      'Chauffe-eau solaire',
      'Quartier résidentiel calme',
    ],
    status: 'reserve', // Réservé pour montrer ce statut
    confirmationToken: 'token-sacre-coeur-1',
    lastAvailabilityConfirmedAt: '2026-10-16T11:00:00Z',
    viewsCount: 410,
    photos: [
      { id: 'p-14', listingId: 'list-5', storagePath: 'sacre-1.jpg', publicUrl: generatePropertySvgData('maison', 'Maison R+1 Sacré-Cœur 3', 4), position: 0, isPrimary: true },
      { id: 'p-15', listingId: 'list-5', storagePath: 'sacre-2.jpg', publicUrl: generatePropertySvgData('maison', 'Cour Intérieure & Terrasse', 0), position: 1, isPrimary: false },
      { id: 'p-16', listingId: 'list-5', storagePath: 'sacre-3.jpg', publicUrl: generatePropertySvgData('maison', 'Séjour Familial RDC', 1), position: 2, isPrimary: false },
    ],
    createdAt: '2026-10-09T09:00:00Z',
    updatedAt: '2026-10-16T11:00:00Z',
  },
  {
    id: 'list-6',
    agencyId: 'agency-sahel-habitat',
    agencyName: 'Sahel Habitat & Conseil',
    neighborhoodId: 'n-6',
    neighborhoodName: 'Fann Résidence / Point E',
    title: 'Appartement Haut Standing F5 à Fann Résidence',
    slug: 'appartement-haut-standing-f5-fann-residence-1j99',
    propertyType: 'appartement',
    city: 'Dakar',
    monthlyRent: 1600000,
    depositAdvance: 3200000,
    chargesIncluded: true,
    bedrooms: 4,
    bathrooms: 4,
    surfaceArea: 280,
    isFurnished: false,
    description: `Dans le secteur diplomatique le plus huppé de Dakar à Fann Résidence.
Superbe appartement F5 de 280 m² occupant tout le 4ème étage. Triple réception avec baies vitrées coulissantes, 4 grandes chambres avec dressings italiens et salles de bain privatives en marbre, cuisine haut de gamme avec îlot et arrière-cuisine, buanderie et chambre de service avec sanitaires.
L'immeuble dispose d'un espace fitness, groupe électrogène lourd, sécurité blindée 24h/24 et 2 places de parking.`,
    features: [
      'Secteur diplomatique Fann',
      'Salle de sport dans l\'immeuble',
      'Groupe électrogène intégral 24/7',
      '2 parkings privés',
      'Ascenseur sécurisé avec badge',
      'Chambre de service avec salle d\'eau',
      'Climatisation gainable',
      'Cuisine italienne équipée',
    ],
    status: 'loue', // Déjà loué (pour tester la page avec bandeau "Déjà loué" et masquée de la recherche)
    confirmationToken: 'token-fann-1',
    lastAvailabilityConfirmedAt: '2026-10-01T10:00:00Z',
    viewsCount: 680,
    photos: [
      { id: 'p-17', listingId: 'list-6', storagePath: 'fann-1.jpg', publicUrl: generatePropertySvgData('appartement', 'F5 Luxe Fann Résidence', 1), position: 0, isPrimary: true },
      { id: 'p-18', listingId: 'list-6', storagePath: 'fann-2.jpg', publicUrl: generatePropertySvgData('appartement', 'Triple Réception Marbre', 2), position: 1, isPrimary: false },
      { id: 'p-19', listingId: 'list-6', storagePath: 'fann-3.jpg', publicUrl: generatePropertySvgData('appartement', 'Suite Parentale Dressing', 3), position: 2, isPrimary: false },
    ],
    createdAt: '2026-09-25T14:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
  },
];

export const INITIAL_REQUESTS: RentalRequest[] = [
  {
    id: 'req-001',
    listingId: 'list-1',
    listingTitle: 'Superbe Appartement F4 de Standing avec Vue Mer',
    listingNeighborhood: 'Almadies',
    listingRent: 850000,
    agencyId: 'agency-teranga',
    agencyName: 'Teranga Immobilier Dakar',
    fullName: 'Moustapha Diop',
    phone: '+221 77 555 44 33',
    consentCdp: true,
    email: 'moustapha.diop@orange.sn',
    message: 'Bonjour, nous sommes une famille de 4 personnes. L\'appartement est-il disponible pour une visite ce jeudi après-midi ? Merci.',
    desiredVisitDate: '2026-10-23',
    status: 'transmise',
    emailStatus: 'envoye',
    emailSentAt: '2026-10-18T14:22:00Z',
    resendEmailId: 're_dakar_98124',
    createdAt: '2026-10-18T14:20:00Z',
    updatedAt: '2026-10-18T14:22:00Z',
  },
  {
    id: 'req-002',
    listingId: 'list-3',
    listingTitle: 'Appartement F3 Moderne & Meublé proche VDN',
    listingNeighborhood: 'Mermoz',
    listingRent: 550000,
    agencyId: 'agency-sahel-habitat',
    agencyName: 'Sahel Habitat & Conseil',
    fullName: 'Aïssatou Sy',
    phone: '+221 78 222 11 00',
    consentCdp: true,
    email: 'aissatou.sy@gmail.com',
    message: 'Je cherche un logement meublé pour un bail d\'un an renouvelable. Est-ce que les charges comprennent l\'eau et le gardiennage ?',
    desiredVisitDate: '2026-10-24',
    status: 'nouvelle',
    emailStatus: 'envoye',
    emailSentAt: '2026-10-19T09:12:00Z',
    resendEmailId: 're_dakar_98130',
    createdAt: '2026-10-19T09:10:00Z',
    updatedAt: '2026-10-19T09:12:00Z',
  },
  {
    id: 'req-003',
    listingId: 'list-4',
    listingTitle: 'Studio Cosy Équipé au Cœur du Plateau',
    listingNeighborhood: 'Plateau (Centre-ville)',
    listingRent: 320000,
    agencyId: 'agency-teranga',
    agencyName: 'Teranga Immobilier Dakar',
    fullName: 'Cheikh Ndao',
    phone: '+221 76 888 99 00',
    consentCdp: true,
    email: '',
    message: 'Disponible immédiatement pour emménager. Merci de me contacter rapidement.',
    desiredVisitDate: '',
    status: 'visite_planifiee',
    emailStatus: 'envoye',
    emailSentAt: '2026-10-17T16:05:00Z',
    resendEmailId: 're_dakar_98099',
    createdAt: '2026-10-17T16:00:00Z',
    updatedAt: '2026-10-18T10:00:00Z',
  },
];
