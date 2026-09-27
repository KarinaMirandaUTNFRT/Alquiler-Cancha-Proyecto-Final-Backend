// src/middlewares/errorHandler.js

export const errorHandler = (err, req, res, next) => {
  console.error("Error capturado por errorHandler:", err);

  const statusCode = err.status || err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    error: {
      mensaje:
        process.env.NODE_ENV === "production"
          ? "Error interno"
          : err.message || "Error interno del servidor",
      ...(process.env.NODE_ENV !== "production" && { detalle: err.stack }),
    },
  });
};