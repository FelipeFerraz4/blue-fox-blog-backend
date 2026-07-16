-- 1. Limpa todas as relações antigas para evitar violação de Foreign Keys
DELETE FROM post_recommendations;
DELETE FROM comments;
DELETE FROM posts;

-- 2. Insere os posts de teste atualizados (com a coluna likes) utilizando IDs em UUIDs compatíveis
INSERT INTO posts (
    id, blog_id, author_id, category_id, title, description, image_url, slug,
    reading_time, published, status, published_at, views, likes, created_at, updated_at
)
VALUES
    (
        '9f000001-28ab-4add-bbbb-112233445566', '77e2c400-28ab-4add-b219-112233445566', '1a3e5b7c-28ab-4add-9999-112233445566', 'c1111111-28ab-4add-aaaa-112233445566',
        'Guia Completo: Como Escolher o Aquário Ideal para Seu Projeto',
        'Descubra como escolher o aquário ideal para seu projeto. Entenda os materiais e fatores que influenciam na estética, durabilidade e bem-estar dos peixes.',
        'assets/images/aquariums/aquariums2.webp', 'aquarium-selection-guide', '8 min', TRUE, 'ACTIVE', '2026-03-24 00:00:00+00', 0, 0, NOW(), NOW()
    ),
    (
        '9f000002-28ab-4add-bbbb-112233445566', '77e2c400-28ab-4add-b219-112233445566', '1a3e5b7c-28ab-4add-9999-112233445566', 'c2222222-28ab-4add-aaaa-112233445566',
        'Tamanhos de Aquário: Guia de Dimensões e Proporções',
        'Descubra como as dimensões influenciam na iluminação e na escolha dos peixes. Veja proporções para iniciantes, aquapaisagismo e jumbos.',
        'assets/images/aquariums/aquariums4.webp', 'aquarium-size', '12 min', TRUE, 'ACTIVE', '2026-03-28 00:00:00+00', 0, 0, NOW(), NOW()
    ),
    (
        '9f000003-28ab-4add-bbbb-112233445566', '77e2c400-28ab-4add-b219-112233445566', '1a3e5b7c-28ab-4add-9999-112233445566', 'c3333333-28ab-4add-aaaa-112233445566',
        'Vidro de Aquário Curvado: Entenda o Perigo da Barriga',
        'Descubra por que o efeito barriga (vidro de aquário curvado) acontece e como travas francesas ou transversais podem salvar seu projeto.',
        'assets/images/aquariums/aquarium-glass-bowing.webp', 'aquarium-glass-bowing-danger', '8 min', TRUE, 'ACTIVE', '2026-04-02 00:00:00+00', 0, 0, NOW(), NOW()
    ),
    (
        '9f000004-28ab-4add-bbbb-112233445566', '77e2c400-28ab-4add-b219-112233445566', '1a3e5b7c-28ab-4add-9999-112233445566', 'c4444444-28ab-4add-aaaa-112233445566',
        'Peixe Betta: 7 Cuidados Essenciais para Ele Viver Mais',
        'Descubra os 7 cuidados essenciais para garantir que seu peixe viva mais e com saúde. Melhore a água, a dieta e o ambiente do seu aquário.',
        'assets/images/fish/betta-fish.webp', 'betta-fish-7-care-tips', '10 min', TRUE, 'ACTIVE', '2026-04-13 00:00:00+00', 0, 0, NOW(), NOW()
    ),
    (
        '9f000005-28ab-4add-bbbb-112233445566', '77e2c400-28ab-4add-b219-112233445566', '1a3e5b7c-28ab-4add-9999-112233445566', 'c1111111-28ab-4add-aaaa-112233445566',
        'Filtro de Aquário: Como Escolher o Melhor Tipo para Você',
        'Hang-on, Canister ou Sump? Descubra qual é o modelo ideal para seu projeto e não caia no mito do filtro que dispensa a TPA.',
        'assets/images/equipment/aquarium-filter-types-comparison2.webp', 'how-to-choose-aquarium-filter', '12 min', TRUE, 'ACTIVE', '2026-05-15 00:00:00+00', 0, 0, NOW(), NOW()
    ),
    (
        '9f000006-28ab-4add-bbbb-112233445566', '77e2c400-28ab-4add-b219-112233445566', '1a3e5b7c-28ab-4add-9999-112233445566', 'c2222222-28ab-4add-aaaa-112233445566',
        'Filtragem no Aquário: Guia Prático de Todos os Tipos',
        'Entenda a diferença entre as filtragens mecânica, biológica, química e UV e aprenda a combiná-las para manter a água do seu tanque sempre saudável.',
        'assets/images/equipment/aquarium-filtration.webp', 'aquarium-filtration-guide', '12 min', FALSE, 'ACTIVE', NULL, 0, 0, NOW(), NOW()
    ),
    (
        '9f000007-28ab-4add-bbbb-112233445566', '77e2c400-28ab-4add-b219-112233445566', '1a3e5b7c-28ab-4add-9999-112233445566', 'c2222222-28ab-4add-aaaa-112233445566',
        'TPA no Aquário: Guia Passo a Passo para Fazer Certo',
        'Aprenda a importância da troca parcial de água e aprenda o passo a passo seguro para renovar o seu ecossistema sem mistérios.',
        'assets/images/equipment/aquarium-siphon.webp', 'aquarium-tpa-guide', '12 min', FALSE, 'ACTIVE', NULL, 0, 0, NOW(), NOW()
    ),
    (
        '9f000008-28ab-4add-bbbb-112233445566', '77e2c400-28ab-4add-b219-112233445566', '1a3e5b7c-28ab-4add-9999-112233445566', 'c4444444-28ab-4add-aaaa-112233445566',
        'Peixes Tetra: O que Você Precisa Saber Antes de Comprar',
        'Pensando em comprar peixes Tetra? Descubra o que você precisa saber sobre o comportamento em cardume, tamanho do aquário e parâmetros da água.',
        'assets/images/fish/tetra-fish.webp', 'tetra-fish-guide', '10 min', FALSE, 'ACTIVE', NULL, 0, 0, NOW(), NOW()
    ),
    (
        '9f000009-28ab-4add-bbbb-112233445566', '77e2c400-28ab-4add-b219-112233445566', '1a3e5b7c-28ab-4add-9999-112233445566', 'c2222222-28ab-4add-aaaa-112233445566',
        'Aquário Comunitário: Guia Passo a Passo para Iniciantes',
        'Você sonha em montar um aquário comunitário? Veja o guia prático para iniciantes com dicas de filtragem, tamanho ideal do tanque e combinação de fauna.',
        'assets/images/aquariums/aquarium8.webp', 'community-aquarium-guide', '12 min', FALSE, 'ACTIVE', NULL, 0, 0, NOW(), NOW()
    );

