# GB Apps Store

Une plateforme de distribution d'applications développée avec Next.js et Supabase.

## Fonctionnalités

- Interface moderne et réactive
- Gestion des applications (ajout, modification, suppression)
- Catégorisation des applications (Nouveautés, En vedette, Sélection)
- Authentification sécurisée avec Supabase
- Éditeur de texte riche pour les descriptions
- Gestion des images et captures d'écran
- Performance optimisée avec Next.js

## Technologies utilisées

- Next.js 13+
- Supabase (Base de données et authentification)
- TailwindCSS
- TypeScript
- Tiptap (Éditeur de texte riche)

## Configuration requise

- Node.js 16.8.0 ou version supérieure
- npm ou yarn
- Compte Supabase

## Installation

1. Cloner le dépôt :
```bash
git clone [URL_DU_REPO]
cd gb-apps-store
```

2. Installer les dépendances :
```bash
npm install
# ou
yarn install
```

3. Configurer les variables d'environnement :
Créer un fichier `.env.local` à la racine du projet :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

4. Lancer le serveur de développement :
```bash
npm run dev
# ou
yarn dev
```

## Déploiement

Le projet est configuré pour être déployé sur Vercel. Il suffit de :
1. Connecter votre compte GitHub à Vercel
2. Importer le projet
3. Configurer les variables d'environnement
4. Déployer !

## Licence

MIT
