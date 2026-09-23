export function formatReportSalesDto(report) {
  if (!report) return null;

  return {
    date: report.date || undefined,
    from: report.from || undefined,
    to: report.to || undefined,
    totalOrders: Number(report.totalOrders || 0),
    totalRevenue: Number(Number(report.totalRevenue || 0).toFixed(2)),
  };
}
