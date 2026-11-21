import React, { useState, useEffect } from 'react';
import { 
  Shield, CheckCircle, XCircle, AlertCircle, RefreshCw, 
  Mail, Phone, Calendar, Building, Eye, Clock, Check, 
  MapPin, SlidersHorizontal, Trash2, Send, Link2,
  Activity, Cpu, CheckCircle2, ShieldCheck, Server
} from 'lucide-react';
import { Agency, Listing, RentalRequest, RequestStatus } from '../../types/database.ts';
import { useApp } from '../../lib/store/appStore.tsx';
import { formatFCFA, formatDateFR } from '../../lib/utils/formatters.ts';
import { ImovexLogo } from '../common/ImovexLogo.tsx';

interface AdminDashboardViewProps {
  onNavigate?: (view: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigate }) => {
  const { 
    agencies, updateAgencyStatus, listings, deleteListing, 
    updateListingStatus, requests, updateRequestStatus, resendRequestEmail, 
    neighborhoods, toggleNeighborhoodStatus, adminEmail,
    isAdminAuthenticated, loginAdminWithCredentials, loginAdminWithGoogle, logoutAdmin
  } = useApp();

  const [activeTab, setActiveTab] = useState<'requests' | 'agencies' | 'listings' | 'neighborhoods' | 'ai_sentinel'>('requests');
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>('all');
  const [selectedAgencyFilter, setSelectedAgencyFilter] = useState<string>('all');
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Supervision & Santé Système
  const [aiReport, setAiReport] = useState<any | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [systemHealth, setSystemHealth] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/system/health')
      .then((r) => r.json())
      .then((data) => setSystemHealth(data))
      .catch(() => {});
  }, []);

  const runAiDiagnosis = async () => {
    setIsDiagnosing(true);
    try {
      const res = await fetch('/api/system/ai-diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingsCount: listings.length,
          requestsCount: requests.length,
          activeAgencyName: 'imovex Master Network',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiReport(data);
        setToastMessage({ text: 'Rapport technique généré. Consultez les points à vérifier.', type: 'success' });
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch {
      setToastMessage({ text: 'Serveur inaccessible : diagnostic non réalisé.', type: 'error' });
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Direct link copying & Firebase admin sign-in
  const [copiedDirectLink, setCopiedDirectLink] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const directAdminUrl = typeof window !== 'undefined' ? `${window.location.origin}/admin` : '/admin';

  const handleCopyDirectLink = () => {
    navigator.clipboard?.writeText(directAdminUrl);
    setCopiedDirectLink(true);
    setTimeout(() => setCopiedDirectLink(false), 2500);
  };

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [useGoogleAuth, setUseGoogleAuth] = useState(false);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSigningIn(true);
    try {
      const success = await loginAdminWithCredentials(adminUsername, adminPassword);
      if (!success) {
        setAuthError('Identifiant ou mot de passe incorrect.');
      }
    } catch {
      setAuthError('Erreur lors de la vérification des identifiants.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleAdminSignIn = async () => {
    setAuthError(null);
    setIsSigningIn(true);
    try {
      const success = await loginAdminWithGoogle();
      if (!success) setAuthError('Ce compte Google n’est pas autorisé à administrer IMOVEX.');
    } catch {
      setAuthError('Connexion impossible. Vérifiez la configuration Firebase Auth et réessayez.');
    } finally {
      setIsSigningIn(false);
    }
  };

  // If not authenticated, render Admin Access Gate
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-3">
            <ImovexLogo size="lg" className="mx-auto shadow-md border-sky-500/30" />
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Portail Administrateur Sécurisé
            </h2>
            <p className="text-xs text-slate-500">
              Cet espace est accessible par son lien direct : <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-purple-700 font-semibold">/admin</code>
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {!useGoogleAuth ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Identifiant Administrateur
                </label>
                <input
                  type="text"
                  autoComplete="username"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="2212429193"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="221242"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={isSigningIn}
                className="w-full rounded-xl bg-purple-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-purple-800 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isSigningIn ? 'Vérification…' : 'Accéder au tableau de bord'}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setUseGoogleAuth(true)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Ou se connecter avec un compte Google Admin
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleAdminSignIn}
                disabled={isSigningIn}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
              >
                {isSigningIn ? 'Connexion sécurisée…' : 'Continuer avec Google'}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setUseGoogleAuth(false)}
                  className="text-xs text-purple-700 hover:text-purple-900 underline cursor-pointer"
                >
                  Retour à la connexion par identifiant
                </button>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <button
              type="button"
              onClick={handleCopyDirectLink}
              className="text-purple-700 hover:text-purple-900 font-semibold cursor-pointer"
            >
              {copiedDirectLink ? '✓ Lien copié !' : 'Copier le lien direct (/admin)'}
            </button>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Retour au site public
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 30 days stats calculations
  const totalActiveListings = listings.filter(l => l.status === 'disponible').length;
  const totalViews = listings.reduce((sum, l) => sum + l.viewsCount, 0);
  const totalRequests = requests.length;
  const pendingAgenciesCount = agencies.filter(a => a.status === 'pending').length;
  const failedEmailsCount = requests.filter(r => r.emailStatus === 'email_en_echec').length;

  const requestsByStatus = {
    nouvelle: requests.filter(r => r.status === 'nouvelle').length,
    transmise: requests.filter(r => r.status === 'transmise').length,
    visite_planifiee: requests.filter(r => r.status === 'visite_planifiee').length,
    conclue: requests.filter(r => r.status === 'conclue').length,
    sans_suite: requests.filter(r => r.status === 'sans_suite').length,
  };

  const filteredRequests = requests.filter((r) => {
    if (requestStatusFilter !== 'all' && r.status !== requestStatusFilter) return false;
    if (selectedAgencyFilter !== 'all' && r.agencyId !== selectedAgencyFilter) return false;
    return true;
  });

  const handleResend = async (requestId: string) => {
    setResendingId(requestId);
    const res = await resendRequestEmail(requestId);
    setResendingId(null);
    if (res.success) {
      setToastMessage({ text: res.message, type: 'success' });
    } else {
      setToastMessage({ text: res.message, type: 'error' });
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Toast de notification */}
      {toastMessage && (
        <div className={`mb-6 p-4 rounded-xl text-sm flex items-center justify-between shadow-xs ${
          toastMessage.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs font-semibold cursor-pointer">
            Fermer
          </button>
        </div>
      )}

      {/* En-tête Admin avec actions de lien direct et déconnexion */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
            <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Panneau Administrateur Master (Lien direct : /admin)</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Supervision & Gestion des Demandes
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Email centralisé de réception : <strong className="font-semibold text-slate-800 dark:text-slate-200">{adminEmail}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCopyDirectLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-xl transition-colors shadow-2xs cursor-pointer"
            title="Copier l'URL directe pour vos favoris administrateur"
          >
            {copiedDirectLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Lien copié !</span>
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Copier lien direct (/admin)</span>
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
            onClick={logoutAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl transition-colors cursor-pointer"
            title="Verrouiller la session administrateur"
          >
            Déconnexion
          </button>

          {failedEmailsCount > 0 && (
            <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{failedEmailsCount} en échec</span>
            </div>
          )}
        </div>
      </div>

      {/* Cartes de statistiques 30 jours */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Annonces Actives</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
            {totalActiveListings}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">sur {listings.length} biens au total</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Vues Cumulées (30j)</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            {totalViews}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">trafic organique locataires</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Demandes Reçues</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
            {totalRequests}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {requestsByStatus.nouvelle} nouvelles à traiter
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Agences en attente</div>
          <div className={`text-2xl font-black mt-1 tabular-nums ${pendingAgenciesCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
            {pendingAgenciesCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">sur {agencies.length} agences enregistrées</div>
        </div>
      </div>

      {/* Bandeau Supervision Système Continue */}
      <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-md border border-purple-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center font-bold shrink-0">
            <Activity className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-tight">État du serveur</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                {systemHealth ? 'Serveur joignable' : 'État non vérifié'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              La base Firebase, les règles d’accès et l’envoi des emails doivent être vérifiés séparément.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setActiveTab('ai_sentinel');
            runAiDiagnosis();
          }}
          disabled={isDiagnosing}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
        >
          <Activity className={`w-3.5 h-3.5 ${isDiagnosing ? 'animate-spin' : ''}`} />
          <span>{isDiagnosing ? 'Audit en cours...' : 'Diagnostic Système'}</span>
        </button>
      </div>

      {/* Onglets de navigation Admin */}
      <div className="mt-8 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex overflow-x-auto gap-4 scrollbar-none pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 whitespace-nowrap">
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Demandes locataires</span>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full text-[10px]">
              {requests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('agencies')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'agencies'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Modération agences</span>
            {pendingAgenciesCount > 0 && (
              <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                {pendingAgenciesCount} en attente
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'listings'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Modération annonces</span>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full text-[10px]">
              {listings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('neighborhoods')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'neighborhoods'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Quartiers de Dakar</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('ai_sentinel');
              if (!aiReport) runAiDiagnosis();
            }}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ai_sentinel'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Supervision & Sécurité</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>
        </div>
      </div>

      {/* CONTENU ONGLETS */}

      {/* 1. ONGLET DEMANDES */}
      {activeTab === 'requests' && (
        <div className="mt-6 space-y-4">
          
          {/* Filtres de demandes */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filtrer par statut :</span>
              <select
                value={requestStatusFilter}
                onChange={(e) => setRequestStatusFilter(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">Tous les statuts ({requests.length})</option>
                <option value="nouvelle">Nouvelle ({requestsByStatus.nouvelle})</option>
                <option value="transmise">Transmise à l'agence ({requestsByStatus.transmise})</option>
                <option value="visite_planifiee">Visite planifiée ({requestsByStatus.visite_planifiee})</option>
                <option value="conclue">Conclue ({requestsByStatus.conclue})</option>
                <option value="sans_suite">Sans suite ({requestsByStatus.sans_suite})</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Agence :</span>
              <select
                value={selectedAgencyFilter}
                onChange={(e) => setSelectedAgencyFilter(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">Toutes les agences</option>
                {agencies.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Liste des demandes */}
          {filteredRequests.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
              Aucune demande ne correspond aux critères sélectionnés.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className={`bg-white rounded-xl border p-4 sm:p-5 shadow-xs transition-all ${
                    req.emailStatus === 'email_en_echec'
                      ? 'border-rose-300 bg-rose-50/30'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    
                    {/* Bloc informations locataire */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{req.fullName}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <a
                          href={`tel:${req.phone}`}
                          className="text-xs font-mono font-semibold text-emerald-700 hover:underline"
                        >
                          {req.phone}
                        </a>
                        {req.email && (
                          <>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span className="text-xs text-slate-500 truncate">{req.email}</span>
                          </>
                        )}
                      </div>

                      <div className="text-xs text-slate-600">
                        <strong className="text-slate-800 font-semibold">{req.listingTitle}</strong> ({req.listingNeighborhood})
                        <span className="text-slate-400 ml-1">· Agence : {req.agencyName}</span>
                      </div>

                      {req.desiredVisitDate && (
                        <div className="text-xs text-emerald-800 flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Visite souhaitée le : {formatDateFR(req.desiredVisitDate)}</span>
                        </div>
                      )}

                      {req.message && (
                        <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-700 italic border border-slate-100 max-w-2xl">
                          "{req.message}"
                        </div>
                      )}

                      <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-2">
                        <span>Reçue le {formatDateFR(req.createdAt)}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-[10px]">ID: {req.id}</span>
                      </div>
                    </div>

                    {/* Bloc Statut & Actions */}
                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
                      
                      {/* Statut d'envoi de l'email */}
                      {req.emailStatus === 'email_en_echec' ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                            Email en échec
                          </span>
                          <button
                            onClick={() => handleResend(req.id)}
                            disabled={resendingId === req.id}
                            className="px-2.5 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <Send className="w-3 h-3" />
                            <span>{resendingId === req.id ? 'Renvoi...' : 'Renvoyer l\'email'}</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Email transmis à {adminEmail}</span>
                        </span>
                      )}

                      {/* Sélecteur de statut de la demande */}
                      <div className="flex items-center gap-2 pt-1">
                        <label className="text-[11px] text-slate-400 font-semibold uppercase">Statut :</label>
                        <select
                          value={req.status}
                          onChange={(e) => updateRequestStatus(req.id, e.target.value as RequestStatus)}
                          className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none cursor-pointer"
                        >
                          <option value="nouvelle">Nouvelle</option>
                          <option value="transmise">Transmise à l'agence</option>
                          <option value="visite_planifiee">Visite planifiée</option>
                          <option value="conclue">Conclue (Bail signé)</option>
                          <option value="sans_suite">Sans suite</option>
                        </select>
                      </div>

                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* 2. ONGLET AGENCES */}
      {activeTab === 'agencies' && (
        <div className="mt-6 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Agences Immobilières Partenaires ({agencies.length})
              </h3>
              <span className="text-xs text-slate-500">
                Validation obligatoire avant publication publique
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {agencies.map((agency) => (
                <div key={agency.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{agency.name}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        agency.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : agency.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {agency.status === 'approved' ? 'Validée' : agency.status === 'pending' ? 'En attente' : agency.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                      <span>Email : {agency.contactEmail}</span>
                      <span aria-hidden="true">·</span>
                      <span>Tél : {agency.phone}</span>
                      {agency.ninea && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>NINEA : {agency.ninea}</span>
                        </>
                      )}
                    </div>
                    {agency.address && (
                      <div className="text-xs text-slate-400">
                        {agency.address}
                      </div>
                    )}
                  </div>

                  {/* Boutons d'action modération */}
                  <div className="flex items-center gap-2">
                    {agency.status !== 'approved' && (
                      <button
                        onClick={() => {
                          updateAgencyStatus(agency.id, 'approved');
                          setToastMessage({ text: `Agence « ${agency.name} » validée avec succès !`, type: 'success' });
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Valider l'agence</span>
                      </button>
                    )}

                    {agency.status !== 'suspended' && (
                      <button
                        onClick={() => {
                          updateAgencyStatus(agency.id, 'suspended', 'Suspendue par l\'administrateur');
                          setToastMessage({ text: `Agence « ${agency.name} » suspendue.`, type: 'error' });
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Suspendre
                      </button>
                    )}

                    {agency.status !== 'rejected' && agency.status === 'pending' && (
                      <button
                        onClick={() => {
                          updateAgencyStatus(agency.id, 'rejected', 'Dossier incomplet');
                          setToastMessage({ text: `Agence « ${agency.name} » refusée.`, type: 'error' });
                        }}
                        className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Refuser
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. ONGLET ANNONCES */}
      {activeTab === 'listings' && (
        <div className="mt-6 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Toutes les annonces imovex ({listings.length})
              </h3>
              <span className="text-xs text-slate-500">
                Modération et contrôle des statuts
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {listings.map((item) => (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-900">{item.title}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-emerald-700 font-semibold">{formatFCFA(item.monthlyRent, true)}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {item.neighborhoodName} · Agence : {item.agencyName} · {item.viewsCount} vues
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={item.status}
                      onChange={(e) => updateListingStatus(item.id, e.target.value as any)}
                      className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 cursor-pointer"
                    >
                      <option value="disponible">Disponible</option>
                      <option value="reserve">Réservé</option>
                      <option value="loue">Loué</option>
                      <option value="masque">Masqué</option>
                    </select>

                    <button
                      onClick={() => {
                        if (confirm(`Supprimer définitivement « ${item.title} » ?`)) {
                          deleteListing(item.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. ONGLET QUARTIERS */}
      {activeTab === 'neighborhoods' && (
        <div className="mt-6 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Référentiel des Quartiers & Communes de Dakar ({neighborhoods.length})
              </h3>
              <span className="text-xs text-slate-500">
                Activé / Désactivé dans le moteur de recherche
              </span>
            </div>

            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {neighborhoods.map((n) => (
                <div
                  key={n.id}
                  onClick={() => toggleNeighborhoodStatus(n.id)}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                    n.isActive
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                  }`}
                >
                  <span>{n.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${n.isActive ? 'bg-emerald-200 text-emerald-950' : 'bg-slate-200 text-slate-500'}`}>
                    {n.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. ONGLET SUPERVISION SYSTÈME & HAUTE DISPONIBILITÉ */}
      {activeTab === 'ai_sentinel' && (
        <div className="mt-6 space-y-6">
          
          {/* Header Supervision */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-2xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Centre de Supervision & Sécurité imovex
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    Rapport technique indicatif
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vérifiez les services externes dans leurs consoles respectives.
                </p>
              </div>
            </div>

            <button
              onClick={runAiDiagnosis}
              disabled={isDiagnosing}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isDiagnosing ? 'animate-spin' : ''}`} />
              <span>{isDiagnosing ? 'Audit en cours...' : 'Exécuter un diagnostic'}</span>
            </button>
          </div>

          {/* Grille des 4 Piliers de Résilience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Routage SPA & Serveur</span>
                <Server className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-base font-extrabold text-slate-900">
                Routes configurées
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Passerelles directes pour <code>/admin</code> et <code>/espace-agence</code> avec sécurité renforcée.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Base de Données</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-base font-extrabold text-slate-900">
                Firebase à vérifier
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Stockage persistant sécurisé avec règles de contrôle d'accès ABAC et intégrité transactionnelle.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Protection Anti-Crash</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-base font-extrabold text-slate-900">
                Protection partielle
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Intercepteurs globaux d'exceptions et de rejets asynchrones actifs au niveau processus.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Canal de Notification</span>
                <Mail className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-base font-extrabold text-slate-900">
                Configuration à vérifier
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                La livraison email dépend d’un fournisseur configuré sur le serveur.
              </p>
            </div>
          </div>

          {/* Rapport d'Audit Système */}
          {aiReport && (
            <div className="bg-white rounded-2xl border border-emerald-200 overflow-hidden shadow-xs animate-in fade-in duration-200">
              <div className="p-5 bg-emerald-50/70 border-b border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h4 className="font-extrabold text-sm text-emerald-950">
                      Rapport d'Audit Système & Sécurité
                    </h4>
                    <p className="text-[11px] text-emerald-700">
                      Généré le {formatDateFR(aiReport.diagnosedAt || new Date().toISOString())}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="text-xs font-semibold text-slate-600">Score de santé globale :</span>
                  <span className="text-sm font-black text-amber-700">
                    {typeof aiReport.healthScore === 'number' ? `${aiReport.healthScore} / 100` : 'Non vérifié'}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Verdict Diagnostic */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">
                    Statut Opérationnel :
                  </div>
                  <p className="text-slate-900 font-semibold leading-relaxed">
                    « {aiReport.aiVerdict || 'Le diagnostic n’a pas renvoyé de verdict.'} »
                  </p>
                </div>

                {/* Modules audités */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Contrôle des Modules Vitaux
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(aiReport.modulesChecked || []).map((m: any, idx: number) => (
                      <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{m.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${m.status === 'VALIDE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {m.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{m.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommandation proactive */}
                {aiReport.recommendation && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Recommandation du système : </span>
                      <span>{aiReport.recommendation}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Télémétrie brute en direct */}
          {systemHealth && (
            <div className="p-4 rounded-xl bg-slate-900 text-slate-300 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span>TÉLÉMÉTRIE SYSTÈME EN DIRECT</span>
                <span className="text-emerald-400">● ACTIF</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>Uptime serveur : <span className="text-white font-bold">{systemHealth.uptimeSeconds}s</span></div>
                <div>Mémoire RSS : <span className="text-white font-bold">{systemHealth.memoryRssMB} MB</span></div>
                <div>Demandes en cache : <span className="text-white font-bold">{systemHealth.totalRequestsStored}</span></div>
                <div>Base Firestore : <span className="text-white font-bold">Connectée</span></div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
