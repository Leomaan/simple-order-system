import { ICONS, ACTION_LABEL } from '../constants/logConstants';

export function getDetailRows(log) {
  let d = log.details || {};
  if (typeof d === 'string') {
    try {
      d = JSON.parse(d);
    } catch {
      d = {};
    }
  }
  const rows = [];

  const mesa = d.table != null ? d.table : null;
  const pedido = d.order != null ? d.order : (log.entity === 'Order' ? log.entityId : null);
  const produto = d.product != null ? d.product : (d.name != null && log.entity !== 'User' ? d.name : null);
  const usuarioAlvo = log.entity === 'User' ? (d.name || null) : null;

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
  if (usuarioAlvo) rows.push({ icon: ICONS.person, label: 'Usuário', value: String(usuarioAlvo), variant: 'neutral' });

  const categoryLabels = {
    FOOD: 'Comida',
    DRINK: 'Bebida',
    SNACK: 'Lanche',
    DESSERT: 'Sobremesa',
    SIDE: 'Acompanhamento',
  };

  switch (log.action) {
    case 'UPDATE_PRODUCT':
      if (d.price != null) {
        rows.push({
          icon: ICONS.money,
          label: 'Novo Preço',
          value: `R$ ${Number(d.price).toFixed(2)}`,
          variant: 'warning'
        });
      }
      if (d.category != null) {
        rows.push({
          icon: ICONS.tag,
          label: 'Nova Categoria',
          value: categoryLabels[d.category] || d.category,
          variant: 'neutral'
        });
      }
      if (d.available != null) {
        rows.push({
          icon: ICONS.info,
          label: 'Disponibilidade',
          value: d.available ? 'Disponível' : 'Indisponível',
          variant: d.available ? 'success' : 'danger'
        });
      }
      break;

    case 'CREATE_PRODUCT':
      if (d.price != null) {
        rows.push({
          icon: ICONS.money,
          label: 'Preço',
          value: `R$ ${Number(d.price).toFixed(2)}`,
          variant: 'success'
        });
      }
      if (d.category != null) {
        rows.push({
          icon: ICONS.tag,
          label: 'Categoria',
          value: categoryLabels[d.category] || d.category,
          variant: 'neutral'
        });
      }
      break;

    case 'UPDATE_USER':
      if (d.role != null) {
        rows.push({
          icon: ICONS.person,
          label: 'Novo Cargo',
          value: d.role === 'ADMIN' ? 'Admin' : 'Garçom',
          variant: 'warning'
        });
      }
      if (d.active != null) {
        rows.push({
          icon: ICONS.info,
          label: 'Status',
          value: d.active ? 'Ativo' : 'Inativo',
          variant: d.active ? 'success' : 'danger'
        });
      }
      break;

    case 'CREATE_USER':
      if (d.role != null) {
        rows.push({
          icon: ICONS.person,
          label: 'Cargo',
          value: d.role === 'ADMIN' ? 'Admin' : 'Garçom',
          variant: 'neutral'
        });
      }
      break;

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
    case 'PAY_ORDER':
      // TOTAL: Sinalizador Verde (success)
      if (d.total) {
        rows.push({ 
          icon: ICONS.money, 
          label: 'Total', 
          value: `R$ ${Number(d.total).toFixed(2)}`, 
          variant: 'success'
        });
      }
      break;

    case 'UPDATE_ORDER':
      if (d.oldTable) rows.push({ icon: ICONS.table, label: 'Anterior', value: `Mesa ${d.oldTable}`, variant: 'neutral' });
      if (d.newTable) rows.push({ icon: ICONS.table, label: 'Nova', value: `Mesa ${d.newTable}`, variant: 'warning' });
      break;
  }

  return rows;
}

export function getActionStyle(action) {
  const label = ACTION_LABEL[action] || action;
  if (action === 'PAY_ORDER') {
    return {
      label,
      dot: 'bg-amber-500',
      badge: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
      icon: ICONS.money
    };
  }
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
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const calendarDays = Math.round((todayStart - dateStart) / (1000 * 60 * 60 * 24));

  let relative = '';
  if (diffSec < 10) {
    relative = 'agora mesmo';
  } else if (diffSec < 60) {
    relative = `há ${diffSec}s`;
  } else if (diffMin === 1) {
    relative = 'há 1 min';
  } else if (diffMin < 60) {
    relative = `há ${diffMin} min`;
  } else if (calendarDays === 0) {
    relative = diffHr === 1 ? 'há 1 hora' : `há ${diffHr} horas`;
  } else if (calendarDays === 1) {
    relative = 'ontem';
  } else {
    relative = `há ${calendarDays} dias`;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  const absoluteDateTime = `${day}/${month}/${year} ${hours}:${minutes}`;

  return { relative, absoluteDateTime };
}