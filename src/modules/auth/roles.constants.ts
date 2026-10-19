/**
 * Roles do realm "blue-fox-global-group" (blue-fox-iam/realm-config/realm-export.json).
 * Use sempre estas constantes no @Roles() para manter o backend alinhado com o Keycloak.
 */
export const KeycloakRole = {
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER',
  AQUARIUM_ADMIN: 'ROLE_AQUARIUM_ADMIN',
  AQUARIUM_EDITOR: 'ROLE_AQUARIUM_EDITOR',
  AQUARIUM_USER: 'ROLE_AQUARIUM_USER',
} as const;

export type KeycloakRole = (typeof KeycloakRole)[keyof typeof KeycloakRole];
