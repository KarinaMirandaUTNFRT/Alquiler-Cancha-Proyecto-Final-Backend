import { Router } from "express"
import { borrarCategoriaProductoPorID, crearCategoriaProducto, editarCategoriaProductoPorID, listarCategoriasProductos, obtenerCategoriaProductoPorID } from "../controllers/categoriaProducto.controllers.js";
import { validacionCategoria, validacionCategoriaPatch, validacionIDCategoria } from "../middlewares/validacionCategoria.js";

const router = Router();

router.route("/").post(validacionCategoria,crearCategoriaProducto).get(listarCategoriasProductos)
router.route("/:id").get(validacionIDCategoria,obtenerCategoriaProductoPorID).delete(validacionIDCategoria,borrarCategoriaProductoPorID).put([validacionIDCategoria,validacionCategoria],editarCategoriaProductoPorID).patch(validacionCategoriaPatch,editarCategoriaProductoPorID)

export default router;