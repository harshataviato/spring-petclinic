const { sequelize, Owner, Pet, PetType, Visit, Vet, Specialty } = require('../models');

describe('Domain Models and Associations', () => {
    beforeAll(async () => {
        // Use in-memory DB for isolation
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    test('should create and retrieve a PetType', async () => {
        const type = await PetType.create({ name: 'hamster' });
        expect(type.id).toBeDefined();
        expect(type.name).toBe('hamster');
    });

    test('should create an Owner and associate a Pet', async () => {
        const owner = await Owner.create({
            firstName: 'John',
            lastName: 'Doe',
            address: '123 Test St',
            city: 'Test City',
            telephone: '1234567890'
        });

        const type = await PetType.create({ name: 'dog' });
        const pet = await Pet.create({
            name: 'Buddy',
            birthDate: '2020-01-01',
            owner_id: owner.id,
            type_id: type.id
        });

        const foundOwner = await Owner.findByPk(owner.id, { include: ['pets'] });
        expect(foundOwner.pets.length).toBe(1);
        expect(foundOwner.pets[0].name).toBe('Buddy');
    });

    test('should validate required fields for Owner', async () => {
        try {
            await Owner.create({ address: 'No name' });
            fail('Should have thrown an error for missing required fields');
        } catch (e) {
            expect(e.name).toBe('SequelizeValidationError');
        }
    });

    test('should handle Vet and Specialty Many-to-Many association', async () => {
        const vet = await Vet.create({ firstName: 'Jane', lastName: 'Smith' });
        const spec = await Specialty.create({ name: 'surgery' });
        
        await vet.addSpecialty(spec);
        const foundVet = await Vet.findByPk(vet.id, { include: ['specialties'] });
        
        expect(foundVet.specialties.length).toBe(1);
        expect(foundVet.specialties[0].name).toBe('surgery');
    });

    test('should handle Pet and Visit associations', async () => {
        const type = await PetType.create({ name: 'cat' });
        const pet = await Pet.create({ name: 'Misty', type_id: type.id });
        const visit = await Visit.create({ 
            pet_id: pet.id, 
            description: 'Checkup', 
            date: '2023-05-05' 
        });

        const foundPet = await Pet.findByPk(pet.id, { include: ['visits'] });
        expect(foundPet.visits.length).toBe(1);
        expect(foundPet.visits[0].description).toBe('Checkup');
    });
});
