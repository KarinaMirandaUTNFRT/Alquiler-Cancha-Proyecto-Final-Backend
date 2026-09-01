import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const UsuarioSchema = new Schema(
  {
    nombreUsuario: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 50,
      trim: true
  },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (valor) => {
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(valor);
        },
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: (valor) => {
        //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,15}/
         /^(?=.*\d)(?=.*[\u0021-\u002b\u003c-\u0040])(?=.*[A-Z])(?=.*[a-z])\S{8,50}$/.test(valor);
        },
      },
    },
    rol: {
      type: String,
      required: true,
      enum: ['Admin', 'Cliente'],
      default:'Cliente'
    },
    verificado: {
      type: Boolean,
      default: false,
    },
    codigoVerificacion:{
      type: String
    },
    fechaExpiracionCodigo:{
      type: Date
    }
  },
  {
    timestamps: true,
  },

);
UsuarioSchema.pre("save", async function () {
  const usuario = this;
  // preguntar si el password no fue modificado
  if (!usuario.isModified("password")) return;
  // aqui hasheamos el password
  try {
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(usuario.password, salt);
  } catch (error) {
    console.error(error);
    throw error;
  }
});

const Usuario =  mongoose.model('usuario',UsuarioSchema)

export default Usuario
