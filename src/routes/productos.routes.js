import { Router } from "express";
import {
  borrarProductoPorID,
  crearProducto,
  editarProductoPorID,
  listarProductos,
  obtenerProductoPorID,
} from "../controllers/producto.controllers.js";
import { autenticador, esAdmin } from "../middlewares/authMiddleware.js";
import { validacionProductoPatch } from "../middlewares/validacionProducto.js";

const router = Router();

router.route("/")
.post( [autenticador, esAdmin], crearProducto)
.get(listarProductos);

router
  .route("/:id")
  .get( obtenerProductoPorID)
  .delete( [autenticador, esAdmin], borrarProductoPorID)
  .put([autenticador, esAdmin], editarProductoPorID)
  .patch([autenticador, esAdmin, validacionProductoPatch ], editarProductoPorID);

export default router;
