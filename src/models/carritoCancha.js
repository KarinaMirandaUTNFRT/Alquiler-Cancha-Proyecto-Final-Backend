import mongoose, { Schema } from "mongoose";

const carritoCanchaSchema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "usuario",
      required: true,
      unique: true,
    },
    items: [
      {
        cancha: {
          type: Schema.Types.ObjectId,
          ref: "producto",
          required: true,
        },
        cantidad: {
          type: Number,
          default: 1,
          min: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const CarritoCancha = mongoose.model("carritoCancha", carritoCanchaSchema);

export default CarritoCancha;
