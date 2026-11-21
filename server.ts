import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Root directory: handles both running via tsx from root and running via node from dist/
const rootDir = fs.existsSync(path.resolve(__dirname, 'public')) ? __dirname : path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// OPTIONAL: Firebase Admin SDK for Storage uploads
// Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON in .env
// ============================================================================
let adminStorage: { bucket: (name?: string) => any } | null = null;
const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET;

async function initFirebaseAdmin() {
  if (!FIREBASE_STORAGE_BUCKET) {
    console.warn('[imovex Storage] FIREBASE_STORAGE_BUCKET non défini — stockage local activé.');
    return;
  }
  try {
    // Dynamic import so the server starts even without firebase-admin installed
    const { initializeApp: initAdmin, getApps: getAdminApps, cert } = await import('firebase-admin/app' as any);
    const { getStorage } = await import('firebase-admin/storage' as any);

    if (!getAdminApps().length) {
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      if (serviceAccountJson) {
        initAdmin({ credential: cert(JSON.parse(serviceAccountJson)), storageBucket: FIREBASE_STORAGE_BUCKET });
      } else {
        // Uses GOOGLE_APPLICATION_CREDENTIALS env variable automatically
        initAdmin({ storageBucket: FIREBASE_STORAGE_BUCKET });
      }
    }
    adminStorage = getStorage();
    console.log(`[imovex Storage] Firebase Admin Storage initialisé (bucket: ${FIREBASE_STORAGE_BUCKET})`);
  } catch (err: any) {
    console.warn('[imovex Storage] firebase-admin non disponible, stockage local activé:', err?.message);
  }
}

// Security: Disable express version header
app.disable('x-powered-by');

// Security: Defense-in-depth HTTP security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// JSON parser with bounded limit
app.use(express.json({ limit: '7mb' }));

// Static directory for uploaded property photos (local fallback)
const uploadsDir = path.resolve(rootDir, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=86400');
  },
}));

// In-memory rate limiting store (IP -> array of timestamps)
const rateLimitMap = new Map<string, number[]>();

function getClientIp(req: Request): string {
  return req.socket.remoteAddress || 'unknown';
}

function checkRateLimit(ip: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter((t) => now - t < windowMs);
  if (!rateLimitMap.has(ip) && rateLimitMap.size >= 10000) {
    const oldestEntry = rateLimitMap.keys().next().value;
    if (oldestEntry) rateLimitMap.delete(oldestEntry);
  }
  if (timestamps.length >= maxRequests) {
    return false;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

// Security: Verify magic bytes for uploaded images to prevent arbitrary executable / script upload
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB max per image

function validateImageBuffer(buffer: Buffer): { valid: boolean; ext: string; mime: string } {
  if (buffer.length < 12 || buffer.length > MAX_UPLOAD_BYTES) {
    return { valid: false, ext: '', mime: '' };
  }
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { valid: true, ext: 'jpg', mime: 'image/jpeg' };
  }
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { valid: true, ext: 'png', mime: 'image/png' };
  }
  // WebP: RIFF .... WEBP
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return { valid: true, ext: 'webp', mime: 'image/webp' };
  }
  return { valid: false, ext: '', mime: '' };
}

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * POST /api/upload
 * Secure image upload with magic-byte verification.
 * Stores to Firebase Storage when configured, falls back to local disk.
 */
