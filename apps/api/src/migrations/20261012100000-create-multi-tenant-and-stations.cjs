'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Tabela Companies (Tenants)
    await queryInterface.createTable('Companies', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      cnpj: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      logoUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      config: {
        type: Sequelize.JSON,
        allowNull: false,
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

    await queryInterface.addIndex('Companies', ['slug'], { unique: true });
    await queryInterface.addIndex('Companies', ['active']);

    // 2. Tabela ProductionStations (Setores / KDS Dinâmico)
    await queryInterface.createTable('ProductionStations', {
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
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      color: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '#64748b',
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

    await queryInterface.addIndex('ProductionStations', ['companyId']);
    await queryInterface.addIndex('ProductionStations', ['companyId', 'slug'], { unique: true });

    // 3. Adicionar companyId nas tabelas existentes
    await queryInterface.addColumn('Users', 'companyId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Nullable para SuperAdmin global
      references: {
        model: 'Companies',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addIndex('Users', ['companyId']);

    await queryInterface.addColumn('Products', 'companyId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Companies',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addColumn('Products', 'stationId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'ProductionStations',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addIndex('Products', ['companyId']);
    await queryInterface.addIndex('Products', ['companyId', 'available']);

    await queryInterface.addColumn('Orders', 'companyId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Companies',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addIndex('Orders', ['companyId']);
    await queryInterface.addIndex('Orders', ['companyId', 'status']);
    await queryInterface.addIndex('Orders', ['companyId', 'table']);

    await queryInterface.addColumn('OrderItems', 'stationId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'ProductionStations',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addColumn('OrderItems', 'status', {
      type: Sequelize.ENUM('PENDING', 'QUEUED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'QUEUED',
    });
    await queryInterface.addColumn('OrderItems', 'deliveredById', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addColumn('OrderItems', 'notes', {
      type: Sequelize.STRING(500),
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addIndex('OrderItems', ['status']);
    await queryInterface.addIndex('OrderItems', ['stationId']);

    await queryInterface.addColumn('Settings', 'companyId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Companies',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addIndex('Settings', ['companyId']);

    await queryInterface.addColumn('AuditLogs', 'companyId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Companies',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addIndex('AuditLogs', ['companyId']);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('AuditLogs', 'companyId');
    await queryInterface.removeColumn('Settings', 'companyId');
    await queryInterface.removeColumn('OrderItems', 'notes');
    await queryInterface.removeColumn('OrderItems', 'deliveredById');
    await queryInterface.removeColumn('OrderItems', 'status');
    await queryInterface.removeColumn('OrderItems', 'stationId');
    await queryInterface.removeColumn('Orders', 'companyId');
    await queryInterface.removeColumn('Products', 'stationId');
    await queryInterface.removeColumn('Products', 'companyId');
    await queryInterface.removeColumn('Users', 'companyId');
    await queryInterface.dropTable('ProductionStations');
    await queryInterface.dropTable('Companies');
  },
};
