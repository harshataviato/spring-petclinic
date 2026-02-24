const { Owner, Pet, PetType, Vet, Specialty, Visit } = require('../models');

/**
 * Seeds initial data into the database.
 * Mirrors the data.sql from the original Spring project.
 */
async function seedDatabase() {
    // Types
    const cat = await PetType.create({ name: 'cat' });
    const dog = await PetType.create({ name: 'dog' });
    await PetType.create({ name: 'lizard' });

    // Vets & Specialties
    const radiology = await Specialty.create({ name: 'radiology' });
    const surgery = await Specialty.create({ name: 'surgery' });
    
    const v1 = await Vet.create({ firstName: 'James', lastName: 'Carter' });
    const v2 = await Vet.create({ firstName: 'Helen', lastName: 'Leary' });
    await v2.addSpecialty(radiology);

    // Owners
    const owner = await Owner.create({
        firstName: 'George',
        lastName: 'Franklin',
        address: '110 W. Liberty St.',
        city: 'Madison',
        telephone: '6085551023'
    });

    // Pets
    const leo = await Pet.create({
        name: 'Leo',
        birthDate: '2010-09-07',
        owner_id: owner.id,
        type_id: cat.id
    });

    // Visits
    await Visit.create({
        pet_id: leo.id,
        date: '2013-01-01',
        description: 'rabies shot'
    });
}

module.exports = seedDatabase;
