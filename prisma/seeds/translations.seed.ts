import { PrismaClient } from '@prisma/client';

/**
 * Traduções em inglês dos títulos/descrições dos posts e dos nomes das categorias.
 * `update: {}`: o seed só cria; traduções editadas depois pela API são preservadas.
 * O texto dos artigos em inglês fica no front (componente de cada artigo).
 */
const POSTS_EN: Record<string, { title: string; description: string }> = {
  '9f000001-28ab-4add-bbbb-112233445566': {
    title: 'Complete Guide: How to Choose the Right Aquarium for Your Project',
    description: 'Learn how to choose the right aquarium: materials and the factors that affect looks, durability and the well-being of your fish.',
  },
  '9f000002-28ab-4add-bbbb-112233445566': {
    title: 'Aquarium Sizes: A Guide to Dimensions and Proportions',
    description: 'See how dimensions affect lighting and fish choice, with proportions for beginners, aquascaping and large tanks.',
  },
  '9f000003-28ab-4add-bbbb-112233445566': {
    title: 'Bowing Aquarium Glass: Understanding the Danger',
    description: 'Find out why aquarium glass bows outward and how euro braces and cross braces can save your tank.',
  },
  '9f000004-28ab-4add-bbbb-112233445566': {
    title: 'Betta Fish: 7 Essential Care Tips for a Longer Life',
    description: 'The 7 essential care tips to keep your betta healthy for longer: better water, diet and tank setup.',
  },
  '9f000005-28ab-4add-bbbb-112233445566': {
    title: 'Aquarium Filters: How to Choose the Best Type for You',
    description: 'Hang-on, canister or sump? Find the right filter for your tank and avoid the myth of a filter that replaces water changes.',
  },
  '9f000006-28ab-4add-bbbb-112233445566': {
    title: 'Aquarium Filtration: A Practical Guide to Every Type',
    description: 'Understand mechanical, biological, chemical and UV filtration and how to combine them to keep your tank water healthy.',
  },
  '9f000007-28ab-4add-bbbb-112233445566': {
    title: 'Aquarium Water Changes: A Step-by-Step Guide',
    description: 'Why partial water changes matter and a safe step-by-step routine to refresh your aquarium.',
  },
  '9f000008-28ab-4add-bbbb-112233445566': {
    title: 'Tetra Fish: What You Need to Know Before Buying',
    description: 'Thinking about buying tetras? Learn about schooling behaviour, tank size and water parameters first.',
  },
  '9f000009-28ab-4add-bbbb-112233445566': {
    title: 'Community Aquarium: A Step-by-Step Guide',
    description: 'Dreaming of a community tank? A practical guide to filtration, tank size and choosing fish that get along.',
  },
  '9f00000a-28ab-4add-bbbb-112233445566': {
    title: 'Planted Aquarium: A Beginner’s Guide',
    description: 'How to set up a planted tank: light, CO₂ and nutrients, the easiest plants to start with and how to prevent algae.',
  },
};

const CATEGORIES_EN: Record<string, { name: string; description: string }> = {
  'c1111111-28ab-4add-aaaa-112233445566': {
    name: 'Aquarium Equipment',
    description: 'Articles and guides about equipment, glass, filters and the physical setup of aquariums.',
  },
  'c2222222-28ab-4add-aaaa-112233445566': {
    name: 'Fishkeeping Basics',
    description: 'Essential concepts and first steps for setting up and cycling the ecosystem.',
  },
  'c3333333-28ab-4add-aaaa-112233445566': {
    name: 'Aquarium Problems',
    description: 'Diagnosis and solutions for classic problems such as bowing glass, leaks and algae.',
  },
  'c4444444-28ab-4add-aaaa-112233445566': {
    name: 'Fish Care',
    description: 'Species-specific guides on behaviour, feeding, ideal parameters and lifespan.',
  },
};

export async function seedTranslations(prisma: PrismaClient) {
  console.log('  → Populando traduções (en) de posts e categorias...');
  let posts = 0;
  for (const [postId, t] of Object.entries(POSTS_EN)) {
    if (!(await prisma.post.findUnique({ where: { id: postId }, select: { id: true } }))) continue;
    await prisma.postTranslation.upsert({
      where: { postId_locale: { postId, locale: 'en' } },
      update: {},
      create: { postId, locale: 'en', ...t },
    });
    posts++;
  }
  let categories = 0;
  for (const [categoryId, t] of Object.entries(CATEGORIES_EN)) {
    if (!(await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } }))) continue;
    await prisma.categoryTranslation.upsert({
      where: { categoryId_locale: { categoryId, locale: 'en' } },
      update: {},
      create: { categoryId, locale: 'en', ...t },
    });
    categories++;
  }
  console.log(`  ✓ Traduções: ${posts} posts e ${categories} categorias (en).`);
}
