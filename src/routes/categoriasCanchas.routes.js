import { Router } from "express";
import {
  borrarCategoria,
  crearCategoriaCancha,
  editarCategoria,
  listarCategoriasCanchas,
} from "../controllers/categoriaCancha.controllers.js";

const router = Router();

router.route("/")
.post(crearCategoriaCancha)
.get(listarCategoriasCanchas);


router.route("/:id")
.delete(borrarCategoria)
.put( editarCategoria)
.patch(editarCategoria);

export default router;
