import { Router  } from "express";
import canchasRouter from "./cancha.routes.js"
import CategoriaCanchasRouter from "./categoriasCanchas.routes.js"

const router =Router()
router.use("/canchas", canchasRouter);
router.use("/categoriaCanchas", CategoriaCanchasRouter);

export default router;