-- 3. Mapeamento das recomendações traduzido de [Slug -> IDs recomendados] para UUIDs correspondentes
INSERT INTO post_recommendations (post_id, recommended_post_id)
VALUES
    -- 'tetra-fish-guide' (9) recomenda 'betta-fish-7-care-tips' (4) e 'aquarium-filtration-guide' (6)
    ('9f000008-28ab-4add-bbbb-112233445566', '9f000004-28ab-4add-bbbb-112233445566'),
    ('9f000008-28ab-4add-bbbb-112233445566', '9f000006-28ab-4add-bbbb-112233445566'),

    -- 'how-to-choose-aquarium-filter' (5) recomenda 'aquarium-selection-guide' (1) e 'betta-fish-7-care-tips' (4)
    ('9f000005-28ab-4add-bbbb-112233445566', '9f000001-28ab-4add-bbbb-112233445566'),
    ('9f000005-28ab-4add-bbbb-112233445566', '9f000004-28ab-4add-bbbb-112233445566'),

    -- 'community-aquarium-guide' (9) recomenda 'betta-fish-7-care-tips' (4) e 'tetra-fish-guide' (8)
    ('9f000009-28ab-4add-bbbb-112233445566', '9f000004-28ab-4add-bbbb-112233445566'),
    ('9f000009-28ab-4add-bbbb-112233445566', '9f000008-28ab-4add-bbbb-112233445566'),

    -- 'betta-fish-7-care-tips' (4) recomenda 'aquarium-selection-guide' (1) e 'aquarium-glass-bowing-danger' (3)
    ('9f000004-28ab-4add-bbbb-112233445566', '9f000001-28ab-4add-bbbb-112233445566'),
    ('9f000004-28ab-4add-bbbb-112233445566', '9f000003-28ab-4add-bbbb-112233445566'),

    -- 'aquarium-tpa-guide' (7) recomenda 'how-to-choose-aquarium-filter' (5) e 'aquarium-filtration-guide' (6)
    ('9f000007-28ab-4add-bbbb-112233445566', '9f000005-28ab-4add-bbbb-112233445566'),
    ('9f000007-28ab-4add-bbbb-112233445566', '9f000006-28ab-4add-bbbb-112233445566'),

    -- 'aquarium-size' (2) recomenda 'aquarium-selection-guide' (1) e 'aquarium-glass-bowing-danger' (3)
    ('9f000002-28ab-4add-bbbb-112233445566', '9f000001-28ab-4add-bbbb-112233445566'),
    ('9f000002-28ab-4add-bbbb-112233445566', '9f000003-28ab-4add-bbbb-112233445566'),

    -- 'aquarium-selection-guide' (1) recomenda 'aquarium-size' (2) e 'aquarium-glass-bowing-danger' (3)
    ('9f000001-28ab-4add-bbbb-112233445566', '9f000002-28ab-4add-bbbb-112233445566'),
    ('9f000001-28ab-4add-bbbb-112233445566', '9f000003-28ab-4add-bbbb-112233445566'),

    -- 'aquarium-glass-bowing-danger' (3) recomenda 'aquarium-selection-guide' (1) e 'aquarium-size' (2)
    ('9f000003-28ab-4add-bbbb-112233445566', '9f000001-28ab-4add-bbbb-112233445566'),
    ('9f000003-28ab-4add-bbbb-112233445566', '9f000002-28ab-4add-bbbb-112233445566'),

    -- 'aquarium-filtration-guide' (6) recomenda 'peixe-betta-cuidados' (4) e 'how-to-choose-aquarium-filter' (5)
    ('9f000006-28ab-4add-bbbb-112233445566', '9f000004-28ab-4add-bbbb-112233445566'),
    ('9f000006-28ab-4add-bbbb-112233445566', '9f000005-28ab-4add-bbbb-112233445566');