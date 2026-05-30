CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'
        CHECK (
            status IN (
                       'ACTIVE',
                       'INACTIVE',
                       'SUSPENDED',
                       'PENDING',
                       'DELETED'
            )
        ),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);