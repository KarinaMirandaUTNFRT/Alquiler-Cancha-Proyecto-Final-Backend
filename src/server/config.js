import express from "express";
import cors from "cors";
import morgan from "morgan";
import { dirname } from "path";
import { fileURLToPath } from "url";
import '../database/db.js'

export default class Server {
  // el objetivo del construcotr es definir las propiedad el futuro objeto
  constructor() {
    this.app = express();
    this.PORT = process.env.PORT || 3000;
    this.middlewares()
  }
  // aqui agregar el resto de los metodos del futuro objeto

  middlewares(){
    this.app.use(cors()); // permitir conexiones remotas
this.app.use(express.json()); // permite interpretar los datos que lleguen los datos que lleguen en la solicitud format json
// agregar el otro middleware morgan
this.app.use(morgan("dev"));
const __dirname = dirname(fileURLToPath(import.meta.url))

// cargar el siguiente archivo en forma estatica
this.app.use(express.static(__dirname + '/../../public'))
  }

  listen() {
    this.app.listen(this.PORT, () => {
      console.info(`Servidor activo en el puerto http://localhost:${this.PORT}`);
    });
  }
}
