# IMOVEX

Plateforme immobilière sénégalaise en **React 19 / Vite 8** avec un serveur **Express** et un backend **Firebase** (Authentication + Firestore). Interface disponible en **français, anglais et espagnol**.

---

## Lancer en local

### Prérequis
- Node.js 22+
- pnpm (`npm i -g pnpm`)

### Démarrage

```sh
# 1. Installer les dépendances
pnpm install

# 2. Copier et remplir le fichier d'environnement
copy .env.example .env   # Windows
# cp .env.example .env   # macOS / Linux

# 3. Démarrer le serveur de développement
pnpm dev
```

Le site s'ouvre sur **http://localhost:3000**.

Les données de démonstration ne sont utilisées **qu'en développement** (`import.meta.env.DEV`). Aucune annonce d'exemple n'est créée en production.

---

## Configuration Firebase

### 1. Projet & Application

Vérifiez que `firebase-applet-config.json` pointe vers votre projet Firebase de production.

### 2. Authentication

Dans la console Firebase → Authentication :
- Activer **Google** et **Email/Mot de passe**
- Ajouter les **domaines autorisés** (votre domaine de production + `localhost`)
- Exiger la **vérification email** avant de permettre l'accès aux agences

### 3. Comptes administrateurs

Remplacez les adresses email admin dans **deux** fichiers :
- [`src/lib/email.ts`](src/lib/email.ts) — constante `ADMIN_EMAIL`
- [`src/lib/store/appStore.tsx`](src/lib/store/appStore.tsx) — tableau `allowedEmails`
- [`firestore.rules`](firestore.rules) — fonction `isAdmin()`

### 4. Règles Firestore

```sh
# Installer firebase-tools si nécessaire
npm i -g firebase-tools
firebase login

# Déployer les règles
bash deploy-firestore-rules.sh
# ou directement :
firebase deploy --only firestore:rules --project gen-lang-client-0901041829
```

### 5. Firebase App Check (obligatoire en production)

1. Obtenez une clé **reCAPTCHA v3** sur https://www.google.com/recaptcha/admin
2. Définissez `VITE_RECAPTCHA_V3_SITE_KEY=...` dans `.env`
3. Dans la console Firebase → App Check → **Activer l'enforcement pour Firestore**

> ⚠️ Sans App Check enforcement, les règles Firestore seules ne suffisent pas à empêcher l'abus de créations publiques.

---

## Configuration des notifications email (Resend)

Les emails de notification de demandes de visite sont envoyés via **[Resend](https://resend.com)** (gratuit jusqu'à 3 000 emails/mois).

1. Créez un compte sur https://resend.com
2. Ajoutez et vérifiez votre domaine (ex : `imovex.sn`)
3. Copiez votre clé API
4. Renseignez dans `.env` :
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ADMIN_NOTIFICATION_EMAIL=votre@email.com
   FROM_EMAIL=notifications@imovex.sn
   ```

---

## Stockage des photos (Firebase Storage)

Par défaut, les photos sont stockées localement dans `public/uploads/` — **incompatible avec un hébergement multi-instance ou éphémère**.

### Pour la production — Firebase Storage

1. Activez Firebase Storage dans la console Firebase
2. Créez un **compte de service** : Console Firebase → Paramètres → Comptes de service → Générer une nouvelle clé privée
3. Renseignez dans `.env` :
   ```
   FIREBASE_STORAGE_BUCKET=votre-projet.firebasestorage.app
   # Option A — fichier local (dev)
   GOOGLE_APPLICATION_CREDENTIALS=/chemin/vers/serviceAccount.json
   # Option B — JSON inline (déploiement cloud)
   FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
   ```
4. Installez firebase-admin :
   ```sh
   pnpm add firebase-admin
   ```

---

## Build & Tests

```sh
pnpm test    # 18 tests unitaires
pnpm lint    # Vérification TypeScript
pnpm build   # Build Vite + esbuild server
pnpm start   # Démarrer en mode production (port 3000)
```

Le build génère plusieurs chunks séparés (vendor, firebase, motion) pour optimiser le chargement initial.

---

## Déploiement

### Option A — Fly.io (recommandé)

```sh
# Installer flyctl
# https://fly.io/docs/hands-on/install-flyctl/

# Première fois
fly launch --no-deploy
# Définir les secrets
fly secrets set RESEND_API_KEY=re_xxx ADMIN_NOTIFICATION_EMAIL=... FROM_EMAIL=... FIREBASE_STORAGE_BUCKET=... FIREBASE_SERVICE_ACCOUNT_JSON='...'
# Déployer
fly deploy
```

Fly.io conserve l'instance active (`min_machines_running = 1`) — pas de cold start.

### Option B — Docker (Railway, Render, Heroku, VPS)

```sh
docker build -t imovex .
docker run -p 3000:3000 --env-file .env imovex
```

### Option C — VPS avec PM2

```sh
pnpm build
NODE_ENV=production pnpm start
# ou avec PM2
pm2 start dist/server.js --name imovex
```

> ⚠️ Le serveur Express doit **toujours rester actif** et accepter la variable `PORT`. Un hébergement statique seul ne sert pas les routes `/api`.

---

## Conformité & Protection des données (Loi CDP n° 2008-12 — Sénégal)

Les demandes de visite contiennent des **données personnelles**. Avant l'ouverture au public :
- Définir les responsables d'accès et la durée de conservation
- Implémenter la procédure de suppression sur demande
- Configurer HTTPS, journalisation et alertes sur l'hébergeur
- Consulter la **CDP (Commission de Protection des Données)** si nécessaire

---

## État de validation

| Vérification | Résultat |
|---|---|
| `pnpm build` | ✅ Réussi |
| TypeScript `tsc --noEmit` | ✅ Réussi |
| Tests (18) | ✅ Réussis |
| HTTP 200 accueil + `/api/system/health` | ✅ Vérifié |
| Bundle JS (après splitting) | ✅ Splitté en chunks (vendor / firebase / motion) |
| Emails | ✅ Resend (côté serveur, clé API) |
| Photos | ✅ Firebase Storage (fallback local) |
| Déploiement | ✅ Dockerfile + fly.toml |
