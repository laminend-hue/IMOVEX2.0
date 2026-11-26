import React, { useState } from 'react';
import { 
  PlusCircle, Edit, Trash2, Clock, CheckCircle, AlertTriangle, 
  Eye, EyeOff, RefreshCw, Building2, ShieldAlert, Check, ShieldCheck, Link2,
  Lock, LogOut, AlertCircle
} from 'lucide-react';
import { Listing, ListingStatus } from '../../types/database.ts';
import { useApp } from '../../lib/store/appStore.tsx';
import { formatFCFA, formatDateFR } from '../../lib/utils/formatters.ts';
import { evaluateListingFreshness } from '../../lib/utils/staleCheck.ts';
import { AgencyListingFormModal } from './AgencyListingFormModal.tsx';
import { ImovexLogo } from '../common/ImovexLogo.tsx';

interface AgencyDashboardViewProps {
  onOpenCreateModal?: boolean;
  onNavigate?: (view: string) => void;
}

export const AgencyDashboardView: React.FC<AgencyDashboardViewProps> = ({ onOpenCreateModal, onNavigate }) => {
  const { 
    activeAgency, listings, updateListingStatus, deleteListing, 
    confirmListingAvailability, registerAgency, agencies, setActiveAgencyId,
    isAgencyAuthenticated, loginAgency, logoutAgency
  } = useApp();

  const [modalOpen, setModalOpen] = useState(Boolean(onOpenCreateModal));
  const [listingToEdit, setListingToEdit] = useState<Listing | null>(null);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);
  const [copiedDirectLink, setCopiedDirectLink] = useState(false);

  // Agency access gate authentication state
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isVerifyingPasskey, setIsVerifyingPasskey] = useState(false);

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [regPhone, setRegPhone] = useState('+221 ');
  const [regAddress, setRegAddress] = useState('');
  const [regNinea, setRegNinea] = useState('');

  const directAgencyUrl = typeof window !== 'undefined' ? `${window.location.origin}/espace-agence` : '/espace-agence';

  const handleCopyDirectLink = () => {
    navigator.clipboard?.writeText(directAgencyUrl);
    setCopiedDirectLink(true);
    setTimeout(() => setCopiedDirectLink(false), 2500);
  };

  const agencyListings = listings.filter((l) => l.agencyId === activeAgency?.id);

  const handleConfirmFreshness = (listingId: string, title: string) => {
    confirmListingAvailability(listingId);
    setConfirmationNotice(`Disponibilité confirmée avec succès pour « ${title} » ! L'annonce reste active.`);
    setTimeout(() => setConfirmationNotice(null), 4000);
  };

  const handlePasskeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasskeyError(null);
    setIsVerifyingPasskey(true);
    try {
      const res = await loginAgency(loginEmail, loginPassword) as any;
      if (res && typeof res === 'object') {
        if (!res.success) {
          setPasskeyError(res.error || 'Adresse, mot de passe incorrects ou compte agence introuvable.');
        }
      } else if (!res) {
        setPasskeyError('Adresse, mot de passe incorrects ou compte agence introuvable.');
      }
    } catch (err: any) {
      setPasskeyError(err?.message || 'Connexion impossible. Réessayez.');
    } finally {
      setIsVerifyingPasskey(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationError(null);
    try {
      await registerAgency({
        name: regName.trim(),
        contactEmail: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        address: regAddress.trim(),
        ninea: regNinea.trim(),
      });
      setRegisterModalOpen(false);
      setPasskeyError(null);
      setConfirmationNotice('✅ Demande d\'intégration envoyée ! Elle est maintenant visible sur le tableau de bord administrateur pour validation.');
    } catch (error: any) {
      setRegistrationError(error?.message || 'Erreur lors de l\'enregistrement de votre agence.');
    }
  };

  // If agency is not authenticated, render Agency Access Gate
  if (!isAgencyAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 transition-colors">
          <div className="text-center space-y-3">
            <ImovexLogo size="lg" className="mx-auto shadow-md border-emerald-500/30" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Portail Agence Partenaire Sécurisé
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cet espace est accessible par son lien direct : <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-emerald-700 dark:text-emerald-400 font-semibold">/espace-agence</code>
            </p>
          </div>

          {confirmationNotice && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{confirmationNotice}</span>
            </div>
          )}

          {passkeyError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{passkeyError}</span>
            </div>
          )}

          <div className="space-y-3">
            <form onSubmit={handlePasskeySubmit} className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Adresse email
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                    title={showLoginPassword ? "Masquer" : "Afficher"}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isVerifyingPasskey}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {isVerifyingPasskey ? 'Connexion…' : 'Se connecter'}
              </button>

             </form>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <button
              onClick={() => setRegisterModalOpen(true)}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Inscrire une nouvelle agence
            </button>
            {onNavigate && (
              <button
                onClick={() => onNavigate('home')}
                className="hover:underline cursor-pointer"
              >
                Retour au site public
              </button>
            )}
          </div>
        </div>

        {/* Modal inscription agence partenaire accessible même déconnecté */}
        {registerModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Inscrire une agence partenaire
                </h3>
                <button
                  onClick={() => setRegisterModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nom de l'agence *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : Dakar Immo Prestige"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email de contact professionnel *</label>
                  <input
                    type="email"
                    required
                    placeholder="contact@agence.sn"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400">Strictement confidentiel, jamais affiché aux locataires.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mot de passe du compte *
                  </label>
                  <div className="relative">
                    <input 
                      type={showRegPassword ? "text" : "password"} 
                      required 
                      minLength={6} 
                      autoComplete="new-password" 
                      value={regPassword} 
                      onChange={(e) => setRegPassword(e.target.value)} 
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                      title={showRegPassword ? "Masquer" : "Afficher"}
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="mt-1 block text-[10px] font-normal text-slate-400">6 caractères minimum.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Téléphone de l'agence *</label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Numéro NINEA (Sénégal)</label>
                  <input
                    type="text"
                    placeholder="001234567 2X9"
                    value={regNinea}
                    onChange={(e) => setRegNinea(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Adresse à Dakar</label>
                  <input
                    type="text"
                    placeholder="Route de Ouakam, Dakar"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                {registrationError && <p role="alert" className="rounded-lg bg-rose-50 p-2 text-xs text-rose-700">{registrationError}</p>}
                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRegisterModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Soumettre l'inscription
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Toast de confirmation */}
      {confirmationNotice && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{confirmationNotice}</span>
          </div>
          <button
            onClick={() => setConfirmationNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold cursor-pointer"
          >
            Fermer
          </button>
        </div>
      )}

      {/* En-tête de l'espace agence avec lien direct */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            <Building2 className="w-4 h-4" />
            <span>Portail Partenaire Agence (Lien direct : /espace-agence)</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            {activeAgency?.name || 'Tableau de bord agence'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gérez vos annonces, ajustez leur disponibilité en temps réel et préservez leur visibilité.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sélecteur d'agence certifiée */}
          <select
            value={activeAgency?.id || ''}
            onChange={(e) => setActiveAgencyId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
            title="Changer d'agence active"
          >
            {agencies.map((ag) => (
              <option key={ag.id} value={ag.id} className="dark:bg-slate-900 dark:text-white">
                Agence : {ag.name} ({ag.status === 'approved' ? 'Certifiée' : 'En attente'})
              </option>
            ))}
          </select>

          <button
            onClick={handleCopyDirectLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors shadow-2xs cursor-pointer"
            title="Copier le lien direct vers cet espace pour le partager aux collaborateurs de l'agence"
          >
            {copiedDirectLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Lien copié !</span>
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Copier lien direct</span>
              </>
            )}
          </button>

          {onNavigate && (
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl transition-colors cursor-pointer"
            >
              Voir site public
            </button>
          )}

          <button
            onClick={() => setRegisterModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl transition-colors cursor-pointer"
          >
            Inscrire nouvelle agence
          </button>

          <button
            onClick={logoutAgency}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors shadow-2xs cursor-pointer"
            title="Verrouiller et quitter l'espace agence"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
          
          <button
            onClick={() => {
              setListingToEdit(null);
              setModalOpen(true);
            }}
            disabled={activeAgency?.status !== 'approved'}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nouvelle annonce</span>
          </button>
        </div>
      </div>

      {/* Avertissement compte en attente de validation */}
      {activeAgency?.status === 'pending' && (
        <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <h4 className="font-bold text-sm">Compte agence en attente de validation</h4>
            <p className="mt-0.5">
              Votre agence est actuellement en cours d'examen par l'administrateur. Vos annonces ne seront visibles dans les résultats publics qu'une fois votre compte validé. Vous pouvez d'ores et déjà préparer vos fiches.
            </p>
          </div>
        </div>
      )}

      {/* Résumé des statistiques agence */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Annonces</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
            {agencyListings.length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Disponibles</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            {agencyListings.filter(l => l.status === 'disponible').length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Réservés / Loués</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
            {agencyListings.filter(l => l.status === 'reserve' || l.status === 'loue').length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Consultations totales</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
            {agencyListings.reduce((sum, l) => sum + l.viewsCount, 0)}
          </div>
        </div>
      </div>

      {/* Liste des annonces de l'agence */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">
            Mes biens immobiliers ({agencyListings.length})
          </h2>
          <span className="text-xs text-slate-400">
            Changement de statut en 1 clic
          </span>
        </div>

        {agencyListings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">
              Aucune annonce publiée pour le moment
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Commencez à publier vos appartements et villas pour recevoir des demandes qualifiées.
            </p>
            <button
              onClick={() => {
                setListingToEdit(null);
                setModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
            >
              Publier mon premier bien
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {agencyListings.map((listing) => {
              const freshness = evaluateListingFreshness(listing.lastAvailabilityConfirmedAt, listing.status);
              const primaryPhoto = listing.photos.find(p => p.isPrimary) || listing.photos[0];

              return (
                <div
                  key={listing.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors"
                >
                  {/* Photo miniature & Informations */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="w-24 h-20 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                      {primaryPhoto ? (
                        <img
                          src={primaryPhoto.publicUrl}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                          Photo
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-slate-800">{listing.neighborhoodName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{listing.propertyType}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-bold text-emerald-700 tabular-nums">
                          {formatFCFA(listing.monthlyRent, true)}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 truncate mt-0.5">
                        {listing.title}
                      </h3>

                      {/* Alerte fraîcheur / Anti-périmé / En attente de validation */}
                      <div className="flex items-center gap-3 text-[11px] mt-2">
                        {listing.status === 'en_attente' && (
                          <div className="inline-flex items-center gap-1.5 text-amber-800 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 px-2.5 py-1 rounded-lg font-bold text-xs">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>⏳ En attente de validation par l'administrateur IMOVEX</span>
                          </div>
                        )}

                        {listing.status !== 'en_attente' && freshness.statusLabel === 'warning' && (
                          <div className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>Non confirmée depuis {freshness.daysSinceConfirmation}j</span>
                            <button
                              onClick={() => handleConfirmFreshness(listing.id, listing.title)}
                              className="ml-1 underline font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                            >
                              Confirmer disponibilité
                            </button>
                          </div>
                        )}

                        {freshness.statusLabel === 'expired' && (
                          <div className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-medium">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>Périmée ({freshness.daysSinceConfirmation}j) · Masquée</span>
                            <button
                              onClick={() => handleConfirmFreshness(listing.id, listing.title)}
                              className="ml-1 underline font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                            >
                              Réactiver
                            </button>
                          </div>
                        )}

                        {freshness.statusLabel === 'fresh' && listing.status === 'disponible' && (
                          <span className="text-slate-400 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>À jour (confirmée le {formatDateFR(listing.lastAvailabilityConfirmedAt)})</span>
                          </span>
                        )}

                        <span className="text-slate-400 flex items-center gap-1 ml-auto">
                          <Eye className="w-3 h-3" />
                          <span>{listing.viewsCount} vues</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contrôles de statut rapide & actions */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    
                    {/* Sélecteur de statut rapide */}
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                        Statut
                      </label>
                      <select
                        value={listing.status}
                        onChange={(e) => updateListingStatus(listing.id, e.target.value as ListingStatus)}
                        className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border focus:outline-none cursor-pointer ${
                          listing.status === 'disponible'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : listing.status === 'en_attente'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : listing.status === 'reserve'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : listing.status === 'loue'
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        <option value="en_attente">⏳ En attente</option>
                        <option value="disponible">Disponible</option>
                        <option value="reserve">Réservé</option>
                        <option value="loue">Loué</option>
                        <option value="masque">Masqué</option>
                      </select>
                    </div>

                    {/* Boutons modifier & supprimer */}
                    <div className="flex items-center gap-1.5 pt-3">
                      <button
                        onClick={() => {
                          setListingToEdit(listing);
                          setModalOpen(true);
                        }}
                        title="Modifier l'annonce"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Êtes-vous sûr de vouloir supprimer l'annonce « ${listing.title} » ?`)) {
                            deleteListing(listing.id);
                          }
                        }}
                        title="Supprimer l'annonce"
                        className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:text-white hover:bg-rose-600 hover:border-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal création / édition annonce */}
      <AgencyListingFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setListingToEdit(null);
        }}
        listingToEdit={listingToEdit}
      />

      {/* Modal inscription agence partenaire */}
      {registerModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Inscrire une agence partenaire
              </h3>
              <button
                onClick={() => setRegisterModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nom de l'agence *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Dakar Immo Prestige"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email de contact professionnel *</label>
                <input
                  type="email"
                  required
                  placeholder="contact@agence.sn"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400">Strictement confidentiel, jamais affiché aux locataires.</span>
              </div>

              <label className="block text-xs font-bold text-slate-700">
                Mot de passe du compte *
                <input type="password" required minLength={12} autoComplete="new-password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500" />
                <span className="mt-1 block text-[10px] font-normal text-slate-400">12 caractères minimum.</span>
              </label>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone de l'agence *</label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Numéro NINEA (Sénégal)</label>
                <input
                  type="text"
                  placeholder="001234567 2X9"
                  value={regNinea}
                  onChange={(e) => setRegNinea(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Adresse à Dakar</label>
                <input
                  type="text"
                  placeholder="Route de Ouakam, Dakar"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {registrationError && <p role="alert" className="rounded-lg bg-rose-50 p-2 text-xs text-rose-700">{registrationError}</p>}
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRegisterModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Soumettre l'inscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
