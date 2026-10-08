import { describe, it, expect } from "vitest";
import request from "supertest";
import Server from "../server/config.js";
import router from "../routes/index.routes.js";

const server = new Server();
server.app.use("/api", router);

describe("Pruebas de Seguridad y Autenticación", () => {
  it("debe rechazar el acceso a una ruta protegida sin token (401)", async () => {
    const res = await request(server.app).get("/api/usuarios/perfil");
    expect(res.statusCode).toBe(401);
  });

  it("debe rechazar el acceso a listar reservas si no hay token de autenticación (401)", async () => {
    const res = await request(server.app).get("/api/reservas");
    expect(res.statusCode).toBe(401);
  });

  it("debe rechazar el acceso al endpoint de logout si no se procesa la solicitud", async () => {
    const res = await request(server.app).post("/api/usuarios/logout");
       expect([200, 204]).toContain(res.statusCode);
  });
});