import React from 'react';
import { X, ShieldCheck, FileText, Lock } from 'lucide-react';

interface LegalModalProps {
  type: 'mentions' | 'cgu' | 'confidentialite' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 max-h-[85vh] flex flex-col transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold">
              {type === 'mentions' && 'Mentions Légales — imovex'}
              {type === 'cgu' && 'Conditions Générales d\'Utilisation (CGU)'}
              {type === 'confidentialite' && 'Politique de Confidentialité (Loi CDP Sénégal)'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {type === 'mentions' && (
            <>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">1. Éditeur de la plateforme</h3>
              <p>
                Le site <strong>imovex</strong> est une plateforme de mise en relation immobilière opérant au Sénégal (Dakar).
                Contact administratif et modération : <code>lmsite.creator@gmail.com</code>.
              </p>
              <h3 className="text-sm font-bold text-slate-900 mt-4">2. Hébergement & Infrastructure</h3>
              <p>
                L'application est déployée sur une infrastructure de serveurs cloud sécurisés haute disponibilité. Les données sont protégées par des règles d'accès strictes (ABAC), le stockage multimédia est chiffré au repos et en transit, et les échanges de notifications sont sécurisés conformément aux exigences de la législation sénégalaise relative aux données à caractère personnel (CDP).
              </p>
              <h3 className="text-sm font-bold text-slate-900 mt-4">3. Propriété Intellectuelle</h3>
              <p>
                Les marques, logos et interfaces graphiques sont la propriété exclusive d'imovex. Les photographies et descriptifs d'annonces sont publiés sous la responsabilité des agences partenaires agréées.
              </p>
            </>
          )}

          {type === 'cgu' && (
            <>
              <h3 className="text-sm font-bold text-slate-900">1. Objet du service</h3>
              <p>
                imovex permet aux locataires de rechercher des logements à Dakar et de transmettre des demandes de visite sans intermédiaire public visible. Les agences partenaires vérifiées disposent d'un espace dédié pour gérer leurs annonces.
              </p>
              <h3 className="text-sm font-bold text-slate-900 mt-4">2. Confidentialité des agences</h3>
              <p>
                Afin de garantir un suivi rigoureux et d'éviter le démarchage intempestif, aucune coordonnée téléphonique ou email d'agence n'est divulguée directement au public. Chaque demande est enregistrée et transmise par la plateforme imovex vers l'agence concernée.
              </p>
              <h3 className="text-sm font-bold text-slate-900 mt-4">3. Règle anti-annonces périmées</h3>
              <p>
                Toute annonce dont la disponibilité n'est pas confirmée au terme d'un délai de 14 jours fait l'objet d'un rappel automatique à l'agence. En l'absence de confirmation sous 7 jours supplémentaires, elle est automatiquement masquée des résultats publics.
              </p>
            </>
          )}

          {type === 'confidentialite' && (
            <>
              <h3 className="text-sm font-bold text-slate-900">1. Cadre Légal (Loi sénégalaise n° 2008-12)</h3>
              <p>
                Conformément à la Loi n° 2008-12 du 25 janvier 2008 portant sur la protection des données à caractère personnel au Sénégal, régie par la Commission de Protection des Données Personnelles (CDP), imovex s'engage à préserver la sécurité et la confidentialité des informations collectées.
              </p>
              <h3 className="text-sm font-bold text-slate-900 mt-4">2. Données collectées lors des demandes</h3>
              <p>
                Lors de l'envoi d'une demande de location, seuls le nom complet, le numéro de téléphone et facultativement l'adresse email et la date de visite sont collectés. Ces données servent exclusivement à l'organisation de la visite du bien sélectionné.
              </p>
              <h3 className="text-sm font-bold text-slate-900 mt-4">3. Vos droits</h3>
              <p>
                Vous bénéficiez d'un droit d'accès, de rectification et de suppression de vos données personnelles sur simple demande par email à <code>lmsite.creator@gmail.com</code>.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
