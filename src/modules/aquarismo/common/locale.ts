import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Idiomas ativos do catálogo. Fonte única no backend (o front tem a sua `SUPPORTED_LOCALES`):
 * para ativar um idioma, inclua-o aqui e cadastre as linhas de tradução — sem migration.
 * O primeiro é o padrão e o fallback quando falta tradução.
 */
export const SUPPORTED_LOCALES = ['pt-BR', 'en'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = SUPPORTED_LOCALES[0];

/** Casa um código (pt, pt-br, en-US...) com um idioma ativo: primeiro exato, depois pelo idioma base. */
export function matchLocale(code?: string | null): SupportedLocale | null {
  if (!code) return null;
  const wanted = code.trim().toLowerCase();
  if (!wanted) return null;
  const exact = SUPPORTED_LOCALES.find((l) => l.toLowerCase() === wanted);
  if (exact) return exact;
  const base = wanted.split('-')[0];
  return SUPPORTED_LOCALES.find((l) => l.toLowerCase().split('-')[0] === base) ?? null;
}

/**
 * Idioma da resposta: `?lang=` tem prioridade; depois o `Accept-Language` (na ordem de preferência
 * do cliente, respeitando q); senão o padrão.
 */
export function resolveLocale(lang?: string | null, acceptLanguage?: string | null): SupportedLocale {
  const fromQuery = matchLocale(lang);
  if (fromQuery) return fromQuery;
  if (acceptLanguage) {
    const ranked = acceptLanguage
      .split(',')
      .map((part) => {
        const [code, ...params] = part.trim().split(';');
        const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
        return { code, q: q ? Number(q.slice(2)) || 0 : 1 };
      })
      .sort((a, b) => b.q - a.q);
    for (const { code } of ranked) {
      const match = matchLocale(code);
      if (match) return match;
    }
  }
  return DEFAULT_LOCALE;
}

/** Parâmetro de rota com o idioma resolvido da requisição (`?lang=` ou `Accept-Language`). */
export const RequestLocale = createParamDecorator((_data: unknown, ctx: ExecutionContext): SupportedLocale => {
  const req = ctx.switchToHttp().getRequest();
  const lang = typeof req.query?.lang === 'string' ? req.query.lang : undefined;
  return resolveLocale(lang, req.headers?.['accept-language']);
});

/**
 * Escolhe a tradução no idioma pedido, com fallback para o padrão (pt-BR) e, por último, a primeira
 * que existir — nunca devolve texto vazio quando há alguma tradução.
 */
export function pickTranslation<T extends { locale: string }>(translations: T[], locale: string): T | null {
  return (
    translations.find((t) => t.locale === locale) ??
    translations.find((t) => t.locale === DEFAULT_LOCALE) ??
    translations[0] ??
    null
  );
}
