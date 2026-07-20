/**
 * Slugs des produits disposant d'un modèle 3D interactif. Volontairement
 * dans un fichier sans dépendance à three.js : la page produit l'importe
 * pour afficher le toggle sans tirer le bundle 3D.
 */
export const PRODUCTS_WITH_3D = new Set([
    'barbecue-baron',
    'barbecue-eclipse-box',
    'barbecue-explorer-flame-portable',
    'barbecue-majestic-pro',
    'barbecue-royalgrill',
    'foyer-a-gaz-copper-flame',
    'foyer-a-gaz-copper-flame-duo',
    'fumoir-aurora-smoker',
]);
