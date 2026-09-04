import React, { memo } from 'react';
import { getActionStyle, getRoleStyle, formatRelativeTime, getDetailRows } from '../util/logUtil';

const DetailPill = memo(({ icon, label, value }) => {
  return (
    <div className="flex items-center gap-1.5 border border-neutral-800 bg-neutral-900/60 rounded-lg px-2.5 py-1 text-[11px] font-medium text-neutral-300">
      <span className="text-neutral-500">{icon}</span>
      <span className="text-neutral-450 select-none">{label}:</span>
      <span className="font-semibold text-neutral-200">{value}</span>
    </div>
  );
});

function LogItem({ log }) {
  const actionStyle = getActionStyle(log.action);
  const roleStyle = getRoleStyle(log.userRole);
  const time = formatRelativeTime(log.createdAt);
  const details = getDetailRows(log);

  return (
    <article className="border border-neutral-850 bg-neutral-900/10 rounded-2xl hover:bg-neutral-900/30 hover:border-neutral-800 transition-all duration-200 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Color dot indicator */}
          <div className="pt-1.5 shrink-0">
            <div className={`w-2 h-2 rounded-full ${actionStyle.dot}`} />
          </div>

          <div className="space-y-2.5 min-w-0 flex-1">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-white font-extrabold text-sm leading-tight break-words">{log.userName}</span>
              <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] ${roleStyle.cls}`}>
                {roleStyle.label}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-semibold text-[10px] uppercase tracking-wider ${actionStyle.badge}`}>
                {actionStyle.icon} {actionStyle.label}
              </span>
            </div>

            {/* Details wrapper */}
            {details.length > 0 && (
              <div className="flex flex-wrap gap-2 animate-in fade-in duration-200 pt-1">
                {details.map((detail, i) => (
                  <DetailPill key={i} {...detail} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Timestamp */}
        <div className="sm:text-right text-left shrink-0 select-none pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-850/60 flex sm:flex-col items-center sm:items-end justify-between gap-2">
          <p className="text-neutral-300 text-xs font-bold">{time.relative}</p>
          <p className="text-neutral-500 text-[10px] font-medium">{time.absoluteDateTime}</p>
        </div>
      </div>
    </article>
  );
}

export default memo(LogItem);