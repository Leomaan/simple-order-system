import { asyncHandler } from '../middleware/asyncHandler.js';
import { getPublicMenuProducts } from '../services/publicMenuService.js';

export const getPublicMenuController = asyncHandler(async (req, res) => {
  const companySlug = req.params.slug || req.query.slug || null;
  const result = await getPublicMenuProducts(companySlug);

  return res.status(200).json({
    success: true,
    data: result.products,
    company: result.company,
    categories: result.categories,
  });
});
