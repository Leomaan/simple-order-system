import { Router } from "express";
import {create, remove, changeQuantity,} from "../controllers/orderItemController.js";
import { validate } from "../middleware/validate.js";
import { createOrderItemSchema,changeQuantitySchema, } from "../schemas/schemas.js";
import { requireWaiter } from '../middleware/authtenticate.js';

const routes = Router();

routes.post("/",  requireWaiter, validate(createOrderItemSchema), create);
routes.patch("/:id", requireWaiter, validate(changeQuantitySchema), changeQuantity);
routes.delete("/:id", requireWaiter, remove);

export default routes;
