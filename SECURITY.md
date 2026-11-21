# Sécurité et mise en production

## Mesures présentes dans le code

- Les règles Firestore protègent les profils d’agence et les demandes de visite; les demandes ne sont lisibles que par les comptes admin autorisés.
- Les comptes admin sont vérifiés côté client et dans les règles Firestore par adresse email vérifiée.
- Les comptes agence ont une identité Firebase Auth, un UID lié à leur profil, une vérification email et une approbation admin avant les écritures sur les annonces.
- Le catalogue production ne charge ni ne publie automatiquement les données de démonstration.
- Le serveur limite certaines requêtes et vérifie les signatures de fichiers pour les téléversements.
- Les réponses de notification ne prétendent pas qu’un email a été envoyé lorsqu’il échoue.

## Conditions impératives avant publication

1. Vérifier que `firebase-applet-config.json` pointe vers le bon projet et remplacer la liste admin dans `src/lib/store/appStore.tsx` et `firestore.rules`.
2. Tester les règles avec Firebase Emulator Suite; déployer `firestore.rules` uniquement après validation.
3. Configurer reCAPTCHA v3, `VITE_RECAPTCHA_V3_SITE_KEY` et l’enforcement Firebase App Check sur Firestore.
4. Vérifier l’expérience complète avec de vrais comptes: demande locataire, inscription et validation agence, publication/modification d’annonce, accès admin, révocation d’accès.
5. Configurer un fournisseur email réel; le code actuel n’assure pas la livraison des messages.
6. Remplacer le stockage local des images par un stockage durable ou monter un volume persistant. Restreindre aussi l’upload aux agences approuvées avant une exposition publique.
7. Définir sauvegardes, durée de rétention et procédure de suppression des données personnelles, puis configurer HTTPS, journalisation et alertes sur l’hébergeur.

Cette liste est une préparation de déploiement, pas une certification. La configuration Firebase et l’environnement d’hébergement n’ont pas été vérifiés depuis ce workspace.
