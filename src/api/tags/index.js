const express = require('express');
const router = express.Router();
const prisma = require('../../db/client');

router.get('/', async (req, res) => {
    try {
        const {category, subCategory} = req.query;

        const where = {};
        if(category) where.category = category;
        if(subCategory) where.subCategory = subCategory;

        const tags = await prisma.tag.findMany({
            where,
            orderBy: {
                name: 'asc'
            }
        });

        res.json({
            success: true,
            data: tags,
            count: tags.length
        });
    } catch(error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tags'
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const tag = await prisma.tag.findUnique({
            where: {id}
        });

        if(!tag) {
            return res.status(404).json({
                success: false,
                error: 'Tag not found'
            });
        }

        res.json({
            success: true,
            data: tag
        });
    } catch(error) {
        console.error('Error fetching tag:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tag'
        });
    }
});

module.exports = router;
