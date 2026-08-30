import { body, param } from "express-validator";
import resultadoValidacion from "./resultadoValidacion.js";
import Producto from "../models/producto.js";

export const reglasProducto = [
  body("nnombreProducto")
    .isString()
    .withMessage("El dato debe ser un string")
    .isLength({ min: 5, max: 100 })
    .withMessage("El nombre producto debe contener entre 5 y 100 caracteres")
    .custom(async (valor, { req }) => {
      const productoBuscado = await Producto.findOne({ nombreProducto: valor });
      //pregunto sino existe el producto buscado
      if (!productoBuscado) {
        return true;
      }
      //verificacar si estamos editando
      if(req.params?.id && productoBuscado._id.toString() === req.params.id){
        return true
      }
      // si ya existe el nombre del producto buscadooo retorno error
      throw new Error('El nombre del producto ingresado ya exite, dato no valido ingrese un nombre distinto al ingresado')
    }),
  body("precio")
    .isNumeric()
    .withMessage("El precio debe ser un valor numerico")
    .isFloat({ min: 1500 })
    .withMessage("El precio debe ser desde $1050")
    ,
  body("imagen")
    .isString()
    .withMessage("La imagen debe ser un string")
    .matches(/^https:\/\/.+\.(jpg|jpeg|png|webp|avif|svg)$/)
    .withMessage(
      "La imagen debe ser una URl valida terminada en: 'jpg|jpeg|png|webp|avif|svg'"
    ),
  body("descripcion")
    .isString()
    .withMessage("La descripcion debe ser un string")
    .isLength({ min: 10, max: 500 })
    .withMessage("La descripcion debe contener entre 10 y 500 caracteres")
];

// para validar en post y put
export const validacionProducto=[...reglasProducto.map((regla)=> regla.notEmpty().withMessage('Este campo es obligaotio')), resultadoValidacion]

export const validacionProductoPatch = [...reglasProducto.map((regla) => regla.optional({values:'falsy'})), resultadoValidacion]

export const validacionIDProducto = [
  param("id")
    .isMongoId()
    .withMessage(
      "El ID no conrresponde con el formato correcto de un ID de MongoDB"
    ),
  resultadoValidacion,
];
