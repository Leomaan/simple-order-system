import { Router } from 'express';
import * as companyController from '../controllers/companyController.js';
import { requireSuperAdmin } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { validateId } from '../middleware/validateId.js';
import { CreateCompanySchema, UpdateCompanySchema } from '@simple-order/schemas';

const router = Router();

// Todas as rotas de empresas são protegidas exclusivamente para SuperAdministradores
router.use(requireSuperAdmin);

router.get('/', companyController.listCompanies);
router.get('/:id', validateId, companyController.getCompanyById);
router.post('/', validate(CreateCompanySchema), companyController.createCompany);
router.put('/:id', validateId, validate(UpdateCompanySchema), companyController.updateCompany);
router.patch('/:id/toggle-status', validateId, companyController.toggleCompanyStatus);
router.post('/:id/impersonate', validateId, companyController.impersonateCompany);

export default router;
