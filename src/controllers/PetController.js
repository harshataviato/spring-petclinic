const { Owner, Pet, PetType } = require('../models/Entities');

/**
 * Handles Pet lifecycle within an Owner's context.
 */
class PetController {
  
  // Middleware to load types for the dropdowns
  static async populatePetTypes(req, res, next) {
    res.locals.types = await PetType.findAll({ order: [['name', 'ASC']] });
    next();
  }

  // GET /owners/:ownerId/pets/new
  static async initCreationForm(req, res) {
    const owner = await Owner.findByPk(req.params.ownerId);
    res.render('pets/createOrUpdatePetForm', { owner, pet: {}, isNew: true });
  }

  // POST /owners/:ownerId/pets/new
  static async processCreationForm(req, res) {
    const { name, birthDate, typeId } = req.body;
    await Pet.create({ name, birthDate, typeId, ownerId: req.params.ownerId });
    res.redirect(`/owners/${req.params.ownerId}`);
  }

  // GET /owners/:ownerId/pets/:petId/edit
  static async initUpdateForm(req, res) {
    const owner = await Owner.findByPk(req.params.ownerId);
    const pet = await Pet.findByPk(req.params.petId);
    res.render('pets/createOrUpdatePetForm', { owner, pet, isNew: false });
  }

  // POST /owners/:ownerId/pets/:petId/edit
  static async processUpdateForm(req, res) {
    await Pet.update(req.body, { where: { id: req.params.petId } });
    res.redirect(`/owners/${req.params.ownerId}`);
  }
}

module.exports = PetController;
