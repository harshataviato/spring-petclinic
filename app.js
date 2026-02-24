/**
 * Main application entry point.
 * Configures Express, Middleware, i18n, and Database connection.
 */
const express = require('express');
const path = require('path');
const i18n = require('i18n');
const expressLayouts = require('express-ejs-layouts');
const { sequelize } = require('./models');
const seedDatabase = require('./config/seed');

const app = express();
const PORT = process.env.PORT || 8080;

// Configure Internationalization (i18n)
i18n.configure({
    locales: ['en', 'de', 'es', 'ru'],
    directory: path.join(__dirname, 'locales'),
    defaultLocale: 'en',
    queryParameter: 'lang', // Allow switching via ?lang=de
    objectNotation: true
});

// Database initialization
// We sync the database and seed it with initial data to match the Java H2 behavior
sequelize.sync({ force: true }).then(async () => {
    console.log('Database synced.');
    await seedDatabase();
    console.log('Database seeded.');
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(i18n.init); // Handle translations
app.use(express.static(path.join(__dirname, 'public')));

// View Engine setup
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'fragments/layout'); // Default layout

// Global variables for templates
app.use((req, res, next) => {
    res.locals.url = req.url;
    res.locals.message = null;
    res.locals.error = null;
    next();
});

// Routes
app.use('/', require('./controllers/WelcomeController'));
app.use('/owners', require('./controllers/OwnerController'));
app.use('/vets.html', require('./controllers/VetController'));
app.use('/oups', (req, res) => { throw new Error("Expected: crash demonstration"); });

// 404 Handler
app.use((req, res) => {
    res.status(404).render('error', { status: 404, message: "Page not found" });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        status: 500, 
        message: err.message || "Internal Server Error" 
    });
});

app.listen(PORT, () => {
    console.log(`PetClinic Node Server running at http://localhost:${PORT}`);
});
