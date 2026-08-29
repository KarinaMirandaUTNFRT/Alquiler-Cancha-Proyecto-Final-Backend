import { Router } from "express";
import {
  borrarCategoria,
  crearCategoriaCancha,
  listarCategoriasCanchas,
} from "../controllers/categoriaCancha.controllers.js";

const router = Router();

router.route("/")
.post(crearCategoriaCancha)
.get(listarCategoriasCanchas);

router.route("/:id")
.delete(borrarCategoria);

export default router;
