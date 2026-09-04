import { Router } from "express";
import {
  cancelarReservaCancha,
  crearReservaCancha,
  obtenerHorariosDisponibles,
  obtenerMisReservasCancha,
} from "../controllers/reserva.controllers.js";
import { autenticador } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", autenticador, crearReservaCancha);
router.get("/disponibles", obtenerHorariosDisponibles);
router.get("/mis-reservas", autenticador, obtenerMisReservasCancha);

router.patch("/:id/cancelar", autenticador, cancelarReservaCancha);

export default router;
