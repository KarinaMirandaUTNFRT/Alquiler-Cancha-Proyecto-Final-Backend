import { Router } from "express";
import canchasRouter from "./cancha.routes.js"
import CategoriaCanchasRouter from "./categoriasCanchas.routes.js"
import productosRouter from './productos.routes.js'
import categoriaProductosRouter from './categoriasProductos.routes.js'
import usuariosRouter from "./usuarios.routes.js"
import carritoRouter from "./carrito.routes.js"
import pagoProductosRouter from "./pagoProducto.routes.js"
import pagoCanchasRouter from "./pagoCancha.routes.js"


const router = Router()
router.use("/canchas", canchasRouter);
router.use("/categoriaCanchas", CategoriaCanchasRouter);
router.use('/productos', productosRouter)
router.use('/categoriaProductos', categoriaProductosRouter)
router.use('/usuarios', usuariosRouter)
router.use('/carrito', carritoRouter)
router.use('/pagoProducto', pagoProductosRouter)
router.use('/pagoCancha', pagoCanchasRouter)


export default router;
