import {
  AquarismoBreeding,
  AquarismoDiet,
  AquarismoDifficulty,
  AquarismoEquipmentType,
  AquarismoLevel,
  AquarismoPublication,
  AquarismoSizingUnit,
  AquarismoSwimLayer,
  AquarismoTechLevel,
  AquarismoTemperament,
  AquarismoWaterType,
  PrismaClient,
} from '@prisma/client';
import { DEFAULT_BLOG_ID } from './blogs.seed';

/**
 * Catálogo do Aquarismo: fichas de exemplo para validar o modelo (fase 4 do plano).
 *
 * - Tudo entra como REVIEWED (não público): o deploy roda o seed em produção, e os números precisam
 *   da conferência de um aquarista antes de um editor mudar para PUBLISHED pela API.
 * - `update: {}`: o seed nunca altera um registro que já existe (edições feitas pela API são preservadas).
 * - Valores alinhados com os artigos publicados (tetra-fish-guide, betta-fish-7-care-tips,
 *   community-aquarium-guide). Os que não aparecem nos artigos (GH, pH do Corydoras etc.) estão
 *   marcados "conferir" no plano (plano-aquarismo/04-modelo-de-dados.md).
 */

const REVIEWED = AquarismoPublication.REVIEWED;
const REVIEWED_AT = new Date('2026-11-19T00:00:00.000Z');

const FAMILIES = [
  {
    id: 'af000001-28ab-4add-aaaa-112233445566',
    scientificName: 'Characidae',
    slug: 'characidae',
    translations: [
      { locale: 'pt-BR', name: 'Caracídeos (tetras)', description: 'Família dos tetras: peixes pequenos de cardume, quase todos da América do Sul e da África.' },
      { locale: 'en', name: 'Characins (tetras)', description: 'The tetra family: small schooling fish, mostly from South America and Africa.' },
    ],
  },
  {
    id: 'af000002-28ab-4add-aaaa-112233445566',
    scientificName: 'Callichthyidae',
    slug: 'callichthyidae',
    translations: [
      { locale: 'pt-BR', name: 'Calictídeos (coridoras)', description: 'Bagres de fundo com placas ósseas, como as coridoras, que vivem em grupo.' },
      { locale: 'en', name: 'Armoured catfishes (corydoras)', description: 'Bottom-dwelling catfish with bony plates, such as corydoras, that live in groups.' },
    ],
  },
  {
    id: 'af000003-28ab-4add-aaaa-112233445566',
    scientificName: 'Osphronemidae',
    slug: 'osphronemidae',
    translations: [
      { locale: 'pt-BR', name: 'Osfronemídeos (labirintídeos)', description: 'Peixes que respiram ar da superfície pelo órgão labirinto, como o Betta e os gouramis.' },
      { locale: 'en', name: 'Gouramis (labyrinth fish)', description: 'Fish that breathe surface air through the labyrinth organ, such as the betta and gouramis.' },
    ],
  },
];

const BIOMES = [
  {
    id: 'ab000001-28ab-4add-aaaa-112233445566',
    slug: 'amazonia',
    tempMinC: 24,
    tempMaxC: 28,
    phMin: 5,
    phMax: 7,
    ghMin: 0,
    ghMax: 8,
    current: AquarismoLevel.LOW,
    light: AquarismoLevel.MEDIUM,
    techLevel: AquarismoTechLevel.LOW,
    translations: [
      {
        locale: 'pt-BR',
        name: 'Amazônia',
        region: 'Bacia amazônica, América do Sul',
        description: 'Rios e igarapés de água mole e levemente ácida, com folhas e galhos no fundo e luz filtrada pela mata.',
        substrate: 'Areia fina e clara, com folhas secas.',
        hardscape: 'Troncos e raízes.',
        plants: 'Poucas plantas submersas; plantas flutuantes fazem sombra.',
      },
      {
        locale: 'en',
        name: 'Amazon',
        region: 'Amazon basin, South America',
        description: 'Soft, slightly acidic rivers and streams with leaves and branches on the bottom and light filtered by the forest.',
        substrate: 'Fine, light sand with dry leaves.',
        hardscape: 'Driftwood and roots.',
        plants: 'Few submerged plants; floating plants provide shade.',
      },
    ],
  },
  {
    id: 'ab000002-28ab-4add-aaaa-112233445566',
    slug: 'sudeste-asiatico',
    tempMinC: 24,
    tempMaxC: 30,
    phMin: 6,
    phMax: 7.5,
    ghMin: 2,
    ghMax: 12,
    current: AquarismoLevel.LOW,
    light: AquarismoLevel.MEDIUM,
    techLevel: AquarismoTechLevel.LOW,
    translations: [
      {
        locale: 'pt-BR',
        name: 'Sudeste Asiático',
        region: 'Tailândia, Camboja, Laos e Vietnã',
        description: 'Arrozais, pântanos e canais rasos de água parada e quente, com muita vegetação.',
        substrate: 'Fundo escuro e lodoso.',
        hardscape: 'Galhos e folhas.',
        plants: 'Vegetação densa e plantas flutuantes.',
      },
      {
        locale: 'en',
        name: 'Southeast Asia',
        region: 'Thailand, Cambodia, Laos and Vietnam',
        description: 'Rice paddies, swamps and shallow canals with warm, still water and plenty of vegetation.',
        substrate: 'Dark, muddy bottom.',
        hardscape: 'Branches and leaves.',
        plants: 'Dense vegetation and floating plants.',
      },
    ],
  },
];

