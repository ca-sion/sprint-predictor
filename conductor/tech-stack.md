# Tech Stack : Sprint Predictor

## Frontend
- **Framework :** Vue 3 (Composition API)
- **Build Tool :** Vite
- **Routing :** Vue Router
- **Visualisation de données :** Chart.js
- **Langage :** JavaScript (ES Modules)

## Stockage et État
- **Client-side Persistence :** 
    - **IndexedDB :** Via `idb-keyval` pour sauvegarder et sychroniser toutes les donnéessur le disque de l'utilisateur via API File System du navigateur.
    - **LocalStorage :** Pour les données des athlètes et des courses ainsi que l'athlète à analyser en cours.

## Infrastructure et Déploiement
- **Hosting :** GitHub Pages (configuré via `gh-pages`)
- **HTTPS :** Configuré localement avec `vite-plugin-mkcert`
