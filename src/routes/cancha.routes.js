import { Router } from "express";
import { crearCancha, listarCanchas } from "../controllers/cancha.controllers.js";

const router = Router ()

router.route("/").post(crearCancha)
router.route("/categoriaCancha").post(crearCancha).get(listarCanchas)