const SPECIES = [
  {
    id: 'a5000001-28ab-4add-aaaa-112233445566',
    slug: 'paracheirodon-innesi',
    scientificName: 'Paracheirodon innesi',
    familyId: FAMILIES[0].id,
    biomeIds: [BIOMES[0].id],
    waterType: AquarismoWaterType.FRESH,
    adultSizeCm: 4,
    minVolumeL: 60,
    minTankLengthCm: 60,
    minGroupSize: 6,
    tempMinC: 20,
    tempMaxC: 26,
    phMin: 5.5,
    phMax: 7,
    ghMin: 1,
    ghMax: 10,
    temperament: AquarismoTemperament.PEACEFUL,
    layers: [AquarismoSwimLayer.MIDDLE],
    activity: AquarismoLevel.MEDIUM,
    difficulty: AquarismoDifficulty.BEGINNER,
    diet: AquarismoDiet.OMNIVORE,
    needsPlants: true,
    needsHiding: true,
    breeding: AquarismoBreeding.HARD,
    imageUrl: 'assets/images/fish/tetra-fish.webp',
    sources: ['https://www.seriouslyfish.com/species/paracheirodon-innesi/', 'https://www.fishbase.se/summary/Paracheirodon-innesi.html'],
    translations: [
      {
        locale: 'pt-BR',
        commonName: 'Tetra-neon',
        otherNames: ['Neon'],
        region: 'Afluentes dos rios Solimões, Purus e Negro (Amazônia)',
        description:
          'Pequeno tetra de cardume com a faixa azul brilhante e a parte de trás vermelha. Pacífico e resistente quando o aquário já está ciclado, vive melhor em grupos de pelo menos 6 a 10 peixes, em aquários compridos, plantados e com luz não muito forte.',
        careNotes: 'Só introduza em aquário ciclado e estável. Em grupo pequeno fica tímido e perde a cor.',
      },
      {
        locale: 'en',
        commonName: 'Neon tetra',
        otherNames: ['Neon'],
        region: 'Tributaries of the Solimões, Purus and Negro rivers (Amazon)',
        description:
          'A small schooling tetra with a bright blue stripe and a red rear half. Peaceful and hardy once the tank is cycled, it does best in groups of at least 6 to 10 fish, in long, planted tanks with moderate light.',
        careNotes: 'Only add it to a cycled, stable tank. In small groups it becomes shy and loses its colour.',
      },
    ],
  },
  {
    id: 'a5000002-28ab-4add-aaaa-112233445566',
    slug: 'corydoras-aeneus',
    scientificName: 'Corydoras aeneus',
    familyId: FAMILIES[1].id,
    biomeIds: [BIOMES[0].id],
    waterType: AquarismoWaterType.FRESH,
    adultSizeCm: 7,
    minVolumeL: 60,
    minTankLengthCm: 60,
    minGroupSize: 6,
    tempMinC: 22,
    tempMaxC: 26,
    phMin: 6,
    phMax: 7.5,
    ghMin: 2,
    ghMax: 12,
    temperament: AquarismoTemperament.PEACEFUL,
    layers: [AquarismoSwimLayer.BOTTOM],
    activity: AquarismoLevel.MEDIUM,
    difficulty: AquarismoDifficulty.BEGINNER,
    diet: AquarismoDiet.OMNIVORE,
    needsHiding: true,
    breeding: AquarismoBreeding.MODERATE,
    sources: ['https://www.seriouslyfish.com/species/corydoras-aeneus/', 'https://www.fishbase.se/summary/Corydoras-aeneus.html'],
    translations: [
      {
        locale: 'pt-BR',
        commonName: 'Coridora-bronze',
        otherNames: ['Corydoras aeneus', 'Coridora'],
        region: 'Ampla distribuição na América do Sul, incluindo a bacia amazônica',
        description:
          'Bagrinho de fundo, pacífico e sociável, que passa o dia revirando o substrato atrás de comida. Precisa de grupo (6 ou mais) e de fundo de areia fina, que não machuca os barbilhões.',
        careNotes: 'Não é "faxineiro": precisa de alimento próprio que afunde (pastilhas de fundo).',
      },
      {
        locale: 'en',
        commonName: 'Bronze corydoras',
        otherNames: ['Corydoras aeneus', 'Cory'],
        region: 'Widespread in South America, including the Amazon basin',
        description:
          'A peaceful, social bottom-dwelling catfish that spends the day sifting the substrate for food. It needs a group (6 or more) and fine sand, which does not hurt its barbels.',
        careNotes: 'It is not a "cleaner": it needs its own sinking food (bottom wafers).',
      },
    ],
  },
  {
    id: 'a5000003-28ab-4add-aaaa-112233445566',
    slug: 'betta-splendens',
    scientificName: 'Betta splendens',
    familyId: FAMILIES[2].id,
    biomeIds: [BIOMES[1].id],
    waterType: AquarismoWaterType.FRESH,
    adultSizeCm: 6,
    minVolumeL: 15,
    minTankLengthCm: 30,
    minGroupSize: 1,
    tempMinC: 24,
    tempMaxC: 28,
    phMin: 6,
    phMax: 7.5,
    ghMin: 2,
    ghMax: 12,
    temperament: AquarismoTemperament.SEMI_AGGRESSIVE,
    longFinned: true,
    territorial: true,
    conspecificAggression: true,
    layers: [AquarismoSwimLayer.SURFACE, AquarismoSwimLayer.MIDDLE],
    activity: AquarismoLevel.LOW,
    difficulty: AquarismoDifficulty.BEGINNER,
    diet: AquarismoDiet.CARNIVORE,
    needsPlants: true,
    needsHiding: true,
    jumps: true,
    breeding: AquarismoBreeding.MODERATE,
    suitableForBreedingSale: true,
    imageUrl: 'assets/images/fish/betta-fish.webp',
    sources: ['https://www.seriouslyfish.com/species/betta-splendens/', 'https://www.fishbase.se/summary/Betta-splendens.html'],
    translations: [
      {
        locale: 'pt-BR',
        commonName: 'Betta',
        otherNames: ['Peixe-de-briga', 'Betta splendens'],
        region: 'Arrozais e pântanos do Sudeste Asiático',
        description:
          'Labirintídeo de nadadeiras longas que respira ar da superfície. O macho é territorial e briga com outros machos, por isso vive sozinho. Precisa de água aquecida (26 a 28 °C é o ideal), tampa no aquário e corrente fraca.',
        careNotes: 'Nada de "beteiras" de 1 a 2 litros: 15 a 20 litros é o ponto de partida. Abaixo de 40 litros, mantenha-o sozinho.',
      },
      {
        locale: 'en',
        commonName: 'Betta',
        otherNames: ['Siamese fighting fish', 'Betta splendens'],
        region: 'Rice paddies and swamps of Southeast Asia',
        description:
          'A long-finned labyrinth fish that breathes air at the surface. Males are territorial and fight other males, so they live alone. It needs heated water (26 to 28 °C is ideal), a lid and a gentle current.',
        careNotes: 'No 1–2 litre bowls: 15 to 20 litres is the starting point. Below 40 litres, keep it alone.',
      },
    ],
  },
];

