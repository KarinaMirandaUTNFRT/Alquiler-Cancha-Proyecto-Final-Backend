import mongoose, { Schema } from "mongoose";

const reservaSchema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },

    servicio: {
      type: Schema.Types.ObjectId,
      ref: "servicio",
      required: true,
    },
    fechaJornada: {
      type: String,
      required: true,
    },
    horaInicio: {
      type: String,
      required: true,
    },

    estado: {
      type: String,
      enum: ["confirmada", "cancelada"],
      default: "confirmada",
    },
  },
  { timestamps: true },
);

reservaSchema.index({ servicio: 1, fechaJornada: 1, horaInicio: 1, estado: 1 });

reservaSchema.virtual("fechaFormateada").get(function () {
  if (!this.fechaJornada) return null;
  const [anio, mes, dia] = this.fechaJornada.split("-");
  return `${dia}/${mes}/${anio}`;
});

reservaSchema.set("toJSON", { virtuals: true });
reservaSchema.set("toObject", { virtuals: true });

export const Reserva = mongoose.model("Reserva", reservaSchema);
