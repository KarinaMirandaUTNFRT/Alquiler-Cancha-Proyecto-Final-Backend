import { Router } from "express";
import { crearCancha, listarCanchas } from "../controllers/cancha.controllers.js";
import validacionCancha from "../middlewares/validacionCancha.js";

const router = Router ()

router.route("/").post(validacionCancha, crearCancha).get(listarCanchas)


export default router