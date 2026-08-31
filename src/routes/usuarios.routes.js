import { Router } from "express";
import { borrarUsuarioPorID, crearUsuario, editarUsuarioPorID, listarUsuarios, obtenerUsuariosPorID } from "../controllers/usuarios.controllers.js";

const router = Router()
// http://localhost:3000/api/usuarios/

router.route('/').post(crearUsuario).get(listarUsuarios)
router.route('/:id').get( obtenerUsuariosPorID).delete( borrarUsuarioPorID).put(editarUsuarioPorID).patch(editarUsuarioPorID)

export default router