import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import buscarOCrearCarrito from "../utils/buscarCarrito.js";
import OrdenProducto from "../models/ordenProducto.js";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});
export const crearPreferenciaPago = async (req, res) => {
  try {
    const userId = req.user.id;

    const carrito = await buscarOCrearCarrito(userId);
    await carrito.populate("items.producto");

    if (carrito.items.length === 0) {
      res.status(500).json({ mensaje: "El carrito esta vacio" });
    }
    let montoTotal = 0;
    const itemsMP = carrito.items.map((item) => {
      const subtotal = item.producto.precio * item.cantidad;
      montoTotal += subtotal;
      return {
        id: item.producto._id.toString(),
        title: item.producto.nombreProducto,
        unit_price: Number(item.producto.precio),
        quantity: Number(item.cantidad),
        currency_id: "ARS",
        picture_url: item.producto.imagen,
      };
    });
    const itemsOrden = carrito.items.map((item) => ({
      producto: item.producto._id,
      nombreProducto: item.producto.nombreProducto,
      precioUnitario: item.producto.precio,
      cantidad: item.cantidad,
    }));

    const nuevaOrden = new OrdenProducto({
      usuario: userId,
      items: itemsOrden,
      montoTotal,
      estado: "pendiente",
    });
    await nuevaOrden.save();

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: itemsMP,
        external_reference: nuevaOrden._id.toString(),

        notification_url: `${process.env.BACKEND_URL}/api/pagoProducto/webhook`,
        back_urls: {
          success: `${process.env.PAYMENT_FRONTEND_URL}/checkout/resultado?status=success`,
          failure: `${process.env.PAYMENT_FRONTEND_URL}/checkout/resultado?status=failure`,
          pending: `${process.env.PAYMENT_FRONTEND_URL}/checkout/resultado?status=pending`,
        },
        auto_return: "approved",
      },
    });
    nuevaOrden.preferenceId = result.id;
    await nuevaOrden.save();

    return res.status(201).json({
      mensaje: "Preferencia de pago creada con exito",
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      ordenId: nuevaOrden._id,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ mensaje: "Ocurrio un error al crear la preferencia de pago" });
  }
};
export const recibirWebhook = async (req, res) => {
  try {
    console.log("🚨 CUIDADO: El Webhook se está ejecutando!");
    const { type, "data.id": paymentId } = req.query;

    if (type === "payment" && paymentId) {
      const payment = new Payment(client);
      const pagoData = await payment.get({ id: paymentId });

      if (pagoData.status === "approved") {
        const ordenActualizada = await OrdenProducto.findByIdAndUpdate(
          pagoData.external_reference,
          {
            estado: "aprobado",
            paymentId: paymentId,
          },
          { new: true },
        );

        if (ordenActualizada) {
          const carrito = await buscarOCrearCarrito(ordenActualizada.usuario);
          carrito.items = [];
          await carrito.save();
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error en Webhook:", error.message);
    res.status(500).json({ error: error.message });
  }
};
