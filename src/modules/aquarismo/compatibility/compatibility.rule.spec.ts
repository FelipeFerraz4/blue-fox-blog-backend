import { AquarismoCompatibilityOverride, AquarismoTemperament, AquarismoWaterType } from '@prisma/client';
import { CompatibilitySpecies, evaluateCompatibility, worstLevel } from './compatibility.rule';

const base: CompatibilitySpecies = {
  id: 'x',
  scientificName: 'X',
  waterType: AquarismoWaterType.FRESH,
  adultSizeCm: 4,
  tempMinC: 22,
  tempMaxC: 26,
  phMin: 6,
  phMax: 7.5,
  temperament: AquarismoTemperament.PEACEFUL,
  finNipper: false,
  longFinned: false,
  conspecificAggression: false,
};
const sp = (over: Partial<CompatibilitySpecies>): CompatibilitySpecies => ({ ...base, ...over });

// Valores das fichas de exemplo (seed) — os mesmos casos da fase 4 do plano.
const neon = sp({ id: 'neon', scientificName: 'Paracheirodon innesi', tempMinC: 20, tempMaxC: 26, phMin: 5.5, phMax: 7 });
const cory = sp({ id: 'cory', scientificName: 'Corydoras aeneus', adultSizeCm: 7, tempMinC: 22, tempMaxC: 26, phMin: 6, phMax: 7.5 });
const betta = sp({
  id: 'betta',
  scientificName: 'Betta splendens',
  adultSizeCm: 6,
  tempMinC: 24,
  tempMaxC: 28,
  phMin: 6,
  phMax: 7.5,
  temperament: AquarismoTemperament.SEMI_AGGRESSIVE,
  longFinned: true,
  conspecificAggression: true,
});

describe('evaluateCompatibility', () => {
  it('neon + corydoras: compatible', () => {
    const r = evaluateCompatibility(neon, cory);
    expect(r.level).toBe('COMPATIBLE');
    expect(r.reasons).toEqual([]);
  });

  it('neon + betta: attention (semi-aggressive with a peaceful fish)', () => {
    const r = evaluateCompatibility(neon, betta, { names: { neon: 'Neon', betta: 'Betta' } });
    expect(r.level).toBe('ATTENTION');
    expect(r.reasons.map((x) => x.code)).toEqual(['TEMPERAMENT_SEMI_AGGRESSIVE']);
    expect(r.reasons[0].message).toContain('Betta é semiagressivo e pode perseguir Neon');
  });

  it('betta + betta: incompatible (males fight)', () => {
    const r = evaluateCompatibility(betta, betta);
    expect(r.level).toBe('INCOMPATIBLE');
    expect(r.reasons.map((x) => x.code)).toEqual(['CONSPECIFIC_AGGRESSION']);
  });

  it('same peaceful species is compatible with itself', () => {
    expect(evaluateCompatibility(neon, neon).level).toBe('COMPATIBLE');
  });

  it('flags temperature ranges that do not overlap or barely overlap', () => {
    const cold = sp({ id: 'cold', tempMinC: 10, tempMaxC: 20 });
    const warm = sp({ id: 'warm', tempMinC: 24, tempMaxC: 30 });
    expect(evaluateCompatibility(cold, warm).reasons[0].code).toBe('TEMPERATURE_NO_OVERLAP');
    const edge = sp({ id: 'edge', tempMinC: 25, tempMaxC: 30 });
    const r = evaluateCompatibility(base, edge);
    expect(r.level).toBe('ATTENTION');
    expect(r.reasons[0]).toMatchObject({ code: 'TEMPERATURE_NARROW' });
    expect(r.reasons[0].message).toContain('(1 °C)');
  });

  it('flags pH ranges that do not overlap or barely overlap', () => {
    expect(evaluateCompatibility(base, sp({ id: 'alk', phMin: 7.8, phMax: 8.5 })).reasons[0].code).toBe('PH_NO_OVERLAP');
    expect(evaluateCompatibility(base, sp({ id: 'n', phMin: 7.2, phMax: 8 })).reasons[0].code).toBe('PH_NARROW');
  });

  it('fin nipper with a long-finned fish is incompatible, in either order', () => {
    const barb = sp({ id: 'barb', finNipper: true, temperament: AquarismoTemperament.SEMI_AGGRESSIVE, tempMinC: 24, tempMaxC: 28 });
    const ab = evaluateCompatibility(barb, betta);
    const ba = evaluateCompatibility(betta, barb);
    expect(ab.level).toBe('INCOMPATIBLE');
    expect(ba.level).toBe('INCOMPATIBLE');
    expect(ab.reasons.some((x) => x.code === 'FIN_NIPPING')).toBe(true);
  });

  it('aggressive fish with a non-aggressive one is incompatible', () => {
    const cichlid = sp({ id: 'c', temperament: AquarismoTemperament.AGGRESSIVE, adultSizeCm: 10 });
    const r = evaluateCompatibility(neon, cichlid);
    expect(r.level).toBe('INCOMPATIBLE');
    expect(r.reasons.map((x) => x.code)).toContain('TEMPERAMENT_AGGRESSIVE');
  });

  it('a much larger fish asks for attention', () => {
    const big = sp({ id: 'big', adultSizeCm: 15 });
    expect(evaluateCompatibility(neon, big).reasons.map((x) => x.code)).toEqual(['SIZE_DIFFERENCE']);
  });

  it('different water types are incompatible', () => {
    expect(evaluateCompatibility(neon, sp({ id: 's', waterType: AquarismoWaterType.SALT })).level).toBe('INCOMPATIBLE');
  });

  it('a manual AVOID override wins and keeps the note', () => {
    const r = evaluateCompatibility(neon, cory, {
      override: { override: AquarismoCompatibilityOverride.AVOID, note: 'Teste.' },
    });
    expect(r.level).toBe('INCOMPATIBLE');
    expect(r.reasons.at(-1)).toMatchObject({ code: 'MANUAL_AVOID' });
    expect(r.reasons.at(-1)?.message).toContain('Teste.');
  });

  it('a manual COMPATIBLE override wins but keeps the computed warnings as notes', () => {
    const r = evaluateCompatibility(neon, betta, { override: { override: AquarismoCompatibilityOverride.COMPATIBLE } });
    expect(r.level).toBe('COMPATIBLE');
    expect(r.reasons.map((x) => x.code)).toEqual(['TEMPERAMENT_SEMI_AGGRESSIVE', 'MANUAL_COMPATIBLE']);
  });

  it('answers in English when asked', () => {
    const r = evaluateCompatibility(betta, betta, { locale: 'en', names: { betta: 'Betta' } });
    expect(r.reasons[0].message).toBe('Betta males fight each other: keep a single male.');
  });

  it('worstLevel picks the most severe level', () => {
    expect(worstLevel([])).toBe('COMPATIBLE');
    expect(worstLevel(['ATTENTION', 'COMPATIBLE'])).toBe('ATTENTION');
    expect(worstLevel(['ATTENTION', 'INCOMPATIBLE'])).toBe('INCOMPATIBLE');
  });
});
