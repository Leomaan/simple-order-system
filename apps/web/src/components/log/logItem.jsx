import { getActionStyle, getRoleStyle, formatRelativeTime, getDetailRows } from '../util/logUtil';
import { memo } from 'react';

const DetailPill = memo(({ icon, label, value, variant }) => {
  const colors = {
    success: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20',
    danger: 'text-red-400 bg-red-500/5 border-red-500/20',
    warning: 'text-orange-400 bg-orange-500/5 border-orange-500/20',
    neutral: 'text-neutral-300 bg-neutral-800/50 border-neutral-700/30'
  };

  return (
    <div className={`flex items-center gap-1.5 border rounded-lg px-2 py-1 text-[11px] ${colors[variant] || colors.neutral}`}>
      <span className="opacity-60">{icon}</span>
      <span className="opacity-60">{label}:</span>
      <span className="font-bold">{value}</span>
    </div>
  );
});

function LogItem({ log }) {
  const actionStyle = getActionStyle(log.action);
  const roleStyle = getRoleStyle(log.userRole);
  const time = formatRelativeTime(log.createdAt);
  const details = getDetailRows(log);

  return (
    <article className="border border-neutral-800/70 bg-neutral-900/30 rounded-2xl overflow-hidden">
      <div className="flex items-start gap-4 px-5 py-4">
        {/* Ponto de cor lateral */}
        <div className="flex-none pt-2.5">
          <div className={`w-1.5 h-1.5 rounded-full ${actionStyle.dot}`} />
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          {/* Cabeçalho */}
          <div className="flex items-center gap-2 flex-wrap text-[11px]">
            <span className="text-white font-bold">{log.userName}</span>
            <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] ${roleStyle.cls}`}>
              {roleStyle.label}
            </span>
            <span className="text-neutral-700">·</span>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-medium ${actionStyle.badge}`}>
              {actionStyle.icon} {actionStyle.label}
            </span>
          </div>

          {/* LISTA DE DETALHES - Agora sem esconder nada */}
          {details.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {details.map((detail, i) => (
                <DetailPill key={i} {...detail} />
              ))}
            </div>
          )}
        </div>

        {/* Data e Hora */}
        <div className="flex-none text-right">
          <p className="text-neutral-400 text-[11px] font-medium">{time.relative}</p>
          <p className="text-neutral-700 text-[10px] tabular-nums uppercase">{time.hour}</p>
        </div>
      </div>
    </article>
  );
}

export default memo(LogItem);