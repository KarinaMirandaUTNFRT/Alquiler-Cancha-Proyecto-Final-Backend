import { body } from "express-validator";
import resultadoValidacion from "./resultadoValidacion.js";

export const validacionRegistroUsuario = [
  body("nombreUsuario")
    .notEmpty()
    .withMessage("El nombre completo es obligatorio")
    .isLength({ min: 3, max: 100 })
    .withMessage("El nombre debe tener entre 3 y 100 caracteres"),
  body("email")
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("Debe ser un email válido"),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener  8 caracteres")
    .custom((valor) => {
      const patronPassword =
        /^(?=.*\d)(?=.*[\u0021-\u002b\u003c-\u0040])(?=.*[A-Z])(?=.*[a-z])\S{8,50}$/;
      if (!patronPassword.test(valor)) {
        throw new Error(
          "La contraseña debe contener al menos una letra mayúscula, una minúscula y un número",
        );
      }
      return true;
    }),
  resultadoValidacion,
];

export const validacionLogin = [
  body("email")
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("Debe ser un email válido"),
  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
  resultadoValidacion,
];

export const validacionVerificarCodigo = [
  body("email").isEmail().withMessage("Debe ser un email válido"),
  body("codigo")
    .notEmpty()
    .withMessage("El código es obligatorio")
    .isLength({ min: 4, max: 8 })
    .withMessage("El código tiene una longitud inválida"),
  resultadoValidacion,
];

export const validacionReenviarCodigo = [
  body("email")
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("Debe ser un email válido"),
  resultadoValidacion,
];
