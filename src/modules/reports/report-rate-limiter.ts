import { Injectable } from '@nestjs/common';

/**
 * Limite de relatos por IP, em memória (janela deslizante). Complementa o rate limit geral do nginx:
 * aqui o limite é bem menor, só para o envio de relatos. Reinicia junto com o processo — suficiente
 * para conter abuso de um visitante; não substitui um limitador distribuído se houver várias instâncias.
 */
@Injectable()
export class ReportRateLimiter {
  static readonly MAX_PER_WINDOW = 5;
  static readonly WINDOW_MS = 10 * 60 * 1000;

  private readonly hits = new Map<string, number[]>();

  /** Registra a tentativa e diz se ela está dentro do limite. */
  allow(ip: string, now = Date.now()): boolean {
    const recent = (this.hits.get(ip) ?? []).filter((t) => now - t < ReportRateLimiter.WINDOW_MS);
    if (recent.length >= ReportRateLimiter.MAX_PER_WINDOW) {
      this.hits.set(ip, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(ip, recent);
    if (this.hits.size > 10_000) this.prune(now);
    return true;
  }

  private prune(now: number) {
    for (const [ip, times] of this.hits) {
      if (times.every((t) => now - t >= ReportRateLimiter.WINDOW_MS)) this.hits.delete(ip);
    }
  }
}

/**
 * IP do cliente atrás do proxy reverso: o nginx acrescenta o IP real no fim do X-Forwarded-For,
 * então vale o último item (os anteriores podem ter sido forjados pelo cliente).
 */
export function clientIp(headers: Record<string, string | string[] | undefined>, fallback?: string): string {
  const raw = headers['x-forwarded-for'];
  const value = Array.isArray(raw) ? raw[raw.length - 1] : raw;
  const last = value?.split(',').map((s) => s.trim()).filter(Boolean).pop();
  return last || headers['x-real-ip']?.toString() || fallback || 'unknown';
}
