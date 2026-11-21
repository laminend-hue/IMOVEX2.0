/**
 * Validation des formulaires de demande de location, anti-spam honeypot
 * et conformité avec la loi sénégalaise sur les données personnelles (CDP).
 */

export interface RentalRequestData {
  fullName: string;
  phone: string;
  email?: string;
  message?: string;
  desiredVisitDate?: string;
  consentCdp: boolean;
  honeypot?: string;
}

export interface ValidationResult {
  isValid: boolean;
  isSpam: boolean;
  errors: Record<string, string>;
  sanitized: {
    fullName: string;
    phone: string;
    email: string;
    message: string;
    desiredVisitDate?: string;
  };
}

export function validateRentalRequest(input: Partial<RentalRequestData>): ValidationResult {
  const errors: Record<string, string> = {};

  // 1. Détection anti-robot honeypot
  const isSpam = Boolean(input.honeypot && input.honeypot.trim().length > 0);
  if (isSpam) {
    return {
      isValid: false,
      isSpam: true,
      errors: { honeypot: 'Bot détecté' },
      sanitized: {
        fullName: '',
        phone: '',
        email: '',
        message: '',
      },
    };
  }

  // 2. Nom complet (obligatoire)
  const fullName = (input.fullName || '').trim();
  if (!fullName) {
    errors.fullName = 'Le nom complet est obligatoire.';
  } else if (fullName.length < 2) {
    errors.fullName = 'Le nom doit contenir au moins 2 caractères.';
  } else if (fullName.length > 100) {
    errors.fullName = 'Le nom ne peut pas dépasser 100 caractères.';
  }

  // 3. Téléphone avec indicatif (obligatoire)
  const rawPhone = (input.phone || '').trim();
  const phoneClean = rawPhone.replace(/[\s.-]/g, '');
  if (!rawPhone) {
    errors.phone = 'Le numéro de téléphone est obligatoire.';
  } else {
    // Valide soit un numéro sénégalais (+221 7X XXX XX XX / 7X XXX XX XX) soit un format international (+... de 8 à 15 chiffres)
    const senegalRegex = /^(?:\+221|00221)?(7[05678]|33)\d{7}$/;
    const generalIntlRegex = /^\+?[0-9]{8,15}$/;
    if (!senegalRegex.test(phoneClean) && !generalIntlRegex.test(phoneClean)) {
      errors.phone = 'Numéro invalide. Ex: +221 77 123 45 67 ou 77 123 45 67';
    }
  }

  // 4. Email (optionnel mais doit être valide si fourni)
  const email = (input.email || '').trim();
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = 'Veuillez renseigner une adresse email valide.';
    }
  }

  // 5. Date de visite souhaitée (optionnelle, ne doit pas être antérieure à aujourd’hui)
  const visitDate = (input.desiredVisitDate || '').trim();
  if (visitDate) {
    const parsedDate = new Date(visitDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(parsedDate.getTime())) {
      errors.desiredVisitDate = 'Format de date invalide.';
    } else if (parsedDate < today) {
      errors.desiredVisitDate = 'La date de visite ne peut pas être dans le passé.';
    }
  }

  // 6. Consentement CDP Sénégal (obligatoire)
  if (!input.consentCdp) {
    errors.consentCdp = 'Vous devez accepter la politique de traitement des données.';
  }

  // 7. Message libre (optionnel, max 1000 caractères)
  const message = (input.message || '').trim().slice(0, 1000);

  return {
    isValid: Object.keys(errors).length === 0,
    isSpam: false,
    errors,
    sanitized: {
      fullName,
      phone: rawPhone,
      email,
      message,
      desiredVisitDate: visitDate || undefined,
    },
  };
}
