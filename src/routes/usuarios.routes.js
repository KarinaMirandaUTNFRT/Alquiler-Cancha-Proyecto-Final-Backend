import { Router } from "express";
import {
  confirmarCodigoVerificacion,
  crearUsuario,
  listarUsuarios,
  login,
  obtenerPerfil,
  registrarUsuario,
  solicitarNuevoCodigo,
  logout,
} from "../controllers/usuarios.controllers.js";
import rateLimit from 'express-rate-limit';
import { autenticador, esAdmin } from "../middlewares/authMiddleware.js";

const router = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiados intentos de login'
});

router
  .route("/")
  .post(crearUsuario)
  .get([autenticador, esAdmin], listarUsuarios);

router.route("/registro").post(registrarUsuario);
router.route("/verificar-cuenta").post(confirmarCodigoVerificacion);
router.route("/reenviar-codigo").post(solicitarNuevoCodigo);
router.route("/login").post(loginLimiter, login );
router.route("/perfil").get(autenticador, obtenerPerfil);
router.route("/logout").post(logout);

export default router;
