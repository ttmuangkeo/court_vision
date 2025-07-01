const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addOnboardingField() {
    try {
        console.log('Adding onboardingComplete field to users table...');
        
        // Update all existing users to have onboardingComplete = true
        const result = await prisma.user.updateMany({
            data: {
                onboardingComplete: true
            }
        });
        
        console.log(`Updated ${result.count} users with onboardingComplete = true`);
        
        // Verify the update
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                onboardingComplete: true
            }
        });
        
        console.log('Current users:');
        users.forEach(user => {
            console.log(`- ${user.username}: onboardingComplete = ${user.onboardingComplete}`);
        });
        
        console.log('✅ Onboarding field added successfully!');
        
    } catch (error) {
        console.error('❌ Error adding onboarding field:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addOnboardingField(); 