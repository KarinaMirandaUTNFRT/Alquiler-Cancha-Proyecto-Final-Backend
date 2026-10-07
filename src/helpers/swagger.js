import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Reserva de Canchas",
      version: "1.0.0",
      description: "Documentación interactiva de endpoints para el sistema de reservas",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: "Servidor de desarrollo",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  // Lee las anotaciones de las rutas
  apis: ["./src/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);