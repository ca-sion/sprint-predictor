# Spécification du Track : Refactoring et Tests des Modèles de Base

Ce track vise à améliorer la robustesse et la maintenabilité des modèles `Athlete.js` et `Race.js`. Il s'agit de s'assurer que la logique métier est correctement testée et que le code respecte les directives de style du projet.

## Objectifs
- Mettre en place une suite de tests unitaires pour `Athlete.js`.
- Mettre en place une suite de tests unitaires pour `Race.js`.
- Refactoriser le code pour améliorer la clarté et la séparation des responsabilités si nécessaire.
- S'assurer de la conformité avec le guide de style JavaScript du projet.

## Modèles Concernés

### Athlete.js
- **Responsabilités :** Gestion des données de l'athlète (nom, âge, catégorie, métriques).
- **Logique à tester :**
    - Calcul de l'âge (`age`).
    - Détermination de la catégorie (`category`).
    - Gestion des métriques (`setMetric`, `getMetric`).
    - Interaction avec `StorageManager` (via mocks).

### Race.js
- **Responsabilités :** Analyse des données de course, calcul des vitesses de segment, analyse des haies, intervalles personnalisés.
- **Logique à tester :**
    - Ajout/Suppression de jalons (`setMilestone`, `removeMilestone`).
    - Calcul des vitesses de segment (`segmentSpeeds`).
    - Analyse des haies (`hurdleAnalysis`).
    - Calcul d'intervalles personnalisés (`calculateIntervals`).
    - Interpolation du temps (`getTimeAtDistance`).

## Exigences de Test
- Couverture de code > 80%.
- Utilisation de mocks pour `StorageManager`.
- Test des cas limites (données manquantes, divisions par zéro, jalons incohérents).

## Environnement de Test
- Framework : À définir (probablement Vitest ou Jest, à vérifier dans les dépendances existantes).
