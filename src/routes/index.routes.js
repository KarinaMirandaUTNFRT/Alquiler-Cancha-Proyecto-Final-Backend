import { Router } from "express";
import productosRoutes from './productos.routes.js'
import categoriaProductosRoutes from './categoriasProductos.routes.js'

const router = Router()

router.use('/productos', productosRoutes)
router.use('/categoriaProductos', categoriaProductosRoutes)

export default router