const request = require('supertest');
const express = require('express');
const path = require('path');
const i18n = require('i18n');
const { expect } = require('chai');
const { sequelize, Vet, Specialty } = require('../models');

const app = express();
i18n.configure({ locales: ['en'], directory: path.join(__dirname, '../locales'), defaultLocale: 'en' });
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(i18n.init);
app.use((req, res, next) => { res.locals.url = req.url; next(); });

app.get('/', (req, res) => res.render('welcome'));
app.get('/vets.html', async (req, res) => {
  const { rows: listVets } = await Vet.findAndCountAll({
    include: [{ model: Specialty, as: 'specialties' }],
    limit: 5, offset: 0
  });
  res.render('vets/vetList', { listVets, currentPage: 1, totalPages: 1 });
});
app.get('/oups', (req, res) => { throw new Error('Expected crash'); });
app.use((err, req, res, next) => {
  res.status(500).render('error', { message: err.message, status: 500 });
});

describe('System Routes', () => {
  before(async () => {
    await sequelize.sync({ force: true });
  });

  it('GET / should render welcome page', async () => {
    const res = await request(app).get('/');
    expect(res.status).to.equal(200);
    expect(res.text).to.contain('Welcome');
  });

  it('GET /vets.html should list veterinarians', async () => {
    const vet = await Vet.create({ firstName: 'James', lastName: 'Carter' });
    const spec = await Specialty.create({ name: 'radiology' });
    await vet.addSpecialty(spec);

    const res = await request(app).get('/vets.html');
    expect(res.status).to.equal(200);
    expect(res.text).to.contain('Veterinarians');
    expect(res.text).to.contain('James Carter');
    expect(res.text).to.contain('radiology');
  });

  it('GET /oups should trigger error handler', async () => {
    const res = await request(app).get('/oups');
    expect(res.status).to.equal(500);
    expect(res.text).to.contain('Expected crash');
  });
});
