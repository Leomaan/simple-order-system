import { ICONS, ACTION_LABEL } from '../constants/logConstants';

export function getDetailRows(log) {
  const d = log.details || {};
  const rows = [];

  const mesa = d.table != null ? d.table : null;
  const pedido = d.order != null ? d.order : (log.entity === 'Order' ? log.entityId : null);
  const produto = d.product != null ? d.product : (d.name != null ? d.name : null);

  // MESA: Sinalizador Laranja (warning)
  if (mesa) {
    rows.push({ 
      icon: ICONS.table, 
      label: 'Mesa', 
      value: `Mesa ${mesa}`, 
      variant: 'warning' // Cor Laranja
    });
  }

  if (pedido) rows.push({ icon: ICONS.tag, label: 'Pedido', value: `#${pedido}`, variant: 'neutral' });
  if (produto) rows.push({ icon: ICONS.product, label: 'Item', value: String(produto), variant: 'neutral' });

  switch (log.action) {
    case 'UPDATE_ORDER_ITEM':
      if (d.change) {
        const text = String(d.change);
        const isAdd = text.startsWith('Adicionou');
        rows.push({
          icon: ICONS.info,
          label: 'Alteração',
          value: text,
          variant: isAdd ? 'success' : 'danger'
        });
      }
      break;

    case 'ADD_ORDER_ITEM':
      if (d.quantity) {
        rows.push({ icon: ICONS.info, label: 'Quantidade', value: `${d.quantity}x`, variant: 'success' });
      }
      break;

    case 'CLOSE_ORDER':
      // TOTAL: Sinalizador Verde (success)
      if (d.total) {
        rows.push({ 
          icon: ICONS.money, 
          label: 'Total', 
          value: `R$ ${Number(d.total).toFixed(2)}`, 
          variant: 'success' // Cor Verde
        });
      }
      break;

    case 'UPDATE_ORDER':
      if (d.oldTable) rows.push({ icon: ICONS.table, label: 'Anterior', value: `Mesa ${d.oldTable}`, variant: 'neutral' });
      if (d.newTable) rows.push({ icon: ICONS.table, label: 'Nova', value: `Mesa ${d.newTable}`, variant: 'warning' });
      break;
      
    // ... outros cases
  }

  return rows;
}

export function getActionStyle(action) {
  const label = ACTION_LABEL[action] || action;
  if (action.match(/CREATE|ADD|RESTORE/)) return { label, dot: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20', icon: ICONS.plus };
  if (action.match(/DELETE|REMOVE|PERMANENT/)) return { label, dot: 'bg-red-500', badge: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20', icon: ICONS.trash };
  return { label, dot: 'bg-blue-500', badge: 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20', icon: ICONS.edit };
}

export function getRoleStyle(role) {
  return role === 'ADMIN' 
    ? { label: 'Admin', cls: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20' }
    : { label: 'Garçom', cls: 'bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20' };
}

export function formatRelativeTime(dateStr) {
  const date = new Date(dateStr);
  // ... sua lógica de formatRelativeTime ...
  return { relative: '2m atrás', hour: '14:20' }; // Exemplo
}