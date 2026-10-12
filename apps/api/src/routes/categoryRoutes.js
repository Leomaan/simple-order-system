import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { requireCompanyUser, requireAdmin } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { validateId } from '../middleware/validateId.js';
import { CreateCategorySchema, UpdateCategorySchema } from '@simple-order/schemas';

const router = Router();

// Todas as rotas de categoria exigem autenticação na empresa
router.use(requireCompanyUser);

router.get('/', categoryController.listCategories);
router.post('/', requireAdmin, validate(CreateCategorySchema), categoryController.createCategory);
router.put('/:id', validateId, requireAdmin, validate(UpdateCategorySchema), categoryController.updateCategory);
router.delete('/:id', validateId, requireAdmin, categoryController.deleteCategory);

export default router;
