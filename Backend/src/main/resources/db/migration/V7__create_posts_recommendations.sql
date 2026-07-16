CREATE TABLE post_recommendations (
    post_id UUID NOT NULL,
    recommended_post_id UUID NOT NULL,

    -- Define que o mesmo ID de recomendação não se repita para o mesmo post
    CONSTRAINT pk_post_recommendations PRIMARY KEY (post_id, recommended_post_id),

    -- Deleta as recomendações caso o post pai seja excluído
    CONSTRAINT fk_recommendations_post FOREIGN KEY (post_id)
        REFERENCES posts (id) ON DELETE CASCADE
);

-- Índice para acelerar a busca dos IDs recomendados de um post
CREATE INDEX idx_post_recommendations_post_id ON post_recommendations(post_id);