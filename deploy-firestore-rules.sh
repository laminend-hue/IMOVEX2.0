#!/usr/bin/env bash
# deploy-firestore-rules.sh
# Déploie les règles Firestore vers le projet Firebase configuré dans firebase-applet-config.json
# Pré-requis : firebase-tools installé globalement (npm i -g firebase-tools) et connecté (firebase login)

set -euo pipefail

PROJECT_ID=$(node -e "console.log(require('./firebase-applet-config.json').projectId)")
DATABASE_ID=$(node -e "const c = require('./firebase-applet-config.json'); console.log(c.firestoreDatabaseId || '(default)')")

echo "🔥 Déploiement des règles Firestore"
echo "   Projet  : $PROJECT_ID"
echo "   Base    : $DATABASE_ID"
echo "   Fichier : firestore.rules"
echo ""

# Optional: run the emulator tests first
# firebase emulators:exec --only firestore "echo 'Tests emulator OK'" --project "$PROJECT_ID"

firebase deploy --only firestore:rules --project "$PROJECT_ID"

echo ""
echo "✅ Règles Firestore déployées avec succès."
echo ""
echo "⚠️  Rappel : vérifiez que l'enforcement Firebase App Check est activé"
echo "   dans la console Firebase → Firestore → App Check"
