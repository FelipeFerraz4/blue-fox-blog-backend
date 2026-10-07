import { PrismaClient, Status } from '@prisma/client';

export const DEFAULT_BLOG_ID = '77e2c400-28ab-4add-b219-112233445566';

export async function seedBlogs(prisma: PrismaClient) {
  console.log('  → Populando Blog padrão...');

  await prisma.blog.upsert({
    where: { id: DEFAULT_BLOG_ID },
    update: {},
    create: {
      id: DEFAULT_BLOG_ID,
      name: 'Blue Fox Aquarismo',
      slug: 'blue-fox-aquarismo',
      status: Status.ACTIVE,
    },
  });
}
