const express = require('express');
const path = require('path');
const i18n = require('i18n');
const methodOverride = require('method-override');
const { sequelize } = require('./models');

const app = express();

// I18n Configuration
i18n.configure({
  locales: ['en', 'de', 'es'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'en',
  cookie: 'lang',
  queryParameter: 'lang'
});

// Middlewares
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(i18n.init);

// Global view variables for Layout helper
app.use((req, res, next) => {
  res.locals.i18n = i18n;
  res.locals.url = req.url;
  next();
});

// Route Controllers
const OwnerController = require('./controllers/ownerController');
const PetController = require('./controllers/petController');
const { Vet, Specialty, Visit } = require('./models');

// Welcome
app.get('/', (req, res) => res.render('welcome'));

// Owners
app.get('/owners/find', OwnerController.initFindForm);
app.get('/owners', OwnerController.processFindForm);
app.get('/owners/new', OwnerController.initCreationForm);
app.post('/owners/new', OwnerController.processCreationForm);
app.get('/owners/:ownerId', OwnerController.showOwner);
app.get('/owners/:ownerId/edit', OwnerController.initUpdateForm);
app.post('/owners/:ownerId/edit', OwnerController.processUpdateForm);

// Pets
app.get('/owners/:ownerId/pets/new', PetController.initCreationForm);
app.post('/owners/:ownerId/pets/new', PetController.processCreationForm);
app.get('/owners/:ownerId/pets/:petId/edit', PetController.initUpdateForm);
app.post('/owners/:ownerId/pets/:petId/edit', PetController.processUpdateForm);

// Visits
app.get('/owners/:ownerId/pets/:petId/visits/new', async (req, res) => {
  const pet = await sequelize.models.Pet.findByPk(req.params.petId, { include: ['type', 'visits'] });
  const owner = await sequelize.models.Owner.findByPk(req.params.ownerId);
  res.render('pets/createOrUpdateVisitForm', { pet, owner, visit: {} });
});

app.post('/owners/:ownerId/pets/:petId/visits/new', async (req, res) => {
  await Visit.create({ ...req.body, petId: req.params.petId });
  res.redirect(`/owners/${req.params.ownerId}`);
});

// Vets
app.get('/vets.html', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const offset = (page - 1) * limit;
  const { count, rows: listVets } = await Vet.findAndCountAll({
    include: [{ model: Specialty, as: 'specialties' }],
    limit, offset
  });
  res.render('vets/vetList', { listVets, currentPage: page, totalPages: Math.ceil(count / limit) });
});

// Crash demo
app.get('/oups', (req, res) => { throw new Error('Expected crash'); });

// Error handling
app.use((err, req, res, next) => {
  res.status(500).render('error', { message: err.message, status: 500 });
});

// Initialization
const PORT = process.env.PORT || 8080;
sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Senior Google Engineer: PetClinic listening on port ${PORT}`));
});
