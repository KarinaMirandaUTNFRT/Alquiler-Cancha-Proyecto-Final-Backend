import { Router } from "express";
import {
  agregarAlCarrito,
  eliminarProductoDelCarrito,
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

router
  .route("/restar/:productoId")
  .patch([autenticador, validacionProductoIdParam], restarCantidad);

router
  .route("/:productoId")
  .delete([autenticador, validacionProductoIdParam], eliminarProductoDelCarrito);

export default router;
