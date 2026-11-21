import test from 'node:test';
import assert from 'node:assert';
import { translations } from './translations.ts';
import type { Language } from './translations.ts';

test('translations dictionary contains all 4 supported languages', () => {
  const languages: Language[] = ['fr', 'en', 'ar', 'es'];
  for (const lang of languages) {
    assert.ok(translations[lang], `Translations should exist for language: ${lang}`);
    assert.strictEqual(typeof translations[lang].brandName, 'string');
    assert.strictEqual(typeof translations[lang].navHome, 'string');
    assert.strictEqual(typeof translations[lang].themeWhite, 'string');
    assert.strictEqual(typeof translations[lang].themeBlack, 'string');
  }
});

test('Arabic dictionary has proper Arabic labels and keywords', () => {
  const ar = translations.ar;
  assert.strictEqual(ar.navHome, 'الرئيسية');
  assert.strictEqual(ar.themeWhite, 'أبيض');
  assert.strictEqual(ar.themeBlack, 'أسود');
  assert.strictEqual(ar.heroSearchButton, 'بحث');
});

test('Spanish dictionary has proper Spanish labels and keywords', () => {
  const es = translations.es;
  assert.strictEqual(es.navHome, 'Inicio');
  assert.strictEqual(es.themeWhite, 'Blanco');
  assert.strictEqual(es.themeBlack, 'Negro');
  assert.strictEqual(es.heroSearchButton, 'Buscar');
});

test('English dictionary has proper English labels and keywords', () => {
  const en = translations.en;
  assert.strictEqual(en.navHome, 'Home');
  assert.strictEqual(en.themeWhite, 'White');
  assert.strictEqual(en.themeBlack, 'Black');
  assert.strictEqual(en.heroSearchButton, 'Search');
});
