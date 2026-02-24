const request = require('supertest');
const express = require('express');
const path = require('path');
const i18n = require('i18n');
const { expect } = require('chai');
const { sequelize, Owner, PetType, Pet, Visit } = require('../models');

const app = express();
i18n.configure({ locales: ['en'], directory: path.join(__dirname, '../locales'), defaultLocale: 'en' });
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.urlencoded({ extended: true }));
app.use(i18n.init);
app.use((req, res, next) => { res.locals.url = req.url; next(); });

const PetController = require('../controllers/petController');
app.get('/owners/:ownerId/pets/new', PetController.initCreationForm);
app.post('/owners/:ownerId/pets/new', PetController.processCreationForm);
app.get('/owners/:ownerId/pets/:petId/edit', PetController.initUpdateForm);
app.post('/owners/:ownerId/pets/:petId/edit', PetController.processUpdateForm);
app.post('/owners/:ownerId/pets/:petId/visits/new', async (req, res) => {
  await Visit.create({ ...req.body, petId: req.params.petId });
  res.redirect(`/owners/${req.params.ownerId}`);
});

describe('Pet & Visit Routes', () => {
  let owner, type;

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    type = await PetType.create({ name: 'dog' });
    owner = await Owner.create({ firstName: 'A', lastName: 'B', address: 'C', city: 'D', telephone: '1234567890' });
  });

  it('GET /owners/:id/pets/new should render form', async () => {
    const res = await request(app).get(`/owners/${owner.id}/pets/new`);
    expect(res.status).to.equal(200);
    expect(res.text).to.contain('Pet');
  });

  it('POST /owners/:id/pets/new should create pet', async () => {
    const res = await request(app)
      .post(`/owners/${owner.id}/pets/new`)
      .send({ name: 'Buddy', birthDate: '2022-01-01', typeId: type.id });
    
    expect(res.status).to.equal(302);
    const pets = await Pet.findAll({ where: { ownerId: owner.id } });
    expect(pets.length).to.equal(1);
    expect(pets[0].name).to.equal('Buddy');
  });

  it('POST /owners/:id/pets/:pid/edit should update pet', async () => {
    const pet = await Pet.create({ name: 'Old', birthDate: '2020-01-01', ownerId: owner.id, typeId: type.id });
    const res = await request(app)
      .post(`/owners/${owner.id}/pets/${pet.id}/edit`)
      .send({ name: 'NewName', birthDate: '2020-01-01', typeId: type.id });
    
    expect(res.status).to.equal(302);
    await pet.reload();
    expect(pet.name).to.equal('NewName');
  });

  it('POST /owners/:id/pets/:pid/visits/new should add a visit', async () => {
    const pet = await Pet.create({ name: 'Leo', birthDate: '2020-01-01', ownerId: owner.id, typeId: type.id });
    const res = await request(app)
      .post(`/owners/${owner.id}/pets/${pet.id}/visits/new`)
      .send({ visitDate: '2023-05-05', description: 'Checkup' });
    
    expect(res.status).to.equal(302);
    const visits = await Visit.findAll({ where: { petId: pet.id } });
    expect(visits.length).to.equal(1);
    expect(visits[0].description).to.equal('Checkup');
  });
});
