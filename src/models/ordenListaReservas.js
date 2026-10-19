import mongoose from "mongoose";

const ordenListaReservasSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      default: null,
    },
    nombreCliente: {
      type: String,
      required: true,
      trim: true,
    },
    reservas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reserva",
      },
    ],
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    estado: {
      type: String,
      enum: ["pendiente", "confirmada", "cancelada"],
      default: "pendiente",
    },
    paymentId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const OrdenListaReservas = mongoose.model(
  "OrdenListaReservas",
  ordenListaReservasSchema
);