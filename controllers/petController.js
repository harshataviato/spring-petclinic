const { Owner, Pet, PetType } = require('../models');

/**
 * Handles pet management for specific owners.
 */
class PetController {
  static async initCreationForm(req, res) {
    const owner = await Owner.findByPk(req.params.ownerId);
    const types = await PetType.findAll();
    res.render('pets/createOrUpdatePetForm', { owner, pet: {}, types, isNew: true });
  }

  static async processCreationForm(req, res) {
    const owner = await Owner.findByPk(req.params.ownerId);
    const types = await PetType.findAll();
    try {
      await Pet.create({ ...req.body, ownerId: owner.id });
      res.redirect(`/owners/${owner.id}`);
    } catch (err) {
      res.render('pets/createOrUpdatePetForm', { owner, pet: req.body, types, isNew: true, errors: err.errors });
    }
  }

  static async initUpdateForm(req, res) {
    const owner = await Owner.findByPk(req.params.ownerId);
    const pet = await Pet.findByPk(req.params.petId);
    const types = await PetType.findAll();
    res.render('pets/createOrUpdatePetForm', { owner, pet, types, isNew: false });
  }

  static async processUpdateForm(req, res) {
    const pet = await Pet.findByPk(req.params.petId);
    await pet.update(req.body);
    res.redirect(`/owners/${req.params.ownerId}`);
  }
}

module.exports = PetController;
