const prisma = require('../db/client');

async function createDemoUser() {
  try {
    console.log('👤 Creating demo user...');
    
    const user = await prisma.user.upsert({
      where: { email: 'demo@courtvision.com' },
      update: {},
      create: {
        email: 'demo@courtvision.com',
        username: 'demo_user',
        password: 'demo123', // In production, this would be hashed
        firstName: 'Demo',
        lastName: 'User',
        isActive: true,
        role: 'USER'
      }
    });
    
    console.log(`✅ Demo user created with ID: ${user.id}`);
    console.log('📋 Use this ID in the frontend for createdById');
    
    return user.id;
  } catch (error) {
    console.error('❌ Error creating demo user:', error.message);
    throw error;
  }
}

createDemoUser()
  .then(() => {
    console.log('\n🎉 Demo user setup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Demo user setup failed:', error.message);
    process.exit(1);
  }); 