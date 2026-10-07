import { describe, it, expect } from "vitest";
import request from "supertest";
import Server from "../server/config.js";
import router from "../routes/index.routes.js";

const server = new Server();
server.app.use("/api", router);

describe("Operaciones de Reservas", () => {
  it("debe rechazar la cancelación si no se envía cabecera de autenticación (401)", async () => {
    const res = await request(server.app).patch("/api/reservas/65f1234567890abcdef12345/cancelar");
    expect(res.statusCode).toBe(401);
  });
});