import { Router } from "express";
import { borrarProductoPorID, crearProducto, editarProductoPorID, listarProductos, obtenerProductoPorID } from "../controllers/producto.controllers.js";

const router = Router()

router.route('/').post(crearProducto).get(listarProductos)
router.route('/:id').get(obtenerProductoPorID).delete(borrarProductoPorID).put(editarProductoPorID).patch(editarProductoPorID)

export default router;