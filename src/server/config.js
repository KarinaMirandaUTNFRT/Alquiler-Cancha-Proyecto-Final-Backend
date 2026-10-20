import express from "express";//si
import cors from "cors";//si
import morgan from "morgan";
import { dirname } from "path";
import { fileURLToPath } from "url";
import "../database/db.js";
import cookieParser from "cookie-parser";
import pagoCanchaRouter from "../routes/pagoCancha.routes.js";
import reservaRouter from "../routes/reserva.routes.js";
import pagoCanchaRouter from "../routes/cancha.routes.js";

export default class Server {
  constructor() {
    this.app = express();
    this.PORT = process.env.PORT || 3000;
    this.middlewares();
    this.routes();
  }

  middlewares() {
    const envOrigins = process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(/[;,]/).map((url) => url.trim())
      : [];

    const defaultOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://alquilercanchasnorte.netlify.app",
    ];

    // 2. Unificar y eliminar duplicados o cadenas vacías
    const origenesPermitidos = Array.from(
      new Set([...defaultOrigins, ...envOrigins]),
    ).filter(Boolean);

    this.app.use(
      cors({
        origin: (origin, callback) => {
          // Permitir peticiones sin 'origin' (herramientas como Postman, curl o tareas del servidor)
          if (!origin || origenesPermitidos.includes(origin)) {
            return callback(null, true);
          }
          return callback(new Error(`Bloqueado por CORS: ${origin}`));
        },

        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "x-token"],
      }),
    );
    this.app.use(express.json());
    this.app.use(morgan("dev"));
    this.app.use(cookieParser());

    const __dirname = dirname(fileURLToPath(import.meta.url));
    this.app.use(express.static(__dirname + "/../../public"));
  }
// 3. MONTAR LAS RUTAS
  routes() {
    // Monta la ruta de pagos exactamente en /api/pagoCancha
    this.app.use("/api/reservas", reservaRouter);
    this.app.use("/api/pagoCancha", pagoCanchaRouter);
    this.app.use("/api/reservas", reservaRouter);
  }
  listen() {
    this.app.listen(this.PORT, () => {
      console.info(
        `Servidor activo en el puerto http://localhost:${this.PORT}`,
      );
    });
  }
}
