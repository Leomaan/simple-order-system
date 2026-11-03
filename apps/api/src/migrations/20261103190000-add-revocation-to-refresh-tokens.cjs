'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('RefreshTokens', 'revokedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('RefreshTokens', 'replacedByToken', {
      type: Sequelize.STRING(512),
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('RefreshTokens', 'revokedAt');
    await queryInterface.removeColumn('RefreshTokens', 'replacedByToken');
  }
};
