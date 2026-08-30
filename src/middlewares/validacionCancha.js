import { body } from "express-validator";
import resultadoValidacion from "./resultadoValidacion.js";

const validacionCancha = [
  body("nombreCancha" )
    .notEmpty()
    .withMessage("El nombre de la cancha es un dato obligatorio")
    .isString()
    .withMessage("El nombre de la cancha es un dato obligatorio y debe ser un texto"),
    resultadoValidacion
];
 export default validacionCancha