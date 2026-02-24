const { Sequelize } = require('sequelize');

/**
 * Senior Engineer Note: Using SQLite for the 'pragmatic' approach.
 * It allows the app to run immediately without external dependencies (MySQL/Postgres),
 * effectively mimicking the H2 in-memory experience.
 */
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './petclinic.sqlite',
  logging: false
});

module.exports = sequelize;
