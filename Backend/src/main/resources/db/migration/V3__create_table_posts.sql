CREATE TABLE posts (
   id UUID NOT NULL DEFAULT gen_random_uuid(),
   title VARCHAR(255) NOT NULL,
   description VARCHAR(160) NOT NULL,
   image_url VARCHAR(255),
   slug VARCHAR(255) NOT NULL,
   reading_time VARCHAR(255),
   published BOOLEAN NOT NULL DEFAULT FALSE,
   status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
   published_at TIMESTAMP WITH TIME ZONE,
   views BIGINT NOT NULL DEFAULT 0,
   author_id UUID NOT NULL,
   category_id UUID NOT NULL,
   created_at TIMESTAMP WITH TIME ZONE NOT NULL,
   updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

   CONSTRAINT pk_posts PRIMARY KEY (id),
   CONSTRAINT uq_posts_slug UNIQUE (slug),
   CONSTRAINT chk_posts_status CHECK (
       status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING', 'DELETED')
   ),

   CONSTRAINT fk_posts_author FOREIGN KEY (author_id)
       REFERENCES authors (id) ON DELETE RESTRICT,

   CONSTRAINT fk_posts_category FOREIGN KEY (category_id)
       REFERENCES categories (id) ON DELETE RESTRICT
);

CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);