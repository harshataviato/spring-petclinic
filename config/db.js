const { Sequelize } = require('sequelize');

/**
 * Senior Engineer Note:
 * Using SQLite as the default database to mirror the H2 experience in Spring PetClinic.
 * This allows the computer to run the code immediately without external dependencies.
 */
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './petclinic.sqlite',
  logging: false // Set to console.log to see SQL queries
});

module.exports = sequelize;
