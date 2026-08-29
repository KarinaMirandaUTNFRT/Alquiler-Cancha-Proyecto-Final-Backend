import { Router } from "express";
import canchasRouter from "./cancha.routes.js"
import CategoriaCanchasRouter from "./categoriasCanchas.routes.js"
import productosRoutes from './productos.routes.js'
import categoriaProductosRoutes from './categoriasProductos.routes.js'
import canchasRouter from "./cancha.routes.js"
import CategoriaCanchasRouter from "./categoriasCanchas.routes.js"

const router =Router()
router.use("/canchas", canchasRouter);
router.use("/categoriaCanchas", CategoriaCanchasRouter);
router.use('/productos', productosRoutes)
router.use('/categoriaProductos', categoriaProductosRoutes)


export default router;
