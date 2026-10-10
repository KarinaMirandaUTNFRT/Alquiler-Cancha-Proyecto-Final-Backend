import express from "express";
import cors from "cors";
import morgan from "morgan";
import { dirname } from "path";
import { fileURLToPath } from "url";
import "../database/db.js";
import cookieParser from "cookie-parser";

export default class Server {
  constructor() {
    this.app = express();
    this.PORT = process.env.PORT || 3000;
    this.middlewares();
  }

  middlewares() {
    const envOrigins = process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(/[;,]/).map((url) => url.trim())
      : [];

    const defaultOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://rollingclub.netlify.app",
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

        // this.app.use(
        //   cors({
        //     origin: process.env.FRONTEND_URL || "https://rollingclub.netlify.app",

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

  listen() {
    this.app.listen(this.PORT, () => {
      console.info(
        `Servidor activo en el puerto http://localhost:${this.PORT}`,
      );
    });
  }
}
