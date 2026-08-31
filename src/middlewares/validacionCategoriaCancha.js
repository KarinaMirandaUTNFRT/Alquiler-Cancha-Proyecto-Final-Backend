import { body, param } from "express-validator";
import resultadoValidacion from "./resultadoValidacion.js";
import CategoriaCancha from "../models/categoriaCancha.js";

export const reglasCategoriaCancha = [
  body("nombre")
    .isString()
    .withMessage("El dato debe ser un string")
    .isLength({ min: 5, max: 50 })
    .withMessage("El nombre la categoria debe contener entre 5 y 50 caracteres")
    .custom(async (valor, { req }) => {
      const categoriaBuscada = await CategoriaCancha.findOne({ nombre: valor });
     
      if (!categoriaBuscada) {
        return true;
      }
      
      if(req.params?.id && categoriaBuscada._id.toString() === req.params.id){
        return true
      }
    }),
  body("descripcion")
    .isString()
    .withMessage("La descripcion debe ser un string")
    .isLength({ min: 5, max: 250 })
    .withMessage("La descripcion debe contener entre 5 y 250 caracteres")
];

export const validacionCategoria=[...reglasCategoriaCancha.map((regla)=> regla.notEmpty().withMessage('Este campo es obligaotio')), resultadoValidacion]

export const validacionCategoriaPatch = [...reglasCategoriaCancha.map((regla) => regla.optional({values:'falsy'})), resultadoValidacion]

export const validacionIDCategoria = [
  param("id")
    .isMongoId()
    .withMessage(
      "El ID no conrresponde con el formato correcto de un ID de MongoDB"
    ),
  resultadoValidacion,
];