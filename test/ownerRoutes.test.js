const request = require('supertest');
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const i18n = require('i18n');
const { expect } = require('chai');
const { sequelize, Owner, PetType, Pet } = require('../models');

// We recreate a test app instance to isolate route testing
const app = express();
i18n.configure({ locales: ['en'], directory: path.join(__dirname, '../locales'), defaultLocale: 'en' });
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(i18n.init);
app.use((req, res, next) => { res.locals.url = req.url; next(); });

const OwnerController = require('../controllers/ownerController');
app.get('/owners/find', OwnerController.initFindForm);
app.get('/owners', OwnerController.processFindForm);
app.get('/owners/new', OwnerController.initCreationForm);
app.post('/owners/new', OwnerController.processCreationForm);
app.get('/owners/:ownerId', OwnerController.showOwner);
app.get('/owners/:ownerId/edit', OwnerController.initUpdateForm);
app.post('/owners/:ownerId/edit', OwnerController.processUpdateForm);

describe('Owner Routes & Controller', () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  it('GET /owners/new should render the creation form', async () => {
    const res = await request(app).get('/owners/new');
    expect(res.status).to.equal(200);
    expect(res.text).to.contain('Add Owner');
  });

  it('POST /owners/new should create owner and redirect to details', async () => {
    const res = await request(app)
      .post('/owners/new')
      .send({ firstName: 'George', lastName: 'Franklin', address: '110 Liberty', city: 'Madison', telephone: '6085551023' });
    
    expect(res.status).to.equal(302);
    expect(res.header.location).to.contain('/owners/');
  });

  it('GET /owners should redirect to details if exactly one match found', async () => {
    await Owner.create({ firstName: 'George', lastName: 'Franklin', address: '110', city: 'M', telephone: '6085551023' });
    const res = await request(app).get('/owners').query({ lastName: 'Franklin' });
    expect(res.status).to.equal(302);
    expect(res.header.location).to.match(/\/owners\/\d+/);
  });

  it('GET /owners should show list if multiple matches found', async () => {
    await Owner.create({ firstName: 'O1', lastName: 'Davis', address: 'A1', city: 'C1', telephone: '1112223333' });
    await Owner.create({ firstName: 'O2', lastName: 'Davis', address: 'A2', city: 'C2', telephone: '1112223334' });
    
    const res = await request(app).get('/owners').query({ lastName: 'Davis' });
    expect(res.status).to.equal(200);
    expect(res.text).to.contain('Owners');
    expect(res.text).to.contain('O1 Davis');
    expect(res.text).to.contain('O2 Davis');
  });

  it('GET /owners should show find form with error if no match found', async () => {
    const res = await request(app).get('/owners').query({ lastName: 'Unknown' });
    expect(res.status).to.equal(200);
    expect(res.text).to.contain('Find Owners');
  });

  it('GET /owners/:id should return 404 for non-existent owner', async () => {
    const res = await request(app).get('/owners/999');
    expect(res.status).to.equal(404);
  });

  it('POST /owners/:id/edit should update owner info', async () => {
    const owner = await Owner.create({ firstName: 'Old', lastName: 'Name', address: '1', city: 'C', telephone: '1112223333' });
    const res = await request(app)
      .post(`/owners/${owner.id}/edit`)
      .send({ firstName: 'New', lastName: 'Name', address: '1', city: 'C', telephone: '1112223333' });
    
    expect(res.status).to.equal(302);
    const updated = await Owner.findByPk(owner.id);
    expect(updated.firstName).to.equal('New');
  });
});
