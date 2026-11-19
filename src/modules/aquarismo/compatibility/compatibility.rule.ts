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

/** Sexo do indivíduo. Sem informação, a regra assume macho (o caso mais restritivo). */
export type FishSex = 'male' | 'female';

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
  /** Temperamento do macho quando difere (ex.: Betta). Nulo = igual a `temperament`. */
  maleTemperament?: AquarismoTemperament | null;
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
  | 'FEMALE_GROUP'
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
    'pt-BR': '{a} tem temperamento agressivo e tende a atacar {b}.',
    en: '{a} is aggressive and tends to attack {b}.',
  },
  TEMPERAMENT_SEMI_AGGRESSIVE: {
    'pt-BR': '{a} tem temperamento semiagressivo e pode perseguir {b}: ofereça espaço e esconderijos.',
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
  FEMALE_GROUP: {
    'pt-BR': 'Fêmeas de {a} podem viver em grupo, com atenção: 5 ou mais, aquário amplo e bem plantado, e separe as que brigarem.',
    en: '{a} females can live in a group, with care: 5 or more, a roomy, well-planted tank, and separate any that fight.',
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

/** Temperamento efetivo do indivíduo: o do macho vale quando o sexo é macho ou não foi informado. */
export function effectiveTemperament(s: CompatibilitySpecies, sex?: FishSex): AquarismoTemperament {
  return sex === 'female' ? s.temperament : (s.maleTemperament ?? s.temperament);
}

/** Um lado do par: a espécie, o rótulo a exibir (ex.: "Betta (macho)") e o temperamento efetivo. */
interface Side {
  s: CompatibilitySpecies;
  label: string;
  temperament: AquarismoTemperament;
}

/**
 * Avalia o par (a, b).
 * - `names`: nome a exibir por espécie (nome popular no idioma pedido); sem ele, o científico.
 * - `labelA`/`labelB`: rótulo de cada indivíduo (ex.: "Betta (fêmea)"); sem ele, o nome da espécie.
 * - `sexA`/`sexB`: só mudam algo em espécies com comportamento diferente por sexo
 *   (`maleTemperament`, `conspecificAggression`); sem sexo, vale macho.
 */
export function evaluateCompatibility(
  a: CompatibilitySpecies,
  b: CompatibilitySpecies,
  options: {
    locale?: string;
    names?: Record<string, string>;
    labelA?: string;
    labelB?: string;
    override?: CompatibilityOverrideInput | null;
    sexA?: FishSex;
    sexB?: FishSex;
  } = {},
): CompatibilityResult {
  const locale = options.locale ?? DEFAULT_LOCALE;
  const speciesName = (s: CompatibilitySpecies) => options.names?.[s.id] ?? s.scientificName;
  const A: Side = { s: a, label: options.labelA ?? speciesName(a), temperament: effectiveTemperament(a, options.sexA) };
  const B: Side = { s: b, label: options.labelB ?? speciesName(b), temperament: effectiveTemperament(b, options.sexB) };
  const reasons: CompatibilityReason[] = [];
  const add = (level: CompatibilityLevel, code: CompatibilityReasonCode, vars: Record<string, string> = {}) =>
    reasons.push({ level, code, message: message(code, locale, { a: A.label, b: B.label, ...vars }) });

  // Mesma espécie: os parâmetros são idênticos; importa o comportamento entre indivíduos.
  if (a.id === b.id) {
    const bothFemale = options.sexA === 'female' && options.sexB === 'female';
    const bothMale = options.sexA !== 'female' && options.sexB !== 'female';
    if (a.conspecificAggression && bothFemale) add('ATTENTION', 'FEMALE_GROUP', { a: speciesName(a) });
    else if (a.conspecificAggression && bothMale) add('INCOMPATIBLE', 'CONSPECIFIC_AGGRESSION', { a: speciesName(a) });
    else checkTemperament(A, B, add);
    return finish(reasons, options.override, locale, A, B);
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

  checkTemperament(A, B, add);

  // Comportamento é assimétrico: avalia nos dois sentidos.
  for (const [x, y] of [
    [A, B],
    [B, A],
  ] as const) {
    const vars = { a: x.label, b: y.label };
    if (x.s.finNipper && y.s.longFinned) add('INCOMPATIBLE', 'FIN_NIPPING', vars);
    if (x.s.adultSizeCm >= y.s.adultSizeCm * COMPATIBILITY_THRESHOLDS.sizeRatioAttention)
      add('ATTENTION', 'SIZE_DIFFERENCE', vars);
  }

  return finish(reasons, options.override, locale, A, B);
}

/** Temperamento efetivo (já considerando o sexo), nos dois sentidos. */
function checkTemperament(
  A: Side,
  B: Side,
  add: (level: CompatibilityLevel, code: CompatibilityReasonCode, vars?: Record<string, string>) => void,
) {
  for (const [x, y] of [
    [A, B],
    [B, A],
  ] as const) {
    const vars = { a: x.label, b: y.label };
    if (x.temperament === AquarismoTemperament.AGGRESSIVE && y.temperament !== AquarismoTemperament.AGGRESSIVE)
      add('INCOMPATIBLE', 'TEMPERAMENT_AGGRESSIVE', vars);
    else if (x.temperament === AquarismoTemperament.SEMI_AGGRESSIVE && y.temperament === AquarismoTemperament.PEACEFUL)
      add('ATTENTION', 'TEMPERAMENT_SEMI_AGGRESSIVE', vars);
  }
}

function finish(
  reasons: CompatibilityReason[],
  override: CompatibilityOverrideInput | null | undefined,
  locale: string,
  A: Side,
  B: Side,
): CompatibilityResult {
  if (override) {
    const code = override.override === AquarismoCompatibilityOverride.AVOID ? 'MANUAL_AVOID' : 'MANUAL_COMPATIBLE';
    const base = message(code, locale, { a: A.label, b: B.label });
    reasons.push({
      level: code === 'MANUAL_AVOID' ? 'INCOMPATIBLE' : 'COMPATIBLE',
      code,
      message: override.note ? `${base} ${override.note}` : base,
    });
    return { level: code === 'MANUAL_AVOID' ? 'INCOMPATIBLE' : 'COMPATIBLE', reasons };
  }
  return { level: worstLevel(reasons.map((r) => r.level)), reasons };
}
