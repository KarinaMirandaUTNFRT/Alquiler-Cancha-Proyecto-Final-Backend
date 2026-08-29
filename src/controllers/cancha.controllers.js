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
}
export const listarCanchas = async (req, res) => {
  try {
    const canchas = await Cancha.find();
    res.status(200).json(canchas);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrio un error al listar las canchas" });
  }
};