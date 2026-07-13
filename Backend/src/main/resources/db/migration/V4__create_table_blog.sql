CREATE TABLE blogs (
                       id UUID NOT NULL,
                       name VARCHAR(255) NOT NULL,
                       slug VARCHAR(255) NOT NULL,
                       status VARCHAR(50) NOT NULL,
                       created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                       updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
                       CONSTRAINT pk_blogs PRIMARY KEY (id),
                       CONSTRAINT uq_blogs_slug UNIQUE (slug)
);

-- Dataload
INSERT INTO blogs (id, name, slug, status, created_at, updated_at)
VALUES ('77e2c400-28ab-4add-b219-112233445566', 'Blue Fox Aquarismo', 'blue-fox-aquarismo', 'ACTIVE', NOW(), NOW());

-- Tabela de Authors
ALTER TABLE authors ADD COLUMN blog_id UUID;
UPDATE authors SET blog_id = '77e2c400-28ab-4add-b219-112233445566' WHERE blog_id IS NULL;
ALTER TABLE authors ALTER COLUMN blog_id SET NOT NULL;
ALTER TABLE authors ADD CONSTRAINT fk_authors_blogs FOREIGN KEY (blog_id) REFERENCES blogs (id);

-- Tabela de Categorias
ALTER TABLE categories ADD COLUMN blog_id UUID;
UPDATE categories SET blog_id = '77e2c400-28ab-4add-b219-112233445566' WHERE blog_id IS NULL;
ALTER TABLE categories ALTER COLUMN blog_id SET NOT NULL;
ALTER TABLE categories ADD CONSTRAINT fk_categories_blogs FOREIGN KEY (blog_id) REFERENCES blogs (id);

-- Tabela de Posts
ALTER TABLE posts ADD COLUMN blog_id UUID;
UPDATE posts SET blog_id = '77e2c400-28ab-4add-b219-112233445566' WHERE blog_id IS NULL;
ALTER TABLE posts ALTER COLUMN blog_id SET NOT NULL;
ALTER TABLE posts ADD CONSTRAINT fk_posts_blogs FOREIGN KEY (blog_id) REFERENCES blogs (id);