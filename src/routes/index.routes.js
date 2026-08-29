import { Router  } from "express";
import canchasRouter from "./cancha.routes.js"

const router =Router()
router.use("/canchas/", canchasRouter);

export default router;