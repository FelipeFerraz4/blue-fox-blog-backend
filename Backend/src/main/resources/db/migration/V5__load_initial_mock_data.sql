INSERT INTO authors (id, blog_id, name, bio, profile_picture_url, slug, email, status, created_at, updated_at)
VALUES (
           '1a3e5b7c-28ab-4add-9999-112233445566',
           '77e2c400-28ab-4add-b219-112233445566',
           'Felipe Ferraz',
           'Computer Scientist and Aquarist passionate about creating digital experiences and sharing knowledge about community planted aquariums.',
           'assets/images/authors/felipe-ferraz.webp',
           'felipe-ferraz',
           'felipeferraz@bluefoxaquarismo.space',
           'ACTIVE',
           NOW(),
           NOW()
       );

INSERT INTO categories (id, blog_id, name, description, slug, status, created_at, updated_at)
VALUES
    (
        'c1111111-28ab-4add-aaaa-112233445566', '77e2c400-28ab-4add-b219-112233445566',
        'Itens do Aquarismo', 'Artigos e guias sobre equipamentos, vidros, filtros e infraestrutura física para aquários.', 'itens-do-aquarismo',
        'ACTIVE', NOW(), NOW()
    ),
    (
        'c2222222-28ab-4add-aaaa-112233445566', '77e2c400-28ab-4add-b219-112233445566',
        'Fundamentos do Aquarismo', 'Conceitos essenciais e passos iniciais cruciais para a montagem e ciclagem do ecossistema.', 'fundamentos-do-aquarismo',
        'ACTIVE', NOW(), NOW()
    ),
    (
        'c3333333-28ab-4add-aaaa-112233445566', '77e2c400-28ab-4add-b219-112233445566',
        'Problemas no Aquarismo', 'Diagnósticos e soluções para problemas clássicos como efeito barriga, vazamentos e algas.', 'problemas-no-aquarismo',
        'ACTIVE', NOW(), NOW()
    ),
    (
        'c4444444-28ab-4add-aaaa-112233445566', '77e2c400-28ab-4add-b219-112233445566',
        'Cuidados com Peixes', 'Guias específicos sobre comportamento, alimentação, parâmetros ideais e longevidade de espécies.', 'cuidados-com-peixes',
        'ACTIVE', NOW(), NOW()
    );

