'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Settings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      restaurantName: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Simple Order Restaurant'
      },
      mercadoPagoAccessToken: {
        type: Sequelize.STRING(512),
        allowNull: true,
        defaultValue: null
      },
      mercadoPagoWebhookSecret: {
        type: Sequelize.STRING(256),
        allowNull: true,
        defaultValue: null
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Settings');
  }
};
