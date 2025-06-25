const express = require('express');
const router = express.Router();
const prisma = require('../../../src/db/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper to generate JWT
function generateToken(user) {
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
    }, process.env.JWT_SECRET || 'devsecret',
    {expiresIn: '7d'}
);
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const {email, username, password, firstName, lastName} = req.body;
        if (!email || !username || !password) {
            return res.status(400).json({error: 'Email, username, and password are required.'});
        }

        const existing = await prisma.user.findFirst({
            where: {OR: [{email}, {username}]}
        });
        if (existing) {
            return res.status(409).json({error: 'Email or username already in use.'});
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashed,
                firstName,
                lastName
            }
        });

        const token = generateToken(user);
        res.status(201).json({
            success: true,
            token,
            user: {id: user.id, email: user.email, username: user.username}
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({error: 'Failed to register user.'});
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const {emailOrUsername, password} = req.body;
        if (!emailOrUsername || !password) {
            return res.status(400).json({error: 'Email/username and password are required.'});
        }

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    {email: emailOrUsername},
                    {username: emailOrUsername}
                ]
            }
        });

        if (!user) {
            return res.status(401).json({error: 'Invalid credentials.'});
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({error: 'Invalid credentials.'});
        }

        const token = generateToken(user);
        res.json({
            success: true,
            token,
            user: {id: user.id, email: user.email, username: user.username}
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({error: 'Failed to log in.'});
    }
});

module.exports = router;