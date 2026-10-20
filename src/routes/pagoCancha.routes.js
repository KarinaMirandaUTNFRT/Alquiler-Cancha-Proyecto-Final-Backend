import { Router } from "express";
import { autenticador } from "../middlewares/authMiddleware.js";
import {
  crearPreferenciaReserva,
  recibirWebhookReserva,
} from "../controllers/pagoCancha.controllers.js";
//import { validarFirmaMercadoPago } from "../helpers/validarWebhookMP.js";

const router = Router();

router.post("/crear-preferencia", autenticador, crearPreferenciaReserva);
router.post( "/webhook", recibirWebhookReserva,
);

export default router;
