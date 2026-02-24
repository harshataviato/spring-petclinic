const request = require('supertest');
const express = require('express');
const path = require('path');
const i18n = require('i18n');
const expressLayouts = require('express-ejs-layouts');

// Setup a mock app for testing controllers
const app = express();
i18n.configure({
    locales: ['en'],
    directory: path.join(__dirname, '../locales'),
    defaultLocale: 'en'
});
app.use(i18n.init);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(expressLayouts);
app.set('layout', 'fragments/layout');
app.use('/', require('../controllers/WelcomeController'));

describe('WelcomeController', () => {
    test('GET / should return welcome page', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('Welcome');
    });
});
