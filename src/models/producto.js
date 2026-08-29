import mongoose, { Schema } from "mongoose";

const ProductoSchema = new Schema(
  {
    nombreProducto: {
      type: String,
      required: true,
      unique: true,
      minLength: 5,
      maxLength: 100,
      trim: true,
    },
    precio: {
      type: Number,
      required: true,
      min: 1500,
    },
    imagen: {
      type: String,
      required: true,
      validate: {
        validator: (valor) => {
          /^https:\/\/.+\.(jpg|jpeg|png|webp|avif|svg)$/.test(valor);
        },
      },
    },
    categoria: {
      type: Schema.Types.ObjectId,
      ref: 'categoriaProducto',
      required: true
    },
    descripcion: {
      type: String,
      required: true,
      minLength: 10,
      maxLength: 500
    }
  },
  {
    timestamps: true,
  },
);

const Producto =  mongoose.model('producto',ProductoSchema)

export default Producto
