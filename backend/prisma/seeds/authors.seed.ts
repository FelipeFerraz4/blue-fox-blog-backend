import { PrismaClient, Status } from '@prisma/client';
import { DEFAULT_BLOG_ID } from './blogs.seed';

export const DEFAULT_AUTHOR_ID = '1a3e5b7c-28ab-4add-9999-112233445566';

export async function seedAuthors(prisma: PrismaClient) {
  console.log('  → Populando Autores padrão...');

  await prisma.author.upsert({
    where: { id: DEFAULT_AUTHOR_ID },
    update: {},
    create: {
      id: DEFAULT_AUTHOR_ID,
      blogId: DEFAULT_BLOG_ID,
      name: 'Felipe Ferraz',
      bio: 'Computer Scientist and Aquarist passionate about creating digital experiences and sharing knowledge about community planted aquariums.',
      profilePictureUrl: 'assets/images/authors/felipe-ferraz.webp',
      slug: 'felipe-ferraz',
      email: 'felipeferraz@bluefoxaquarismo.space',
      status: Status.ACTIVE,
    },
  });
}
