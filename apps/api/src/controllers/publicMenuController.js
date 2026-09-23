import { asyncHandler } from '../middleware/asyncHandler.js';
import { getPublicMenuProducts } from '../services/publicMenuService.js';

export const getPublicMenuController = asyncHandler(async (req, res) => {
  const products = await getPublicMenuProducts();

  return res.status(200).json({
    success: true,
    data: products,
  });
});
