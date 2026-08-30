import { body } from "express-validator";
import resultadoValidacion from "./resultadoValidacion.js";
import Cancha from "../models/cancha.js";

const validacionCancha = [
  body("nombreCancha")
    .notEmpty()
    .withMessage("El nombre de la cancha es un dato obligatorio")
    .isString()
    .withMessage(
      "El nombre de la cancha es un dato obligatorio y debe ser un texto",
    )
    .isLength({ min: 5, max: 10 })
    .withMessage("El nombre de la cancha debe contener entre 5 y 10 caracteres")
    .custom(async (valorNom, { req }) => {
      const valorNomBuscado = await Cancha.findOne({ nombreCancha: valorNom });

      if (!valorNomBuscado) {
        return true;
      }
      throw new Error(
        "El nombre de la cancha ya existe, elige otron diferente",
      );
    }),
  
body("precio")
    .isNumeric()
    .withMessage("el precio debe ser un valor numerico")
    .isFloat({ min: 50 })
    .withMessage("el precio minimo es de $1000 pesos")
    ,


  resultadoValidacion,
];
export default validacionCancha;
