import CategoriaCancha from "../models/categoriaCancha.js";

export const crearCategoriaCancha = async (req, res) => {
  try {
    //todo: agregar el middlware para validar los datos del body
    const categoriaNueva = new CategoriaCancha(req.body);
    await categoriaNueva.save();
    res.status(201).json({ mensaje: "se creo la categoria correctamente" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Se produjo un error al crear una categoria" });
  }
};

export const listarCategoriasCanchas = async (req, res) => {
  try {
    const categorias = await CategoriaCancha.find();
    res.status(200).json(categorias)
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Se produjo un error al listar las categorias" });
  }
}
export const borrarCategoria = async (req, res) => {
  try {
    
    const categoriaEliminada = await CategoriaCancha.findByIdAndDelete(req.params.id);

  
    if (!categoriaEliminada) {
      return res
        .status(404)
        .json({ mensaje: "No se encontró la categoria que querés borrar" });
    }

   
    res.status(200).json({
      mensaje: "La categoria fue eliminada con éxito",
      categoriaEliminada, // Opcional: devolvemos el objeto que se borró
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrió un error al intentar borrar una categoria" });
  }
};
