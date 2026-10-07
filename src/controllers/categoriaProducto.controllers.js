import CategoriaProducto from "../models/categoriaProducto.js";

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

export const listarCategoriasProductos = async (req, res) => {
    try {
    const limite = Math.max(1, parseInt(req.query.limite) || 10);
    const pagina = Math.max(1, parseInt(req.query.pagina) || 1);
    const skip = (pagina - 1) * limite;

    const [total, categorias] = await Promise.all([
      CategoriaProducto.countDocuments(),
      CategoriaProducto.find().skip(skip).limit(limite),
    ]);

    res.status(200).json({
      total,
      paginaActual: pagina,
      totalPaginas: Math.ceil(total / limite),
      limite,
      categorias,
    });
  
    } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Se produjo un error al listar las categorias" });
  }
};

export const obtenerCategoriaProductoPorID = async (req, res) => {
  try {
    const categoriaBuscada = await Categoria.findById(req.params.id);
    if (!categoriaBuscada) {
      return res
        .status(404)
        .json({ mensaje: "No se encontro una categoria con ese ID" });
    }
    res.status(200).json(categoriaBuscada);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrio un error al buscar una categoria por ID" });
  }
};

export const borrarCategoriaProductoPorID = async (req, res) => {
  try {
    const categoriaBuscada = await CategoriaProducto.findByIdAndDelete(
      req.params.id,
    );

    if (!categoriaBuscada) {
      return res
        .status(404)
        .json({ mensaje: "No se encontro una categoria con ese ID" });
    }
    res.status(200).json({ mensaje: "La categoria fue borrada correctamente" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        mensaje: "Ocurrio un error al intentar borrar una categoria por ID",
      });
  }
};

export const editarCategoriaProductoPorID = async (req, res) => {
  try {
    const categoriaBuscada = await CategoriaProducto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!categoriaBuscada) {
      return res
        .status(404)
        .json({ mensaje: "No se encontro una categoria con el id enviado" });
    }
    res
      .status(200)
      .json({
        mensaje: "La categoria fue editado correctamente",
        Categoria: categoriaBuscada,
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        mensaje: "Ocurrio un error al intentar editar una categoria por id",
      });
  }
};
