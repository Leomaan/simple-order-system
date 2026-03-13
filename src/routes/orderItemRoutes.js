import { create, remove } from "../controllers/orderItemController.js";
import { Router } from "express";

const routes = Router();

routes.post('/', create);
routes.delete('/:id', remove);

export default routes;