const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedGlossaryEntries() {
  const tags = await prisma.tag.findMany();
  for (const tag of tags) {
    const entry = {
      tagId: tag.id,
      title: tag.name,
      definition: tag.description || `Definition for ${tag.name}`,
      explanation: `This is a basketball concept or action: ${tag.name}. ${tag.description || ''}`.trim(),
      videoUrl: null,
      imageUrl: null,
      difficulty: 'BEGINNER',
      relatedTerms: [],
      examples: [],
    };
    await prisma.glossaryEntry.upsert({
      where: { tagId: tag.id },
      update: entry,
      create: entry,
    });
    console.log(`Upserted glossary entry for tag: ${tag.name}`);
  }
  await prisma.$disconnect();
}

seedGlossaryEntries()
  .catch(e => {
    console.error(e);
    process.exit(1);
  }); 