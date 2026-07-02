'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Índice para otimizar busca de mesas ativas/pedidos abertos
    await queryInterface.addIndex('Orders', ['table', 'status', 'deletedAt'], {
      name: 'idx_orders_table_status_deletedAt'
    });

    // Índice para otimizar consultas e paginação de logs de auditoria
    await queryInterface.addIndex('AuditLogs', ['createdAt', 'userId'], {
      name: 'idx_audit_logs_created_user'
    });

    // Índices explícitos para chaves estrangeiras de itens de pedidos
    await queryInterface.addIndex('OrderItems', ['OrderId'], {
      name: 'idx_order_items_order_id'
    });
    await queryInterface.addIndex('OrderItems', ['ProductId'], {
      name: 'idx_order_items_product_id'
    });

    // Índice para chave estrangeira de tokens de atualização
    await queryInterface.addIndex('RefreshTokens', ['UserId'], {
      name: 'idx_refresh_tokens_user_id'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('Orders', 'idx_orders_table_status_deletedAt');
    await queryInterface.removeIndex('AuditLogs', 'idx_audit_logs_created_user');
    await queryInterface.removeIndex('OrderItems', 'idx_order_items_order_id');
    await queryInterface.removeIndex('OrderItems', 'idx_order_items_product_id');
    await queryInterface.removeIndex('RefreshTokens', 'idx_refresh_tokens_user_id');
  }
};
