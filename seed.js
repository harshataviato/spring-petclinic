const { sequelize, PetType, Vet, Specialty, Owner, Pet, Visit } = require('./models');

/**
 * Pragmatic Seeding Script
 * Populates the database with initial data similar to data.sql
 */
async function seed() {
  await sequelize.sync({ force: true });

  const cat = await PetType.create({ name: 'cat' });
  const dog = await PetType.create({ name: 'dog' });

  const radiology = await Specialty.create({ name: 'radiology' });
  const surgery = await Specialty.create({ name: 'surgery' });

  const v1 = await Vet.create({ firstName: 'James', lastName: 'Carter' });
  const v2 = await Vet.create({ firstName: 'Helen', lastName: 'Leary' });
  await v2.addSpecialty(radiology);

  const o1 = await Owner.create({
    firstName: 'George', lastName: 'Franklin', 
    address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023'
  });

  const p1 = await Pet.create({ 
    name: 'Leo', birthDate: '2010-09-07', typeId: cat.id, ownerId: o1.id 
  });

  await Visit.create({ petId: p1.id, description: 'rabies shot', visitDate: '2013-01-01' });

  console.log('Database Seeded Successfully!');
  process.exit();
}

seed();
