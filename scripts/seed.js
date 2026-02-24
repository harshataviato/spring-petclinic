const sequelize = require('../src/db/database');
const { Owner, PetType, Vet, Specialty, Pet } = require('../src/models/Entities');

/**
 * Pragmatic Data Seeder. 
 * Re-creates the database from scratch and inserts the standard PetClinic data.
 */
async function seed() {
  await sequelize.sync({ force: true });

  const types = await PetType.bulkCreate([
    { name: 'cat' }, { name: 'dog' }, { name: 'lizard' },
    { name: 'snake' }, { name: 'bird' }, { name: 'hamster' }
  ]);

  const surgery = await Specialty.create({ name: 'surgery' });
  const radiology = await Specialty.create({ name: 'radiology' });

  const vet1 = await Vet.create({ firstName: 'James', lastName: 'Carter' });
  const vet2 = await Vet.create({ firstName: 'Helen', lastName: 'Leary' });
  await vet2.addSpecialty(radiology);

  const owner = await Owner.create({
    firstName: 'George',
    lastName: 'Franklin',
    address: '110 W. Liberty St.',
    city: 'Madison',
    telephone: '6085551023'
  });

  await Pet.create({
    name: 'Leo',
    birthDate: '2010-09-07',
    typeId: types[0].id,
    ownerId: owner.id
  });

  console.log('Database seeded successfully.');
  process.exit();
}

seed();
