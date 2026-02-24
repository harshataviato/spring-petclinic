const { expect } = require('chai');
const { Sequelize } = require('sequelize');
const { Owner, Pet, PetType, Visit, Vet, Specialty } = require('../src/models/Entities');
const sequelize = require('../src/db/database');

describe('Domain Models & Validations', () => {
  before(async () => {
    // Standardize on in-memory for model unit tests to ensure isolation
    await sequelize.sync({ force: true });
  });

  describe('Owner Model', () => {
    it('should successfully create a valid owner', async () => {
      const owner = await Owner.create({
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Google St',
        city: 'Mountain View',
        telephone: '1234567890'
      });
      expect(owner.id).to.not.be.null;
      expect(owner.firstName).to.equal('John');
    });

    it('should fail if telephone is not 10 digits', async () => {
      try {
        await Owner.create({
          firstName: 'Jane',
          lastName: 'Doe',
          address: '123 Google St',
          city: 'Mountain View',
          telephone: '123'
        });
        throw new Error('Should have failed validation');
      } catch (err) {
        expect(err.name).to.equal('SequelizeValidationError');
      }
    });

    it('should fail if required fields are missing', async () => {
      try {
        await Owner.create({ lastName: 'Doe' });
        throw new Error('Should have failed validation');
      } catch (err) {
        expect(err.name).to.equal('SequelizeValidationError');
      }
    });
  });

  describe('Associations', () => {
    it('should link pets to owners', async () => {
      const owner = await Owner.create({
        firstName: 'George', lastName: 'Franklin', address: '110 W Liberty', city: 'Madison', telephone: '6085551023'
      });
      const type = await PetType.create({ name: 'cat' });
      const pet = await Pet.create({
        name: 'Leo',
        birthDate: '2010-09-07',
        typeId: type.id,
        ownerId: owner.id
      });

      const foundOwner = await Owner.findByPk(owner.id, { include: 'pets' });
      expect(foundOwner.pets).to.have.lengthOf(1);
      expect(foundOwner.pets[0].name).to.equal('Leo');
    });

    it('should link visits to pets', async () => {
      const pet = await Pet.findOne({ where: { name: 'Leo' } });
      await Visit.create({
        description: 'rabies shot',
        visitDate: '2023-01-01',
        petId: pet.id
      });

      const foundPet = await Pet.findByPk(pet.id, { include: 'visits' });
      expect(foundPet.visits).to.have.lengthOf(1);
      expect(foundPet.visits[0].description).to.equal('rabies shot');
    });

    it('should handle Vet and Specialty many-to-many relationship', async () => {
      const vet = await Vet.create({ firstName: 'James', lastName: 'Carter' });
      const spec = await Specialty.create({ name: 'radiology' });
      
      await vet.addSpecialty(spec);
      
      const foundVet = await Vet.findByPk(vet.id, { include: 'specialties' });
      expect(foundVet.specialties).to.have.lengthOf(1);
      expect(foundVet.specialties[0].name).to.equal('radiology');
    });
  });
});
