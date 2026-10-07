import { describe, it, expect } from "vitest";

describe("Validaciones de Password y Utilidades", () => {
  const regexPassword = /^(?=.*\d)(?=.*[\u0021-\u002b\u003c-\u0040])(?=.*[A-Z])(?=.*[a-z])\S{8,50}$/;

  it("debe rechazar contraseñas débiles o cortas", () => {
    expect(regexPassword.test("12345")).toBe(false);
    expect(regexPassword.test("sinmayuscula1!")).toBe(false);
    expect(regexPassword.test("SinSimbolo1234")).toBe(false);
  });

  it("debe aceptar contraseñas que cumplan todos los requisitos", () => {
    expect(regexPassword.test("PasswordSeguro1!")).toBe(true);
  });
});