-- Migration de dados (sem mudança de schema).
-- Publica os 4 guias que já existiam como rascunho no banco de produção. O seed usa `update: {}` e nunca
-- altera posts existentes, então só uma migration (aplicada uma única vez pelo `migrate deploy`) resolve.
-- Em bancos novos não encontra nenhum post e não faz nada: o seed, que roda depois, já os cria publicados.

UPDATE "posts"
SET "published" = true,
    "published_at" = '2026-10-19T00:00:00Z',
    "updated_at" = CURRENT_TIMESTAMP
WHERE "slug" IN (
        'aquarium-filtration-guide',
        'aquarium-tpa-guide',
        'tetra-fish-guide',
        'community-aquarium-guide'
    )
  AND "published" = false;

-- Título e descrição encurtados do aquário comunitário (mesmo texto do posts.seed.ts).
UPDATE "posts"
SET "title" = 'Aquário Comunitário: Guia Passo a Passo',
    "description" = 'Você sonha em montar um aquário comunitário? Veja o guia prático com dicas de filtragem, tamanho ideal do tanque e combinação de fauna.',
    "updated_at" = CURRENT_TIMESTAMP
WHERE "slug" = 'community-aquarium-guide';
