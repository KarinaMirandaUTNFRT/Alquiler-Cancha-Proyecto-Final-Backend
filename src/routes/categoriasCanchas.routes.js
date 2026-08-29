import { Router } from "express";
import { crearCategoriaCancha, listarCategoriasCanchas } from "../controllers/categoriaCancha.controllers.js";


const router = Router ()

router.route("/").post(crearCategoriaCancha).get(listarCategoriasCanchas)

export default router;