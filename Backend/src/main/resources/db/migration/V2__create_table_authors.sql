CREATE TABLE authors (
     id UUID NOT NULL DEFAULT gen_random_uuid(),
     name VARCHAR(255) NOT NULL,
     bio TEXT,
     profile_picture_url VARCHAR(255),
     slug VARCHAR(255) NOT NULL,
     email VARCHAR(255) NOT NULL,
     status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
     created_at TIMESTAMP WITH TIME ZONE NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

     CONSTRAINT pk_authors PRIMARY KEY (id),
     CONSTRAINT uq_authors_slug UNIQUE (slug),
     CONSTRAINT uq_authors_email UNIQUE (email),
     CONSTRAINT chk_authors_status CHECK (
         status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING', 'DELETED')
     )
);