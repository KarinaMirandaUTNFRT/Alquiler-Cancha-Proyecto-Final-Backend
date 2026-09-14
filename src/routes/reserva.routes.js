import { Router } from "express";
import {
  cancelarReservaCancha,
  crearReservaCancha,
  listarReservas,
  obtenerHorariosDisponibles,
  obtenerMisReservasCancha,
} from "../controllers/reserva.controllers.js";
import { autenticador } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", autenticador, crearReservaCancha).get( [autenticador, esAdmin], listarReservas);
router.get("/disponibles", obtenerHorariosDisponibles);
router.get("/mis-reservas", autenticador, obtenerMisReservasCancha);

router.patch("/:id/cancelar", autenticador, cancelarReservaCancha);

export default router;
