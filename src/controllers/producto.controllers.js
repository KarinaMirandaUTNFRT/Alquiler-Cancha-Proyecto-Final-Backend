import Producto from "../models/producto";

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