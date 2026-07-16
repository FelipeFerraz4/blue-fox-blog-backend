-- 1. Atualização da tabela posts para suportar a coluna de likes
ALTER TABLE posts
    ADD COLUMN likes BIGINT NOT NULL DEFAULT 0;

-- 2. Criação da tabela comments
CREATE TABLE comments (
                          id UUID NOT NULL DEFAULT gen_random_uuid(),
                          blog_id UUID NOT NULL,
                          post_id UUID NOT NULL,
                          content TEXT NOT NULL,
                          author_name VARCHAR(255) NOT NULL,
                          status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
                          created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                          updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

                          CONSTRAINT pk_comments PRIMARY KEY (id),

    -- Validação do enum status do comentário
                          CONSTRAINT chk_comments_status CHECK (
                              status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING', 'DELETED')
                              ),

    -- Chave estrangeira para a tabela posts (se o post for excluído, os comentários são removidos)
                          CONSTRAINT fk_comments_post FOREIGN KEY (post_id)
                              REFERENCES posts (id) ON DELETE CASCADE,

    -- Chave estrangeira para a tabela blogs (garante o isolamento multi-tenant)
                          CONSTRAINT fk_comments_blog FOREIGN KEY (blog_id)
                              REFERENCES blogs (id) ON DELETE RESTRICT
);

-- 3. Criação de índices de performance para otimizar buscas frequentes
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_blog_id ON comments(blog_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- 4. Ajuste dos dados existentes (Zera as visualizações e garante os likes em zero)
UPDATE posts
SET views = 0,
    likes = 0;