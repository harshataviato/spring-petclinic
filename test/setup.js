const { sequelize } = require('../models');

/**
 * Global Setup/Teardown for the test suite.
 * Uses a dedicated test SQLite database.
 */
before(async () => {
  // Ensure we are using a clean test database
  process.env.NODE_ENV = 'test';
  await sequelize.sync({ force: true });
});

after(async () => {
  await sequelize.close();
});
