import buscarOCrearCarrito from "../utils/buscarCarrito.js";
import Producto from "../models/producto.js";

export const agregarAlCarrito = async (req, res) => {
  try {
    const { producto, cantidad } = req.body;
    const userId = req.user.id;

    const productoBuscado = await Producto.findById(producto);
    if (!productoBuscado) {
      return res
        .status(400)
        .json({ mensaje: "El producto solicitado no exite" });
    }

    const carrito = await buscarOCrearCarrito(userId);
    const itemIndex = carrito.items.findIndex(
      (item) => item.producto.toString() === producto,
    );

    if (itemIndex > -1) {
      carrito.items[itemIndex].cantidad += parseInt(cantidad);
    } else {
      carrito.items.push({
        producto,
        cantidad,
      });
    }
    await carrito.save();

    await carrito.populate("items.producto", "nombreProdcuto precio");

    res.status(201).json({
      mensaje: "Producto agregado al carrito correctamente",
      carrito,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrio un error al agregar un producto al carrito" });
  }
};

export const obtenerCarrito = async (req, res) => {
  try {
    const userId = req.user.id;
    const carrito = await buscarOCrearCarrito(userId);

    await carrito.populate("items.producto", "nombreProducto precio imagen");

    res.status(200).json(carrito);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "ocurrio un error al obtener el carrito" });
  }
};

export const vaciarCarrito = async (req, res) => {
  try {
    const userId = req.user.id;
    const carrito = await buscarOCrearCarrito(userId);

    carrito.items = [];

    await carrito.save();
    res
      .status(200)
      .json({ mensaje: "el carrito fue vaciado correctamente", carrito });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "ocurrio un error al intentar vaciar el carrito" });
  }
};

export const restarCantidad = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productoId } = req.params;

    const carrito = await buscarOCrearCarrito(userId);
    const itemIndex = carrito.items.findIndex(
      (item) => item.producto.toString() === productoId,
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ mensaje: "El producto no se encuentra en el carrito" });
    }

    carrito.items[itemIndex].cantidad -= 1;

    if (carrito.items[itemIndex].cantidad <= 0) {
      carrito.items.splice(itemIndex, 1);
    }

    await carrito.save();

    res.status(200).json(carrito);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "ocurrio un error al intentar restar un producto" });
  }
};
