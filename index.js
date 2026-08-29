import router from "./src/routes/index.routes.js";
import Server from "./src/server/config.js";


// Instanciar la clase server
const server = new Server()
server.app.use('/api', router)

server.listen()