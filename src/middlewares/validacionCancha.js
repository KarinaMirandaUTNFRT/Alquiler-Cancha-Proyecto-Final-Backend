import { body } from "express-validator";
import resultadoValidacion from "./resultadoValidacion.js";
import Cancha from "../models/cancha.js";

const reglasCancha = [
  body("nombreCancha")
    .isString()
    .withMessage(
      "El nombre de la cancha es un dato obligatorio y debe ser un texto",
    )
    .isLength({ min: 5, max: 10 })
    .withMessage("El nombre de la cancha debe contener entre 5 y 10 caracteres")
    .custom(async (valorNom, { req }) => {
      const valorNomBuscado = await Cancha.findOne({ nombreCancha: valorNom });
       console.log(valorNomBuscado)
      if (!valorNomBuscado) {
        return true;
      }
      if (req.params?.id && valorNomBuscado._id.toString()===req.params.id)
      {
        return true
      }
      throw new Error(
        "El nombre de la cancha ya existe, elige otro diferente",
      );
    }),
  
body("precio")
    .isNumeric()
    .withMessage("el precio debe ser un valor numerico")
    .isFloat({ min: 50 })
    .withMessage("el precio minimo es de $1000 pesos")
    ,
body("descripcion")
    .isString()
    .withMessage("La descripcion  de la cancha debe ser un string")
    .isLength({ min: 10, max: 500 })
    .withMessage("La descripcion no debe exceder los 500 caracteres"),
];

export const validacionCancha = [...reglasCancha.map((regla)=>regla.notEmpty().withMessage('Este campo es obligatorio')
), resultadoValidacion]

export default validacionCancha;
