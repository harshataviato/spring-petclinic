const request = require('supertest');
const { expect } = require('chai');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PetController = require('../src/controllers/PetController');
const VisitController = require('../src/controllers/VisitController');
const sequelize = require('../src/db/database');
const { Owner, PetType, Pet } = require('../src/models/Entities');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../src/views'));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/owners/:ownerId/pets/new', PetController.populatePetTypes, PetController.initCreationForm);
app.post('/owners/:ownerId/pets/new', PetController.processCreationForm);
app.get('/owners/:ownerId/pets/:petId/visits/new', VisitController.initNewVisitForm);
app.post('/owners/:ownerId/pets/:petId/visits/new', VisitController.processNewVisitForm);

describe('Pets & Visits Logic', () => {
  let ownerId, typeId, petId;

  before(async () => {
    await sequelize.sync({ force: true });
    const owner = await Owner.create({
      firstName: 'George', lastName: 'Franklin', address: '110 W Liberty', city: 'Madison', telephone: '6085551023'
    });
    const type = await PetType.create({ name: 'dog' });
    ownerId = owner.id;
    typeId = type.id;
  });

  describe('Pet Lifecycle', () => {
    it('should render new pet form with types', async () => {
      const res = await request(app).get(`/owners/${ownerId}/pets/new`);
      expect(res.status).to.equal(200);
      expect(res.text).to.contain('dog');
    });

    it('should add a pet to an owner', async () => {
      const res = await request(app)
        .post(`/owners/${ownerId}/pets/new`)
        .send({ name: 'Rosy', birthDate: '2020-01-01', typeId: typeId });
      
      expect(res.status).to.equal(302);
      const pet = await Pet.findOne({ where: { name: 'Rosy' } });
      expect(pet.ownerId).to.equal(ownerId);
      petId = pet.id;
    });
  });

  describe('Visit Lifecycle', () => {
    it('should render new visit form', async () => {
      const res = await request(app).get(`/owners/${ownerId}/pets/${petId}/visits/new`);
      expect(res.status).to.equal(200);
      expect(res.text).to.contain('Visit');
    });

    it('should add a visit to a pet', async () => {
      const res = await request(app)
        .post(`/owners/${ownerId}/pets/${petId}/visits/new`)
        .send({ visitDate: '2023-10-10', description: 'checkup' });
      
      expect(res.status).to.equal(302);
      const foundPet = await Pet.findByPk(petId, { include: 'visits' });
      expect(foundPet.visits[0].description).to.equal('checkup');
    });
  });
});
