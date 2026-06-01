import { Router } from "express";
import { create, getAll, getById, update, remove, restore, permanentDelete, } from "../controllers/productController.js";
import { validate } from "../middleware/validate.js";
import { createProductSchema, updateProductSchema, } from "../schemas/schemas.js";
import { requireAdmin, requireWaiter } from '../middleware/authtenticate.js';
import { validateId } from "../middleware/validateId.js";

const routes = Router();

routes.post("/", requireAdmin, validate(createProductSchema), create);
routes.get("/", requireWaiter, getAll);
routes.get("/:id", validateId, requireWaiter, getById);
routes.put("/:id", validateId, requireAdmin, validate(updateProductSchema), update);
routes.delete("/:id", validateId, requireAdmin, remove);
routes.patch('/:id/restore', requireAdmin,  validateId, restore);
routes.delete('/:id/permanent', requireAdmin,  validateId, permanentDelete);

export default routes;
