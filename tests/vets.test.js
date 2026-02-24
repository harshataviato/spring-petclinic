const request = require('supertest');
const express = require('express');
const path = require('path');
const i18n = require('i18n');
const expressLayouts = require('express-ejs-layouts');
const { sequelize, Vet, Specialty } = require('../models');

const app = express();
i18n.configure({ locales: ['en'], directory: path.join(__dirname, '../locales'), defaultLocale: 'en' });
app.use(i18n.init);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(expressLayouts);
app.set('layout', 'fragments/layout');
app.use('/vets.html', require('../controllers/VetController'));

describe('VetController', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
        const radiology = await Specialty.create({ name: 'radiology' });
        const v = await Vet.create({ firstName: 'James', lastName: 'Carter' });
        await v.addSpecialty(radiology);
    });

    afterAll(async () => {
        await sequelize.close();
    });

    test('GET /vets.html should list veterinarians', async () => {
        const res = await request(app).get('/vets.html');
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('James Carter');
        expect(res.text).toContain('radiology');
    });
});
