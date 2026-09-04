import Cancha from "../models/cancha.js";
import CategoriaCancha from "../models/categoriaCancha.js";

export const crearCancha = async (req, res) => {
    try {
    let imagenUrl = "";

    if (req.file) {
      const resultado = await subirImagenACloudinary(req.file.buffer);
      console.log(resultado);
      imagenUrl = resultado.secure_url;
    } else {
      imagenUrl =
        "https://images.pexels.com/photos/8481895/pexels-photo-8481895.jpeg";
    }

    const nuevocanchaData = {
      ...req.body,
      imagen: imagenUrl,
    };

    const canchaNuevo = new cancha(nuevocanchaData);
    await canchaNuevo.save();
    res.status(201).json({ mensaje: "El cancha fue creado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Ocurrio un error al crear el cancha" });
  }
};

export const listarCanchas = async (req, res) => {
  try {
    const { termino, pagina, cantCanchas } = req.query;
    const paginaNumero = Math.max(1, parseInt(pagina)) || 1;
    const limite = Math.max(1, parseInt(cantCanchas)) || 10;
    const salto = (paginaNumero - 1) * limite;

    const query = {};

    if (termino && typeof termino === "string" && termino.trim() !== "") {
      const terminoLimpio = termino.trim();
      const categoriasCoincidentes = await CategoriaCancha.find({
        nombre: { $regex: terminoLimpio, $options: "i" },
      }).select("_id");

      const idsCategorias = categoriasCoincidentes.map((cat) => cat._id);

      query.$or = [
        { nombreCancha: { $regex: terminoLimpio, $options: "i" } },
        { categoria: { $in: idsCategorias } },
      ];
    }

    const [canchas, cantidadTotal] = await Promise.all([
      Cancha.find(query)
        .populate("categoria", "nombre descripcion")
        .skip(salto)
        .limit(limite),
      Cancha.countDocuments(query),
    ]);
    res
      .status(200)
      .json({
        canchas,
        cantidadTotal,
        paginaActual: paginaNumero,
        totalPaginas: Math.ceil(cantidadTotal / limite),
      });
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
