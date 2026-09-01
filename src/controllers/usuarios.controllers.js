import  Jwt  from "jsonwebtoken";
import Usuario from "../models/usuario.js";
import transporter from "../utils/mailer.js";
import bcrypt from "bcryptjs";



export const crearUsuario = async (req, res) => {
  try {
    
    const usuarioNuevo = new Usuario(req.body);
  
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
export const solicitarNuevoCodigo = async(req, res) =>{
  try{
    const {email} = req.body
   
    const usuarioBuscado = await Usuario.findOne({email})
    if(!usuarioBuscado){
      return res.status(404).json({mensaje:'No se encontró ningun usuario con el email enviado'})
    }

   if(usuarioBuscado.verificado){
      return res.status(400).json({mensaje:'Esta cuenta ya esta verificada'})
    }

    const codigoVerificacion = Math.floor(
      100000 + Math.random() * 900000,
    ).toString(); 
    const tiempoExpiracion = new Date(Date.now() + 15 * 60 * 1000);
   
    await Usuario.findByIdAndUpdate(usuarioBuscado._id,
      {
        codigoVerificacion,
        fechaExpiracionCodigo: tiempoExpiracion
      }
    )

await transporter.sendMail({
      from: '"CRUD Usuario" <no-reply@crud-usuario.com>',
      to: email,
      subject: "Nuevo 🔑 Código de Verificación de Cuenta",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">¡Hola, ${usuarioBuscado.nombreUsuario}!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Has solicitado un nuevo código para activar tu cuenta y poder ingresar a la plataforma, por favor utiliza el siguiente código de verificación:
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

    res.status(200).json({mensaje: 'El nuevo código de verificación fue enviado.'})

  }catch(error){
    console.error(error)
    res.status(500).json({mensaje: 'Ocurrio un error al crear un nuevo código de verificación'})
  }
}
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const usuarioBuscado = await Usuario.findOne({ email });
    if (!usuarioBuscado) {
      return res
        .status(401)
        .json({ mensaje: "Credenciales invalidas - email" });
    }
     if (!(await bcrypt.compare(password, usuarioBuscado.password))) {
      return res
        .status(401)
        .json({ mensaje: "Credenciales invalidas - password" });
    }
    
    if (!usuarioBuscado.verificado) {
      return res
        .status(403)
        .json({ mensaje: "Tu cuenta no fue verificada aún" });
    }

    const token = jwt.sign(
      { id: usuarioBuscado._id, rol: usuarioBuscado.rol },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });
    res
      .status(200)
      .json({ mensaje: "Login exitoso", nombre: usuarioBuscado.nombreUsuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Ocurrio un error al loguear un usuario" });
  }
};
export const obtenerPerfil = async(req, res) => {
  try{
    
     const usuarioBuscado = await Usuario.findById(req.user.id)
    if(!usuarioBuscado){
      return res.status(404).json({mensaje: 'No se encontro un usuario con ese id'});
    }
    const perfilUsuario = {
      nombreUsuario: usuarioBuscado.nombreUsuario,
      email: usuarioBuscado.email,
      rol: usuarioBuscado.rol 
    }
    res.status(200).json(perfilUsuario)
  }catch(error){
    console.error(error)
    res.status(500).json({mensaje: 'Ocurrio al obtener el perfil del usuario'})

  }
}