import { Router } from "express";
import {
  crearPreferenciaPago,
  recibirWebhook,
} from "../controllers/pagoProducto.controllers.js";
import { autenticador } from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/crear-preferencia")
.post(autenticador, crearPreferenciaPago);
router.route("/webhook").post((req, res, next) => {
  if (!validarFirmaMercadoPago(req)) {
    return res.status(401).json({ error: "Firma inválida" });
  }
  next();
}, recibirWebhook);

export default router;
