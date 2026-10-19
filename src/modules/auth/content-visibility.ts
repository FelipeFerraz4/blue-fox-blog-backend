import { KeycloakRole } from './roles.constants';
import { KeycloakUser } from './jwt.strategy';

/** Papéis que gerenciam o conteúdo do blog e, por isso, enxergam rascunhos e itens inativos. */
const CONTENT_MANAGER_ROLES: string[] = [
  KeycloakRole.ADMIN,
  KeycloakRole.AQUARIUM_ADMIN,
  KeycloakRole.AQUARIUM_EDITOR,
];

/**
 * Rotas públicas aceitam um token opcional. Visitantes anônimos só recebem conteúdo publicado e ativo;
 * quem tem papel de editor ou admin também vê rascunhos (para revisar e publicar).
 */
export function canSeeUnpublished(user?: KeycloakUser | null): boolean {
  return !!user?.roles?.some((role) => CONTENT_MANAGER_ROLES.includes(role));
}

/** Mesma regra para categorias e autores: itens inativos ou removidos só aparecem para quem gerencia o conteúdo. */
export const canSeeInactive = canSeeUnpublished;
