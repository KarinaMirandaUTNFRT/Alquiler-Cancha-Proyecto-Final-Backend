import { Router } from "express";
import {
  crearCancha,
  listarCanchas,
  borrarCancha,
  editarCancha,
  obtenerCanchasid,
} from "../controllers/cancha.controllers.js";
import {
  validacionCancha,
  validacionCanchaPatch,
  validacionIdCancha,
} from "../middlewares/validacionCancha.js";
import { autenticador, esAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router
  .route("/")
  .post([autenticador, esAdmin,upload.single('imagen'), errorMulter, validacionCancha], crearCancha)
  .get(listarCanchas);

router
  .route("/:id")
  .get(validacionIdCancha, obtenerCanchasid)
  .delete([autenticador, esAdmin, validacionIdCancha], borrarCancha)
  .put( [autenticador, esAdmin, upload.single('imagen'), errorMulter, validacionIdCancha, validacionCancha], editarCancha )
  .patch([autenticador, esAdmin, validacionCanchaPatch], editarCancha);

export default router;
