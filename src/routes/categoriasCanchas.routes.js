import { Router } from "express";
import {
  borrarCategoria,
  crearCategoriaCancha,
  editarCategoria,
  listarCategoriasCanchas,
  obtenerCategoriaCanchaPorID,
} from "../controllers/categoriaCancha.controllers.js";

import { autenticador, esAdmin } from "../middlewares/authMiddleware.js";
import { validacionCategoriaPatch } from "../middlewares/validacionCategoriaCancha.js";

const router = Router();

router
  .route("/")
  .post([autenticador, esAdmin],crearCategoriaCancha)
  .get(listarCategoriasCanchas);

router
  .route("/:id")
  .get( obtenerCategoriaCanchaPorID)
  .delete([autenticador, esAdmin],  borrarCategoria)
  .put( [autenticador, esAdmin],editarCategoria)
  .patch([autenticador, esAdmin, validacionCategoriaPatch], editarCategoria);

export default router;
