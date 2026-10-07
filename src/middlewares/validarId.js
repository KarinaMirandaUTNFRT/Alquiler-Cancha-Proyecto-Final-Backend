import { param } from "express-validator";
import resultadoValidacion from "./resultadoValidacion.js";

export const validacionIdParam = [
  param("id")
    .isMongoId()
    .withMessage("El id no corresponde a un formato válido de MongoDB"),
  resultadoValidacion,
];