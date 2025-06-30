const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedDemoUser() {
  try {
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@courtvision.com' },
      update: {},
      create: {
        id: 'demo-user-1',
        email: 'demo@courtvision.com',
        username: 'demo',
        password: 'demo-password', // Not used for login
        firstName: 'Demo',
        lastName: 'User',
        isActive: true,
        role: 'USER',
        emailVerified: true
      }
    });
    console.log('Seeded demo user:', demoUser);
  } catch (error) {
    console.error('Error seeding demo user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDemoUser(); 