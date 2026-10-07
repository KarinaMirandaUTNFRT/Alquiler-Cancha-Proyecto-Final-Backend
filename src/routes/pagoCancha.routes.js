import { Router } from "express";
import { autenticador } from "../middlewares/authMiddleware.js";
import {
  crearPreferenciaReserva,
  recibirWebhookReserva,
} from "../controllers/pagoCancha.controllers.js";

const router = Router();

router.route("/crear-preferencia")
.post(autenticador, crearPreferenciaReserva);

router.post('/webhook', (req, res, next) => {
  if (!validarFirmaMercadoPago(req)) {
    return res.status(401).json({ error: "Firma inválida" });
  }
  next();
}, recibirWebhookReserva);

export default router;
