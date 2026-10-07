import { PrismaClient } from '@prisma/client';
import { seedBlogs } from './seeds/blogs.seed';
import { seedAuthors } from './seeds/authors.seed';
import { seedCategories } from './seeds/categories.seed';
import { seedPosts } from './seeds/posts.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando processo de seed modular do Blue Fox Blog...');
  const startTime = Date.now();

  try {
    // 1. Blog padrão
    await seedBlogs(prisma);

    // 2. Autores padrão
    await seedAuthors(prisma);

    // 3. Categorias padrão
    await seedCategories(prisma);

    // 4. Posts padrão e recomendações M:N
    await seedPosts(prisma);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✨ Todos os seeds do Blog foram aplicados com sucesso em ${elapsed}s!`);
  } catch (error) {
    console.error('❌ Erro durante a execução dos seeds:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
