import { body } from "express-validator";
import resultadoValidacion from "./resultadoValidacion.js";

// 1. Para registro y creación de usuario
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
    .withMessage("La contraseña debe tener al menos 8 caracteres"),
  resultadoValidacion,
];

// 2. Para el inicio de sesión
export const validacionLogin = [
  body("email")
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("Debe ser un email válido"),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria"),
  resultadoValidacion,
];

// 3. Opcionales si tienes verificación por código
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
  body("email").isEmail().withMessage("Debe ser un email válido"),
  resultadoValidacion,
];