import { Router } from "express";
import { 
    crearCancha, 
    listarCanchas,
    borrarCancha,
    editarCancha,
    obtenerCanchasid,
    
 } from "../controllers/cancha.controllers.js";

const router = Router ()

router.route("/")
.post(crearCancha)
.get(listarCanchas)

router.route("/:id")
.get(obtenerCanchasid)
.delete(borrarCancha)
.put( editarCancha)
.put([validacionCancha], editarCancha);

export default router