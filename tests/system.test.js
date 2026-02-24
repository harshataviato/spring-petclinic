const request = require('supertest');
const { expect } = require('chai');
const express = require('express');
const path = require('path');

const app = express();
const VetController = require('../src/controllers/VetController');
const sequelize = require('../src/db/database');
const { Vet } = require('../src/models/Entities');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../src/views'));

app.get('/vets.html', VetController.showVetList);
app.get('/vets', VetController.showResourcesVetList);
app.get('/oups', (req, res) => { throw new Error('Expected error'); });

// Error handler
app.use((err, req, res, next) => {
    res.status(500).send('Internal Error Page');
});

describe('System & Vet Endpoints', () => {
  before(async () => {
    await sequelize.sync({ force: true });
    await Vet.create({ firstName: 'James', lastName: 'Carter' });
  });

  it('should list vets in HTML format', async () => {
    const res = await request(app).get('/vets.html');
    expect(res.status).to.equal(200);
    expect(res.text).to.contain('James Carter');
  });

  it('should return vets in JSON format for the API', async () => {
    const res = await request(app).get('/vets');
    expect(res.status).to.equal(200);
    expect(res.body.vetList).to.be.an('array');
    expect(res.body.vetList[0].lastName).to.equal('Carter');
  });

  it('should trigger error handler for /oups', async () => {
    const res = await request(app).get('/oups');
    expect(res.status).to.equal(500);
    expect(res.text).to.equal('Internal Error Page');
  });
});
