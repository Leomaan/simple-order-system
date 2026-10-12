'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Tabela Categories (Dinâmica por Empresa)
    await queryInterface.createTable('Categories', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Companies',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      stationId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ProductionStations',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(60),
        allowNull: false,
      },
      orderIndex: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('Categories', ['companyId']);
    await queryInterface.addIndex('Categories', ['companyId', 'slug']);
    await queryInterface.addIndex('Categories', ['companyId', 'orderIndex']);

    // 2. Adicionar categoryId em Products
    await queryInterface.addColumn('Products', 'categoryId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addIndex('Products', ['categoryId']);

    // 3. Alterar category de Products para STRING(50) permitindo retrocompatibilidade
    await queryInterface.changeColumn('Products', 'category', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Products', 'categoryId');
    await queryInterface.dropTable('Categories');
  },
};
