import { Router } from "express";
import { query } from "express-validator";
import {
  cancelarReservaCancha,
  crearReservaCancha,
  listarReservas,
  obtenerHorariosDisponibles,
  obtenerMisReservasCancha,
  
} from "../controllers/reserva.controllers.js";
import { autenticador, esAdmin } from "../middlewares/authMiddleware.js";
import resultadoValidacion from "../middlewares/resultadoValidacion.js";
const router = Router();
router
  .route("/")
  .post(autenticador, crearReservaCancha)
  .get([autenticador, esAdmin], listarReservas);

router.route("/disponibles").get([query("fecha")
      .notEmpty()
      .withMessage("La fecha es obligatoria")
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage("El formato de fecha debe ser YYYY-MM-DD"),
    resultadoValidacion], obtenerHorariosDisponibles);
router.route("/mis-reservas").get(autenticador, obtenerMisReservasCancha);
router.route("/:id/cancelar").patch(autenticador, cancelarReservaCancha);

export default router;
