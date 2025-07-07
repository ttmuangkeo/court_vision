const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword(email, newPassword) {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log(`User with email ${email} not found.`);
            return;
        }
        const hashed = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { email },
            data: { password: hashed }
        });
        console.log(`✅ Password for ${email} has been reset to '${newPassword}'`);
    } catch (error) {
        console.error('Error resetting password:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Change the email below to the user you want to reset
resetPassword('demo@courtvision.com', 'password123'); 