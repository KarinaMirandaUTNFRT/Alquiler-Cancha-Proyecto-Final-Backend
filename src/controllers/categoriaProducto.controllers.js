import CategoriaProducto from "../models/categoriaProducto";

export const crearCategoriaProducto = async (req, res) => {
  try {
    const categoriaNueva = new CategoriaProducto(req.body);
    await categoriaNueva.save();
    res.status(201).json({ mensaje: "se creo la categoria correctamente" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Se produjo un error al crear una categoria" });
  }
};

export const listarCategorias = async (req, res) => {
  try {
    const categorias = await CategoriaProducto.find();
    res.status(200).json(categorias)
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Se produjo un error al listar las categorias" });
  }
}