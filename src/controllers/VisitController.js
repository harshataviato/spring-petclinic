const { Pet, Visit, Owner } = require('../models/Entities');

class VisitController {
  // GET /owners/:ownerId/pets/:petId/visits/new
  static async initNewVisitForm(req, res) {
    const pet = await Pet.findByPk(req.params.petId, {
      include: ['type', { model: Owner }, 'visits']
    });
    res.render('pets/createOrUpdateVisitForm', { pet, visit: {} });
  }

  // POST /owners/:ownerId/pets/:petId/visits/new
  static async processNewVisitForm(req, res) {
    const { visitDate, description } = req.body;
    await Visit.create({
      visitDate,
      description,
      petId: req.params.petId
    });
    res.redirect(`/owners/${req.params.ownerId}`);
  }
}

module.exports = VisitController;
