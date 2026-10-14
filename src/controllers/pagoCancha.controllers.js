import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { Reserva } from "../models/reserva.js";
import OrdenCancha from "../models/ordenCancha.js";
import { MerchantOrder } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN?.trim(),
});

export const crearPreferenciaReserva = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reservaIds, reservaId } = req.body;

    const idsAProcesar = reservaIds || (reservaId ? [reservaId] : []);

    if (idsAProcesar.length === 0) {
      return res.status(400).json({
        mensaje: "Debes enviar al menos un ID de reserva",
      });
    }

    const reservas = await Reserva.find({
      _id: { $in: idsAProcesar },
      usuario: userId,
    }).populate("cancha", "nombreCancha precio");

    if (reservas.length === 0) {
      return res.status(404).json({
        mensaje: "No se encontraron reservas válidas para este usuario",
      });
    }

    let montoTotal = 0;
    const itemsMP = [];
    const itemsOrden = [];

    for (const reserva of reservas) {
      const precioUnitario = Number(reserva.cancha.precio);
      montoTotal += precioUnitario;

      itemsMP.push({
        id: reserva._id.toString(),
        title: `Reserva ${reserva.cancha.nombreCancha} (${reserva.fechaJornada} - ${reserva.horaInicio} hs)`,
        unit_price: precioUnitario,
        quantity: 1,
        currency_id: "ARS",
      });

      itemsOrden.push({
        reserva: reserva._id,
        cancha: reserva.cancha._id,
        nombreCancha: `Reserva ${reserva.cancha.nombreCancha} (${reserva.fechaJornada} ${reserva.horaInicio}hs)`,
        precioUnitario,
        cantidad: 1,
      });
    }

    const nuevaOrden = new OrdenCancha({
      usuario: userId,
      items: itemsOrden,
      montoTotal,
      estado: "pendiente",
    });

    await nuevaOrden.save();

    const backendUrl = process.env.BACKEND_URL?.trim().replace(/\/$/, "");
    const frontendUrl = (
      process.env.PAYMENT_FRONTEND_URL?.trim() 
    ).replace(/\/$/, "");

    const preference = new Preference(client);

    const preferenceData = {
      items: itemsMP,
      external_reference: nuevaOrden._id.toString(),
      notification_url: `${process.env.BACKEND_URL || 
        "https://alquiler-cancha-proyecto-final-backend.onrender.com"}/api/pagoCancha/webhook`,
      //notification_url: `${backendUrl}/api/pagoCancha/webhook`,
      // back_urls: {
      //   success: `${frontendUrl}/checkout/resultado?status=success`,
      //   failure: `${frontendUrl}/checkout/resultado?status=failure`,
      //   pending: `${frontendUrl}/checkout/resultado?status=pending`,
      // },
      // auto_return: "approved",
      
    };

    const result = await preference.create({ body: preferenceData });

    nuevaOrden.preferenceId = result.id;
    await nuevaOrden.save();

    await Reserva.updateMany(
      { _id: { $in: idsAProcesar } },
      { $set: { preferenceId: result.id, estado: "pendiente" } },
    );

    return res.status(201).json({
      mensaje: "Orden guardada en BD y preferencia de pago generada con éxito",
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      ordenId: nuevaOrden._id,
    });
  } catch (error) {
    console.error("Error al crear la orden y la preferencia de pago:", error);
    return res.status(500).json({
      mensaje: "Ocurrió un error al procesar la solicitud",
      error: error.message,
    });
  }
};
export const recibirWebhookReserva = async (req, res) => {
  try {
    const tipo = req.body?.type || req.query?.type || req.body?.topic;
    const dataId = req.body?.data?.id || req.query?.["data.id"] || req.query?.id;

    if (!dataId) {
      return res.status(200).send("OK");
    }

    let pagoId = null;

    // Caso 1: Notificación directa de pago
    if (tipo === "payment") {
      pagoId = dataId;
    }

    // Caso 2: Notificación de orden comercial (merchant_order)
    if (tipo === "topic_merchant_order_wh" || tipo === "merchant_order") {
      const merchantOrderClient = new MerchantOrder(client);
      const ordenMP = await merchantOrderClient.get({ merchantOrderId: dataId });

      // Obtener el último pago aprobado de la orden si existe
      const pagoAprobado = ordenMP.payments?.find((p) => p.status === "approved");
      if (pagoAprobado) {
        pagoId = pagoAprobado.id;
      } else {
        return res.status(200).send("Orden sin pagos aprobados aún");
      }
    }

    if (!pagoId) {
      return res.status(200).send("Evento no procesable");
    }

    // Consultar el detalle del pago
    const paymentClient = new Payment(client);
    const pago = await paymentClient.get({ id: pagoId });

    if (pago.status === "approved") {
      const ordenId = pago.external_reference;
      const orden = await OrdenCancha.findById(ordenId);

      if (orden && orden.estado !== "aprobado") {
        orden.estado = "aprobado";
        orden.paymentId = String(pagoId);
        await orden.save();

        const idsReservas = orden.items.map((item) => item.reserva);
        await Reserva.updateMany(
          { _id: { $in: idsReservas } },
          { $set: { estado: "confirmada" } }
        );

        console.log(`✅ Orden ${ordenId} y Reservas ${idsReservas.join(", ")} confirmadas con éxito.`);
      }
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Error en webhook:", error);
    return res.status(500).json({ error: "Error al procesar notificación" });
  }
};