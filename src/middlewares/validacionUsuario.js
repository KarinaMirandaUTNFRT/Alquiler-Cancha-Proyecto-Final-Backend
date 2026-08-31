import { body, param } from "express-validator";
import resultadoValidacion from "./resultadoValidacion.js";
import Usuario from "../models/usuario.js"

export const reglasUsuario = [
  body("nombreUsuario")
    .isString()
    .withMessage("El dato debe ser un string")
    .isLength({ min: 4, max: 50 })
    .withMessage("El nombre usuario debe contener entre 4 y 50 caracteres")
    .custom(async (valor, { req }) => {
      const usuarioBuscado = await Usuario.findOne({ nombreUsuario: valor });
      //pregunto sino existe el servicio buscado
      if (!usuarioBuscado) {
        return true;
      }
      //verificacar si estamos editando
      if(req.params?.id && usuarioBuscado._id.toString() === req.params.id){
        return true
      }
      // si ya existe el nombre del servicio buscadooo retorno error
      throw new Error('El nombre del servicio ingresado ya exite, dato no valido ingrese un nombre distinto al ingresado')
    }),
  body("email")
    .isString()
    .withMessage("El email debe ser un string")
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
     .withMessage(
      "el correo electronico debe contener caracteres de valor email'"
    )
    ,
  body("password")
    .isString()
    .matches(/^(?=.*\d)(?=.*[\u0021-\u002b\u003c-\u0040])(?=.*[A-Z])(?=.*[a-z])\S{8,50}$/)
    .withMessage(
      "el password debe contener caracteres de valor password'"
    ),
  body("rol")
    .isString()
    .withMessage("El rol debe ser un string")
       .isIn(["Admin", "Cliente"])
    .withMessage(
      "La categoria debe ser algunos de los siguientes valores: 'Admin', 'Cliente'"
    )
];

// para validar en post y put
export const validacionUsuario=[...reglasUsuario.map((regla)=> regla.notEmpty().withMessage('Este campo es obligaotio')), resultadoValidacion]

export const validacionUsuarioPatch = [...reglasUsuario.map((regla) => regla.optional({values:'falsy'})), resultadoValidacion]

export const validacionIDUsuario = [
  param("id")
    .isMongoId()
    .withMessage(
      "El ID no conrresponde con el formato correcto de un ID de MongoDB"
    ),
  resultadoValidacion,
];
