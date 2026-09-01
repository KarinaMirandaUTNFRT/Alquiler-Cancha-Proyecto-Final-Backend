import { Router } from "express";
import { 
    borrarUsuarioPorID, 
    confirmarCodigoVerificacion, 
    crearUsuario, 
    editarUsuarioPorID, 
    listarUsuarios, 
    login, 
    obtenerUsuariosPorID, 
    registrarUsuario, 
    solicitarNuevoCodigo} from "../controllers/usuarios.controllers.js";
import { 
    validacionIDUsuario, 
    validacionUsuario, 
    validacionUsuarioPatch } from "../middlewares/validacionUsuario.js";
import { autenticador } from "../middlewares/authMiddleware.js";

const router = Router()

router.route('/').post(validacionUsuario,crearUsuario).get(listarUsuarios)
router.route('/:id').get(validacionIDUsuario,obtenerUsuariosPorID).delete(validacionIDUsuario, borrarUsuarioPorID).put([validacionIDUsuario,validacionUsuario],editarUsuarioPorID).patch(validacionUsuarioPatch,editarUsuarioPorID)
router.route('/registro').post(registrarUsuario)
router.route('/verificar-cuenta').post(confirmarCodigoVerificacion)
router.route('/reenviar-codigo').post(solicitarNuevoCodigo)
router.route("/login").post(login);
router.route("/perfil").get(autenticador)

export default router