const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addMissingTags() {
    try {
        console.log('🏷️  Adding missing tags...');

        // Tags that should exist based on quick actions
        const requiredTags = [
            { name: 'Double Teamed', category: 'DEFENSIVE_ACTION', subcategory: 'Double Team' },
            { name: 'Double Team Defense', category: 'DEFENSIVE_ACTION', subcategory: 'Double Team' },
            { name: '3-Pointer', category: 'OFFENSIVE_ACTION', subcategory: 'Shot' },
            { name: 'Pick & Roll', category: 'OFFENSIVE_ACTION', subcategory: 'PnR' },
            { name: 'Post Up', category: 'OFFENSIVE_ACTION', subcategory: 'Post' },
            { name: 'Transition', category: 'TRANSITION', subcategory: 'Fast Break' },
            { name: 'Isolation', category: 'OFFENSIVE_ACTION', subcategory: 'ISO' },
            { name: 'Block', category: 'DEFENSIVE_ACTION', subcategory: 'Defense' },
            { name: 'Steal', category: 'DEFENSIVE_ACTION', subcategory: 'Defense' }
        ];

        for (const tagData of requiredTags) {
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
                        description: `${tagData.name} action`,
                        isActive: true
                    }
                });
                console.log(`✅ Created tag: ${tagData.name}`);
            } else {
                console.log(`ℹ️  Tag already exists: ${tagData.name}`);
            }
        }

        console.log('🎉 Finished adding missing tags!');

    } catch (error) {
        console.error('❌ Error adding tags:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addMissingTags(); 