const EQUIPMENT = [
  {
    id: 'ae000001-28ab-4add-aaaa-112233445566',
    slug: 'filtro',
    type: AquarismoEquipmentType.FILTER,
    waterTypes: [AquarismoWaterType.FRESH],
    sizingUnit: AquarismoSizingUnit.TURNOVER_PER_HOUR,
    sizingMin: 5,
    sizingMax: 10,
    guideSlug: 'how-to-choose-aquarium-filter',
    translations: [
      {
        locale: 'pt-BR',
        name: 'Filtro',
        description: 'Faz a filtragem mecânica, biológica e química da água. É o equipamento central do aquário.',
        sizingNote: 'Vazão de 5 a 10 vezes o volume do aquário por hora.',
      },
      {
        locale: 'en',
        name: 'Filter',
        description: 'Provides mechanical, biological and chemical filtration. It is the core piece of equipment in the tank.',
        sizingNote: 'Flow of 5 to 10 times the tank volume per hour.',
      },
    ],
  },
  {
    id: 'ae000002-28ab-4add-aaaa-112233445566',
    slug: 'aquecedor',
    type: AquarismoEquipmentType.HEATER,
    waterTypes: [AquarismoWaterType.FRESH, AquarismoWaterType.SALT],
    sizingUnit: AquarismoSizingUnit.WATTS_PER_LITER,
    sizingMin: 0.5,
    sizingMax: 1,
    translations: [
      {
        locale: 'pt-BR',
        name: 'Aquecedor com termostato',
        description: 'Mantém a temperatura estável, essencial para peixes tropicais.',
        sizingNote: 'De 0,5 a 1 W por litro; em ambientes frios, fique perto de 1 W/L.',
      },
      {
        locale: 'en',
        name: 'Heater with thermostat',
        description: 'Keeps the temperature stable, which tropical fish need.',
        sizingNote: '0.5 to 1 W per litre; in cold rooms, stay close to 1 W/L.',
      },
    ],
  },
  {
    id: 'ae000003-28ab-4add-aaaa-112233445566',
    slug: 'iluminacao',
    type: AquarismoEquipmentType.LIGHTING,
    waterTypes: [AquarismoWaterType.FRESH],
    translations: [
      {
        locale: 'pt-BR',
        name: 'Iluminação',
        description: 'Luminária de LED para as plantas e para ver os peixes. Em aquário low tech, 6 a 8 horas por dia.',
      },
      {
        locale: 'en',
        name: 'Lighting',
        description: 'An LED light for the plants and to see the fish. In a low-tech tank, 6 to 8 hours a day.',
      },
    ],
  },
  {
    id: 'ae000004-28ab-4add-aaaa-112233445566',
    slug: 'kit-de-testes',
    type: AquarismoEquipmentType.TEST_KIT,
    waterTypes: [AquarismoWaterType.FRESH],
    translations: [
      {
        locale: 'pt-BR',
        name: 'Kit de testes',
        description: 'Testes de amônia, nitrito, nitrato e pH para acompanhar a ciclagem e a qualidade da água.',
      },
      {
        locale: 'en',
        name: 'Test kit',
        description: 'Ammonia, nitrite, nitrate and pH tests to follow cycling and water quality.',
      },
    ],
  },
];

