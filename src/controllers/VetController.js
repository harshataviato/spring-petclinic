const { Vet, Specialty } = require('../models/Entities');

class VetController {
  // GET /vets.html
  static async showVetList(req, res) {
    const listVets = await Vet.findAll({
      include: [{ model: Specialty, as: 'specialties' }]
    });
    res.render('vets/vetList', { listVets });
  }

  // API endpoint for JSON
  static async showResourcesVetList(req, res) {
    const vets = await Vet.findAll({ include: ['specialties'] });
    res.json({ vetList: vets });
  }
}

module.exports = VetController;
