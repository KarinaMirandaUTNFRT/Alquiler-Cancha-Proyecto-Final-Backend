import { Router } from "express";
import { crearPreferenciaPago, recibirWebhook } from "../controllers/pago.controllers.js";
import { autenticador } from "../middlewares/authMiddlewares.js";


const router = Router();

router
  .route("/crear-preferencia").post(autenticador,crearPreferenciaPago)
  router.route("/webhook").post(recibirWebhook);
export default router;
