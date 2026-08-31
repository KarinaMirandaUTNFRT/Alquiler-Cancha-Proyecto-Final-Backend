import { Router } from "express";
import { borrarUsuarioPorID, crearUsuario, editarUsuarioPorID, listarUsuarios, obtenerUsuariosPorID } from "../controllers/usuarios.controllers.js";
import { validacionIDUsuario, validacionUsuario, validacionUsuarioPatch } from "../middlewares/validacionUsuario.js";

const router = Router()
// http://localhost:3000/api/usuarios/

router.route('/').post(validacionUsuario,crearUsuario).get(listarUsuarios)
router.route('/:id').get(validacionIDUsuario,obtenerUsuariosPorID).delete(validacionIDUsuario, borrarUsuarioPorID).put([validacionIDUsuario,validacionUsuario],editarUsuarioPorID).patch(validacionUsuarioPatch,editarUsuarioPorID)

export default router