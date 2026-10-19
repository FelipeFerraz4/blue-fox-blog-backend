import { canSeeInactive, canSeeUnpublished } from './content-visibility';
import { KeycloakUser } from './jwt.strategy';

const userWith = (...roles: string[]): KeycloakUser => ({ sub: 'u1', roles });

describe('canSeeUnpublished', () => {
  it('denies anonymous visitors (no token)', () => {
    expect(canSeeUnpublished(null)).toBe(false);
    expect(canSeeUnpublished(undefined)).toBe(false);
  });

  it('allows admins and aquarium editors/admins, with or without the ROLE_ prefix', () => {
    expect(canSeeUnpublished(userWith('ROLE_ADMIN'))).toBe(true);
    expect(canSeeUnpublished(userWith('ROLE_AQUARIUM_ADMIN'))).toBe(true);
    expect(canSeeUnpublished(userWith('ROLE_AQUARIUM_EDITOR', 'AQUARIUM_EDITOR'))).toBe(true);
  });

  it('denies authenticated users without a content role (e.g. finance or plain users)', () => {
    expect(canSeeUnpublished(userWith('ROLE_USER'))).toBe(false);
    expect(canSeeUnpublished(userWith('ROLE_FINANCE_ADMIN', 'ROLE_AQUARIUM_USER'))).toBe(false);
    expect(canSeeUnpublished(userWith())).toBe(false);
  });

  it('exposes the same rule for categories and authors', () => {
    expect(canSeeInactive(userWith('ROLE_AQUARIUM_EDITOR'))).toBe(true);
    expect(canSeeInactive(null)).toBe(false);
  });
});
