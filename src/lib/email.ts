/**
 * email.ts — Notifications email via le serveur Express (Resend).
 *
 * Cette couche côté client construit uniquement le payload HTML et
 * appelle /api/notifications/send. L'authentification et la clé API
 * Resend restent exclusivement côté serveur (server.ts).
 */
import { escapeHtml, sanitizePhone, sanitizeEmail } from './utils/sanitize.ts';

export const ADMIN_EMAIL = 'laminend2462@gmail.com';

export interface EmailVisitPayload {
  requestId: string;
  listingId: string;
  listingTitle: string;
  listingNeighborhood: string;
  listingRent: number;
  agencyName: string;
  fullName: string;
  phone: string;
  email?: string;
  message?: string;
  desiredVisitDate?: string;
}

/** Build the notification HTML body (shared with server for preview). */
export function buildVisitEmailHtml(payload: EmailVisitPayload): { subject: string; html: string } {
  const safeFullName = escapeHtml(payload.fullName);
  const safePhone = sanitizePhone(payload.phone);
  const safeEmail = sanitizeEmail(payload.email);
  const safeMessage = escapeHtml(payload.message);
  const safeDate = escapeHtml(payload.desiredVisitDate);
  const safeTitle = escapeHtml(payload.listingTitle);
  const safeNeighborhood = escapeHtml(payload.listingNeighborhood);
  const safeAgency = escapeHtml(payload.agencyName);
  const safeRequestId = escapeHtml(payload.requestId);

  const subject = `[imovex Dakar] Demande de visite — ${safeTitle} (${safeNeighborhood})`;
  const formattedRent = payload.listingRent
    ? `${payload.listingRent.toLocaleString('fr-FR')} FCFA / mois`
    : 'Sur demande';

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Nouvelle demande de visite imovex</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 28px 24px; color: #ffffff;">
      <div style="font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #bae6fd; margin-bottom: 6px;">imovex Dakar · Notification Officielle</div>
      <h1 style="font-size: 22px; font-weight: 800; margin: 0; color: #ffffff; line-height: 1.3;">Nouvelle demande de visite reçue</h1>
      <p style="margin: 6px 0 0; font-size: 14px; color: #e0f2fe;">Transmission confidentielle vers l'administrateur</p>
    </div>

    <!-- Contenu -->
    <div style="padding: 24px;">

      <!-- Infos Locataire -->
      <div style="margin-bottom: 24px; background: #f8fafc; padding: 18px; border-radius: 8px; border-left: 4px solid #0284c7;">
        <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #0369a1; font-weight: 700;">Coordonnées du locataire</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 140px;">Nom complet :</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${safeFullName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Téléphone / WhatsApp :</td>
            <td style="padding: 6px 0; font-weight: 700; color: #0284c7;">
              <a href="tel:${safePhone}" style="color: #0284c7; text-decoration: none;">${safePhone}</a>
            </td>
          </tr>
          ${safeEmail ? `
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Email :</td>
            <td style="padding: 6px 0; color: #0f172a;">
              <a href="mailto:${safeEmail}" style="color: #0284c7; text-decoration: none;">${safeEmail}</a>
            </td>
          </tr>` : ''}
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Date souhaitée :</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${safeDate || 'Dès que possible'}</td>
          </tr>
        </table>
        ${safeMessage ? `
        <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1;">
          <div style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 4px;">Message du locataire :</div>
          <div style="font-size: 13px; font-style: italic; color: #334155; line-height: 1.5; background: #ffffff; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
            « ${safeMessage} »
          </div>
        </div>` : ''}
      </div>

      <!-- Infos Bien & Agence -->
      <div style="margin-bottom: 24px;">
        <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; font-weight: 700;">Détails du bien immobilier</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 140px;">Titre de l'annonce :</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${safeTitle}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Quartier :</td>
            <td style="padding: 6px 0; color: #0f172a;"><strong>${safeNeighborhood}</strong>, Dakar</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Loyer mensuel :</td>
            <td style="padding: 6px 0; font-weight: 700; color: #059669;">${formattedRent}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Agence mandataire :</td>
            <td style="padding: 6px 0; color: #0f172a;">${safeAgency} (Coordonnées protégées)</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Réf demande :</td>
            <td style="padding: 6px 0; font-family: monospace; font-size: 12px; color: #64748b;">#${safeRequestId}</td>
          </tr>
        </table>
      </div>

      <!-- Action WhatsApp -->
      <div style="text-align: center; margin-top: 24px; padding-top: 18px; border-top: 1px solid #f1f5f9;">
        <a href="https://wa.me/${safePhone.replace(/[^0-9]/g, '')}" style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 10px 18px; border-radius: 6px; margin: 0 4px 8px 4px;">
          Ouvrir WhatsApp Locataire
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background: #f1f5f9; padding: 14px 24px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0;">
      Plateforme imovex · Infrastructure sécurisée &amp; chiffrée · Données protégées conformément à la loi sénégalaise CDP n° 2008-12
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, html };
}

/**
 * Send a visit notification email via the Express server endpoint.
 * The server uses Resend with a server-side API key — no OAuth token needed here.
 */
export async function sendVisitEmailViaGmail(payload: EmailVisitPayload): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
  channel: 'gmail_api' | 'server_proxy' | 'simulated';
}> {
  const { subject, html } = buildVisitEmailHtml(payload);

  try {
    const res = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, html }),
    });

    const result = await res.json();
    return {
      success: res.ok && result.success === true,
      ...(result.id ? { messageId: String(result.id) } : {}),
      ...(!res.ok || result.success !== true ? { error: result.error || 'Notification non envoyée.' } : {}),
      channel: 'server_proxy',
    };
  } catch (err: any) {
    console.warn('[imovex Notification] Échec de l\'envoi ; la demande reste enregistrée dans Firestore.');
    return { success: false, error: 'Notification non envoyée.', channel: 'simulated' };
  }
}
