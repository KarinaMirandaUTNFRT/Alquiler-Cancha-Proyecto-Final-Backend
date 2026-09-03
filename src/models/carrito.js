import mongoose, { Schema } from "mongoose";

const carritoSchema = new Schema(
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
          ref: "cancha",
          required: true,
        },
        cantidadCancha: {
          type: Number,
          default: 1,
          min: 1,
        },
        producto: {
          type: Schema.Types.ObjectId,
          ref: "producto",
          required: true,
        },
        cantidadProducto: {
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

const Carrito = mongoose.model('carrito', carritoSchema)

export default Carrito
