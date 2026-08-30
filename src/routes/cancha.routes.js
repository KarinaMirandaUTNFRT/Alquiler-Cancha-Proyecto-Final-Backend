import { Router } from "express";
import { 
    crearCancha, 
    listarCanchas,
    borrarCancha,
    editarCancha,
    obtenerCanchasid,
 } from "../controllers/cancha.controllers.js";
 import validacionCancha from "../middlewares/validacionCancha.js";

const router = Router ()

router.route("/")
.post(validacionCancha, crearCancha)
.get(listarCanchas)

router.route("/:id")
.get(obtenerCanchasid)
.delete(borrarCancha)
.put(validacionCancha, editarCancha);
.patch(editarCancha)

export default router