import { formatFCFA } from './formatters.ts';

export interface StaleStatusResult {
  daysSinceConfirmation: number;
  needsReminder: boolean;
  needsAutoMask: boolean;
  statusLabel: 'fresh' | 'warning' | 'expired';
}

export const REMINDER_DAYS_THRESHOLD = 14;
export const AUTO_MASK_DAYS_THRESHOLD = 21;

export function evaluateListingFreshness(
  lastConfirmedAt: string | Date,
  currentStatus: string,
  referenceNow: Date = new Date()
): StaleStatusResult {
  if (currentStatus !== 'disponible') {
    return {
      daysSinceConfirmation: 0,
      needsReminder: false,
      needsAutoMask: false,
      statusLabel: 'fresh',
    };
  }

  const confirmedDate = typeof lastConfirmedAt === 'string' ? new Date(lastConfirmedAt) : lastConfirmedAt;
  const nowMs = referenceNow.getTime();
  const confirmedMs = confirmedDate.getTime();
  
  const diffHours = (nowMs - confirmedMs) / (1000 * 60 * 60);
  const daysSinceConfirmation = Math.max(0, Math.floor(diffHours / 24));

  const needsAutoMask = daysSinceConfirmation >= AUTO_MASK_DAYS_THRESHOLD;
  const needsReminder = daysSinceConfirmation >= REMINDER_DAYS_THRESHOLD && !needsAutoMask;

  let statusLabel: 'fresh' | 'warning' | 'expired' = 'fresh';
  if (needsAutoMask) {
    statusLabel = 'expired';
  } else if (needsReminder) {
    statusLabel = 'warning';
  }

  return {
    daysSinceConfirmation,
    needsReminder,
    needsAutoMask,
    statusLabel,
  };
}

export function buildAdminEmailPayload(params: {
  requestId: string;
  listingTitle: string;
  listingNeighborhood: string;
  listingRent: number;
  listingUrl: string;
  agencyName: string;
  tenantName: string;
  tenantPhone: string;
  tenantEmail?: string;
  message?: string;
  desiredVisitDate?: string;
  adminDashboardUrl: string;
}) {
  const subject = `Nouvelle demande — ${params.listingTitle} — ${params.listingNeighborhood}`;
  
  const formattedRent = formatFCFA(params.listingRent, true);
  const visitText = params.desiredVisitDate 
    ? new Date(params.desiredVisitDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Non spécifiée';

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
        .card { background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; max-width: 600px; margin: 0 auto; padding: 24px; }
        .header { border-bottom: 2px solid #059669; padding-bottom: 16px; margin-bottom: 20px; }
        .title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0; }
        .badge { display: inline-block; background-color: #ecfdf5; color: #065f46; font-size: 13px; font-weight: 600; padding: 4px 8px; border-radius: 4px; }
        .section { margin-bottom: 18px; }
        .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 6px; }
        .data-row { font-size: 15px; margin-bottom: 6px; }
        .strong { font-weight: 600; color: #1e293b; }
        .message-box { background-color: #f1f5f9; padding: 12px 16px; border-radius: 6px; font-style: italic; margin-top: 6px; font-size: 14px; color: #334155; }
        .btn-container { margin-top: 24px; text-align: center; }
        .btn { display: inline-block; background-color: #059669; color: #ffffff !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; }
        .footer { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 12px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <span class="badge">imovex Dakar</span>
          <h1 class="title" style="margin-top: 8px;">Nouvelle demande de location reçue</h1>
          <div style="font-size: 14px; color: #64748b;">Cette demande doit être transmise à l'agence partenaire.</div>
        </div>

        <div class="section">
          <div class="section-title">Coordonnées du locataire</div>
          <div class="data-row"><span class="strong">Nom complet :</span> ${params.tenantName}</div>
          <div class="data-row"><span class="strong">Téléphone :</span> <a href="tel:${params.tenantPhone}">${params.tenantPhone}</a></div>
          ${params.tenantEmail ? `<div class="data-row"><span class="strong">Email :</span> <a href="mailto:${params.tenantEmail}">${params.tenantEmail}</a></div>` : ''}
          <div class="data-row"><span class="strong">Date de visite souhaitée :</span> ${visitText}</div>
          ${params.message ? `
            <div class="section-title" style="margin-top: 10px;">Message du candidat :</div>
            <div class="message-box">${params.message}</div>
          ` : ''}
        </div>

        <div class="section" style="border-top: 1px solid #f1f5f9; padding-top: 16px;">
          <div class="section-title">Bien immobilier concerné</div>
          <div class="data-row"><span class="strong">Titre :</span> ${params.listingTitle}</div>
          <div class="data-row"><span class="strong">Quartier :</span> ${params.listingNeighborhood}</div>
          <div class="data-row"><span class="strong">Loyer :</span> ${formattedRent}</div>
          <div class="data-row"><span class="strong">Agence gestionnaire :</span> ${params.agencyName}</div>
          <div class="data-row"><span class="strong">Lien de l'annonce :</span> <a href="${params.listingUrl}" target="_blank">Voir la fiche publique</a></div>
        </div>

        <div class="btn-container">
          <a href="${params.adminDashboardUrl}" class="btn" target="_blank">
            Traiter la demande dans l'espace Admin
          </a>
        </div>

        <div class="footer">
          imovex — Gestionnaire centralisé des demandes de location Dakar.<br/>
          Rappel : les coordonnées de l'agence ne sont jamais divulguées au locataire.
        </div>
      </div>
    </body>
    </html>
  `.trim();

  return {
    to: 'lmsite.creator@gmail.com',
    subject,
    html,
  };
}
