import { create, remove, changeQuantity } from "../controllers/orderItemController.js";
import { Router } from "express";

const routes = Router();

routes.post('/', create);
routes.delete('/:id', remove);
routes.patch('/:id', changeQuantity);

export default routes;