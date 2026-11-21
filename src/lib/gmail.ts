import { getCachedAccessToken } from './firebase.ts';
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

// Convert string to base64url format required by Gmail API
function toBase64Url(str: string): string {
  // UTF-8 encode safe
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sendVisitEmailViaGmail(payload: EmailVisitPayload): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
  channel: 'gmail_api' | 'server_proxy' | 'simulated';
}> {
  const token = getCachedAccessToken();
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

  const htmlBody = `
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

      <!-- Actions -->
      <div style="text-align: center; margin-top: 24px; padding-top: 18px; border-top: 1px solid #f1f5f9;">
        <a href="https://wa.me/${safePhone.replace(/[^0-9]/g, '')}" style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 10px 18px; border-radius: 6px; margin: 0 4px 8px 4px;">
          Ouvrir WhatsApp Locataire
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background: #f1f5f9; padding: 14px 24px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0;">
      Plateforme imovex · Infrastructure sécurisée & chiffrée · Données protégées conformément à la loi sénégalaise CDP n° 2008-12
    </div>
  </div>
</body>
</html>
  `.trim();

  // 1. If OAuth token is available in browser, send directly via API
  if (token) {
    try {
      const emailLines = [
        `To: ${ADMIN_EMAIL}`,
        `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        '',
        htmlBody,
      ];
      const rawMessage = toBase64Url(emailLines.join('\r\n'));

      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: rawMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[imovex Gmail API] Email expédié avec succès:', data.id);
        return { success: true, messageId: data.id, channel: 'gmail_api' };
      } else {
        const errorData = await response.json();
        console.warn('[imovex Gmail API] Réponse erreur:', errorData);
      }
    } catch (err: any) {
      console.warn('[imovex Gmail API] Échec envoi direct token:', err?.message);
    }
  }

  // 2. Fallback to server endpoint
  try {
    const res = await fetch('/api/notifications/gmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        to: ADMIN_EMAIL,
        subject,
        html: htmlBody,
        payload,
      }),
    });

    const result = await res.json();
    return {
      success: res.ok && result.success === true,
      ...(res.ok && result.id ? { messageId: result.id } : {}),
      ...(!res.ok || result.success !== true ? { error: result.error || 'Notification non envoyée.' } : {}),
      channel: 'server_proxy',
    };
  } catch (err: any) {
    console.warn('[imovex Notification] Échec de l’envoi; la demande reste enregistrée.');
    return {
      success: false,
      error: 'Notification non envoyée.',
      channel: 'simulated',
    };
  }
}
