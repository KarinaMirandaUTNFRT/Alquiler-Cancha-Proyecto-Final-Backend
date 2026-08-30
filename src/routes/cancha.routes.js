import { Router } from "express";
import { crearCancha, listarCanchas } from "../controllers/cancha.controllers.js";
import validacionCancha from "../middlewares/validacionCancha.js";

const router = Router ()

router.route("/")
.post(validacionCancha, crearCancha)
.get(listarCanchas)

router
  .route("/:id")
  .delete(borrarCancha)
  .put([validacionCancha], editarCancha);
  
export default router