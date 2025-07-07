const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function debugLogin() {
    try {
        console.log('=== DEBUGGING LOGIN ISSUE ===\n');

        // 1. Check if database is connected
        console.log('1. Testing database connection...');
        await prisma.$connect();
        console.log('✅ Database connected successfully\n');

        // 2. Check existing users
        console.log('2. Checking existing users...');
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                password: true,
                isActive: true,
                createdAt: true
            }
        });

        console.log(`Found ${users.length} users:`);
        users.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.email} (${user.username}) - Active: ${user.isActive}`);
            console.log(`     Password hash: ${user.password.substring(0, 20)}...`);
        });
        console.log('');

        // 3. Test login with first user
        if (users.length > 0) {
            const testUser = users[0];
            console.log(`3. Testing login with user: ${testUser.email}`);
            
            // Test password verification
            const testPassword = 'password123'; // Common test password
            const isValidPassword = await bcrypt.compare(testPassword, testUser.password);
            console.log(`   Password 'password123' valid: ${isValidPassword}`);
            
            // Test with email
            const userByEmail = await prisma.user.findFirst({
                where: { email: testUser.email }
            });
            console.log(`   User found by email: ${!!userByEmail}`);
            
            // Test with username
            const userByUsername = await prisma.user.findFirst({
                where: { username: testUser.username }
            });
            console.log(`   User found by username: ${!!userByUsername}`);
            
            // Test the OR query used in login
            const userByEmailOrUsername = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: testUser.email },
                        { username: testUser.username }
                    ]
                }
            });
            console.log(`   User found by email OR username: ${!!userByEmailOrUsername}`);
        }

        // 4. Check if there are any teams and players for favorites
        console.log('\n4. Checking teams and players for favorites...');
        const teamCount = await prisma.team.count();
        const playerCount = await prisma.player.count();
        console.log(`   Teams: ${teamCount}`);
        console.log(`   Players: ${playerCount}`);

        // 5. Test the login query structure
        console.log('\n5. Testing login query structure...');
        const testEmail = users.length > 0 ? users[0].email : 'test@example.com';
        
        try {
            const loginQuery = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: testEmail },
                        { username: testEmail }
                    ]
                },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    password: true,
                    favoriteTeams: {
                        select: {
                            id: true,
                            key: true,
                            name: true,
                            city: true,
                            wikipediaLogoUrl: true
                        }
                    },
                    favoritePlayers: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            position: true,
                            photoUrl: true,
                            teamId: true,
                            team: {
                                select: {
                                    key: true,
                                    city: true,
                                    name: true
                                }
                            }
                        }
                    }
                }
            });
            console.log('✅ Login query structure is valid');
            console.log(`   User found: ${!!loginQuery}`);
        } catch (error) {
            console.log('❌ Login query structure error:', error.message);
        }

    } catch (error) {
        console.error('Error during debug:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugLogin(); 