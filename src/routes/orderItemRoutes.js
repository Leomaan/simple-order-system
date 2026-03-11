import { create } from "../controllers/orderItemController.js";
import { Router } from "express";

const routes = Router();

routes.post('/', create);


export default routes;