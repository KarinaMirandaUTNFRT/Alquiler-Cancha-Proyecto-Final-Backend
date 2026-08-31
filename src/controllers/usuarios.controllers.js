import Usuario from "../models/usuario.js";
import transporter from "../utils/mailer.js";

export const crearUsuario = async (req, res) => {
  try {
    // falta hashear el password
    const usuarioNuevo = new Usuario(req.body);
    // aqui quiero guardar en la BD
    await usuarioNuevo.save();
    res.status(201).json({ mensaje: "El usuario fue creado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Ocurrio un error al crear el usuario" });
  }
};

export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.status(200).json(usuarios);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrio un error al listar los usuarios" });
  }
};

export const obtenerUsuariosPorID = async (req, res) => {
  try {
    console.log(req.params.id);
    const usuariosBuscados = await Usuario.findById(req.params.id);
    console.log(usuariosBuscados);
    if (!usuariosBuscados) {
      return res
        .status(404)
        .json({ mensaje: "No se encontro un usuario con ese ID" });
    }
    res.status(200).json(usuariosBuscados);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrio un error al buscar un usuario por ID" });
  }
};

export const borrarUsuarioPorID = async (req, res) => {
  try {
    const usuarioBorrado = await Usuario.findByIdAndDelete(req.params.id);

    if (!usuarioBorrado) {
      return res
        .status(404)
        .json({ mensaje: "No se encontro un usuario con ese ID" });
    }
    res.status(200).json({ mensaje: "El usuario fue borrado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Ocurrio un error al intentar borrar un usuario por ID",
    });
  }
};

export const editarUsuarioPorID = async (req, res) => {
  try {
    //deberia validar que el id exista y sea un id de mongodb
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!usuarioActualizado) {
      return res
        .status(404)
        .json({ mensaje: "No se encontro un usuario con el id enviado" });
    }
    res.status(200).json({
      mensaje: "El usuario fue editado correctamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Ocurrio un error al intentar editar un usuario por id",
    });
  }
};
export const registrarUsuario = async (req, res) => {
  try {
    const { nombreUsuario, email, password, rol } = req.body;

    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res
        .status(409)
        .json({ mensaje: "El email enviado ya esta registrado" });
    }

    const codigoVerificacion = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const tiempoExpiracion = new Date(Date.now() + 15 * 60 * 1000);

    const datosUsuario = {
      nombreUsuario,
      email,
      password,
      codigoVerificacion,
      fechaExpiracionCodigo: tiempoExpiracion,
    };

    if (rol && rol.trim() !== "") {
      datosUsuario.rol = rol;
    }

    const usuarioNuevo = await Usuario.create(datosUsuario);

    await transporter.sendMail({
      from: '"CRUD Usuario" <no-reply@crud-usuario.com>',
      to: email,
      subject: "🔑 Código de Verificación de Cuenta",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">¡Hola, ${nombreUsuario}!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Gracias por registrarte. Para activar tu cuenta y poder ingresar a la plataforma, por favor utiliza el siguiente código de verificación:
          </p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 4px; color: #007bff;">
            ${codigoVerificacion}
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">
            Este código vencerá en 15 minutos. Si no solicitaste este registro, puedes ignorar este correo de forma segura.
          </p>
        </div>
      `,
    });

    res.status(201).json({ mensaje: "El usuario fue creado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Ocurrio un error al registrar usuarios" });
  }
};
export const confirmarCodigoVerificacion = async (req, res) => {
  try {
    const { email, codigo } = req.body;

    const usuarioBuscado = await Usuario.findOne({ email });
    if (!usuarioBuscado) {
      return res
        .status(404)
        .json({ mensaje: "No se encontro ningún usuario con ese email" });
    }

    if (usuarioBuscado.verificado) {
      return res
        .status(400)
        .json({ mensaje: "Esta cuenta ya esta verificada" });
    }

    if (new Date() > usuarioBuscado.fechaExpiracionCodigo) {
      return res
        .status(400)
        .json({
          mensaje:
            "El código esta expirado. Por favor, solicita un nuevo código.",
        });
    }

    if (usuarioBuscado.codigoVerificacion !== codigo) {
      return res
        .status(400)
        .json({ mensaje: "El código de verificación es incorrecto." });
    }

    await Usuario.findByIdAndUpdate(usuarioBuscado._id, {
      $set: { verificado: true },
      $unset: { codigoVerificacion: 1, fechaExpiracionCodigo: 1 },
    });

    res
      .status(200)
      .json({
        mensaje: "Cuenta verificada con exito. Ya puedes iniciar sesión.",
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        mensaje:
          "Ocurrio un error al validar el codigo de verificacion del usuario",
      });
  }
};
