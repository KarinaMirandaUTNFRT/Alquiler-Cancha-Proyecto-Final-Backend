import { Router } from "express";
import {
  borrarCategoria,
  crearCategoriaCancha,
  editarCategoria,
  listarCategoriasCanchas,
  obtenerCategoriaCanchaPorID,
} from "../controllers/categoriaCancha.controllers.js";
import { validacionCategoria, validacionCategoriaPatch, validacionIDCategoria } from "../middlewares/validacionCategoriaCancha.js";

const router = Router();

router.route("/")
.post( validacionCategoria, crearCategoriaCancha)
.get(  listarCategoriasCanchas);


router.route("/:id")
.get( validacionIDCategoria,  obtenerCategoriaCanchaPorID)
.delete(validacionIDCategoria,  borrarCategoria)
.put( [ validacionIDCategoria, validacionCategoria], editarCategoria)
.patch( validacionCategoriaPatch, editarCategoria);

export default router;
