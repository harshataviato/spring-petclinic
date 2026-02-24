const express = require('express');
const router = express.Router();
const { Owner, Pet, PetType, Visit } = require('../models');
const { Op } = require('sequelize');

/**
 * GET /owners/find - Show the find owners search page.
 */
router.get('/find', (req, res) => {
    res.render('owners/findOwners', { owner: {} });
});

/**
 * GET /owners - Process search results or list all.
 */
router.get('/', async (req, res) => {
    const lastName = req.query.lastName || '';
    
    const owners = await Owner.findAll({
        where: {
            lastName: { [Op.like]: `${lastName}%` }
        },
        include: [{ model: Pet, as: 'pets' }]
    });

    if (owners.length === 0) {
        return res.render('owners/findOwners', { owner: { lastName }, error: 'notFound' });
    } else if (owners.length === 1) {
        return res.redirect(`/owners/${owners[0].id}`);
    } else {
        return res.render('owners/ownersList', { listOwners: owners });
    }
});

/**
 * GET /owners/new - Show create form.
 */
router.get('/new', (req, res) => {
    res.render('owners/createOrUpdateOwnerForm', { owner: { isNew: true } });
});

/**
 * POST /owners/new - Process creation.
 */
router.post('/new', async (req, res) => {
    try {
        const owner = await Owner.create(req.body);
        res.redirect(`/owners/${owner.id}`);
    } catch (e) {
        res.render('owners/createOrUpdateOwnerForm', { owner: req.body, error: e.message });
    }
});

/**
 * GET /owners/:id - Show specific owner details.
 */
router.get('/:id', async (req, res) => {
    const owner = await Owner.findByPk(req.params.id, {
        include: [{ 
            model: Pet, 
            as: 'pets',
            include: ['type', 'visits']
        }]
    });
    res.render('owners/ownerDetails', { owner });
});

/**
 * Nested Pet Routes within Owner
 */
router.get('/:ownerId/pets/new', async (req, res) => {
    const types = await PetType.findAll();
    res.render('pets/createOrUpdatePetForm', { 
        ownerId: req.params.ownerId, 
        pet: { isNew: true },
        types 
    });
});

router.post('/:ownerId/pets/new', async (req, res) => {
    await Pet.create({
        ...req.body,
        owner_id: req.params.ownerId,
        type_id: req.body.typeId
    });
    res.redirect(`/owners/${req.params.ownerId}`);
});

/**
 * Visit Routes
 */
router.get('/:ownerId/pets/:petId/visits/new', async (req, res) => {
    const pet = await Pet.findByPk(req.params.petId, { include: ['visits', 'type'] });
    res.render('pets/createOrUpdateVisitForm', { pet, ownerId: req.params.ownerId, visit: {} });
});

router.post('/:ownerId/pets/:petId/visits/new', async (req, res) => {
    await Visit.create({
        ...req.body,
        pet_id: req.params.petId
    });
    res.redirect(`/owners/${req.params.ownerId}`);
});

module.exports = router;
