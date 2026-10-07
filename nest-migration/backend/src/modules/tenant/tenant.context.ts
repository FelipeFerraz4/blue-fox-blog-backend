import { AsyncLocalStorage } from 'async_hooks';

export interface TenantStore {
  tenantId: string;
}

const asyncLocalStorage = new AsyncLocalStorage<TenantStore>();

export const DEFAULT_TENANT_ID = '77e2c400-28ab-4add-b219-112233445566';

export class TenantContext {
  /**
   * Executa uma função dentro do contexto isolado do tenant atual.
   * Impede vazamento de dados entre requisições concorrentes no Node.js.
   */
  static run<T>(tenantId: string, callback: () => T): T {
    return asyncLocalStorage.run({ tenantId }, callback);
  }

  /**
   * Retorna o ID do tenant da requisição atual.
   * Se nenhum tenant foi configurado, retorna o tenant padrão.
   */
  static getTenantId(): string {
    const store = asyncLocalStorage.getStore();
    return store?.tenantId || DEFAULT_TENANT_ID;
  }

  /**
   * Verifica se há um tenant explicitamente definido no contexto assíncrono.
   */
  static hasTenant(): boolean {
    const store = asyncLocalStorage.getStore();
    return !!store?.tenantId;
  }
}