INSERT INTO posts (id, blog_id, author_id, category_id, title, description, image_url, slug, reading_time, published, status, published_at, views, created_at, updated_at)
VALUES
    (
        '9f000001-28ab-4add-bbbb-112233445566', '77e2c400-28ab-4add-b219-112233445566', '1a3e5b7c-28ab-4add-9999-112233445566', 'c1111111-28ab-4add-aaaa-112233445566',
        'Guia Completo: Como Escolher o Aquário Ideal para Seu Projeto',
        'Descubra como escolher o aquário ideal para seu projeto. Entenda os materiais e fatores que influenciam na estética, durabilidade e bem-estar dos peixes.',
        'assets/images/aquariums/aquariums2.webp', 'aquarium-selection-guide', '8 min', TRUE, 'ACTIVE', '2026-03-24 00:00:00+00', 142, NOW(), NOW()
    ),
    (
        '9f000002-28ab-4add-bbbb-112233445566', '77e2c400-28ab-4add-b219-112233445566', '1a3e5b7c-28ab-4add-9999-112233445566', 'c2222222-28ab-4add-aaaa-112233445566',
        'Tamanhos de Aquário: Guia de Dimensões e Proporções',
        'Descubra como as dimensões influenciam na iluminação e na escolha dos peixes. Veja proporções para iniciantes, aquapaisagismo e jumbos.',
        'assets/images/aquariums/aquariums4.webp', 'aquarium-size', '12 min', TRUE, 'ACTIVE', '2026-03-28 00:00:00+00', 98, NOW(), NOW()
    ),
    (
        '9f000003-28ab-4add-bbbb-112233445566', '77e2c400-28ab-4add-b219-112233445566', '1a3e5b7c-28ab-4add-9999-112233445566', 'c3333333-28ab-4add-aaaa-112233445566',
        'Vidro de Aquário Curvado: Entenda o Perigo da Barriga',
        'Descubra por que o efeito barriga (vidro de aquário curvado) acontece e como travas francesas ou transversais podem salvar seu projeto.',
        'assets/images/aquariums/aquarium-glass-bowing.webp', 'aquarium-glass-bowing-danger', '8 min', TRUE, 'ACTIVE', '2026-04-02 00:00:00+00', 230, NOW(), NOW()
    ),
    (
        '9f000004-28ab-4add-bbbb-112233445566', '77e2c400-28ab-4add-b219-112233445566', '1a3e5b7c-28ab-4add-9999-112233445566', 'c4444444-28ab-4add-aaaa-112233445566',
        'Peixe Betta: 7 Cuidados Essenciais para Ele Viver Mais',
        'Descubra os 7 cuidados essenciais para garantir que seu peixe viva mais e com saúde. Melhore a água, a dieta e o ambiente do seu aquário.',
        'assets/images/fish/betta-fish.webp', 'betta-fish-7-care-tips', '10 min', TRUE, 'ACTIVE', '2026-04-13 00:00:00+00', 315, NOW(), NOW()
    ),
    (
        '9f000005-28ab-4add-bbbb-112233445566', '77e2c400-28ab-4add-b219-112233445566', '1a3e5b7c-28ab-4add-9999-112233445566', 'c1111111-28ab-4add-aaaa-112233445566',
        'Filtro de Aquário: Como Escolher o Melhor Tipo para Você',
        'Hang-on, Canister ou Sump? Descubra qual é o modelo ideal para seu projeto e não caia no mito do filtro que dispensa a TPA.',
        'assets/images/equipment/aquarium-filter-types-comparison2.webp', 'how-to-choose-aquarium-filter', '12 min', TRUE, 'ACTIVE', '2026-05-15 00:00:00+00', 188, NOW(), NOW()
    ),
    (
        '9f000006-28ab-4add-bbbb-112233445566', '77e2c400-28ab-4add-b219-112233445566', '1a3e5b7c-28ab-4add-9999-112233445566', 'c2222222-28ab-4add-aaaa-112233445566',
        'Filtragem no Aquário: Guia Prático de Todos os Tipos',
        'Entenda a diferença entre as filtragens mecânica, biológica, química e UV e aprenda a combiná-las para manter a água do seu tanque sempre saudável.',
        'assets/images/equipment/aquarium-filtration.webp', 'aquarium-filtration-guide', '12 min', FALSE, 'ACTIVE', NULL, 0, NOW(), NOW()
    ),
    (
        '9f000007-28ab-4add-bbbb-112233445566', '77e2c400-28ab-4add-b219-112233445566', '1a3e5b7c-28ab-4add-9999-112233445566', 'c2222222-28ab-4add-aaaa-112233445566',
        'TPA no Aquário: Guia Passo a Passo para Fazer Certo',
        'Aprenda a importância da troca parcial de água e aprenda o passo a passo seguro para renovar o seu ecossistema sem mistérios.',
        'assets/images/equipment/aquarium-siphon.webp', 'aquarium-tpa-guide', '12 min', FALSE, 'ACTIVE', NULL, 0, NOW(), NOW()
    ),
    (
        '9f000008-28ab-4add-bbbb-112233445566', '77e2c400-28ab-4add-b219-112233445566', '1a3e5b7c-28ab-4add-9999-112233445566', 'c4444444-28ab-4add-aaaa-112233445566',
        'Peixes Tetra: O que Você Precisa Saber Antes de Comprar',
        'Pensando em comprar peixes Tetra? Descubra o que você precisa saber sobre o comportamento em cardume, tamanho do aquário e parâmetros da água.',
        'assets/images/fish/tetra-fish.webp', 'tetra-fish-guide', '10 min', FALSE, 'ACTIVE', NULL, 0, NOW(), NOW()
    ),
    (
        '9f000009-28ab-4add-bbbb-112233445566', '77e2c400-28ab-4add-b219-112233445566', '1a3e5b7c-28ab-4add-9999-112233445566', 'c2222222-28ab-4add-aaaa-112233445566',
        'Aquário Comunitário: Guia Passo a Passo para Iniciantes',
        'Você sonha em montar um aquário comunitário? Veja o guia prático para iniciantes com dicas de filtragem, tamanho ideal do tanque e combinação de fauna.',
        'assets/images/aquariums/aquarium8.webp', 'community-aquarium-guide', '12 min', FALSE, 'ACTIVE', NULL, 0, NOW(), NOW()
    );