const request = require('supertest');
const express = require('express');
const path = require('path');
const i18n = require('i18n');
const expressLayouts = require('express-ejs-layouts');
const { sequelize, Owner, Pet, PetType, Visit } = require('../models');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
i18n.configure({ locales: ['en'], directory: path.join(__dirname, '../locales'), defaultLocale: 'en' });
app.use(i18n.init);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(expressLayouts);
app.set('layout', 'fragments/layout');
app.use('/owners', require('../controllers/OwnerController'));

describe('Pets and Visits', () => {
    let ownerId, petId;

    beforeAll(async () => {
        await sequelize.sync({ force: true });
        const type = await PetType.create({ name: 'lizard' });
        const owner = await Owner.create({ firstName: 'Eduardo', lastName: 'Rodriquez' });
        ownerId = owner.id;
        const pet = await Pet.create({ name: 'Iggy', owner_id: ownerId, type_id: type.id });
        petId = pet.id;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    test('GET /owners/:ownerId/pets/new should render pet form', async () => {
        const res = await request(app).get(`/owners/${ownerId}/pets/new`);
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('Pet');
    });

    test('POST /owners/:ownerId/pets/new should create pet', async () => {
        const res = await request(app)
            .post(`/owners/${ownerId}/pets/new`)
            .send({ name: 'Basil', birthDate: '2022-01-01', typeId: 1 });
        expect(res.statusCode).toBe(302);
        const pet = await Pet.findOne({ where: { name: 'Basil' } });
        expect(pet).toBeDefined();
    });

    test('GET /owners/:ownerId/pets/:petId/visits/new should render visit form', async () => {
        const res = await request(app).get(`/owners/${ownerId}/pets/${petId}/visits/new`);
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('Visit');
    });

    test('POST /owners/:ownerId/pets/:petId/visits/new should create visit', async () => {
        const res = await request(app)
            .post(`/owners/${ownerId}/pets/${petId}/visits/new`)
            .send({ date: '2023-01-01', description: 'flu shot' });
        expect(res.statusCode).toBe(302);
        const visit = await Visit.findOne({ where: { description: 'flu shot' } });
        expect(visit).toBeDefined();
    });
});
