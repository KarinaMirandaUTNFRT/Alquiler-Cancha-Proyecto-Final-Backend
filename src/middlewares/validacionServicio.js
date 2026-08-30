import { body, param } from "express-validator";
import resultadoValidacion from "./resultadoValidacion.js";
import Servicio from "../models/servicio.js";

export const reglasServicio = [
  body("nombreServicio")
    .isString()
    .withMessage("El dato debe ser un string")
    .isLength({ min: 5, max: 100 })
    .withMessage("El nombre servicio debe contener entre 5 y 100 caracteres")
    .custom(async (valor, { req }) => {
      const servicioBuscado = await Servicio.findOne({ nombreServicio: valor });
      //pregunto sino existe el servicio buscado
      if (!servicioBuscado) {
        return true;
      }
      //verificacar si estamos editando
      if(req.params?.id && servicioBuscado._id.toString() === req.params.id){
        return true
      }
      // si ya existe el nombre del servicio buscadooo retorno error
      throw new Error('El nombre del servicio ingresado ya exite, dato no valido ingrese un nombre distinto al ingresado')
    }),
  body("precio")
    .isNumeric()
    .withMessage("El precio debe ser un valor numerico")
    .isFloat({ min: 50 })
    .withMessage("El precio debe ser desde $50")
    ,
  // body("categoria")
  //   .isString()
  //   .withMessage("El dato  de la categoria debe ser un string")
  //   .isIn(["Desarrollo Web", "Backend & API", "Consultoria"])
  //   .withMessage(
  //     "La categoria debe ser algunos de los siguientes valores: 'Desarrollo Web', 'Backend & API','Consultoria'"
  //   ),
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
export const validacionServicio=[...reglasServicio.map((regla)=> regla.notEmpty().withMessage('Este campo es obligaotio')), resultadoValidacion]

export const validacionServicioPatch = [...reglasServicio.map((regla) => regla.optional({values:'falsy'})), resultadoValidacion]

export const validacionIDServicio = [
  param("id")
    .isMongoId()
    .withMessage(
      "El ID no conrresponde con el formato correcto de un ID de MongoDB"
    ),
  resultadoValidacion,
];
