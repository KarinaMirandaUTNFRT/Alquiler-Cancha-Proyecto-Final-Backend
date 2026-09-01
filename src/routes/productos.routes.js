import { Router } from "express";
import {
  borrarProductoPorID,
  crearProducto,
  editarProductoPorID,
  listarProductos,
  obtenerProductoPorID,
} from "../controllers/producto.controllers.js";
import {
  validacionIDProducto,
  validacionProducto,
  validacionProductoPatch,
} from "../middlewares/validacionProducto.js";

const router = Router();

router.route("/").post(validacionProducto, crearProducto).get(listarProductos);
router
  .route("/:id")
  .get(validacionIDProducto, obtenerProductoPorID)
  .delete(validacionIDProducto, borrarProductoPorID)
  .put([validacionIDProducto, validacionProducto], editarProductoPorID)
  .patch(validacionProductoPatch, editarProductoPorID);

export default router;
