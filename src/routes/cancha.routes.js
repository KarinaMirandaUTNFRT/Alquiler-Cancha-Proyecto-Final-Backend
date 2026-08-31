import { Router } from "express";
import { 
    crearCancha, 
    listarCanchas,
    borrarCancha,
    editarCancha,
    obtenerCanchasid,
 } from "../controllers/cancha.controllers.js";
 import {validacionCancha, validacionCanchaPatch, validacionIdCancha} from "../middlewares/validacionCancha.js";

const router = Router ()

router.route("/")
.post(validacionCancha, crearCancha)
.get(listarCanchas)

router.route("/:id")
.get(validacionIdCancha, obtenerCanchasid)
.delete(validacionIdCancha, borrarCancha)
.put( [validacionIdCancha, validacionCancha], editarCancha)
.patch(validacionCanchaPatch, editarCancha)

export default router