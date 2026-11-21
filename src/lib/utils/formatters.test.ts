import test from 'node:test';
import assert from 'node:assert/strict';
import { formatFCFA, calculateTotalMoveInCost, getWhatsAppListingShareUrl } from './formatters.ts';
import { slugify, generateListingSlug } from './slugify.ts';
import { validateRentalRequest } from './validation.ts';
import { evaluateListingFreshness, buildAdminEmailPayload } from './staleCheck.ts';

test('formatFCFA formats Senegalese currency with non-breaking spaces and suffix', () => {
  assert.equal(formatFCFA(250000, true), '250 000 FCFA / mois');
  assert.equal(formatFCFA(1500000, false), '1 500 000 FCFA');
  assert.equal(formatFCFA(0, false), '0 FCFA');
});

test('calculateTotalMoveInCost sums rent and deposit accurately', () => {
  const result = calculateTotalMoveInCost(300000, 600000);
  assert.equal(result.total, 900000);
  assert.equal(result.monthlyRent, 300000);
  assert.equal(result.depositAdvance, 600000);
});

test('slugify cleans accents and special characters into clean URL slugs', () => {
  assert.equal(slugify('Appartement F4 Sacré-Cœur 3'), 'appartement-f4-sacre-coeur-3');
  assert.equal(slugify('Villa Almadies vue d\'océan !'), 'villa-almadies-vue-docean');
});

test('generateListingSlug constructs a coherent readable listing slug', () => {
  const slug = generateListingSlug('Appartement Standing', 'Almadies', 'x9z1');
  assert.ok(slug.startsWith('appartement-standing-almadies-x9z1'));
});

test('validateRentalRequest flags spam when honeypot field is filled', () => {
  const res = validateRentalRequest({
    fullName: 'Mamadou Diallo',
    phone: '+221 77 123 45 67',
    consentCdp: true,
    honeypot: 'spam bot value',
  });
  assert.equal(res.isValid, false);
  assert.equal(res.isSpam, true);
});

test('validateRentalRequest accepts valid Senegalese phone numbers and consent', () => {
  const res = validateRentalRequest({
    fullName: 'Fatou Ndiaye',
    phone: '+221 77 654 32 10',
    email: 'fatou@example.com',
    message: 'Je souhaite visiter cet appartement samedi.',
    consentCdp: true,
  });
  assert.equal(res.isValid, true);
  assert.equal(res.isSpam, false);
  assert.equal(Object.keys(res.errors).length, 0);
  assert.equal(res.sanitized.fullName, 'Fatou Ndiaye');
});

test('validateRentalRequest rejects missing consent or invalid phone', () => {
  const res = validateRentalRequest({
    fullName: 'Alioune',
    phone: '123',
    consentCdp: false,
  });
  assert.equal(res.isValid, false);
  assert.ok(res.errors.phone);
  assert.ok(res.errors.consentCdp);
});

test('evaluateListingFreshness detects stale listings over 14 days and expired over 21 days', () => {
  const now = new Date('2026-10-20T12:00:00Z');
  
  // 5 days ago: fresh
  const fiveDaysAgo = new Date('2026-10-15T12:00:00Z');
  const freshRes = evaluateListingFreshness(fiveDaysAgo, 'disponible', now);
  assert.equal(freshRes.needsReminder, false);
  assert.equal(freshRes.needsAutoMask, false);
  assert.equal(freshRes.statusLabel, 'fresh');

  // 15 days ago: needs reminder
  const fifteenDaysAgo = new Date('2026-10-05T12:00:00Z');
  const reminderRes = evaluateListingFreshness(fifteenDaysAgo, 'disponible', now);
  assert.equal(reminderRes.needsReminder, true);
  assert.equal(reminderRes.needsAutoMask, false);
  assert.equal(reminderRes.statusLabel, 'warning');

  // 22 days ago: needs auto mask
  const twentyTwoDaysAgo = new Date('2026-09-28T12:00:00Z');
  const expiredRes = evaluateListingFreshness(twentyTwoDaysAgo, 'disponible', now);
  assert.equal(expiredRes.needsReminder, false);
  assert.equal(expiredRes.needsAutoMask, true);
  assert.equal(expiredRes.statusLabel, 'expired');
});

test('buildAdminEmailPayload formats destination and subject as required', () => {
  const email = buildAdminEmailPayload({
    requestId: 'req-123',
    listingTitle: 'Appartement F3 Almadies',
    listingNeighborhood: 'Almadies',
    listingRent: 450000,
    listingUrl: 'https://imovex.sn/location/dakar/almadies/appartement-f3-almadies',
    agencyName: 'Teranga Immobilier',
    tenantName: 'Ibrahima Sow',
    tenantPhone: '+221 78 111 22 33',
    adminDashboardUrl: 'https://imovex.sn/admin/demandes?id=req-123',
  });

  assert.equal(email.to, 'lmsite.creator@gmail.com');
  assert.equal(email.subject, 'Nouvelle demande — Appartement F3 Almadies — Almadies');
  assert.ok(email.html.includes('Ibrahima Sow'));
  assert.ok(email.html.includes('+221 78 111 22 33'));
  assert.ok(email.html.includes('Teranga Immobilier'));
  assert.ok(email.html.includes('450 000 FCFA / mois'));
});

test('getWhatsAppListingShareUrl generates properly encoded WhatsApp URL with listing details and localized text', () => {
  const listing = {
    id: 'listing-abc-123',
    title: 'Superbe Villa F5 avec Piscine',
    neighborhoodName: 'Almadies',
    monthlyRent: 1200000,
  };

  // Test FR
  const urlFR = getWhatsAppListingShareUrl(listing, 'fr');
  assert.ok(urlFR.startsWith('https://api.whatsapp.com/send?text='));
  const decodedFR = decodeURIComponent(urlFR.replace('https://api.whatsapp.com/send?text=', ''));
  assert.ok(decodedFR.includes('Superbe Villa F5 avec Piscine'));
  assert.ok(decodedFR.includes('Almadies, Dakar'));
  assert.ok(decodedFR.includes('1 200 000 FCFA / mois'));
  assert.ok(decodedFR.includes('Regarde ce logement disponible à Dakar'));
  assert.ok(decodedFR.includes('view=listing_detail&id=listing-abc-123'));

  // Test EN
  const urlEN = getWhatsAppListingShareUrl(listing, 'en');
  const decodedEN = decodeURIComponent(urlEN.replace('https://api.whatsapp.com/send?text=', ''));
  assert.ok(decodedEN.includes('Check out this property available in Dakar'));

  // Test AR
  const urlAR = getWhatsAppListingShareUrl(listing, 'ar');
  const decodedAR = decodeURIComponent(urlAR.replace('https://api.whatsapp.com/send?text=', ''));
  assert.ok(decodedAR.includes('شاهد هذا العقار المتاح للإيجار في دكار'));

  // Test ES
  const urlES = getWhatsAppListingShareUrl(listing, 'es');
  const decodedES = decodeURIComponent(urlES.replace('https://api.whatsapp.com/send?text=', ''));
  assert.ok(decodedES.includes('Mira este inmueble disponible en Dakar'));
});
