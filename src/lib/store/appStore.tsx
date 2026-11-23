import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
} from 'firebase/firestore';
import { User, createUserWithEmailAndPassword, deleteUser, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import { Agency, Listing, ListingStatus, Neighborhood, RentalRequest, RequestStatus } from '../../types/database.ts';
import { INITIAL_AGENCIES, INITIAL_LISTINGS, INITIAL_NEIGHBORHOODS } from '../data/initialData.ts';
import { generateListingSlug } from '../utils/slugify.ts';
import { validateRentalRequest } from '../utils/validation.ts';
import {
  db,
  auth,
  initAuth,
  signInWithGoogle,
  signOutGoogle,
  handleFirestoreError,
  OperationType,
} from '../firebase.ts';
import { sendVisitEmailViaGmail, ADMIN_EMAIL } from '../email.ts';
import { supabase } from '../supabase.ts';


export type UserRole = 'tenant' | 'agency' | 'admin';

export interface TenantProfile {
  fullName: string;
  phone: string;
  email?: string;
  connectedAt?: string;
}

interface AppContextType {
  // Current user & role
  currentUser: User | null;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeAgency: Agency | null;
  setActiveAgencyId: (agencyId: string | null) => void;
  adminEmail: string;
  isGoogleAuthenticated: boolean;
  loginWithGoogle: () => Promise<void>;
  logoutUser: () => Promise<void>;

  // Direct In-App Tenant Auth (no external links)
  tenantProfile: TenantProfile | null;
  loginTenantDirect: (profile: { fullName: string; phone: string; email?: string }) => void;
  loginTenantWithGoogle: () => Promise<boolean>;
  logoutTenant: () => void;

  // Direct Admin Portal Auth
  isAdminAuthenticated: boolean;
  loginAdminWithCredentials: (username: string, password: string) => Promise<boolean>;
  loginAdminWithGoogle: () => Promise<boolean>;
  logoutAdmin: () => void;

  // Direct Agency Portal Auth
  isAgencyAuthenticated: boolean;
  loginAgency: (email: string, password: string) => Promise<boolean>;
  logoutAgency: () => void;

  // Data
  neighborhoods: Neighborhood[];
  listings: Listing[];
  agencies: Agency[];
  requests: RentalRequest[];
  isFirestoreSyncing: boolean;

  // Actions Locataire
  submitRentalRequest: (params: {
    listingId: string;
    fullName: string;
    phone: string;
    email?: string;
    message?: string;
    desiredVisitDate?: string;
    consentCdp: boolean;
    honeypot?: string;
  }) => Promise<{ success: boolean; requestId?: string; error?: string }>;
  incrementListingViews: (listingId: string) => void;

  // Actions Agence
  addListing: (listingData: Omit<Listing, 'id' | 'slug' | 'viewsCount' | 'confirmationToken' | 'lastAvailabilityConfirmedAt' | 'createdAt' | 'updatedAt'>) => Promise<Listing>;
  updateListing: (id: string, updates: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
  updateListingStatus: (id: string, newStatus: ListingStatus) => void;
  confirmListingAvailability: (tokenOrId: string) => boolean;
  registerAgency: (data: { name: string; contactEmail: string; phone: string; password: string; address?: string; ninea?: string }) => Promise<Agency>;

  // Actions Admin
  updateAgencyStatus: (agencyId: string, status: 'approved' | 'rejected' | 'suspended', reason?: string) => void;
  updateRequestStatus: (requestId: string, status: RequestStatus) => void;
  resendRequestEmail: (requestId: string) => Promise<{ success: boolean; message: string }>;
  toggleNeighborhoodStatus: (id: string) => void;
  resetToInitialData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY_LISTINGS = 'imovex_listings_v2';
const STORAGE_KEY_NEIGHBORHOODS = 'imovex_neighborhoods_v2';
const STORAGE_KEY_TENANT = 'imovex_tenant_profile_v2';
const STORAGE_KEY_ADMIN_SESSION = 'imovex_admin_session_v1';
const STORAGE_KEY_AGENCY_SESSION = 'imovex_agency_session_v1';
const DEMO_MODE = import.meta.env.DEV;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCredentialAdmin, setIsCredentialAdmin] = useState<boolean>(() => {
    try {
      return (
        sessionStorage.getItem(STORAGE_KEY_ADMIN_SESSION) === 'true' ||
        localStorage.getItem(STORAGE_KEY_ADMIN_SESSION) === 'true'
      );
    } catch {
      return false;
    }
  });

  const isAdminAuthenticated = Boolean(
    isCredentialAdmin ||
    (currentUser?.emailVerified && (currentUser.email === ADMIN_EMAIL || currentUser.email === 'lmsite.creator@gmail.com'))
  );
  const [savedAgencySession, setSavedAgencySession] = useState<Agency | null>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY_AGENCY_SESSION) || localStorage.getItem(STORAGE_KEY_AGENCY_SESSION);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    try {
      if (
        sessionStorage.getItem(STORAGE_KEY_ADMIN_SESSION) === 'true' ||
        localStorage.getItem(STORAGE_KEY_ADMIN_SESSION) === 'true'
      ) {
        return 'admin';
      }
      const agencyRaw = sessionStorage.getItem(STORAGE_KEY_AGENCY_SESSION) || localStorage.getItem(STORAGE_KEY_AGENCY_SESSION);
      if (agencyRaw) {
        return 'agency';
      }
    } catch {
      // ignore
    }
    return 'tenant';
  });
  const [activeAgencyId, setActiveAgencyIdState] = useState<string | null>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY_AGENCY_SESSION) || localStorage.getItem(STORAGE_KEY_AGENCY_SESSION);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed?.id || null;
      }
    } catch {
      // ignore
    }
    return null;
  });
  const [isFirestoreSyncing, setIsFirestoreSyncing] = useState<boolean>(false);

  // Tenant profile for direct in-app connection without external links
  const [tenantProfile, setTenantProfile] = useState<TenantProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TENANT);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NEIGHBORHOODS);
      return saved ? JSON.parse(saved) : INITIAL_NEIGHBORHOODS;
    } catch {
      return INITIAL_NEIGHBORHOODS;
    }
  });

  const [agencies, setAgencies] = useState<Agency[]>(DEMO_MODE ? INITIAL_AGENCIES : []);

  const [listings, setListings] = useState<Listing[]>(() => {
    if (!DEMO_MODE) return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LISTINGS);
      return saved ? JSON.parse(saved) : (DEMO_MODE ? INITIAL_LISTINGS : []);
    } catch {
      return DEMO_MODE ? INITIAL_LISTINGS : [];
    }
  });

  const [requests, setRequests] = useState<RentalRequest[]>([]);

  // Firebase identity controls all privileged views and data access.
  useEffect(() => {
    const unsubscribe = initAuth(
      async (user) => {
        setCurrentUser(user);
        const isAdmin = user.emailVerified && (user.email === ADMIN_EMAIL || user.email === 'lmsite.creator@gmail.com');
        if (isAdmin || isCredentialAdmin) {
          setCurrentRoleState('admin');
          setActiveAgencyIdState(null);
          return;
        }
        try {
          const profile = await getDoc(doc(db, 'agencies', user.uid));
          if (profile.exists()) {
            const agency = { ...(profile.data() as Agency), id: profile.id };
            setAgencies((previous) => [...previous.filter((item) => item.id !== agency.id), agency]);
            setActiveAgencyIdState(user.uid);
            setCurrentRoleState('agency');
          } else {
            setActiveAgencyIdState(null);
            if (!isCredentialAdmin) {
              setCurrentRoleState('tenant');
            }
          }
        } catch {
          setActiveAgencyIdState(null);
          if (!isCredentialAdmin) {
            setCurrentRoleState('tenant');
          }
        }
      },
      () => {
        setCurrentUser(null);
        setActiveAgencyIdState(null);
        if (!isCredentialAdmin) {
          setRequests([]);
          setCurrentRoleState('tenant');
        }
      }
    );
    return () => unsubscribe();
  }, [isCredentialAdmin]);

  // Synchronisation directe avec Supabase (PostgreSQL + RLS)
  const syncWithSupabase = useCallback(async () => {
    setIsFirestoreSyncing(true);
    try {
      if (isAdminAuthenticated) {
        const { data: overview } = await supabase.rpc('get_admin_overview');
        if (overview) {
          if (overview.agencies && Array.isArray(overview.agencies)) setAgencies(overview.agencies);
          if (overview.listings && Array.isArray(overview.listings)) setListings(overview.listings);
          if (overview.requests && Array.isArray(overview.requests)) setRequests(overview.requests);
        }
      } else if (activeAgencyId) {
        const [pubRes, agRes] = await Promise.all([
          supabase.rpc('get_public_listings'),
          supabase.rpc('get_agency_listings', { p_agency_id: activeAgencyId })
        ]);
        const publicListings: Listing[] = pubRes.data || [];
        const agencyListings: Listing[] = agRes.data || [];
        const combined = [...agencyListings, ...publicListings.filter((p: Listing) => p.agencyId !== activeAgencyId)];
        if (combined.length > 0) setListings(combined);
      } else {
        const { data: publicListings } = await supabase.rpc('get_public_listings');
        if (publicListings && Array.isArray(publicListings) && publicListings.length > 0) {
          setListings(publicListings);
        }
      }

      // Charger les quartiers de Dakar depuis Supabase
      const { data: neighData } = await supabase
        .from('neighborhoods')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (neighData && Array.isArray(neighData) && neighData.length > 0) {
        const formattedNeighs: Neighborhood[] = neighData.map((n: any) => ({
          id: n.id,
          name: n.name,
          slug: n.slug,
          city: n.city,
          department: n.department,
          isPopular: n.is_popular,
          isActive: n.is_active,
          displayOrder: n.display_order,
          createdAt: n.created_at,
        }));
        setNeighborhoods(formattedNeighs);
      }
    } catch (err) {
      console.warn('[imovex Supabase] Synchronisation:', err);
    } finally {
      setIsFirestoreSyncing(false);
    }
  }, [isAdminAuthenticated, activeAgencyId]);

  useEffect(() => {
    syncWithSupabase();
  }, [syncWithSupabase]);

  // Sync state to local storage for instant offline resilience
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(listings));
    } catch (e) {
      console.warn('Storage quota exceeded for listings', e);
    }
  }, [listings]);

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
  };

  const setActiveAgencyId = (id: string | null) => {
    setActiveAgencyIdState(id);
  };

  const activeAgency = agencies.find((a) => a.id === activeAgencyId) || (savedAgencySession?.id === activeAgencyId ? savedAgencySession : null) || savedAgencySession || null;

  // Direct In-App Tenant Auth (no external redirect or external links)
  const loginTenantDirect = (profile: { fullName: string; phone: string; email?: string }) => {
    const fullProfile: TenantProfile = {
      fullName: profile.fullName.trim(),
      phone: profile.phone.trim(),
      email: profile.email?.trim() || undefined,
      connectedAt: new Date().toISOString(),
    };
    setTenantProfile(fullProfile);
    try {
      localStorage.setItem(STORAGE_KEY_TENANT, JSON.stringify(fullProfile));
    } catch {
      // ignore
    }
  };

  const loginTenantWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithGoogle();
      if (result?.user) {
        setCurrentUser(result.user);
        const fullProfile: TenantProfile = {
          fullName: result.user.displayName || 'Locataire imovex',
          email: result.user.email || undefined,
          phone: result.user.phoneNumber || '+221 ',
          connectedAt: new Date().toISOString(),
        };
        setTenantProfile(fullProfile);
        try {
          localStorage.setItem(STORAGE_KEY_TENANT, JSON.stringify(fullProfile));
        } catch {
          // ignore
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Connexion locataire interrompue:', err);
      return false;
    }
  };

  const logoutTenant = () => {
    setTenantProfile(null);
    try {
      localStorage.removeItem(STORAGE_KEY_TENANT);
    } catch {
      // ignore
    }
  };

  // Direct Admin Auth Logic for /admin link
  const loginAdminWithCredentials = async (username: string, pass: string): Promise<boolean> => {
    const rawUser = String(username || '').trim();
    const rawPass = String(pass || '').trim();
    const cleanUser = rawUser.replace(/[\s\-_+.]/g, '').toLowerCase();
    const cleanPass = rawPass.replace(/[\s\-_]/g, '').trim();

    const isRecognizedUser = 
      cleanUser === '2212429193' ||
      cleanUser === '2429193' ||
      cleanUser === '221242' ||
      cleanUser === 'admin' ||
      cleanUser === 'imovex' ||
      cleanUser === 'laminend' ||
      cleanUser === 'laminend2462' ||
      cleanUser === 'laminend2462@gmail.com' ||
      cleanUser === 'laminend2462gmailcom' ||
      cleanUser === 'lmsite.creator@gmail.com' ||
      cleanUser === 'lmsitecreatorgmailcom' ||
      rawUser.toLowerCase().includes('laminend') ||
      rawUser.toLowerCase() === 'admin' ||
      rawUser === '2212429193';

    const isRecognizedPass =
      cleanPass === '221242' ||
      cleanPass === '2212429193' ||
      rawPass === '221242' ||
      rawPass === 'Pass123456!' ||
      rawPass.toLowerCase() === 'admin' ||
      rawPass.toLowerCase() === 'imovex';

    // Support flexible format or entering 221242 anywhere
    const isDirectMatch = 
      (isRecognizedUser && isRecognizedPass) ||
      (rawUser === '221242' && rawPass === '2212429193') ||
      (rawUser === '2212429193' && rawPass === '2212429193') ||
      (rawUser === '221242' && rawPass === '221242') ||
      (cleanPass === '221242' && cleanUser.length >= 3);

    if (isDirectMatch) {
      setIsCredentialAdmin(true);
      setCurrentRoleState('admin');
      try {
        sessionStorage.setItem(STORAGE_KEY_ADMIN_SESSION, 'true');
        localStorage.setItem(STORAGE_KEY_ADMIN_SESSION, 'true');
      } catch {
        // ignore
      }
      void supabase.rpc('get_admin_overview').then(({ data: overview }: any) => {
        if (overview) {
          if (overview.agencies && Array.isArray(overview.agencies)) setAgencies(overview.agencies);
          if (overview.listings && Array.isArray(overview.listings)) setListings(overview.listings);
          if (overview.requests && Array.isArray(overview.requests)) setRequests(overview.requests);
        }
      });
      return true;
    }
    return false;
  };

  const loginAdminWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithGoogle();
      const user = result?.user;
      const allowedEmails = [ADMIN_EMAIL, 'lmsite.creator@gmail.com'];
      if (!user || !user.emailVerified || !allowedEmails.includes(user.email || '')) {
        await signOutGoogle();
        setCurrentUser(null);
        return false;
      }
      setCurrentUser(user);
      setCurrentRoleState('admin');
      return true;
    } catch (err) {
      console.error('Échec authentification administrateur:', err);
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsCredentialAdmin(false);
    try {
      sessionStorage.removeItem(STORAGE_KEY_ADMIN_SESSION);
      localStorage.removeItem(STORAGE_KEY_ADMIN_SESSION);
    } catch {
      // ignore
    }
    void logoutUser();
  };

  const isAgencyAuthenticated = Boolean(
    isAdminAuthenticated ||
    (activeAgency && activeAgency.status === 'approved') ||
    (savedAgencySession && savedAgencySession.status === 'approved')
  );

  const loginAgency = async (email: string, password: string): Promise<boolean | { success: boolean; error?: string }> => {
    const rawEmail = String(email || '').trim().toLowerCase();
    const rawPass = String(password || '').trim();
    const cleanEmail = rawEmail.replace(/[\s\-_+.]/g, '');

    // Si l'administrateur essaie de se connecter sur l'espace agence avec ses identifiants admin
    if (
      (cleanEmail === '2212429193' || cleanEmail === '2429193' || cleanEmail === 'admin' || cleanEmail === 'laminend2462@gmail.com' || cleanEmail === 'laminend' || rawEmail.includes('2212429193')) &&
      (rawPass === '221242' || rawPass === '2212429193' || rawPass === 'Pass123456!' || rawPass.toLowerCase() === 'admin')
    ) {
      setIsCredentialAdmin(true);
      setCurrentRoleState('admin');
      try {
        sessionStorage.setItem(STORAGE_KEY_ADMIN_SESSION, 'true');
        localStorage.setItem(STORAGE_KEY_ADMIN_SESSION, 'true');
      } catch {}
      void supabase.rpc('get_admin_overview').then(({ data: overview }: any) => {
        if (overview) {
          if (overview.agencies && Array.isArray(overview.agencies)) setAgencies(overview.agencies);
          if (overview.listings && Array.isArray(overview.listings)) setListings(overview.listings);
          if (overview.requests && Array.isArray(overview.requests)) setRequests(overview.requests);
        }
      });
      return true;
    }

    try {
      const { data, error } = await supabase.rpc('login_agency', {
        p_email: rawEmail,
        p_password: rawPass
      });

      if (error || !data || !data.success) {
        const errorMsg = data?.error || 'Adresse, mot de passe incorrects ou compte agence introuvable.';
        return { success: false, error: errorMsg };
      }

      const agency = data.agency as Agency;
      setAgencies((prev) => [...prev.filter((a) => a.id !== agency.id), agency]);
      setActiveAgencyIdState(agency.id);
      setSavedAgencySession(agency);
      setCurrentRoleState('agency');

      try {
        localStorage.setItem(STORAGE_KEY_AGENCY_SESSION, JSON.stringify(agency));
        sessionStorage.setItem(STORAGE_KEY_AGENCY_SESSION, JSON.stringify(agency));
      } catch {
        // ignore
      }

      // Charger les annonces spécifiques de cette agence (y compris en_attente)
      const { data: agencyListings } = await supabase.rpc('get_agency_listings', { p_agency_id: agency.id });
      if (agencyListings) {
        setListings((prev) => [...agencyListings, ...prev.filter((l) => l.agencyId !== agency.id)]);
      }

      return true;
    } catch (err: any) {
      console.warn('[imovex Supabase Auth] Connexion agence impossible:', err);
      return { success: false, error: err?.message || 'Erreur lors de la connexion agence.' };
    }
  };

  const logoutAgency = () => {
    setActiveAgencyIdState(null);
    setSavedAgencySession(null);
    if (!isCredentialAdmin) {
      setCurrentRoleState('tenant');
    }
    try {
      localStorage.removeItem(STORAGE_KEY_AGENCY_SESSION);
      sessionStorage.removeItem(STORAGE_KEY_AGENCY_SESSION);
    } catch {
      // ignore
    }
  };

  // Authentification alternative administrateur ou partenaire
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithGoogle();
      if (result?.user) {
        setCurrentUser(result.user);
        setCurrentRoleState('tenant');
      }
    } catch (err) {
      console.error('Échec authentification:', err);
    }
  };

  const logoutUser = async () => {
    await signOutGoogle();
    setCurrentUser(null);
    setActiveAgencyIdState(null);
    setRequests([]);
    setCurrentRoleState('tenant');
  };

  // View count increment with Firestore update
  const incrementListingViews = async (listingId: string) => {
    setListings((prev) =>
      prev.map((item) =>
        item.id === listingId ? { ...item, viewsCount: (item.viewsCount || 0) + 1 } : item
      )
    );
    try {
      const listingRef = doc(db, 'properties', listingId);
      const current = listings.find((l) => l.id === listingId);
      if (current) {
        await updateDoc(listingRef, { viewsCount: (current.viewsCount || 0) + 1 });
      }
    } catch (err) {
      // Non-blocking
    }
  };

  // Soumission d'une demande de visite locataire
  const submitRentalRequest = async (params: {
    listingId: string;
    fullName: string;
    phone: string;
    email?: string;
    message?: string;
    desiredVisitDate?: string;
    consentCdp: boolean;
    honeypot?: string;
  }): Promise<{ success: boolean; requestId?: string; error?: string }> => {
    // 1. Validation & Anti-Spam
    const validation = validateRentalRequest(params);
    if (validation.isSpam) {
      return { success: true, requestId: 'spam-dropped' };
    }
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0] || 'Veuillez vérifier les informations saisies.';
      return { success: false, error: firstError };
    }

    const listing = listings.find((l) => l.id === params.listingId);
    if (!listing) {
      return { success: false, error: 'Annonce introuvable.' };
    }

    const agency = agencies.find((a) => a.id === listing.agencyId);
    const agencyName = agency ? agency.name : listing.agencyName;

    const newRequestId = `req-${crypto.randomUUID()}`;
    const newRequest: RentalRequest = {
      id: newRequestId,
      listingId: listing.id,
      listingTitle: listing.title,
      listingNeighborhood: listing.neighborhoodName,
      listingRent: listing.monthlyRent,
      agencyId: listing.agencyId,
      agencyName,
      fullName: validation.sanitized.fullName,
      phone: validation.sanitized.phone,
      consentCdp: true,
      email: validation.sanitized.email || '',
      message: validation.sanitized.message || '',
      desiredVisitDate: validation.sanitized.desiredVisitDate || '',
      status: 'nouvelle',
      emailStatus: 'en_attente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Enregistrement sécurisé dans Supabase
    try {
      await supabase.from('requests').insert({
        id: crypto.randomUUID(),
        listing_id: listing.id,
        agency_id: listing.agencyId,
        full_name: validation.sanitized.fullName,
        phone: validation.sanitized.phone,
        email: validation.sanitized.email || null,
        message: validation.sanitized.message || null,
        desired_visit_date: validation.sanitized.desiredVisitDate || null,
        status: 'nouvelle',
        email_status: 'en_attente',
      });
    } catch (supabaseErr) {
      console.warn('[imovex Supabase] Demande non enregistrée dans Supabase:', supabaseErr);
    }

    // 3. Envoi par canal de notification email
    try {
      const gmailResult = await sendVisitEmailViaGmail({
        requestId: newRequestId,
        listingId: listing.id,
        listingTitle: listing.title,
        listingNeighborhood: listing.neighborhoodName,
        listingRent: listing.monthlyRent,
        agencyName,
        fullName: validation.sanitized.fullName,
        phone: validation.sanitized.phone,
        email: validation.sanitized.email || '',
        message: validation.sanitized.message || '',
        desiredVisitDate: validation.sanitized.desiredVisitDate || '',
      });

      if (gmailResult.success) {
        const updatedReq: RentalRequest = {
          ...newRequest,
          emailStatus: 'envoye',
          resendEmailId: gmailResult.messageId,
          emailSentAt: new Date().toISOString(),
        };

        setRequests((prev) => prev.map((r) => (r.id === newRequestId ? updatedReq : r)));

        try {
          await updateDoc(doc(db, 'visit_requests', newRequestId), {
            emailStatus: 'envoye',
            emailSentAt: new Date().toISOString(),
            emailId: gmailResult.messageId,
          });
        } catch {
          // Non blocking
        }
      }
    } catch (mailErr) {
      console.warn('[imovex Gmail Notification] Demande sauvegardée, envoi en tâche de fond');
    }

    // Le locataire a toujours confirmation de sa demande
    return { success: true, requestId: newRequestId };
  };

  // Add listing with Supabase persistence (created in 'en_attente' status until admin validates)
  const addListing = async (
    listingData: Omit<Listing, 'id' | 'slug' | 'viewsCount' | 'confirmationToken' | 'lastAvailabilityConfirmedAt' | 'createdAt' | 'updatedAt'>
  ): Promise<Listing> => {
    const targetAgencyId = activeAgency?.id || listingData.agencyId;

    // Upload base64/dataUrl photos to Supabase Storage if needed
    const photoUrls: string[] = [];
    for (let i = 0; i < (listingData.photos || []).length; i++) {
      const p = listingData.photos[i];
      if (p.publicUrl.startsWith('data:')) {
        try {
          const res = await fetch(p.publicUrl);
          const blob = await res.blob();
          const fileName = `${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}.jpg`;
          const { data: upData } = await supabase.storage.from('property-photos').upload(fileName, blob, {
            contentType: 'image/jpeg',
            upsert: true,
          });
          if (upData) {
            const { data: urlData } = supabase.storage.from('property-photos').getPublicUrl(fileName);
            photoUrls.push(urlData.publicUrl);
          } else {
            photoUrls.push(p.publicUrl);
          }
        } catch {
          photoUrls.push(p.publicUrl);
        }
      } else {
        photoUrls.push(p.publicUrl);
      }
    }

    const { data: rpcRes, error } = await supabase.rpc('agency_create_listing', {
      p_agency_id: targetAgencyId,
      p_neighborhood_id: listingData.neighborhoodId,
      p_title: listingData.title,
      p_property_type: listingData.propertyType,
      p_monthly_rent: Number(listingData.monthlyRent),
      p_deposit_advance: Number(listingData.depositAdvance) || 0,
      p_charges_included: Boolean(listingData.chargesIncluded),
      p_bedrooms: Number(listingData.bedrooms) || 0,
      p_bathrooms: Number(listingData.bathrooms) || 0,
      p_surface_area: listingData.surfaceArea ? Number(listingData.surfaceArea) : 0,
      p_is_furnished: Boolean(listingData.isFurnished),
      p_description: listingData.description,
      p_features: listingData.features || [],
      p_photos: photoUrls,
    });

    if (error || !rpcRes || !rpcRes.success) {
      throw new Error(rpcRes?.error || error?.message || 'Erreur lors de l\'enregistrement de l\'annonce');
    }

    const newId = rpcRes.listingId || `list-${Date.now()}`;
    const newListing: Listing = {
      ...listingData,
      id: newId,
      agencyId: targetAgencyId,
      status: 'en_attente',
      photos: photoUrls.map((url, idx) => ({
        id: `p-${idx}`,
        listingId: newId,
        storagePath: url,
        publicUrl: url,
        position: idx + 1,
        isPrimary: idx === 0,
      })),
      slug: generateListingSlug(listingData.title, listingData.neighborhoodName),
      viewsCount: 0,
      confirmationToken: `token-${Math.random().toString(36).substring(2, 10)}`,
      lastAvailabilityConfirmedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setListings((prev) => [newListing, ...prev]);

    if (targetAgencyId) {
      void supabase.rpc('get_agency_listings', { p_agency_id: targetAgencyId }).then(({ data: agencyListings }: any) => {
        if (agencyListings && Array.isArray(agencyListings)) {
          setListings((prev) => [...agencyListings, ...prev.filter((l) => l.agencyId !== targetAgencyId)]);
        }
      });
    }

    return newListing;
  };

  // Update listing with Firestore persistence
  const updateListing = async (id: string, updates: Partial<Listing>) => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
      )
    );

    try {
      await updateDoc(doc(db, 'properties', id), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('[imovex Firestore] Mise à jour annonce locale:', err);
    }
  };

  // Delete listing
  const deleteListing = async (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    try {
      await deleteDoc(doc(db, 'properties', id));
    } catch (err) {
      console.warn('[imovex Firestore] Suppression annonce locale:', err);
    }
  };

  // Update status (disponible, reserve, loue, masque, en_attente) with Supabase persistence
  const updateListingStatus = async (id: string, newStatus: ListingStatus) => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: newStatus,
              lastAvailabilityConfirmedAt:
                newStatus === 'disponible' ? new Date().toISOString() : l.lastAvailabilityConfirmedAt,
              updatedAt: new Date().toISOString(),
            }
          : l
      )
    );

    try {
      await supabase.rpc('admin_update_listing_status', {
        p_listing_id: id,
        p_status: newStatus,
      });
    } catch (err) {
      console.warn('[imovex Supabase] Mise à jour statut annonce:', err);
    }
  };

  // Confirm availability
  const confirmListingAvailability = (tokenOrId: string): boolean => {
    let found = false;
    setListings((prev) =>
      prev.map((l) => {
        if (l.confirmationToken === tokenOrId || l.id === tokenOrId) {
          found = true;
          const updated = {
            ...l,
            status: 'disponible' as ListingStatus,
            lastAvailabilityConfirmedAt: new Date().toISOString(),
            reminderSentAt: undefined,
            updatedAt: new Date().toISOString(),
          };
          updateListing(l.id, {
            status: 'disponible',
            lastAvailabilityConfirmedAt: updated.lastAvailabilityConfirmedAt,
          });
          return updated;
        }
        return l;
      })
    );
    return found;
  };

  // Register agency via Supabase
  const registerAgency = async (data: {
    name: string;
    contactEmail: string;
    phone: string;
    password: string;
    address?: string;
    ninea?: string;
  }): Promise<Agency> => {
    const { data: res, error } = await supabase.rpc('register_agency', {
      p_name: data.name.trim(),
      p_email: data.contactEmail.trim().toLowerCase(),
      p_password: data.password,
      p_phone: data.phone.trim(),
      p_address: data.address?.trim() || '',
      p_ninea: data.ninea?.trim() || '',
    });

    if (error || !res || !res.success) {
      throw new Error(res?.error || error?.message || 'Erreur lors de la création du compte agence');
    }

    const dummyAgency: Agency = {
      id: `temp-${Date.now()}`,
      name: data.name.trim(),
      slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      contactEmail: data.contactEmail.trim().toLowerCase(),
      phone: data.phone.trim(),
      address: data.address || '',
      ninea: data.ninea || '',
      status: 'pending',
      isAdmin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAgencies((previous) => [...previous.filter((item) => item.contactEmail !== dummyAgency.contactEmail), dummyAgency]);
    return dummyAgency;
  };

  // Admin update agency status via Supabase
  const updateAgencyStatus = async (agencyId: string, status: 'approved' | 'rejected' | 'suspended', reason?: string) => {
    setAgencies((prev) =>
      prev.map((a) =>
        a.id === agencyId ? { ...a, status, rejectionReason: reason, updatedAt: new Date().toISOString() } : a
      )
    );

    try {
      await supabase.rpc('admin_update_agency_status', {
        p_agency_id: agencyId,
        p_status: status,
        p_reason: reason || null,
      });
    } catch (err) {
      console.warn('[imovex Supabase] Erreur mise à jour agence:', err);
    }
  };

  // Admin update request status
  const updateRequestStatus = async (requestId: string, status: RequestStatus) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status, updatedAt: new Date().toISOString() } : r
      )
    );

    try {
      await updateDoc(doc(db, 'visit_requests', requestId), {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      // Non blocking
    }
  };

  // Admin resend email
  const resendRequestEmail = async (requestId: string): Promise<{ success: boolean; message: string }> => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Demande introuvable.' };

    const gmailResult = await sendVisitEmailViaGmail({
      requestId: req.id,
      listingId: req.listingId,
      listingTitle: req.listingTitle,
      listingNeighborhood: req.listingNeighborhood,
      listingRent: req.listingRent,
      agencyName: req.agencyName,
      fullName: req.fullName,
      phone: req.phone,
      email: req.email,
      message: req.message,
      desiredVisitDate: req.desiredVisitDate,
    });

    if (gmailResult.success) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, emailStatus: 'envoye', emailErrorMessage: undefined, emailSentAt: new Date().toISOString() }
            : r
        )
      );
      return { success: true, message: `Email expédié via l'API Gmail vers ${ADMIN_EMAIL} !` };
    } else {
      return { success: false, message: 'Échec de renvoi via Gmail.' };
    }
  };

  const toggleNeighborhoodStatus = (id: string) => {
    setNeighborhoods((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isActive: !n.isActive } : n))
    );
  };

  const resetToInitialData = () => {
    localStorage.removeItem(STORAGE_KEY_LISTINGS);
    localStorage.removeItem(STORAGE_KEY_NEIGHBORHOODS);
    setListings(INITIAL_LISTINGS);
    setAgencies(INITIAL_AGENCIES);
    setRequests([]);
    setNeighborhoods(INITIAL_NEIGHBORHOODS);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        setCurrentRole,
        activeAgency,
        setActiveAgencyId,
        adminEmail: ADMIN_EMAIL,
        isGoogleAuthenticated: Boolean(currentUser),
        loginWithGoogle,
        logoutUser,
        tenantProfile,
        loginTenantDirect,
        loginTenantWithGoogle,
        logoutTenant,
        isAdminAuthenticated,
        loginAdminWithCredentials,
        loginAdminWithGoogle,
        logoutAdmin,
        isAgencyAuthenticated,
        loginAgency,
        logoutAgency,
        neighborhoods,
        listings,
        agencies,
        requests,
        isFirestoreSyncing,
        submitRentalRequest,
        incrementListingViews,
        addListing,
        updateListing,
        deleteListing,
        updateListingStatus,
        confirmListingAvailability,
        registerAgency,
        updateAgencyStatus,
        updateRequestStatus,
        resendRequestEmail,
        toggleNeighborhoodStatus,
        resetToInitialData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
