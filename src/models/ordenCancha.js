import mongoose, { Schema } from "mongoose";

const ordenCanchaSchema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "usuario",
      required: true
    },
    items: [
      {
        cancha: {
          type: Schema.Types.ObjectId,
          ref: "cancha",
          required: true,
        },
        nombreCancha:{
            type: String,
            required: true
        },
        precioUnitario: {
            type: Number,
            required: true
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

const OrdenCancha = mongoose.model('ordenCancha', ordenCanchaSchema)

export default OrdenCancha
