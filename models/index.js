/**
 * Database index file.
 * Initializes Sequelize and defines model associations.
 */
const { Sequelize, DataTypes } = require('sequelize');

// Using SQLite for a pragmatic, zero-config start (mimics H2)
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './petclinic.sqlite',
    logging: false
});

const PetType = sequelize.define('PetType', {
    name: DataTypes.STRING
}, { tableName: 'types', timestamps: false });

const Owner = sequelize.define('Owner', {
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    telephone: DataTypes.STRING
}, { tableName: 'owners', timestamps: false });

const Pet = sequelize.define('Pet', {
    name: DataTypes.STRING,
    birthDate: DataTypes.DATEONLY
}, { tableName: 'pets', timestamps: false });

const Visit = sequelize.define('Visit', {
    date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    description: DataTypes.STRING
}, { tableName: 'visits', timestamps: false });

const Vet = sequelize.define('Vet', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING
}, { tableName: 'vets', timestamps: false });

const Specialty = sequelize.define('Specialty', {
    name: DataTypes.STRING
}, { tableName: 'specialties', timestamps: false });

// Associations
Owner.hasMany(Pet, { as: 'pets', foreignKey: 'owner_id' });
Pet.belongsTo(Owner, { foreignKey: 'owner_id' });

Pet.belongsTo(PetType, { as: 'type', foreignKey: 'type_id' });
Pet.hasMany(Visit, { as: 'visits', foreignKey: 'pet_id' });
Visit.belongsTo(Pet, { foreignKey: 'pet_id' });

Vet.belongsToMany(Specialty, { through: 'vet_specialties', as: 'specialties', timestamps: false });
Specialty.belongsToMany(Vet, { through: 'vet_specialties', timestamps: false });

module.exports = { sequelize, Owner, Pet, PetType, Visit, Vet, Specialty };
