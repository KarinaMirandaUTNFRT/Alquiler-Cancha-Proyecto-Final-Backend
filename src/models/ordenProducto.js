import mongoose, { Schema } from "mongoose";

const ordenProductoSchema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "usuario",
      required: true
    },
    items: [
      {
        producto: {
          type: Schema.Types.ObjectId,
          ref: "producto",
          required: true,
        },
        nombreProducto:{
            type: String,
            required: true
        },
        precioUnitario: {
            type: Number,
            required: true
        },
        cantidad: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
       montoTotal: {
        type: Number,
        required: true
      },
      estado: {
        type: String,
        enum:['pendiente', 'aprobado', 'rechazado', 'cancelado'],
        default: 'pendiente'
      },
      //ids clave de mercadoPago para auditoria
      preferenceId:{
        type: String,

      },
      paymentId: {
        type: String
      }
  },
  {
    timestamps: true,
  },
);

const OrdenProducto = mongoose.model('ordenProducto', ordenProductoSchema)

export default OrdenProducto
