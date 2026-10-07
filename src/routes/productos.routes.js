import { Router } from "express";
import {
  borrarProductoPorID,
  crearProducto,
  editarProductoPorID,
  listarProductos,
  obtenerProductoPorID,
} from "../controllers/producto.controllers.js";
import { autenticador, esAdmin } from "../middlewares/authMiddleware.js";
import { 
  validacionIDProducto,
  validacionProducto,
  validacionProductoPatch 
} from "../middlewares/validacionProducto.js";
import { obtenerCategoriaProductoPorID } from "../controllers/categoriaProducto.controllers.js";

const router = Router();

router.route("/")
.post( [autenticador, esAdmin, validacionProducto], crearProducto)
.get(listarProductos);

router
  .route("/:id")
  .get( validacionIDProducto,   obtenerProductoPorID)
  .delete( [autenticador, esAdmin, validacionIDProducto], borrarProductoPorID)
  .put(
    [
      autenticador, esAdmin, validacionIDProducto, validacionProducto], editarProductoPorID)
  .patch(
    [
      autenticador, esAdmin, validacionIDProducto, validacionProductoPatch ], editarProductoPorID);

export default router;
