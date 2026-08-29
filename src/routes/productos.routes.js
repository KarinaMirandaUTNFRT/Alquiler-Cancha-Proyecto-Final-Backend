import { Router } from "express";
import { crearProducto, listarProductos } from "../controllers/producto.controllers.js";

const router = Router()

router.route('/').post(crearProducto).get(listarProductos)