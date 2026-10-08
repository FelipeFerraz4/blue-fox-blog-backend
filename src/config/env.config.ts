export interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  KEYCLOAK_ISSUER_URI: string;
  SWAGGER_ENABLED: boolean;
  LOG_LEVEL: string;
}

export const loadEnvConfig = (): EnvConfig => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = parseInt(process.env.PORT || '8081', 10);

  // Computar DATABASE_URL se variáveis individuais foram fornecidas
  let databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl && process.env.DB_HOST) {
    const user = process.env.DB_USER || 'postgres';
    const password = encodeURIComponent(process.env.DB_PASSWORD || 'postgres');
    const host = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '5432';
    const dbName = process.env.DB_NAME || 'blog_db';
    databaseUrl = `postgresql://${user}:${password}@${host}:${dbPort}/${dbName}?schema=public`;
  }

  return {
    NODE_ENV: nodeEnv,
    PORT: port,
    DATABASE_URL: databaseUrl || 'postgresql://postgres:postgres@localhost:5432/blog_db?schema=public',
    KEYCLOAK_ISSUER_URI: process.env.KEYCLOAK_ISSUER_URI || 'http://localhost:8080/auth/realms/blue-fox-global-group',
    SWAGGER_ENABLED: process.env.SWAGGER_ENABLED !== 'false',
    LOG_LEVEL: process.env.LOG_LEVEL || (nodeEnv === 'production' ? 'info' : 'debug'),
  };
};
