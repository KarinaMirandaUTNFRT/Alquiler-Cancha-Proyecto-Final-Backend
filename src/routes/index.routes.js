import { Router } from "express";
import canchasRouter from "./cancha.routes.js"
import CategoriaCanchasRouter from "./categoriasCanchas.routes.js"
import productosRouter from './productos.routes.js'
import categoriaProductosRouter from './categoriasProductos.routes.js'
import usuariosRouter from "./usuarios.routes.js"


const router =Router()
router.use("/canchas", canchasRouter);
router.use("/categoriaCanchas", CategoriaCanchasRouter);
router.use('/productos', productosRouter)
router.use('/categoriaProductos', categoriaProductosRouter)
router.use('/usuarios', usuariosRouter)


export default router;
