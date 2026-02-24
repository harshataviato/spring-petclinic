const request = require('supertest');
const { expect } = require('chai');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const methodOverride = require('method-override');

// Setup a mock app instance for integration testing
const app = express();
const OwnerController = require('../src/controllers/OwnerController');
const sequelize = require('../src/db/database');
const { Owner } = require('../src/models/Entities');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../src/views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get('/owners/new', OwnerController.initCreationForm);
app.post('/owners/new', OwnerController.processCreationForm);
app.get('/owners/find', OwnerController.initFindForm);
app.get('/owners', OwnerController.processFindForm);
app.get('/owners/:ownerId', OwnerController.showOwner);
app.post('/owners/:ownerId/edit', OwnerController.processUpdateForm);

describe('Owner Controller & Routes', () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
    await Owner.create({
      firstName: 'George',
      lastName: 'Franklin',
      address: '110 W. Liberty St.',
      city: 'Madison',
      telephone: '6085551023'
    });
    await Owner.create({
      firstName: 'Betty',
      lastName: 'Davis',
      address: '638 Cardinal Ave.',
      city: 'Sun Prairie',
      telephone: '6085551749'
    });
  });

  describe('GET /owners/find', () => {
    it('should render the find owners form', async () => {
      const res = await request(app).get('/owners/find');
      expect(res.status).to.equal(200);
      expect(res.text).to.contain('Find Owners');
    });
  });

  describe('GET /owners (Process Find Form)', () => {
    it('should redirect to owner details if exactly one match is found', async () => {
      const res = await request(app).get('/owners?lastName=Franklin');
      expect(res.status).to.equal(302);
      expect(res.header.location).to.match(/\/owners\/\d+/);
    });

    it('should render a list if multiple matches are found', async () => {
      // Empty search finds everyone
      const res = await request(app).get('/owners?lastName=');
      expect(res.status).to.equal(200);
      expect(res.text).to.contain('George Franklin');
      expect(res.text).to.contain('Betty Davis');
    });

    it('should show error message if no owner is found', async () => {
      const res = await request(app).get('/owners?lastName=NonExistent');
      expect(res.status).to.equal(200);
      expect(res.text).to.contain('has not been found');
    });
  });

  describe('POST /owners/new', () => {
    it('should create new owner and redirect', async () => {
      const res = await request(app)
        .post('/owners/new')
        .send({
          firstName: 'Eduardo',
          lastName: 'Rodriquez',
          address: '2693 Commerce St.',
          city: 'McFarland',
          telephone: '6085558763'
        });
      expect(res.status).to.equal(302);
      const newOwner = await Owner.findOne({ where: { lastName: 'Rodriquez' } });
      expect(newOwner).to.not.be.null;
    });

    it('should re-render form with error on invalid input', async () => {
      const res = await request(app)
        .post('/owners/new')
        .send({ firstName: 'Bad', lastName: 'Data', telephone: '123' });
      expect(res.status).to.equal(200);
      expect(res.text).to.contain('Owner'); // Renders form
    });
  });

  describe('POST /owners/:id/edit', () => {
    it('should update existing owner', async () => {
      const owner = await Owner.findOne({ where: { lastName: 'Franklin' } });
      const res = await request(app)
        .post(`/owners/${owner.id}/edit`)
        .send({
          firstName: 'George',
          lastName: 'Franklin',
          address: 'New Address',
          city: 'Madison',
          telephone: '6085551023'
        });
      expect(res.status).to.equal(302);
      await owner.reload();
      expect(owner.address).to.equal('New Address');
    });
  });
});
