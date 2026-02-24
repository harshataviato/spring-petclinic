const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Base Entity Logic is handled by Sequelize's default 'id' field

/**
 * PetType Model
 * Represents types like Cat, Dog, etc.
 */
const PetType = sequelize.define('PetType', {
  name: { type: DataTypes.STRING, allowNull: false }
});

/**
 * Specialty Model
 * Represents Vet specialties like Dentistry, Surgery.
 */
const Specialty = sequelize.define('Specialty', {
  name: { type: DataTypes.STRING, allowNull: false }
});

/**
 * Vet Model
 */
const Vet = sequelize.define('Vet', {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false }
});

/**
 * Owner Model
 */
const Owner = sequelize.define('Owner', {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  telephone: { 
    type: DataTypes.STRING, 
    allowNull: false,
    validate: { isNumeric: true, len: [10, 10] }
  }
});

/**
 * Pet Model
 */
const Pet = sequelize.define('Pet', {
  name: { type: DataTypes.STRING, allowNull: false },
  birthDate: { type: DataTypes.DATEONLY, allowNull: false }
});

/**
 * Visit Model
 */
const Visit = sequelize.define('Visit', {
  visitDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  description: { type: DataTypes.STRING, allowNull: false }
});

// Associations (Relationships)
Owner.hasMany(Pet, { as: 'pets', foreignKey: 'ownerId' });
Pet.belongsTo(Owner, { foreignKey: 'ownerId' });

Pet.belongsTo(PetType, { as: 'type', foreignKey: 'typeId' });
Pet.hasMany(Visit, { as: 'visits', foreignKey: 'petId' });
Visit.belongsTo(Pet, { foreignKey: 'petId' });

Vet.belongsToMany(Specialty, { through: 'vet_specialties', as: 'specialties' });
Specialty.belongsToMany(Vet, { through: 'vet_specialties' });

module.exports = { sequelize, Owner, Pet, PetType, Visit, Vet, Specialty };
