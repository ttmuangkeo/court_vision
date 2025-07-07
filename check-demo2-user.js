const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUser() {
    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: 'demo2' },
                    { username: 'demo2' }
                ]
            }
        });

        if (user) {
            console.log('User found:', {
                id: user.id,
                username: user.username,
                email: user.email,
                passwordLength: user.password?.length,
                passwordStartsWith: user.password?.substring(0, 10) + '...'
            });

            // Test password verification
            const isValidPassword = await bcrypt.compare('Ertert123', user.password);
            console.log('Password verification result:', isValidPassword);
        } else {
            console.log('User not found');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser(); 