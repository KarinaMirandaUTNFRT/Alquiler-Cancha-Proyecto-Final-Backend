import { body } from "express-validator";

const validacionCancha = [
  body("nombreCancha")
    .notEmpty()
    .withMessage("El nombre de la cancha es un dato obligatorio")
    .isString(),
];