app.post('/api/upload', async (req: Request, res: Response) => {
  const clientIp = getClientIp(req);
  if (!checkRateLimit(clientIp, 20, 60000)) {
    return res.status(429).json({ error: 'Trop de téléversements. Veuillez patienter une minute.' });
  }

  try {
    const { dataUrl } = req.body;
    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ error: 'Payload dataUrl requis.' });
    }

    const matches = dataUrl.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: "Format d'image non autorisé. Formats acceptés : JPEG, PNG, WebP." });
    }
    if (
      matches[2].length > Math.ceil(MAX_UPLOAD_BYTES / 3) * 4 + 4 ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(matches[2])
    ) {
      return res.status(400).json({ error: 'Encodage image invalide ou fichier trop volumineux.' });
    }

    const buffer = Buffer.from(matches[2], 'base64');
    const { valid, ext, mime } = validateImageBuffer(buffer);
    if (!valid) {
      return res.status(400).json({
        error: 'Fichier invalide ou corrompu. Seules les véritables images JPEG, PNG ou WebP de moins de 5 Mo sont acceptées.',
      });
    }

    const randomHex = crypto.randomBytes(8).toString('hex');
    const cleanFilename = `prop-${Date.now()}-${randomHex}.${ext}`;

    // --- Firebase Storage (preferred when configured) ---
    if (adminStorage && FIREBASE_STORAGE_BUCKET) {
      try {
        const bucket = adminStorage.bucket(FIREBASE_STORAGE_BUCKET);
        const file = bucket.file(`uploads/${cleanFilename}`);
        await file.save(buffer, {
          metadata: { contentType: mime },
          resumable: false,
        });
        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${FIREBASE_STORAGE_BUCKET}/uploads/${cleanFilename}`;
        console.log(`[imovex Storage] Photo enregistrée dans Firebase Storage : ${publicUrl} (${(buffer.length / 1024).toFixed(1)} KB)`);
        return res.status(200).json({ url: publicUrl, path: cleanFilename, storage: 'firebase' });
      } catch (fbErr: any) {
        console.warn('[imovex Storage] Erreur Firebase Storage, basculement local:', fbErr?.message);
        // Fall through to local storage
      }
    }

    // --- Local fallback ---
    const filePath = path.join(uploadsDir, cleanFilename);
    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/${cleanFilename}`;
    console.log(`[imovex Storage] Photo enregistrée localement : ${publicUrl} (${(buffer.length / 1024).toFixed(1)} KB)`);
    return res.status(200).json({ url: publicUrl, path: cleanFilename, storage: 'local' });
  } catch (err: any) {
    console.error('[imovex Storage] Erreur upload:', err);
    return res.status(500).json({ error: "Erreur lors du stockage sécurisé de l'image." });
  }
});

/**
 * POST /api/notifications/send  (also accepts legacy /api/notifications/gmail)
 * Send email notification via Resend API.
 * Requires RESEND_API_KEY and ADMIN_NOTIFICATION_EMAIL in environment.
 */
app.post(['/api/notifications/send', '/api/notifications/gmail'], async (req: Request, res: Response) => {
  const clientIp = getClientIp(req);
  if (!checkRateLimit(clientIp, 15, 60000)) {
    return res.status(429).json({ error: 'Trop de notifications envoyées. Veuillez patienter.' });
  }

  const { subject, html } = req.body || {};
  const resendApiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  const fromEmail = process.env.FROM_EMAIL || 'notifications@imovex.sn';

  if (!adminEmail) {
    return res.status(503).json({ error: 'ADMIN_NOTIFICATION_EMAIL non configuré.' });
  }
  if (!resendApiKey) {
    return res.status(503).json({ error: 'RESEND_API_KEY non configuré.' });
  }
  if (typeof subject !== 'string' || subject.length > 200 || typeof html !== 'string' || html.length > 20000) {
    return res.status(400).json({ error: 'Contenu de notification invalide.' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `imovex Dakar <${fromEmail}>`,
        to: [adminEmail],
        subject,
        html,
      }),
    });

    if (response.ok) {
      const data = await response.json() as { id: string };
      console.log(`[imovex Resend] Email délivré (ID: ${data.id}) → ${adminEmail}`);
      return res.status(200).json({ success: true, id: data.id, method: 'resend' });
    }

    const errData = await response.json().catch(() => ({})) as { message?: string };
    console.warn('[imovex Resend] Échec envoi:', errData);
    return res.status(502).json({ success: false, error: errData?.message || 'Resend a refusé la notification.' });
  } catch (err: any) {
    console.error('[imovex Resend] Erreur réseau:', err?.message);
    return res.status(502).json({ success: false, error: 'Erreur réseau lors de l\'envoi de la notification.' });
  }
});

