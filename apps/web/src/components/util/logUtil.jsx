import { ICONS, ACTION_LABEL } from '../constants/logConstants';

/**
 * Normaliza e formata a exibição de variação de quantidade (+X ou -X).
 * @param {string|number} change 
 * @returns {string}
 */
export function formatItemChange(change) {
  if (!change) return '';
  const text = String(change).trim();
  if (text.startsWith('Adicionou ')) {
    return `+${text.replace('Adicionou ', '').trim()}`;
  }
  if (text.startsWith('Reduziu ')) {
    return `-${text.replace('Reduziu ', '').trim()}`;
  }
  if (text.startsWith('Aumentou ')) {
    return `+${text.replace('Aumentou ', '').trim()}`;
  }
  return text;
}

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

  if (mesa) {
    rows.push({ 
      icon: ICONS.table, 
      label: 'Mesa', 
      value: `Mesa ${mesa}`, 
    });
  }

  if (pedido) rows.push({ icon: ICONS.tag, label: 'Pedido', value: `#${pedido}` });
  if (produto) rows.push({ icon: ICONS.product, label: 'Item', value: String(produto) });
  if (usuarioAlvo) rows.push({ icon: ICONS.person, label: 'Usuário', value: String(usuarioAlvo) });

  const categoryLabels = {
    FOOD: 'Comida',
    DRINK: 'Bebida',
    SNACK: 'Lanche',
    DESSERT: 'Sobremesa',
    SIDE: 'Acompanhamento',
  };

  switch (log.action) {
    case 'UPDATE_PRODUCT': {
      const diff = d.diff || {};
      if (diff.name) {
        rows.push({
          icon: ICONS.product,
          label: 'Nome',
          value: `${diff.name.old} ➔ ${diff.name.new}`,
        });
      }
      if (diff.price) {
        rows.push({
          icon: ICONS.money,
          label: 'Preço',
          value: `R$ ${Number(diff.price.old).toFixed(2)} ➔ R$ ${Number(diff.price.new).toFixed(2)}`,
        });
      }
      if (diff.category) {
        const oldCat = categoryLabels[diff.category.old] || diff.category.old;
        const newCat = categoryLabels[diff.category.new] || diff.category.new;
        rows.push({
          icon: ICONS.tag,
          label: 'Categoria',
          value: `${oldCat} ➔ ${newCat}`,
        });
      }
      if (diff.available) {
        const oldStatus = diff.available.old ? 'Disponível' : 'Indisponível';
        const newStatus = diff.available.new ? 'Disponível' : 'Indisponível';
        rows.push({
          icon: ICONS.info,
          label: 'Disponibilidade',
          value: `${oldStatus} ➔ ${newStatus}`,
        });
      }
      if (diff.description) {
        const oldD = diff.description.old ? `"${diff.description.old}"` : '(sem descrição)';
        const newD = diff.description.new ? `"${diff.description.new}"` : '(sem descrição)';
        rows.push({
          icon: ICONS.info,
          label: 'Descrição',
          value: `${oldD} ➔ ${newD}`,
        });
      }

      // Compatibilidade para logs antigos gravados antes da atualização da auditoria
      if (!d.diff) {
        const nonNameKeys = Object.keys(d).filter(k => k !== 'name');
        if (nonNameKeys.length === 1) {
          const k = nonNameKeys[0];
          if (k === 'price' && d.price != null) {
            rows.push({ icon: ICONS.money, label: 'Preço Atualizado', value: `R$ ${Number(d.price).toFixed(2)}` });
          } else if (k === 'category' && d.category != null) {
            rows.push({ icon: ICONS.tag, label: 'Categoria Atualizada', value: categoryLabels[d.category] || d.category });
          } else if (k === 'available' && d.available != null) {
            rows.push({ icon: ICONS.info, label: 'Disponibilidade', value: d.available ? 'Disponível' : 'Indisponível' });
          } else if (k === 'description' && d.description != null) {
            rows.push({ icon: ICONS.info, label: 'Descrição', value: `"${d.description}"` });
          }
        }
      }
      break;
    }

    case 'CREATE_PRODUCT':
      if (d.price != null) {
        rows.push({
          icon: ICONS.money,
          label: 'Preço',
          value: `R$ ${Number(d.price).toFixed(2)}`,
        });
      }
      if (d.category != null) {
        rows.push({
          icon: ICONS.tag,
          label: 'Categoria',
          value: categoryLabels[d.category] || d.category,
        });
      }
      if (d.description) {
        rows.push({
          icon: ICONS.info,
          label: 'Descrição',
          value: `"${d.description}"`,
        });
      }
      break;

    case 'UPDATE_USER': {
      const diff = d.diff || {};
      if (diff.name) {
        rows.push({ icon: ICONS.person, label: 'Nome', value: `${diff.name.old} ➔ ${diff.name.new}` });
      }
      if (diff.role) {
        const oldR = diff.role.old === 'ADMIN' ? 'Admin' : 'Garçom';
        const newR = diff.role.new === 'ADMIN' ? 'Admin' : 'Garçom';
        rows.push({ icon: ICONS.person, label: 'Cargo', value: `${oldR} ➔ ${newR}` });
      }
      if (diff.active) {
        const oldA = diff.active.old ? 'Ativo' : 'Inativo';
        const newA = diff.active.new ? 'Ativo' : 'Inativo';
        rows.push({ icon: ICONS.info, label: 'Status', value: `${oldA} ➔ ${newA}` });
      }

      if (!d.diff) {
        if (d.role != null) rows.push({ icon: ICONS.person, label: 'Novo Cargo', value: d.role === 'ADMIN' ? 'Admin' : 'Garçom' });
        if (d.active != null) rows.push({ icon: ICONS.info, label: 'Status', value: d.active ? 'Ativo' : 'Inativo' });
      }
      break;
    }

    case 'CREATE_USER':
      if (d.role != null) {
        rows.push({
          icon: ICONS.person,
          label: 'Cargo',
          value: d.role === 'ADMIN' ? 'Admin' : 'Garçom',
        });
      }
      break;

    case 'UPDATE_ORDER_ITEM':
      if (d.change) {
        rows.push({
          icon: ICONS.info,
          label: 'Alteração',
          value: formatItemChange(d.change),
        });
      }
      break;

    case 'ADD_ORDER_ITEM':
      if (d.quantity) {
        rows.push({ icon: ICONS.info, label: 'Quantidade', value: `${d.quantity}x` });
      }
      break;

    case 'CLOSE_ORDER':
    case 'PAY_ORDER':
      if (d.total) {
        rows.push({ 
          icon: ICONS.money, 
          label: 'Total', 
          value: `R$ ${Number(d.total).toFixed(2)}`, 
        });
      }
      break;

    case 'UPDATE_ORDER':
      if (d.oldTable) rows.push({ icon: ICONS.table, label: 'Anterior', value: `Mesa ${d.oldTable}` });
      if (d.newTable) rows.push({ icon: ICONS.table, label: 'Nova', value: `Mesa ${d.newTable}` });
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
    : { label: 'Garçom', cls: 'bg-neutral-800/80 text-neutral-400 border border-neutral-750' };
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