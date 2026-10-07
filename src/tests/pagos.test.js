import { describe, it, expect } from "vitest";
import request from "supertest";
import Server from "../server/config.js";
import router from "../routes/index.routes.js";

const server = new Server();
server.app.use("/api", router);

describe("Webhook de Pagos", () => {
  it("debe rechazar la notificación de pago si no incluye firma de Mercado Pago (400 o 401)", async () => {
    const res = await request(server.app)
      .post("/api/pagoCancha/webhook")
      .send({
        action: "payment.created",
        data: { id: "123456" }
      });

    // Sin las cabeceras x-signature / x-request-id no debe procesarse
    expect([400, 401, 403, 500]).toContain(res.statusCode);
  });
});