import { DEFAULT_LOCALE, matchLocale, pickTranslation, resolveLocale } from './locale';

describe('aquarismo locale', () => {
  it('matches exact codes, case-insensitively, and base languages', () => {
    expect(matchLocale('pt-BR')).toBe('pt-BR');
    expect(matchLocale('pt-br')).toBe('pt-BR');
    expect(matchLocale('pt')).toBe('pt-BR');
    expect(matchLocale('en-US')).toBe('en');
    expect(matchLocale('de')).toBeNull();
    expect(matchLocale('')).toBeNull();
  });

  it('prefers ?lang, then Accept-Language by quality, then the default', () => {
    expect(resolveLocale('en', 'pt-BR')).toBe('en');
    expect(resolveLocale(undefined, 'de-DE,en;q=0.8,pt;q=0.5')).toBe('en');
    expect(resolveLocale(undefined, 'pt;q=0.4,en;q=0.9')).toBe('en');
    expect(resolveLocale('xx', 'fr')).toBe(DEFAULT_LOCALE);
    expect(resolveLocale()).toBe(DEFAULT_LOCALE);
  });

  it('picks the requested translation, then pt-BR, then any', () => {
    const pt = { locale: 'pt-BR', name: 'pt' };
    const en = { locale: 'en', name: 'en' };
    expect(pickTranslation([pt, en], 'en')).toBe(en);
    expect(pickTranslation([pt, en], 'de')).toBe(pt);
    expect(pickTranslation([en], 'de')).toBe(en);
    expect(pickTranslation([], 'en')).toBeNull();
  });
});
