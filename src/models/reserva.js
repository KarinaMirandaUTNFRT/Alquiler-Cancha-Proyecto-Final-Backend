import mongoose, { Schema, model } from "mongoose";
import "./usuario.js";
import "./cancha.js";
import { HORARIOS } from "../helpers/constants.js";

const reservaSchema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "usuario",
      required: true,
    },

    cancha: {
      type: Schema.Types.ObjectId,
      ref: "Cancha",
      required: true,
    },
    nombreCliente: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 100,
    },

    fechaJornada: {
      type: String,
      required: true,
    },
    horaInicio: {
      type: String,
      enum: HORARIOS,
      required: true,
    },

    estado: {
      type: String,
      enum: ["pendiente", "confirmada", "cancelada"],
      default: "pendiente",
    },
    grupoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrdenListaReservas",
      default: null,
    },
  },
  { timestamps: true },
);

reservaSchema.index({
  cancha: 1,
  fechaJornada: 1,
  horaInicio: 1,
  estado: 1,
});

reservaSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 900, // segundos
    partialFilterExpression: { estado: "pendiente" },
  },
);

reservaSchema.virtual("fechaFormateada").get(function () {
  if (!this.fechaJornada) return null;
  const [anio, mes, dia] = this.fechaJornada.split("-");
  return `${dia}/${mes}/${anio}`;
});

reservaSchema.set("toJSON", { virtuals: true });
reservaSchema.set("toObject", { virtuals: true });

export const Reserva = mongoose.model("Reserva", reservaSchema);
