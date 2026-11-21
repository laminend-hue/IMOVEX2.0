/**
 * Formatage monétaire et dates selon les conventions sénégalaises et françaises.
 */

export function formatFCFA(amount: number, perMonth: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return perMonth ? '0 FCFA / mois' : '0 FCFA';
  }
  
  // Formatage avec séparateur d'espace insécable standard (ex: 250 000 FCFA)
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return perMonth ? `${formatted} FCFA / mois` : `${formatted} FCFA`;
}

export function formatDateFR(dateInput: string | Date): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';
  
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function calculateTotalMoveInCost(monthlyRent: number, depositAdvance: number = 0): {
  monthlyRent: number;
  depositAdvance: number;
  total: number;
} {
  const rent = Math.max(0, monthlyRent || 0);
  const deposit = Math.max(0, depositAdvance || 0);
  return {
    monthlyRent: rent,
    depositAdvance: deposit,
    total: rent + deposit,
  };
}

/**
 * Génère le lien officiel de partage direct WhatsApp pour un bien immobilier.
 */
export function getWhatsAppListingShareUrl(listing: {
  title: string;
  neighborhoodName: string;
  monthlyRent: number;
  id: string;
}, lang: string = 'fr'): string {
  const formattedRent = formatFCFA(listing.monthlyRent, true);
  const baseUrl = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://imovex.sn';
  const itemUrl = `${baseUrl}/?view=listing_detail&id=${listing.id}`;

  let intro = 'Regarde ce logement disponible à Dakar sur imovex';
  if (lang === 'en') {
    intro = 'Check out this property available in Dakar on imovex';
  } else if (lang === 'ar') {
    intro = 'شاهد هذا العقار المتاح للإيجار في دكار عبر منصة imovex';
  } else if (lang === 'es') {
    intro = 'Mira este inmueble disponible en Dakar en imovex';
  }

  const messageText = `🏠 *${listing.title}*\n📍 ${listing.neighborhoodName}, Dakar\n💰 ${formattedRent}\n\n👉 ${intro} :\n${itemUrl}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
}

