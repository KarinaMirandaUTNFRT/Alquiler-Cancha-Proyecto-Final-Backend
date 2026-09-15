import { Router } from "express";
import {
  cancelarReservaCancha,
  crearReservaCancha,
  listarReservas,
  obtenerHorariosDisponibles,
  obtenerMisReservasCancha,
} from "../controllers/reserva.controllers.js";
import { autenticador, esAdmin } from "../middlewares/authMiddleware.js";

const router = Router();
router
  .route("/")
  .post(autenticador, crearReservaCancha)
  .get([autenticador, esAdmin], listarReservas);

router.route("/disponibles").get(obtenerHorariosDisponibles);
router.route("/mis-reservas").get(autenticador, obtenerMisReservasCancha);
router.route("/:id/cancelar").patch(autenticador, cancelarReservaCancha);

export default router;
