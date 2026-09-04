import Carrito from "../models/carrito.js";

const buscarOCrearCarrito = async (userId) => {
  let carrito = await Carrito.findOne({ usuario: userId });
  if (!carrito) {
    //vamos a crear el carrito para el usuario
    carrito = await Carrito.create({ usuario: userId, items: [] });
  }
  return carrito;
};


export default buscarOCrearCarrito