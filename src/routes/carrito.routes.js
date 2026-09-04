import { Router } from "express";
import {
  agregarAlCarrito,
  obtenerCarrito,
  restarCantidad,
  vaciarCarrito,
} from "../controllers/carrito.controllers.js";
import { autenticador } from "../middlewares/authMiddleware.js";

const router = Router();

router
  .route("/")
  .post(autenticador, agregarAlCarrito)
  .get(autenticador, obtenerCarrito)
  .delete(autenticador, vaciarCarrito);

  router.route('/restar/:productoId').patch(autenticador,restarCantidad)

export default router;
