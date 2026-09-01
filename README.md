# Portfolio — Antoine HOUNDONOUGBO

Site portfolio multi-pages (HTML/CSS/JS statique) déployé via GitHub Pages :
https://antoine-houndonougbo.github.io/

## Structure
- `index.html` — Accueil (résumé exécutif + chiffres clés)
- `a-propos.html`, `competences.html`, `experience.html` — profil
- `realisations.html` — analyses, figures STROBE et **coffre des projets à accès par code** (AES-GCM)
- `publications.html`, `certifications.html`, `contact.html`
- `assets/` — styles.css, script.js, vault-data.js (charge chiffrée), favicon, image de partage
- `cv/` — CV FR/EN téléchargeables

## Maintenance rapide
1. Modifier la page concernée (texte dans les balises `<span lang="fr">` / `<span lang="en">`).
2. Commit + push → publication automatique GitHub Pages (1–2 min).
3. Coffre : régénérer `assets/vault-data.js` avec l'outil fourni (changer code/résumés).

## Confidentialité
Aucune donnée sensible en clair dans le dépôt. Les résumés des projets en cours sont chiffrés
(`assets/vault-data.js`). Ne jamais versionner de PDF contenant des données de tiers.

---
**Version Antoine V1** — page « En action » : 30 photos (7 champs) · page « Statistiques » : démarche + 10 figures anonymisées · STROBE sous coffre à code.
