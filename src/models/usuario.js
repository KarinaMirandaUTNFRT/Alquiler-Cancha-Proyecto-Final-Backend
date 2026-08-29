const usuarioSchema = new Schema(
  {
    nombreUsuario: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 100,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // No permite correos duplicados en la base de datos
      lowercase: true,
      trim: true,
      validate: {
        validator: (valor) => {
          /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(
            valor,
          );
        },
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: (valor) => {
          /^(?=.*\d)(?=.*[\u0021-\u002b\u003c-\u0040])(?=.*[A-Z])(?=.*[a-z])\S{8,50}$/.test(
            valor,
          );
        },
      },
    },
    rol: {
      type: String,
      required: true,
      enum: {
        values: ["Usuario", "Admin", "usuario", "admin"],
        default: "usuario",
      },
    },
},
    {
    timestamps: true, 
  },
);
