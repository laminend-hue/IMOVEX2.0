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
  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    try {
      if (
        sessionStorage.getItem(STORAGE_KEY_ADMIN_SESSION) === 'true' ||
        localStorage.getItem(STORAGE_KEY_ADMIN_SESSION) === 'true'
      ) {
        return 'admin';
      }
    } catch {
      // ignore
    }
    return 'tenant';
  });
  const [activeAgencyId, setActiveAgencyIdState] = useState<string | null>(() => {
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

  // Fast resilient sync with Firestore: never blocks the app, instant startup (< 1.5s)
  const syncWithFirestore = useCallback(async () => {
    try {
      const propertiesCol = collection(db, 'properties');
      const propertiesQuery = isAdminAuthenticated
        ? query(propertiesCol, limit(100))
        : currentUser && activeAgencyId === currentUser.uid
          ? query(propertiesCol, where('agencyId', '==', currentUser.uid), limit(100))
          : query(propertiesCol, where('status', 'in', ['disponible', 'reserve']), limit(100));
      const propertiesSnap = await getDocs(propertiesQuery);
      const remoteProps = propertiesSnap.docs.map((item) => ({ ...(item.data() as Listing), id: item.id }));
      setListings(remoteProps);
      localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(remoteProps));

      if (isAdminAuthenticated) {
        try {
          const [requestsSnap, agenciesSnap] = await Promise.all([
            getDocs(query(collection(db, 'visit_requests'), limit(100))).catch(() => null),
            getDocs(collection(db, 'agencies')).catch(() => null),
          ]);
          if (requestsSnap && !requestsSnap.empty) {
            setRequests(requestsSnap.docs.map((item) => ({ ...(item.data() as RentalRequest), id: item.id })));
          }
          if (agenciesSnap && !agenciesSnap.empty) {
            setAgencies(agenciesSnap.docs.map((item) => ({ ...(item.data() as Agency), id: item.id })));
          }
        } catch (fetchErr) {
          console.warn('[imovex Firestore] Erreur de lecture admin cloud (mode local résilient):', fetchErr);
        }
      } else if (currentUser) {
        const agencySnap = await getDoc(doc(db, 'agencies', currentUser.uid));
        if (agencySnap.exists()) {
          setAgencies((previous) => [...previous.filter((item) => item.id !== agencySnap.id), { ...(agencySnap.data() as Agency), id: agencySnap.id }]);
        }
      }

      // 3. Listen in real-time to properties updates without throwing
      const unsubProps = onSnapshot(
        propertiesQuery,
        (snapshot) => {
          const liveListings = snapshot.docs.map((item) => ({ ...(item.data() as Listing), id: item.id }));
          setListings(liveListings);
        },
        (error) => {
          console.warn('[imovex Firestore] Écoute properties en mode résilient local:', error?.message);
        }
      );

      // 4. Listen in real-time to visit_requests updates
      const unsubRequests = isAdminAuthenticated ? onSnapshot(
        query(collection(db, 'visit_requests'), limit(100)),
        (snapshot) => setRequests(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as any) }))),
        (error) => console.warn('[imovex Firestore] Écoute des demandes refusée:', error.message)
      ) : undefined;

      return () => {
        unsubProps();
        unsubRequests?.();
      };
    } catch (err) {
      console.warn('[imovex Firestore] Synchronisation locale active:', err);
    }
  }, [isAdminAuthenticated, currentUser?.uid, activeAgencyId]);

  useEffect(() => {
    let cancelled = false;
    let stop: (() => void) | undefined;
    syncWithFirestore().then((unsubscribe) => {
      if (cancelled) unsubscribe?.();
      else stop = unsubscribe;
    });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [syncWithFirestore]);

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

  const activeAgency = agencies.find((a) => a.id === activeAgencyId) || null;

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
    // Nettoyage complet : supprime espaces, tirets et caractères invisibles
    const cleanUser = String(username || '').replace(/[\s\-_]/g, '').trim();
    const cleanPass = String(pass || '').trim();

    if (
      (cleanUser === '2212429193' || cleanUser === '+2212429193') &&
      cleanPass === '221242'
    ) {
      setIsCredentialAdmin(true);
      setCurrentRoleState('admin');
      try {
        sessionStorage.setItem(STORAGE_KEY_ADMIN_SESSION, 'true');
        localStorage.setItem(STORAGE_KEY_ADMIN_SESSION, 'true');
      } catch {
        // ignore
      }
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
    isAdminAuthenticated || (currentUser && activeAgency?.id === currentUser.uid && activeAgency.status === 'approved')
  );

  const loginAgency = async (email: string, password: string): Promise<boolean> => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const profile = await getDoc(doc(db, 'agencies', credential.user.uid));
      if (!credential.user.emailVerified || !profile.exists() || profile.data().status !== 'approved') {
        await signOutGoogle();
        return false;
      }
        const agency = { ...(profile.data() as Agency), id: profile.id };
      setAgencies((previous) => [...previous.filter((item) => item.id !== agency.id), agency]);
      setActiveAgencyIdState(agency.id);
      setCurrentUser(credential.user);
      setCurrentRoleState('agency');
      return true;
    } catch (err) {
      console.warn('[imovex Auth] Connexion agence impossible:', err);
      return false;
    }
  };

  const logoutAgency = () => { void logoutUser(); };

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

    // A request is confirmed only after durable storage succeeds.
    try {
      await setDoc(doc(db, 'visit_requests', newRequestId), newRequest);
    } catch (firestoreErr) {
      console.warn('[imovex Firestore] Demande non enregistrée:', firestoreErr);
      return { success: false, error: 'La demande n’a pas pu être enregistrée. Vérifiez votre connexion et réessayez.' };
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

  // Add listing with Firestore persistence
  const addListing = async (
    listingData: Omit<Listing, 'id' | 'slug' | 'viewsCount' | 'confirmationToken' | 'lastAvailabilityConfirmedAt' | 'createdAt' | 'updatedAt'>
  ): Promise<Listing> => {
    const newId = `list-${Date.now()}`;
    const slug = generateListingSlug(listingData.title, listingData.neighborhoodName);
    const confirmationToken = `token-${Math.random().toString(36).substring(2, 10)}`;

    const newListing: Listing = {
      ...listingData,
      id: newId,
      slug,
      viewsCount: 0,
      confirmationToken,
      lastAvailabilityConfirmedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setListings((prev) => [newListing, ...prev]);

    try {
      await setDoc(doc(db, 'properties', newId), newListing);
      console.log(`[imovex Firestore] Annonce ${newId} ajoutée dans Firestore`);
    } catch (err) {
      console.warn('[imovex Firestore] Annonce conservée localement:', err);
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

  // Update status (disponible, reserve, loue, masque)
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
      await updateDoc(doc(db, 'properties', id), {
        status: newStatus,
        lastAvailabilityConfirmedAt:
          newStatus === 'disponible' ? new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      // Non blocking
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

  // Register agency
  const registerAgency = async (data: {
    name: string;
    contactEmail: string;
    phone: string;
    password: string;
    address?: string;
    ninea?: string;
  }): Promise<Agency> => {
    const normalizedEmail = data.contactEmail.trim().toLowerCase();
    const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, data.password);
    const newAgency: Agency = {
      id: credential.user.uid,
      name: data.name.trim(),
      slug: data.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      contactEmail: normalizedEmail,
      phone: data.phone.trim(),
      address: data.address || '',
      ninea: data.ninea || '',
      status: 'pending',
      isAdmin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'agencies', credential.user.uid), newAgency);
    } catch (error) {
      await deleteUser(credential.user).catch(() => {});
      await signOutGoogle();
      throw error;
    }
    await sendEmailVerification(credential.user);
    setAgencies((previous) => [...previous.filter((item) => item.id !== newAgency.id), newAgency]);
    await signOutGoogle();
    setCurrentUser(null);
    setActiveAgencyIdState(null);
    setCurrentRoleState('tenant');
    return newAgency;
  };

  // Admin update agency status
  const updateAgencyStatus = async (agencyId: string, status: 'approved' | 'rejected' | 'suspended', reason?: string) => {
    setAgencies((prev) =>
      prev.map((a) =>
        a.id === agencyId ? { ...a, status, rejectionReason: reason, updatedAt: new Date().toISOString() } : a
      )
    );

    try {
      await updateDoc(doc(db, 'agencies', agencyId), {
        status,
        rejectionReason: reason || null,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      // Non blocking
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
