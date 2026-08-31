import Producto from "../models/producto.js";

export const crearProducto = async (req, res) => {
  try {
    // console.log(req.body);
    const productoNuevo = new Producto(req.body);
    // aqui quiero guardar en la BD
    await productoNuevo.save();
    res.status(201).json({ mensaje: "El producto fue creado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Ocurrio un error al crear el producto" });
  }
};

export const listarProductos = async (req, res) => {
  try {
    const productos = await Producto.find().populate('categoria','nombre descripcion');
    res.status(200).json(productos);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrio un error al listar los producto" });
  }
};

export const obtenerProductoPorID = async (req, res) => {
  try {
    console.log(req.params.id);
    const productoBuscado = await Producto.findById(req.params.id).populate('categoria', 'nombre descripcion');
    console.log(productoBuscado)
    if (!productoBuscado) {
      return res
        .status(404)
        .json({ mensaje: "No se encontro un producto con ese ID" });
    }
    res.status(200).json(productoBuscado);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrio un error al buscar un producto por ID" });
  }
};


export const borrarProductoPorID = async (req, res) => {
  try {
    const productoBorrado = await Producto.findByIdAndDelete(req.params.id);
   
    if (!productoBorrado) {
      return res
        .status(404)
        .json({ mensaje: "No se encontro un producto con ese ID" });
    }
    res.status(200).json({mensaje: 'El producto fue borrado correctamente'});
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrio un error al intentar borrar un producto por ID" });
  }
};

export const editarProductoPorID = async (req, res) => {
  try {
    //deberia validar que el id exista y sea un id de mongodb
    const productoActualizado = await Producto.findByIdAndUpdate(req.params.id, req.body, {new:true})
    if (!productoActualizado) {
      return res
        .status(404)
        .json({ mensaje: "No se encontro un producto con el id enviado" });
    }
    res.status(200).json({mensaje: 'El producto fue editado correctamente', producto: productoActualizado});
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrio un error al intentar editar un producto por id" });
  }
};