export async function seedAquarismo(prisma: PrismaClient) {
  console.log('  → Populando catálogo do Aquarismo (famílias, biomas, espécies, equipamentos)...');
  const blogId = DEFAULT_BLOG_ID;

  for (const { translations, ...f } of FAMILIES) {
    await prisma.aquarismoFamily.upsert({
      where: { id: f.id },
      update: {},
      create: { ...f, blogId, translations: { create: translations } },
    });
  }

  for (const { translations, ...b } of BIOMES) {
    await prisma.aquarismoBiome.upsert({
      where: { id: b.id },
      update: {},
      create: { ...b, blogId, publication: REVIEWED, translations: { create: translations } },
    });
  }

  for (const { translations, biomeIds, ...s } of SPECIES) {
    await prisma.aquarismoSpecies.upsert({
      where: { id: s.id },
      update: {},
      create: {
        ...s,
        blogId,
        publication: REVIEWED,
        lastReviewedAt: REVIEWED_AT,
        translations: { create: translations },
        biomes: { create: biomeIds.map((biomeId) => ({ biomeId })) },
      },
    });
  }

  for (const { translations, ...e } of EQUIPMENT) {
    await prisma.aquarismoEquipment.upsert({
      where: { id: e.id },
      update: {},
      create: { ...e, blogId, publication: REVIEWED, translations: { create: translations } },
    });
  }

  console.log(`  ✓ Aquarismo: ${FAMILIES.length} famílias, ${BIOMES.length} biomas, ${SPECIES.length} espécies, ${EQUIPMENT.length} equipamentos.`);
}
