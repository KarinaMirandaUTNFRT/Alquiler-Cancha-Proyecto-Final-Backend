import { body, param } from "express-validator";
import resultadoValidacion from "./resultadoValidacion.js";
import CategoriaProducto from "../models/categoriaProducto.js";

export const reglasCategoriaProducto = [
  body("nombre")
    .isString()
    .withMessage("El dato debe ser un string")
    .isLength({ min: 3, max: 100 })
    .withMessage("El nombre de la categoria debe contener entre 3 y 100 caracteres")
    .custom(async (valor, { req }) => {
      const categoriaBuscada = await CategoriaProducto.findOne({ nombre: valor });
      //pregunto sino existe el servicio buscado
      if (!categoriaBuscada) {
        return true;
      }
      //verificacar si estamos editando
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

// para validar en post y put
export const validacionCategoria=[...reglasCategoriaProducto.map((regla)=> regla.notEmpty().withMessage('Este campo es obligaotio')), resultadoValidacion]

export const validacionCategoriaPatch = [...reglasCategoriaProducto.map((regla) => regla.optional({values:'falsy'})), resultadoValidacion]

export const validacionIDCategoria = [
  param("id")
    .isMongoId()
    .withMessage(
      "El ID no conrresponde con el formato correcto de un ID de MongoDB"
    ),
  resultadoValidacion,
];
