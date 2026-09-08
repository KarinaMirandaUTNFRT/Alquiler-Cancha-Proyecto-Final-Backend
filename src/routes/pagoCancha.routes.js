import { Router } from "express";
import { autenticador } from "../middlewares/authMiddleware.js";
import {
  crearPreferenciaReserva,
  recibirWebhookReserva,
} from "../controllers/pagoCancha.controllers.js";

const router = Router();

router.route("/crear-preferencia").post(autenticador, crearPreferenciaReserva);
router.route("/webhook").post(recibirWebhookReserva).get(recibirWebhookReserva);
export default router;
