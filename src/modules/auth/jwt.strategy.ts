import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';

export interface KeycloakUser {
  sub: string;
  email?: string;
  preferred_username?: string;
  roles: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const issuerUri = configService.get<string>(
      'KEYCLOAK_ISSUER_URI',
      'http://localhost:8080/auth/realms/blue-fox-global-group',
    );

    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${issuerUri}/protocol/openid-connect/certs`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      issuer: issuerUri,
      algorithms: ['RS256'],
    });
  }

  validate(payload: any): KeycloakUser {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Token inválido ou sem subject (sub)');
    }

    // Extração das roles do Keycloak (compatível com KeycloakJwtAuthenticationConverter.java)
    const realmAccess = payload.realm_access;
    const rawRoles: string[] = Array.isArray(realmAccess?.roles)
      ? realmAccess.roles
      : [];

    // Normaliza roles: garante suporte tanto a 'ADMIN' quanto a 'ROLE_ADMIN'
    const normalizedRoles = new Set<string>();
    rawRoles.forEach((role) => {
      normalizedRoles.add(role);
      if (role.startsWith('ROLE_')) {
        normalizedRoles.add(role.substring(5));
      } else {
        normalizedRoles.add(`ROLE_${role}`);
      }
    });

    return {
      sub: payload.sub,
      email: payload.email,
      preferred_username: payload.preferred_username,
      roles: Array.from(normalizedRoles),
    };
  }
}
