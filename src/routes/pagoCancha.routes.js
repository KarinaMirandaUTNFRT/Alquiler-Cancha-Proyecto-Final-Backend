import { Router } from "express";
import { autenticador } from "../middlewares/authMiddleware.js";
import { crearPreferenciaPagoDirecta, recibirWebhook } from "../controllers/pagoCancha.controllers.js";



const router = Router();

router
  .route("/crear-preferencia").post(autenticador, crearPreferenciaPagoDirecta)
  router.route("/webhook").post(recibirWebhook);
export default router;
