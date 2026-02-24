const express = require('express');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const methodOverride = require('method-override');

const OwnerController = require('./src/controllers/OwnerController');
const PetController = require('./src/controllers/PetController');
const VetController = require('./src/controllers/VetController');
const VisitController = require('./src/controllers/VisitController');

const app = express();

// Senior Engineer Choice: Standardizing on Port 8080 to match Spring
const PORT = process.env.PORT || 8080;

// View Engine Configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Route Mapping
 */

// Home
app.get('/', (req, res) => res.render('welcome'));

// Owners
app.get('/owners/new', OwnerController.initCreationForm);
app.post('/owners/new', OwnerController.processCreationForm);
app.get('/owners/find', OwnerController.initFindForm);
app.get('/owners', OwnerController.processFindForm);
app.get('/owners/:ownerId', OwnerController.showOwner);
app.get('/owners/:ownerId/edit', OwnerController.initUpdateForm);
app.post('/owners/:ownerId/edit', OwnerController.processUpdateForm);

// Pets
app.get('/owners/:ownerId/pets/new', PetController.populatePetTypes, PetController.initCreationForm);
app.post('/owners/:ownerId/pets/new', PetController.processCreationForm);
app.get('/owners/:ownerId/pets/:petId/edit', PetController.populatePetTypes, PetController.initUpdateForm);
app.post('/owners/:ownerId/pets/:petId/edit', PetController.processUpdateForm);

// Visits
app.get('/owners/:ownerId/pets/:petId/visits/new', VisitController.initNewVisitForm);
app.post('/owners/:ownerId/pets/:petId/visits/new', VisitController.processNewVisitForm);

// Vets
app.get('/vets.html', VetController.showVetList);
app.get('/vets', VetController.showResourcesVetList);

// System Crash (Demoing error handling)
app.get('/oups', (req, res) => {
    throw new Error('Expected error from CrashController');
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { message: err.message, status: 500 });
});

app.listen(PORT, () => {
    console.log(`PetClinic running on http://localhost:${PORT}`);
});
