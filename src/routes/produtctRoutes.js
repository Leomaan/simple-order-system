import { create, getAll, getById, remove, update } from "../controllers/productController.js";
import { Router } from "express";

const routes = Router();

routes.post('/', create);
routes.get('/', getAll);
routes.get('/:id', getById);
routes.delete('/:id', remove);
routes.put('/:id', update);

export default routes;