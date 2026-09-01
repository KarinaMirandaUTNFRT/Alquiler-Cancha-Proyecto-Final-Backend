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

import { autenticador, esAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router
  .route("/")
  .post( crearUsuario)
  .get([autenticador, esAdmin], listarUsuarios);

  
router.route("/registro").post(registrarUsuario);
router.route("/verificar-cuenta").post(confirmarCodigoVerificacion);
router.route("/reenviar-codigo").post(solicitarNuevoCodigo);
router.route("/login").post(login);
router.route("/perfil").get(autenticador, obtenerPerfil);
router.route("/logout").post(logout);

export default router;
