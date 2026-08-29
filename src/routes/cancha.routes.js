import { Router } from "express";
import { crearCancha } from "../controllers/cancha.controllers.js";

const router = Router ()

router.route("/").post(crearCancha)