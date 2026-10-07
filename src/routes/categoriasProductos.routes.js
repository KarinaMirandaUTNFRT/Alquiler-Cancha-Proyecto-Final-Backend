import { Router } from "express";
import {
  borrarCategoriaProductoPorID,
  crearCategoriaProducto,
  editarCategoriaProductoPorID,
  listarCategoriasProductos,
  obtenerCategoriaProductoPorID,
} from "../controllers/categoriaProducto.controllers.js";
import {
  validacionCategoria,
  validacionCategoriaPatch,
  validacionIDCategoria,
} from "../middlewares/validacionCategoria.js";
import { autenticador, esAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router
  .route("/")
  .post([autenticador, esAdmin, validacionCategoria], crearCategoriaProducto)
  .get(listarCategoriasProductos);
router
  .route("/:id")
  .get(validacionIDCategoria, obtenerCategoriaProductoPorID)
  .delete([autenticador, esAdmin, validacionIDCategoria], borrarCategoriaProductoPorID)
  .put(
    [autenticador, esAdmin, validacionIDCategoria, validacionCategoria],
    editarCategoriaProductoPorID,
  )
  .patch([autenticador, esAdmin, validacionIDCategoria, validacionCategoriaPatch], editarCategoriaProductoPorID);

export default router;
