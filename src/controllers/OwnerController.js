const { Owner, Pet, PetType, Visit } = require('../models/Entities');
const { Op } = require('sequelize');

/**
 * Handles all Owner-related web requests.
 */
class OwnerController {
  
  // GET /owners/new
  static async initCreationForm(req, res) {
    res.render('owners/createOrUpdateOwnerForm', { owner: {}, isNew: true });
  }

  // POST /owners/new
  static async processCreationForm(req, res) {
    try {
      const owner = await Owner.create(req.body);
      res.redirect(`/owners/${owner.id}`);
    } catch (err) {
      res.render('owners/createOrUpdateOwnerForm', { owner: req.body, isNew: true, error: err.message });
    }
  }

  // GET /owners/find
  static initFindForm(req, res) {
    res.render('owners/findOwners', { owner: {} });
  }

  // GET /owners
  static async processFindForm(req, res) {
    let lastName = req.query.lastName || '';
    
    // Spring logic: empty string finds everyone
    const results = await Owner.findAll({
      where: { lastName: { [Op.like]: `${lastName}%` } },
      include: [{ model: Pet, as: 'pets' }]
    });

    if (results.length === 0) {
      return res.render('owners/findOwners', { error: 'has not been found' });
    }
    
    if (results.length === 1) {
      return res.redirect(`/owners/${results[0].id}`);
    }

    res.render('owners/ownersList', { listOwners: results });
  }

  // GET /owners/:ownerId
  static async showOwner(req, res) {
    const owner = await Owner.findByPk(req.params.ownerId, {
      include: [{ 
        model: Pet, 
        as: 'pets', 
        include: ['type', 'visits'] 
      }]
    });
    res.render('owners/ownerDetails', { owner });
  }

  // GET /owners/:ownerId/edit
  static async initUpdateForm(req, res) {
    const owner = await Owner.findByPk(req.params.ownerId);
    res.render('owners/createOrUpdateOwnerForm', { owner, isNew: false });
  }

  // POST /owners/:ownerId/edit
  static async processUpdateForm(req, res) {
    await Owner.update(req.body, { where: { id: req.params.ownerId } });
    res.redirect(`/owners/${req.params.ownerId}`);
  }
}

module.exports = OwnerController;
