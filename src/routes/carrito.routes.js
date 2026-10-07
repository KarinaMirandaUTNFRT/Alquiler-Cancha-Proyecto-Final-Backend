import { Router } from "express";
import {
  agregarAlCarrito,
  obtenerCarrito,
  restarCantidad,
  vaciarCarrito,
} from "../controllers/carrito.controllers.js";
import { autenticador } from "../middlewares/authMiddleware.js";
import { 
  validacionAgregarCarrito, 
  validacionProductoIdParam 
} from "../middlewares/validacionCarrito.js";

const router = Router();

router
  .route("/")
  .post([autenticador, validacionAgregarCarrito], agregarAlCarrito)
  .get(autenticador, obtenerCarrito)
  .delete(autenticador, vaciarCarrito);

router.route("/restar/:productoId")
.patch([autenticador, validacionProductoIdParam], restarCantidad);

export default router;
