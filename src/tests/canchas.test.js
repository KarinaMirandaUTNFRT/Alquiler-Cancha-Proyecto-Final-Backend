import { describe, it, expect } from "vitest";
import request from "supertest";
import Server from "../server/config.js";
import router from "../routes/index.routes.js";

const server = new Server();
server.app.use("/api", router);

describe("GET /api/reservas/disponibles", () => {
  it("debe responder con error 400 si no se envía la fecha", async () => {
    const res = await request(server.app).get("/api/reservas/disponibles");
    expect(res.statusCode).toBe(400);
  });

  it("debe responder con error 400 si el formato de fecha es inválido", async () => {
    const res = await request(server.app).get("/api/reservas/disponibles?fecha=12-05-2024");
    expect(res.statusCode).toBe(400);
  });
});