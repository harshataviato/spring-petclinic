const request = require('supertest');
const express = require('express');
const path = require('path');
const i18n = require('i18n');
const expressLayouts = require('express-ejs-layouts');
const { sequelize, Owner, Pet, PetType } = require('../models');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
i18n.configure({ locales: ['en'], directory: path.join(__dirname, '../locales'), defaultLocale: 'en', objectNotation: true });
app.use(i18n.init);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(expressLayouts);
app.set('layout', 'fragments/layout');
app.use((req, res, next) => { res.locals.url = req.url; next(); });
app.use('/owners', require('../controllers/OwnerController'));

describe('OwnerController', () => {
    beforeEach(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    test('GET /owners/find should render search form', async () => {
        const res = await request(app).get('/owners/find');
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('Find Owners');
    });

    test('POST /owners/new should create owner and redirect', async () => {
        const res = await request(app)
            .post('/owners/new')
            .send({ firstName: 'George', lastName: 'Franklin', address: '110 Liberty', city: 'Madison', telephone: '6085551023' });
        
        expect(res.statusCode).toBe(302);
        const owner = await Owner.findOne({ where: { lastName: 'Franklin' } });
        expect(owner).toBeDefined();
    });

    test('GET /owners should redirect to details if only one match', async () => {
        const o = await Owner.create({ firstName: 'Betty', lastName: 'Davis', address: 'addr', city: 'city', telephone: '123' });
        const res = await request(app).get('/owners?lastName=Davis');
        expect(res.statusCode).toBe(302);
        expect(res.header.location).toBe(`/owners/${o.id}`);
    });

    test('GET /owners should list multiple matches', async () => {
        await Owner.create({ firstName: 'Jeff', lastName: 'Black', address: 'a', city: 'c', telephone: '1' });
        await Owner.create({ firstName: 'Joe', lastName: 'Black', address: 'b', city: 'd', telephone: '2' });
        
        const res = await request(app).get('/owners?lastName=Black');
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('Jeff Black');
        expect(res.text).toContain('Joe Black');
    });

    test('GET /owners should show error if no match', async () => {
        const res = await request(app).get('/owners?lastName=NonExistent');
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('has not been found');
    });

    test('GET /owners/:id should show details', async () => {
        const type = await PetType.create({ name: 'cat' });
        const o = await Owner.create({ firstName: 'George', lastName: 'Franklin' });
        await Pet.create({ name: 'Leo', owner_id: o.id, type_id: type.id });

        const res = await request(app).get(`/owners/${o.id}`);
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('George Franklin');
        expect(res.text).toContain('Leo');
    });
});
