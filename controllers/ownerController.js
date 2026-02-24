const { Owner, Pet, PetType, Visit } = require('../models');
const { Op } = require('sequelize');

/**
 * Handles owner-related web requests.
 */
class OwnerController {
  // Display Find Owners form
  static initFindForm(req, res) {
    res.render('owners/findOwners', { owner: {} });
  }

  // Process Search
  static async processFindForm(req, res) {
    const lastName = req.query.lastName || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    const { count, rows: owners } = await Owner.findAndCountAll({
      where: { lastName: { [Op.like]: `${lastName}%` } },
      include: [{ model: Pet, as: 'pets' }],
      limit,
      offset,
      order: [['lastName', 'ASC']]
    });

    if (count === 0) {
      return res.render('owners/findOwners', { owner: { lastName }, error: 'notFound' });
    }

    if (count === 1 && page === 1) {
      return res.redirect(`/owners/${owners[0].id}`);
    }

    res.render('owners/ownersList', {
      listOwners: owners,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count
    });
  }

  // Display Owner details
  static async showOwner(req, res) {
    const owner = await Owner.findByPk(req.params.ownerId, {
      include: [
        { 
          model: Pet, as: 'pets', 
          include: [{ model: PetType, as: 'type' }, { model: Visit, as: 'visits' }] 
        }
      ]
    });
    if (!owner) return res.status(404).send('Owner not found');
    res.render('owners/ownerDetails', { owner });
  }

  // Create/Update Logic
  static async initCreationForm(req, res) {
    res.render('owners/createOrUpdateOwnerForm', { owner: {}, isNew: true });
  }

  static async processCreationForm(req, res) {
    try {
      const owner = await Owner.create(req.body);
      res.redirect(`/owners/${owner.id}`);
    } catch (err) {
      res.render('owners/createOrUpdateOwnerForm', { owner: req.body, isNew: true, errors: err.errors });
    }
  }

  static async initUpdateForm(req, res) {
    const owner = await Owner.findByPk(req.params.ownerId);
    res.render('owners/createOrUpdateOwnerForm', { owner, isNew: false });
  }

  static async processUpdateForm(req, res) {
    const owner = await Owner.findByPk(req.params.ownerId);
    await owner.update(req.body);
    res.redirect(`/owners/${owner.id}`);
  }
}

module.exports = OwnerController;
