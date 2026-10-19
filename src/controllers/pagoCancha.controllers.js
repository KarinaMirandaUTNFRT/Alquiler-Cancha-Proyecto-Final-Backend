import { MercadoPagoConfig, Preference, Payment, MerchantOrder } from "mercadopago";
import { Reserva } from "../models/reserva.js";
import OrdenCancha from "../models/ordenCancha.js";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN?.trim(),
});

export const crearPreferenciaReserva = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.usuario?._id || null;

    // Acepta tanto si viene por params (:id) como por body (reservaId, reservaIds, ordenId)
    const idParam = req.params?.id || req.params?.idReserva;
    const { reservaIds, reservaId, ordenId } = req.body || {};

    let reservas = [];
    let ordenExistente = null;

    // Caso A: Si enviaron directamente el ID de una OrdenCancha ya creada
    const posibleOrdenId = ordenId || idParam;
    if (posibleOrdenId) {
      ordenExistente = await OrdenCancha.findById(posibleOrdenId).populate({
        path: "items.cancha",
        select: "nombreCancha precio",
      });
    }

    if (ordenExistente) {
      // Tomamos las reservas vinculadas a esa orden
      const idsDeOrden = ordenExistente.items.map((i) => i.reserva);
      reservas = await Reserva.find({ _id: { $in: idsDeOrden } }).populate(
        "cancha",
        "nombreCancha precio"
      );
    } else {
      // Caso B: Enviaron un array o un id de reserva suelto
      const idsAProcesar = reservaIds || (reservaId ? [reservaId] : (idParam ? [idParam] : []));

      if (idsAProcesar.length === 0) {
        return res.status(400).json({
          mensaje: "Debes enviar al menos un ID de reserva u orden",
        });
      }

      reservas = await Reserva.find({
        _id: { $in: idsAProcesar },
      }).populate("cancha", "nombreCancha precio");
    }

    if (!reservas || reservas.length === 0) {
      return res.status(404).json({
        mensaje: "No se encontraron reservas para procesar el pago",
      });
    }

    let montoTotal = 0;
    const itemsMP = [];
    const itemsOrden = [];

    for (const reserva of reservas) {
      const precioUnitario = Number(reserva.precio || reserva.cancha?.precio || 0);
      montoTotal += precioUnitario;

      itemsMP.push({
        id: reserva._id.toString(),
        title: `Cancha ${reserva.cancha?.nombreCancha || ""} (${reserva.fechaJornada || ""} ${reserva.horaInicio || ""}hs)`,
        unit_price: precioUnitario,
        quantity: 1,
        currency_id: "ARS",
      });

      itemsOrden.push({
        reserva: reserva._id,
        cancha: reserva.cancha?._id || reserva.cancha,
        nombreCancha: `Reserva ${reserva.cancha?.nombreCancha || "Cancha"} (${reserva.fechaJornada || ""} ${reserva.horaInicio || ""}hs)`,
        precioUnitario,
        cantidad: 1,
      });
    }

    // Si no existía la orden, la creamos
    let ordenFinal = ordenExistente;
    if (!ordenFinal) {
      ordenFinal = new OrdenCancha({
        usuario: userId,
        items: itemsOrden,
        montoTotal,
        estado: "pendiente",
      });
      await ordenFinal.save();
    }

    const FRONTEND_URL = process.env.FRONTEND_URL || "https://rollingclub.netlify.app";
    const BACKEND_URL =
      process.env.BACKEND_URL ||
      "https://alquiler-cancha-proyecto-final-backend.onrender.com";

    const preferenceData = {
      items: itemsMP,
      external_reference: ordenFinal._id.toString(),
      notification_url: `${BACKEND_URL}/api/pagoCancha/webhook`,
      back_urls: {
        success: `${FRONTEND_URL}/checkout/resultado`,
        failure: `${FRONTEND_URL}/checkout/resultado`,
        pending: `${FRONTEND_URL}/checkout/resultado`,
      },
      auto_return: "approved",
    };

    // Crear la preferencia en Mercado Pago
    const preference = new Preference(client);
    const result = await preference.create({ body: preferenceData });

    // Actualizar la orden y las reservas con el preferenceId
    ordenFinal.preferenceId = result.id;
    await ordenFinal.save();

    const idsActualizar = reservas.map((r) => r._id);
    await Reserva.updateMany(
      { _id: { $in: idsActualizar } },
      { $set: { preferenceId: result.id, estado: "pendiente" } }
    );

    return res.status(201).json({
      mensaje: "Orden guardada y preferencia generada con éxito",
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      ordenId: ordenFinal._id,
    });
  } catch (error) {
    console.error("Error al crear la orden y la preferencia de pago:", error);
    return res.status(500).json({
      mensaje: "Ocurrió un error al procesar la solicitud",
      error: error.message || error,
    });
  }
};

export const recibirWebhookReserva = async (req, res) => {
  try {
    const tipo = req.body?.type || req.query?.type || req.body?.topic;
    const dataId =
      req.body?.data?.id || req.query?.["data.id"] || req.query?.id;

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
      const ordenMP = await merchantOrderClient.get({
        merchantOrderId: dataId,
      });

      const pagoAprobado = ordenMP.payments?.find(
        (p) => p.status === "approved"
      );
      if (pagoAprobado) {
        pagoId = pagoAprobado.id;
      } else {
        return res.status(200).send("Orden sin pagos aprobados aún");
      }
    }

    if (!pagoId) {
      return res.status(200).send("Evento no procesable");
    }

    // Consultar el detalle del pago a Mercado Pago
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

        console.log(
          `✅ Orden ${ordenId} y Reservas [${idsReservas.join(", ")}] confirmadas con éxito.`
        );
      }
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Error en webhook:", error);
    return res.status(500).json({ error: "Error al procesar notificación" });
  }
};