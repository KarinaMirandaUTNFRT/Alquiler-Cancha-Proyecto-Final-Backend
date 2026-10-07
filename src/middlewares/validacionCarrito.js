import { param, body } from "express-validator";
import resultadoValidacion from "./resultadoValidacion.js";

export const validacionProductoIdParam = [
  param("productoId")
    .isMongoId()
    .withMessage("El id del producto no tiene un formato válido de MongoDB"),
  resultadoValidacion,
];

export const validacionAgregarCarrito = [
  body("productoId")
    .isMongoId()
    .withMessage("El id del producto enviado en el body no es válido"),
  body("cantidad")
    .optional()
    .isInt({ min: 1 })
    .withMessage("La cantidad debe ser un número entero mayor o igual a 1"),
  resultadoValidacion,
];