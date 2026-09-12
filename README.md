# RoomBook Frontend

Interface Next.js pour l'API de reservation de salles Spring Boot.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- lucide-react

## Developpement local

Le frontend utilise le proxy Next `/backend` et transmet les requetes vers `http://localhost:8081` par defaut.

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000. Le backend Spring Boot doit ecouter sur le port `8081`.

Pour changer l'API :

```bash
NEXT_PUBLIC_API_URL=http://localhost:8081 npm run dev
```

## Deploiement Render

Le fichier [render.yaml](render.yaml) configure un Web Service Node.js.

1. Pousser ce dossier dans un depot GitHub dedie.
2. Dans Render, choisir **New > Blueprint** et selectionner ce depot.
3. Definir `BACKEND_API_URL` avec l'URL publique du backend Spring Boot, par exemple `https://reservation-api.onrender.com`.
4. Deployer.

Laisser `NEXT_PUBLIC_API_URL=/backend`. Le serveur Next proxifie les appels vers `BACKEND_API_URL`, ce qui evite les problemes CORS. Aucune cle secrete ne doit etre ajoutee au frontend.

## Parcours principal

- `/` : dashboard et disponibilite des salles
- `/salles/{id}` : timeline 08h-20h et creation d'une reservation
- `/reservations` : reservations du jour et a venir

Identifiants de demonstration backend : `demo` / `demo123`.
# frontend-reservation-demo
# frontend-reservation-demo
