const express = require('express');
const router = express.Router();
const prisma = require('../../../src/db/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticateJWT = require('../../middleware/auth');

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

// GET /api/auth/me - Get current user info
router.get('/me', authenticateJWT, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
                bio: true,
                isActive: true,
                role: true,
                emailVerified: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true,
                favoriteTeams: {
                    select: {
                        espnId: true,
                        name: true,
                        abbreviation: true,
                        logoUrl: true
                    }
                },
                favoritePlayers: {
                    select: {
                        espnId: true,
                        fullName: true,
                        position: true,
                        teamEspnId: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                ...user,
                onboardingComplete: user.onboardingComplete || false
            }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user information'
        });
    }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const {
            email, 
            username, 
            password, 
            firstName, 
            lastName,
            experienceLevel,
            coachingRole,
            teamLevel,
            onboardingComplete = false
        } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({error: 'Email and password are required.'});
        }

        const existing = await prisma.user.findFirst({
            where: {OR: [{email}, {username: username || email}]}
        });
        if (existing) {
            return res.status(409).json({error: 'Email or username already in use.'});
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                username: username || email,
                password: hashed,
                firstName: firstName || '',
                lastName: lastName || '',
                experienceLevel,
                coachingRole,
                teamLevel,
                onboardingComplete
            }
        });

        const token = generateToken(user);
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id, 
                email: user.email, 
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                experienceLevel: user.experienceLevel,
                coachingRole: user.coachingRole,
                teamLevel: user.teamLevel,
                onboardingComplete: user.onboardingComplete
            }
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

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        });

        const token = generateToken(user);
        res.json({
            success: true,
            token,
            user: {
                id: user.id, 
                email: user.email, 
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                experienceLevel: user.experienceLevel,
                coachingRole: user.coachingRole,
                teamLevel: user.teamLevel,
                onboardingComplete: user.onboardingComplete
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({error: 'Failed to log in.'});
    }
});

// POST /api/auth/logout
router.post('/logout', authenticateJWT, async (req, res) => {
    try {
        // In a more complex setup, you might want to blacklist the token
        // For now, we'll just return success
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({error: 'Failed to log out.'});
    }
});

// POST /api/auth/complete-onboarding
router.post('/complete-onboarding', authenticateJWT, async (req, res) => {
    try {
        const { experienceLevel, coachingRole, teamLevel } = req.body;
        
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                experienceLevel,
                coachingRole,
                teamLevel,
                onboardingComplete: true
            }
        });

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                experienceLevel: user.experienceLevel,
                coachingRole: user.coachingRole,
                teamLevel: user.teamLevel,
                onboardingComplete: user.onboardingComplete
            }
        });
    } catch (error) {
        console.error('Complete onboarding error:', error);
        res.status(500).json({error: 'Failed to complete onboarding.'});
    }
});

// GET /api/auth/profile - Get user profile with preferences
router.get('/profile', authenticateJWT, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                favoriteTeams: {
                    select: {
                        espnId: true,
                        name: true,
                        abbreviation: true,
                        logoUrl: true,
                        primaryColor: true,
                        alternateColor: true
                    }
                },
                favoritePlayers: {
                    select: {
                        espnId: true,
                        fullName: true,
                        position: true,
                        headshot: true,
                        teamEspnId: true,
                        team: {
                            select: {
                                abbreviation: true
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch profile'
        });
    }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateJWT, async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            username,
            bio,
            experienceLevel,
            coachingRole,
            teamLevel,
            avatar,
            favoriteTeams,
            favoritePlayers
        } = req.body;

        // Check if username is already taken by another user
        if (username) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    username,
                    NOT: { id: req.user.id }
                }
            });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    error: 'Username already taken'
                });
            }
        }

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                firstName,
                lastName,
                username,
                bio,
                experienceLevel,
                coachingRole,
                teamLevel,
                avatar
            }
        });

        // Update favorite teams
        if (favoriteTeams !== undefined) {
            await prisma.user.update({
                where: { id: req.user.id },
                data: {
                    favoriteTeams: {
                        set: favoriteTeams.map(teamId => ({ espnId: teamId }))
                    }
                }
            });
        }

        // Update favorite players
        if (favoritePlayers !== undefined) {
            await prisma.user.update({
                where: { id: req.user.id },
                data: {
                    favoritePlayers: {
                        set: favoritePlayers.map(playerId => ({ espnId: playerId }))
                    }
                }
            });
        }

        // Fetch updated user with all relations
        const finalUser = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                favoriteTeams: {
                    select: {
                        espnId: true,
                        name: true,
                        abbreviation: true,
                        logoUrl: true,
                        primaryColor: true,
                        alternateColor: true
                    }
                },
                favoritePlayers: {
                    select: {
                        espnId: true,
                        fullName: true,
                        position: true,
                        headshot: true,
                        teamEspnId: true,
                        team: {
                            select: {
                                abbreviation: true
                            }
                        }
                    }
                }
            }
        });

        res.json({
            success: true,
            user: finalUser
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile'
        });
    }
});

module.exports = router;

// GET /api/auth/profile - Get user profile with preferences
router.get('/profile', authenticateJWT, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                favoriteTeams: {
                    select: {
                        espnId: true,
                        name: true,
                        abbreviation: true,
                        logoUrl: true,
                        primaryColor: true,
                        alternateColor: true
                    }
                },
                favoritePlayers: {
                    select: {
                        espnId: true,
                        fullName: true,
                        position: true,
                        headshot: true,
                        teamEspnId: true,
                        team: {
                            select: {
                                abbreviation: true
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch profile'
        });
    }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateJWT, async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            username,
            bio,
            experienceLevel,
            coachingRole,
            teamLevel,
            avatar,
            favoriteTeams,
            favoritePlayers
        } = req.body;

        // Check if username is already taken by another user
        if (username) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    username,
                    NOT: { id: req.user.id }
                }
            });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    error: 'Username already taken'
                });
            }
        }

        // Update user profile
        await prisma.user.update({
            where: { id: req.user.id },
            data: {
                firstName,
                lastName,
                username,
                bio,
                experienceLevel,
                coachingRole,
                teamLevel,
                avatar
            }
        });

        // Update favorite teams
        if (favoriteTeams !== undefined) {
            await prisma.user.update({
                where: { id: req.user.id },
                data: {
                    favoriteTeams: {
                        set: favoriteTeams.map(teamId => ({ espnId: teamId }))
                    }
                }
            });
        }

        // Update favorite players
        if (favoritePlayers !== undefined) {
            await prisma.user.update({
                where: { id: req.user.id },
                data: {
                    favoritePlayers: {
                        set: favoritePlayers.map(playerId => ({ espnId: playerId }))
                    }
                }
            });
        }

        // Fetch updated user with all relations
        const finalUser = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                favoriteTeams: {
                    select: {
                        espnId: true,
                        name: true,
                        abbreviation: true,
                        logoUrl: true,
                        primaryColor: true,
                        alternateColor: true
                    }
                },
                favoritePlayers: {
                    select: {
                        espnId: true,
                        fullName: true,
                        position: true,
                        headshot: true,
                        teamEspnId: true,
                        team: {
                            select: {
                                abbreviation: true
                            }
                        }
                    }
                }
            }
        });

        res.json({
            success: true,
            user: finalUser
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile'
        });
    }
});

