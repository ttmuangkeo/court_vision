const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addResponseTags() {
    try {
        console.log('🏷️  Adding player response tags...');

        // Player response tags
        const responseTags = [
            { name: 'Pass Out', category: 'OFFENSIVE_ACTION', subcategory: 'Response' },
            { name: 'Split Defense', category: 'OFFENSIVE_ACTION', subcategory: 'Response' },
            { name: 'Pull Up Shot', category: 'OFFENSIVE_ACTION', subcategory: 'Response' },
            { name: 'Drive to Basket', category: 'OFFENSIVE_ACTION', subcategory: 'Response' },
            { name: 'Step Back', category: 'OFFENSIVE_ACTION', subcategory: 'Response' },
            { name: 'Fade Away', category: 'OFFENSIVE_ACTION', subcategory: 'Response' }
        ];

        for (const tagData of responseTags) {
            // Check if tag already exists
            const existingTag = await prisma.tag.findUnique({
                where: { name: tagData.name }
            });

            if (!existingTag) {
                const newTag = await prisma.tag.create({
                    data: {
                        name: tagData.name,
                        category: tagData.category,
                        subcategory: tagData.subcategory,
                        description: `${tagData.name} - Player's response to defensive pressure`,
                        isActive: true
                    }
                });
                console.log(`✅ Created response tag: ${tagData.name}`);
            } else {
                console.log(`ℹ️  Response tag already exists: ${tagData.name}`);
            }
        }

        console.log('🎉 Finished adding response tags!');

    } catch (error) {
        console.error('❌ Error adding response tags:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addResponseTags(); 