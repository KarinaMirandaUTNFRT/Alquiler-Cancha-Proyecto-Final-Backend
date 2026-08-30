import Cancha from "../models/cancha.js";

export const crearCancha = async (req, res) => {
  try {
    const nuevaCancha = new Cancha(req.body);
    await nuevaCancha.save();
    res
      .status(201)
      .json({ mensaje: "La cancha fue creada con éxito", nuevaCancha });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Ocurrió un error al crear la cancha" });
  }
};
export const listarCanchas = async (req, res) => {
  try {
    const canchas = await Cancha.find().populate("categoria", "nombre descripcion");
    res.status(200).json(canchas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Ocurrio un error al listar las canchas" });
  }
};
export const borrarCancha = async (req, res) => {
  try {
    const canchaEliminada = await Cancha.findByIdAndDelete(req.params.id);

    if (!canchaEliminada) {
      return res
        .status(404)
        .json({ mensaje: "No se encontró la cancha que querés borrar" });
    }

    res.status(200).json({
      mensaje: "La cancha fue eliminada con éxito",
      canchaEliminada, 
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrió un error al intentar borrar una cancha" });
  }
};
export const editarCancha = async (req, res) => {
  try {
    const canchaActualizada = await Cancha.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!canchaActualizada) {
      return res
        .status(404)
        .json({ mensaje: "No se encontró la cancha para editar" });
    }
    res.status(200).json({
      mensaje: "La cancha fue modificada con éxito",
      canchaActualizada,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrió un error al intentar editar la cancha" });
  }
};
export const obtenerCanchasid = async (req, res) => {
  try {
    console.log(req.params.id);
    const canchaBuscada = await Cancha.findById(req.params.id);
    if (!canchaBuscada) {
      return res
        .status(404)
        .json({ mensaje: "no se encontro la cancha por id" });
    }
    res.status(200).json(canchaBuscadaBuscado);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "ocurrio un error al buscar una cancha por id" });
  }
};