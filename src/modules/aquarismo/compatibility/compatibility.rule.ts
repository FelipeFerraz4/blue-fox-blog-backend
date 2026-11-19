import { AquarismoCompatibilityOverride, AquarismoTemperament, AquarismoWaterType } from '@prisma/client';
import { DEFAULT_LOCALE } from '../common/locale';

/**
 * Regra de compatibilidade entre duas espécies — fonte única, usada pelo catálogo e pela ferramenta
 * "Monte seu aquário". Função pura (sem banco), para ser testada e reaproveitada.
 *
 * Cada verificação gera um motivo com nível; o resultado é o pior nível encontrado.
 * Uma exceção manual (AVOID/COMPATIBLE) cadastrada para o par tem a palavra final.
 */

export type CompatibilityLevel = 'COMPATIBLE' | 'ATTENTION' | 'INCOMPATIBLE';

/** Campos da espécie que a regra usa (subconjunto do modelo Prisma). */
export interface CompatibilitySpecies {
  id: string;
  scientificName: string;
  waterType: AquarismoWaterType;
  adultSizeCm: number;
  tempMinC: number;
  tempMaxC: number;
  phMin: number;
  phMax: number;
  temperament: AquarismoTemperament;
  finNipper: boolean;
  longFinned: boolean;
  conspecificAggression: boolean;
}

export interface CompatibilityOverrideInput {
  override: AquarismoCompatibilityOverride;
  note?: string | null;
}

export type CompatibilityReasonCode =
  | 'WATER_TYPE'
  | 'TEMPERATURE_NO_OVERLAP'
  | 'TEMPERATURE_NARROW'
  | 'PH_NO_OVERLAP'
  | 'PH_NARROW'
  | 'TEMPERAMENT_AGGRESSIVE'
  | 'TEMPERAMENT_SEMI_AGGRESSIVE'
  | 'FIN_NIPPING'
  | 'SIZE_DIFFERENCE'
  | 'CONSPECIFIC_AGGRESSION'
  | 'MANUAL_AVOID'
  | 'MANUAL_COMPATIBLE';

export interface CompatibilityReason {
  level: CompatibilityLevel;
  code: CompatibilityReasonCode;
  message: string;
}

export interface CompatibilityResult {
  level: CompatibilityLevel;
  reasons: CompatibilityReason[];
}

/** Limiares da regra (ajuste aqui, num lugar só). */
export const COMPATIBILITY_THRESHOLDS = {
  /** Sobreposição de temperatura abaixo disso (°C) pede atenção. */
  minTempOverlapC: 2,
  /** Sobreposição de pH abaixo disso pede atenção. */
  minPhOverlap: 0.5,
  /** Peixe maior com tamanho adulto ≥ N× o menor pode tratá-lo como alimento. */
  sizeRatioAttention: 3,
} as const;

const RANK: Record<CompatibilityLevel, number> = { COMPATIBLE: 0, ATTENTION: 1, INCOMPATIBLE: 2 };

const fmt = (n: number) => Number(n.toFixed(1)).toString();

/** Mensagens por idioma (fallback no padrão). Placeholders: {a}, {b}, {overlap}. */
const MESSAGES: Record<CompatibilityReasonCode, Record<string, string>> = {
  WATER_TYPE: {
    'pt-BR': '{a} e {b} vivem em tipos de água diferentes.',
    en: '{a} and {b} live in different water types.',
  },
  TEMPERATURE_NO_OVERLAP: {
    'pt-BR': 'As faixas de temperatura de {a} e {b} não se sobrepõem.',
    en: 'The temperature ranges of {a} and {b} do not overlap.',
  },
  TEMPERATURE_NARROW: {
    'pt-BR': 'A faixa de temperatura em comum é estreita ({overlap} °C): mantenha o termostato no meio dela.',
    en: 'The shared temperature range is narrow ({overlap} °C): keep the thermostat in the middle of it.',
  },
  PH_NO_OVERLAP: {
    'pt-BR': 'As faixas de pH de {a} e {b} não se sobrepõem.',
    en: 'The pH ranges of {a} and {b} do not overlap.',
  },
  PH_NARROW: {
    'pt-BR': 'A faixa de pH em comum é estreita ({overlap}): exige água estável.',
    en: 'The shared pH range is narrow ({overlap}): it requires stable water.',
  },
  TEMPERAMENT_AGGRESSIVE: {
    'pt-BR': '{a} é agressivo e tende a atacar {b}.',
    en: '{a} is aggressive and tends to attack {b}.',
  },
  TEMPERAMENT_SEMI_AGGRESSIVE: {
    'pt-BR': '{a} é semiagressivo e pode perseguir {b}: ofereça espaço e esconderijos.',
    en: '{a} is semi-aggressive and may chase {b}: provide space and hiding places.',
  },
  FIN_NIPPING: {
    'pt-BR': '{a} belisca nadadeiras, e {b} tem nadadeiras longas.',
    en: '{a} nips fins, and {b} has long fins.',
  },
  SIZE_DIFFERENCE: {
    'pt-BR': '{a} fica bem maior que {b} e pode tratá-lo como alimento.',
    en: '{a} grows much larger than {b} and may treat it as food.',
  },
  CONSPECIFIC_AGGRESSION: {
    'pt-BR': 'Machos de {a} brigam entre si: mantenha só um macho.',
    en: '{a} males fight each other: keep a single male.',
  },
  MANUAL_AVOID: {
    'pt-BR': 'Combinação a evitar (exceção cadastrada).',
    en: 'Combination to avoid (registered exception).',
  },
  MANUAL_COMPATIBLE: {
    'pt-BR': 'Combinação aprovada (exceção cadastrada); os avisos acima continuam valendo como cuidado.',
    en: 'Approved combination (registered exception); the warnings above still apply as care notes.',
  },
};