/**
 * GET /api/system/health
 * Supervision système & télémétrie de disponibilité.
 */
app.get('/api/system/health', (_req: Request, res: Response) => {
  const mem = process.memoryUsage();
  const storageMode = adminStorage && FIREBASE_STORAGE_BUCKET ? 'Firebase Storage' : 'Local (public/uploads)';
  return res.status(200).json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    memoryRssMB: (mem.rss / (1024 * 1024)).toFixed(1),
    services: {
      server: 'En cours',
      storage: storageMode,
      notifications: process.env.RESEND_API_KEY
        ? `Resend configuré → ${process.env.ADMIN_NOTIFICATION_EMAIL || '(email manquant)'}`
        : 'RESEND_API_KEY manquant',
      database: 'Configuration Firebase vérifiable via /api/system/diagnose',
    },
  });
});

/**
 * POST /api/system/diagnose
 * Diagnostic d'infrastructure et audit préventif.
 */
app.post(['/api/system/diagnose', '/api/system/ai-diagnose'], (req: Request, res: Response) => {
  const clientIp = getClientIp(req);
  if (!checkRateLimit(clientIp, 12, 60000)) {
    return res.status(429).json({ error: 'Limitation de diagnostic atteinte.' });
  }

  const uptime = Math.floor(process.uptime());
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasAdminEmail = Boolean(process.env.ADMIN_NOTIFICATION_EMAIL);
  const hasStorage = Boolean(adminStorage && FIREBASE_STORAGE_BUCKET);

  const diagnosticReport = {
    healthScore: null,
    systemState: 'UNVERIFIED',
    aiVerdict: 'Diagnostic technique indicatif. La disponibilité des services externes doit être vérifiée séparément.',
    metrics: {
      uptimeMinutes: Math.floor(uptime / 60),
      databaseSync: 'Non vérifiée par le serveur',
    },
    modulesChecked: [
      { name: 'Serveur Applicatif & Sécurité HTTP', status: 'OK', detail: 'Headers de sécurité actifs, rate limiting en place.' },
      {
        name: 'Stockage Médias',
        status: hasStorage ? 'OK' : 'PARTIEL',
        detail: hasStorage
          ? `Firebase Storage actif (${FIREBASE_STORAGE_BUCKET})`
          : 'Stockage local actif. Configurer FIREBASE_STORAGE_BUCKET pour la production.',
      },
      { name: 'Base de Données & Contrôle d\'Accès', status: 'À VÉRIFIER', detail: 'Le serveur ne vérifie pas la connexion Firestore ni le déploiement des règles.' },
      { name: 'Authentification Espace Pro & Admin', status: 'À CONFIGURER', detail: 'La sécurité dépend des règles Firebase déployées.' },
      {
        name: 'Service Notifications Email (Resend)',
        status: hasResend && hasAdminEmail ? 'OK' : 'À CONFIGURER',
        detail: hasResend && hasAdminEmail
          ? `Resend configuré. Emails → ${process.env.ADMIN_NOTIFICATION_EMAIL}`
          : 'Configurer RESEND_API_KEY et ADMIN_NOTIFICATION_EMAIL dans .env',
      },
    ],
    recommendation: 'Vérifier les secrets et les services Firebase avant la mise en production.',
    diagnosedAt: new Date().toISOString(),
  };

  return res.status(200).json(diagnosticReport);
});

// ============================================================================
// VITE DEV MIDDLEWARE / STATIC SERVE
// ============================================================================
async function startServer() {
  // Initialize Firebase Admin (non-blocking — server starts regardless)
  await initFirebaseAdmin();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Handle direct SPA routes in development
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distDir = path.resolve(rootDir, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[imovex Server] Démarré sur le port ${PORT}`);
  });
}

startServer();
