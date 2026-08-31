import mongoose, { Schema, Types } from "mongoose";

const CategoriaProductoSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 100,
      trim: true,
    },
    descripcion: {
      type: String,
      minLength: 5,
      maxLength: 250,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const CategoriaProducto = mongoose.model("categoriaProducto", CategoriaProductoSchema);

export default CategoriaProducto