function message(code: CompatibilityReasonCode, locale: string, vars: Record<string, string>): string {
  const template = MESSAGES[code][locale] ?? MESSAGES[code][DEFAULT_LOCALE];
  return template.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
}

export function worstLevel(levels: CompatibilityLevel[]): CompatibilityLevel {
  return levels.reduce<CompatibilityLevel>((acc, l) => (RANK[l] > RANK[acc] ? l : acc), 'COMPATIBLE');
}

/**
 * Avalia o par (a, b). `names` traz o nome a exibir de cada espécie (nome popular no idioma pedido);
 * sem ele, usa o nome científico.
 */
export function evaluateCompatibility(
  a: CompatibilitySpecies,
  b: CompatibilitySpecies,
  options: { locale?: string; names?: Record<string, string>; override?: CompatibilityOverrideInput | null } = {},
): CompatibilityResult {
  const locale = options.locale ?? DEFAULT_LOCALE;
  const name = (s: CompatibilitySpecies) => options.names?.[s.id] ?? s.scientificName;
  const reasons: CompatibilityReason[] = [];
  const add = (level: CompatibilityLevel, code: CompatibilityReasonCode, vars: Record<string, string> = {}) =>
    reasons.push({ level, code, message: message(code, locale, { a: name(a), b: name(b), ...vars }) });

  // Mesma espécie: só importa a briga entre machos (os parâmetros são idênticos).
  if (a.id === b.id) {
    if (a.conspecificAggression) add('INCOMPATIBLE', 'CONSPECIFIC_AGGRESSION');
    return finish(reasons, options.override, locale, a, b, name);
  }

  if (a.waterType !== b.waterType) add('INCOMPATIBLE', 'WATER_TYPE');

  const tempOverlap = Math.min(a.tempMaxC, b.tempMaxC) - Math.max(a.tempMinC, b.tempMinC);
  if (tempOverlap < 0) add('INCOMPATIBLE', 'TEMPERATURE_NO_OVERLAP');
  else if (tempOverlap < COMPATIBILITY_THRESHOLDS.minTempOverlapC)
    add('ATTENTION', 'TEMPERATURE_NARROW', { overlap: fmt(tempOverlap) });

  const phOverlap = Math.min(a.phMax, b.phMax) - Math.max(a.phMin, b.phMin);
  if (phOverlap < 0) add('INCOMPATIBLE', 'PH_NO_OVERLAP');
  else if (phOverlap < COMPATIBILITY_THRESHOLDS.minPhOverlap)
    add('ATTENTION', 'PH_NARROW', { overlap: fmt(phOverlap) });

  // Temperamento e comportamento são assimétricos: avalia nos dois sentidos.
  for (const [x, y] of [
    [a, b],
    [b, a],
  ] as const) {
    const vars = { a: name(x), b: name(y) };
    if (x.temperament === AquarismoTemperament.AGGRESSIVE && y.temperament !== AquarismoTemperament.AGGRESSIVE)
      add('INCOMPATIBLE', 'TEMPERAMENT_AGGRESSIVE', vars);
    else if (
      x.temperament === AquarismoTemperament.SEMI_AGGRESSIVE &&
      y.temperament === AquarismoTemperament.PEACEFUL
    )
      add('ATTENTION', 'TEMPERAMENT_SEMI_AGGRESSIVE', vars);

    if (x.finNipper && y.longFinned) add('INCOMPATIBLE', 'FIN_NIPPING', vars);

    if (x.adultSizeCm >= y.adultSizeCm * COMPATIBILITY_THRESHOLDS.sizeRatioAttention)
      add('ATTENTION', 'SIZE_DIFFERENCE', vars);
  }

  return finish(reasons, options.override, locale, a, b, name);
}

function finish(
  reasons: CompatibilityReason[],
  override: CompatibilityOverrideInput | null | undefined,
  locale: string,
  a: CompatibilitySpecies,
  b: CompatibilitySpecies,
  name: (s: CompatibilitySpecies) => string,
): CompatibilityResult {
  if (override) {
    const code = override.override === AquarismoCompatibilityOverride.AVOID ? 'MANUAL_AVOID' : 'MANUAL_COMPATIBLE';
    const base = message(code, locale, { a: name(a), b: name(b) });
    reasons.push({
      level: code === 'MANUAL_AVOID' ? 'INCOMPATIBLE' : 'COMPATIBLE',
      code,
      message: override.note ? `${base} ${override.note}` : base,
    });
    return { level: code === 'MANUAL_AVOID' ? 'INCOMPATIBLE' : 'COMPATIBLE', reasons };
  }
  return { level: worstLevel(reasons.map((r) => r.level)), reasons };
}
