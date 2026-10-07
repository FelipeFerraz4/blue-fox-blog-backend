import { PrismaClient, Status } from '@prisma/client';
import { DEFAULT_BLOG_ID } from './blogs.seed';

export const CATEGORIES_SEED = [
  {
    id: 'c1111111-28ab-4add-aaaa-112233445566',
    blogId: DEFAULT_BLOG_ID,
    name: 'Itens do Aquarismo',
    description: 'Artigos e guias sobre equipamentos, vidros, filtros e infraestrutura física para aquários.',
    slug: 'itens-do-aquarismo',
    status: Status.ACTIVE,
  },
  {
    id: 'c2222222-28ab-4add-aaaa-112233445566',
    blogId: DEFAULT_BLOG_ID,
    name: 'Fundamentos do Aquarismo',
    description: 'Conceitos essenciais e passos iniciais cruciais para a montagem e ciclagem do ecossistema.',
    slug: 'fundamentos-do-aquarismo',
    status: Status.ACTIVE,
  },
  {
    id: 'c3333333-28ab-4add-aaaa-112233445566',
    blogId: DEFAULT_BLOG_ID,
    name: 'Problemas no Aquarismo',
    description: 'Diagnósticos e soluções para problemas clássicos como efeito barriga, vazamentos e algas.',
    slug: 'problemas-no-aquarismo',
    status: Status.ACTIVE,
  },
  {
    id: 'c4444444-28ab-4add-aaaa-112233445566',
    blogId: DEFAULT_BLOG_ID,
    name: 'Cuidados com Peixes',
    description: 'Guias específicos sobre comportamento, alimentação, parâmetros ideais e longevidade de espécies.',
    slug: 'cuidados-com-peixes',
    status: Status.ACTIVE,
  },
];

export async function seedCategories(prisma: PrismaClient) {
  console.log('  → Populando Categorias padrão...');

  for (const cat of CATEGORIES_SEED) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    });
  }
}
