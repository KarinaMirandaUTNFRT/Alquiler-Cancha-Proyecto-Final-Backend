import { Router } from "express";
import { query, param } from "express-validator";
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

router.get(
  "/disponibles",
  [
    query("fecha")
      .notEmpty()
      .withMessage("La fecha es obligatoria")
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage("El formato de fecha debe ser YYYY-MM-DD"),
    query("canchaId")
      .optional()
      .isMongoId()
      .withMessage("El ID de la cancha debe ser un ID válido"),
    resultadoValidacion,
  ],
  obtenerHorariosDisponibles,
);

router.route("/mis-reservas").get(autenticador, obtenerMisReservasCancha);
router.route("/:id/cancelar")
.patch
[
  autenticador, 
  param("id")
  .isMongoId()
  .withMessage("El ID de la reserva no es válido"),
    resultadoValidacion,
]
   cancelarReservaCancha;

export default router;
