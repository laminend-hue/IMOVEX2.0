/**
 * Utilitaires de slugification et de construction des URLs propres pour le SEO sénégalais.
 * Ex: /location/dakar/almadies/appartement-3-chambres-vue-mer-k8j2
 */

export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .replace(/œ/g, 'oe')
    .replace(/Œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/Æ/g, 'ae')
    .normalize('NFD') // Normalise les accents
    .replace(/[\u0300-\u036f]/g, '') // Supprime les diacritiques
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Supprime les caractères non alphanumériques
    .replace(/[\s_-]+/g, '-') // Remplace les espaces et tirets multiples par un seul tiret
    .replace(/^-+|-+$/g, ''); // Supprime les tirets de début et de fin
}

export function generateListingSlug(title: string, neighborhood: string, suffix?: string): string {
  const baseTitle = slugify(title);
  const baseNeighborhood = slugify(neighborhood);
  const shortId = suffix ? slugify(suffix).slice(0, 8) : Math.random().toString(36).substring(2, 7);
  
  if (baseTitle.includes(baseNeighborhood)) {
    return `${baseTitle}-${shortId}`;
  }
  return `${baseTitle}-${baseNeighborhood}-${shortId}`;
}

export function buildListingUrl(city: string, neighborhood: string, slug: string): string {
  const cleanCity = slugify(city || 'dakar');
  const cleanNeighborhood = slugify(neighborhood || 'almadies');
  return `/location/${cleanCity}/${cleanNeighborhood}/${slug}`;
}
