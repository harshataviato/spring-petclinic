const { expect } = require('chai');
const { Owner, Pet, PetType, sequelize } = require('../models');

describe('Models Logic & Validation', () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  it('should fail to create an Owner with invalid telephone (not 10 digits)', async () => {
    try {
      await Owner.create({
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Street',
        city: 'NY',
        telephone: '123'
      });
      throw new Error('Should have failed validation');
    } catch (err) {
      expect(err.name).to.equal('SequelizeValidationError');
      expect(err.errors[0].path).to.equal('telephone');
    }
  });

  it('should successfully create an Owner with valid data', async () => {
    const owner = await Owner.create({
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Street',
      city: 'NY',
      telephone: '1234567890'
    });
    expect(owner.id).to.not.be.null;
    expect(owner.firstName).to.equal('John');
  });

  it('should associate a Pet with an Owner and a PetType', async () => {
    const type = await PetType.create({ name: 'cat' });
    const owner = await Owner.create({
      firstName: 'Jane', lastName: 'Doe', address: '123 St', city: 'City', telephone: '1112223333'
    });
    const pet = await Pet.create({
      name: 'Leo',
      birthDate: '2020-01-01',
      ownerId: owner.id,
      typeId: type.id
    });

    const foundPet = await Pet.findByPk(pet.id, { include: ['type'] });
    expect(foundPet.name).to.equal('Leo');
    expect(foundPet.type.name).to.equal('cat');
  });
});
