const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');

/**
 * Base Model approach to mimic BaseEntity/NamedEntity/Person
 */

// Owner Model
const Owner = sequelize.define('Owner', {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  telephone: { 
    type: DataTypes.STRING, 
    allowNull: false,
    validate: { is: /^\d{10}$/ } // Business Rule: 10 digit phone
  }
});

// PetType Model (Cat, Dog, etc)
const PetType = sequelize.define('PetType', {
  name: { type: DataTypes.STRING, allowNull: false }
});

// Pet Model
const Pet = sequelize.define('Pet', {
  name: { type: DataTypes.STRING, allowNull: false },
  birthDate: { type: DataTypes.DATEONLY, allowNull: false }
});

// Visit Model
const Visit = sequelize.define('Visit', {
  visitDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  description: { type: DataTypes.STRING, allowNull: false }
});

// Vet Model
const Vet = sequelize.define('Vet', {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false }
});

// Specialty Model
const Specialty = sequelize.define('Specialty', {
  name: { type: DataTypes.STRING, allowNull: false }
});

// Relationships
Owner.hasMany(Pet, { as: 'pets', foreignKey: 'ownerId' });
Pet.belongsTo(Owner, { foreignKey: 'ownerId' });

PetType.hasMany(Pet, { foreignKey: 'typeId' });
Pet.belongsTo(PetType, { as: 'type', foreignKey: 'typeId' });

Pet.hasMany(Visit, { as: 'visits', foreignKey: 'petId' });
Visit.belongsTo(Pet, { foreignKey: 'petId' });

Vet.belongsToMany(Specialty, { through: 'VetSpecialties', as: 'specialties' });
Specialty.belongsToMany(Vet, { through: 'VetSpecialties' });

module.exports = { Owner, Pet, PetType, Visit, Vet, Specialty };
