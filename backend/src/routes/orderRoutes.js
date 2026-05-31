import { Router } from "express";
import { create, getAll, getById, update, close, remove, } from "../controllers/orderController.js";
import { validate } from "../middleware/validate.js";
import { createOrderSchema, updateOrderSchema } from "../schemas/schemas.js";
import { requireAdmin, requireWaiter } from '../middleware/authtenticate.js';
import { validateId } from "../middleware/validateId.js";

const routes = Router();

routes.post("/", requireWaiter, validate(createOrderSchema), create);
routes.get("/",  requireWaiter, getAll);
routes.get("/:id", validateId, requireWaiter, getById);
routes.put("/:id", validateId, requireWaiter, validate(updateOrderSchema), update);
routes.patch("/:id/close", validateId, requireWaiter, close);
routes.delete("/:id", validateId, requireAdmin, remove);

export default routes;
