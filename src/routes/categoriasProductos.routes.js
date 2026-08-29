import { Router } from "express"
import { crearCategoriaProducto, listarCategorias } from "../controllers/categoriaProducto.controllers";

const router = Router();

router.route("/").post(crearCategoriaProducto).get(listarCategorias)