import Usuario from "../models/usuario.js";

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
    console.log(usuariosBuscados)
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
    res.status(200).json({mensaje: 'El usuario fue borrado correctamente'});
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrio un error al intentar borrar un usuario por ID" });
  }
};

export const editarUsuarioPorID = async (req, res) => {
  try {
    //deberia validar que el id exista y sea un id de mongodb
    const usuarioActualizado = await Usuario.findByIdAndUpdate(req.params.id, req.body, {new:true})
    if (!usuarioActualizado) {
      return res
        .status(404)
        .json({ mensaje: "No se encontro un usuario con el id enviado" });
    }
    res.status(200).json({mensaje: 'El usuario fue editado correctamente', usuario: usuarioActualizado});
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrio un error al intentar editar un usuario por id" });
  }
};