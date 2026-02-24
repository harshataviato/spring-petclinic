const request = require('supertest');
const express = require('express');
const path = require('path');
const i18n = require('i18n');
const expressLayouts = require('express-ejs-layouts');

const app = express();
i18n.configure({ locales: ['en'], directory: path.join(__dirname, '../locales'), defaultLocale: 'en', objectNotation: true });
app.use(i18n.init);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(expressLayouts);
app.set('layout', 'fragments/layout');

app.use('/oups', (req, res) => { throw new Error("Expected: crash demonstration"); });
app.use((req, res) => {
    res.status(404).render('error', { status: 404, message: "Page not found" });
});
app.use((err, req, res, next) => {
    res.status(500).render('error', { status: 500, message: err.message });
});

describe('System Error Handling', () => {
    test('should return 404 for non-existent routes', async () => {
        const res = await request(app).get('/non-existent');
        expect(res.statusCode).toBe(404);
        expect(res.text).toContain('404');
    });

    test('should return 500 for the /oups route', async () => {
        const res = await request(app).get('/oups');
        expect(res.statusCode).toBe(500);
        expect(res.text).toContain('Expected: crash demonstration');
    });
});
