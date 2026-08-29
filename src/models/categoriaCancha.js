import mongoose, { Schema, Types } from "mongoose";

const categoriaCanchaSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      minLength: 5,
      maxLength: 50,
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

const CategoriaCancha = mongoose.model("categoriaCancha", categoriaCanchaSchema);

export default CategoriaCancha;