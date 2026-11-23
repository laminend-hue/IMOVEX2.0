export type AgencyStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type PropertyType = 'appartement' | 'maison' | 'studio' | 'chambre' | 'villa';
export type ListingStatus = 'disponible' | 'reserve' | 'loue' | 'masque' | 'en_attente';
export type RequestStatus = 'nouvelle' | 'transmise' | 'visite_planifiee' | 'conclue' | 'sans_suite';
export type EmailStatus = 'en_attente' | 'envoye' | 'email_en_echec';
export type ReportReason = 'deja_loue' | 'prix_incorrect' | 'fausses_photos' | 'fraude_suspectee' | 'autre';

export interface Neighborhood {
  id: string;
  name: string;
  slug: string;
  city: string;
  department: string;
  isPopular: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface Agency {
  id: string;
  name: string;
  slug: string;
  contactEmail: string; // Not public
  phone: string;        // Not public
  address?: string;
  ninea?: string;
  status: AgencyStatus;
  isAdmin: boolean;
  logoUrl?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListingPhoto {
  id: string;
  listingId: string;
  storagePath: string;
  publicUrl: string;
  position: number;
  isPrimary: boolean;
  createdAt?: string;
}

export interface Listing {
  id: string;
  agencyId: string;
  agencyName: string; // Display name without private phone/email
  neighborhoodId: string;
  neighborhoodName: string;
  title: string;
  slug: string;
  propertyType: PropertyType;
  city: string;
  monthlyRent: number; // In FCFA
  depositAdvance: number; // In FCFA (caution / avance)
  chargesIncluded: boolean;
  bedrooms: number;
  bathrooms: number;
  surfaceArea?: number; // In m2
  isFurnished: boolean;
  description: string;
  features: string[];
  status: ListingStatus;
  confirmationToken: string;
  lastAvailabilityConfirmedAt: string;
  reminderSentAt?: string;
  viewsCount: number;
  photos: ListingPhoto[];
  createdAt: string;
  updatedAt: string;
}

export interface RentalRequest {
  id: string;
  listingId: string;
  listingTitle: string;
  listingNeighborhood: string;
  listingRent: number;
  agencyId: string;
  agencyName: string;
  fullName: string;
  phone: string;
  consentCdp: boolean;
  email?: string;
  message?: string;
  desiredVisitDate?: string;
  status: RequestStatus;
  emailStatus: EmailStatus;
  emailErrorMessage?: string;
  emailSentAt?: string;
  resendEmailId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListingFiltersState {
  propertyType: PropertyType | 'all';
  neighborhoodSlug: string;
  minRent: number | '';
  maxRent: number | '';
  bedrooms: number | 'all';
  isFurnished: boolean | 'all';
  searchQuery: string;
  sortBy: 'recent' | 'price_asc' | 'price_desc';
}
