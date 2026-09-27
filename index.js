import router from "./src/routes/index.routes.js";
import Server from "./src/server/config.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";

const server = new Server()

server.app.use('/api', router)

server.app.use(errorHandler);

server.listen()

