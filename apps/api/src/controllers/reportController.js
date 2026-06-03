import { asyncHandler } from '../middleware/asyncHandler.js';
import * as reportService from '../services/reportService.js';

export const getSalesToday = asyncHandler(async (req, res) => {
  const data = await reportService.salesToday();
  res.status(200).json({ success: true, data });
});

export const getRevenueByPeriod = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const data = await reportService.revenueByPeriod(from, to);
  res.status(200).json({ success: true, data });
});

export const getOrdersByPeriod = asyncHandler(async (req, res) => {
  const { from, to, status } = req.query;
  const data = await reportService.ordersByPeriod(from, to, status);
  res.status(200).json({ success: true, data });
});