const express = require('express');
const router = express.Router();
const { Vet, Specialty } = require('../models');

/**
 * GET /vets.html - Show the list of veterinarians.
 */
router.get('/', async (req, res) => {
    const listVets = await Vet.findAll({
        include: [{ model: Specialty, as: 'specialties' }]
    });
    res.render('vets/vetList', { listVets });
});

module.exports = router;
