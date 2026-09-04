import { Router } from "express";
import canchasRouter from "./cancha.routes.js"
import CategoriaCanchasRouter from "./categoriasCanchas.routes.js"
import productosRouter from './productos.routes.js'
import categoriaProductosRouter from './categoriasProductos.routes.js'
import usuariosRouter from "./usuarios.routes.js"
import carritoRouter from "./carrito.routes.js"
import reservaRouter from "./reserva.routes.js"

const router = Router()
router.use("/canchas", canchasRouter);
router.use("/categoriaCanchas", CategoriaCanchasRouter);
router.use('/productos', productosRouter)
router.use('/categoriaProductos', categoriaProductosRouter)
router.use('/usuarios', usuariosRouter)
router.use('/carrito', carritoRouter)
router.use("/reservas", reservaRouter);


export default router;
