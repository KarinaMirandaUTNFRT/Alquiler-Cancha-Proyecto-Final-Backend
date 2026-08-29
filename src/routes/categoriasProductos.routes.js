import { Router } from "express"
import { borrarCategoriaProductoPorID, crearCategoriaProducto, editarCategoriaProductoPorID, listarCategoriasProductos, obtenerCategoriaProductoPorID } from "../controllers/categoriaProducto.controllers";

const router = Router();

router.route("/").post(crearCategoriaProducto).get(listarCategoriasProductos)
router.route("/:id").get(obtenerCategoriaProductoPorID).delete(borrarCategoriaProductoPorID).put(editarCategoriaProductoPorID).patch(editarCategoriaProductoPorID)