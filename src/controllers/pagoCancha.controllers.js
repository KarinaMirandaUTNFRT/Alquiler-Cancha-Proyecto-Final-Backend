import { MercadoPagoConfig, Preference, Payment, MerchantOrder } from "mercadopago";
import { Reserva } from "../models/reserva.js";
import OrdenCancha from "../models/ordenCancha.js";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN?.trim(),
});

export const crearPreferenciaReserva = async (req, res) => {
  try {
    const { reservaIds, reservaId, ordenId } = req.body;
    const idEntrante = ordenId || reservaId || (Array.isArray(reservaIds) ? reservaIds[0] : null);

    if (!idEntrante && (!reservaIds || reservaIds.length === 0)) {
      return res.status(400).json({
        mensaje: "Debes enviar un identificador de orden o reserva",
      });
    }

    // 1. Buscamos todas las reservas que coincidan con el ID directo, con el grupoId, o dentro del array
    const listaIds = Array.isArray(reservaIds) && reservaIds.length > 0 ? reservaIds : [idEntrante];

    let reservas = await Reserva.find({
      $or: [
        { _id: { $in: listaIds } },
        { grupoId: idEntrante },
      ],
    }).populate("cancha", "nombreCancha precio");

    // Si aún no encuentra reservas pero existe una orden guardada, leemos sus reservas asociadas
    if (reservas.length === 0) {
      const orden = await OrdenListaReservas.findById(idEntrante);
      if (orden && orden.reservas?.length > 0) {
        reservas = await Reserva.find({ _id: { $in: orden.reservas } }).populate(
          "cancha",
          "nombreCancha precio"
        );
      }
    }

    // Validación final
    if (!reservas || reservas.length === 0) {
      return res.status(404).json({
        mensaje: "No se encontraron reservas para procesar el pago",
      });
    }

    // 2. Construir los items para Mercado Pago
    const itemsMP = reservas.map((r) => {
      const precioUnitario = Number(r.precio || r.cancha?.precio || 15000);
      return {
        id: String(r._id),
        title: `Cancha ${r.cancha?.nombreCancha || "Fútbol"} (${r.fechaJornada || ""} ${r.horaInicio || ""}hs)`.trim(),
        unit_price: precioUnitario,
        quantity: 1,
        currency_id: "ARS",
      };
    });

    const FRONTEND_URL = process.env.FRONTEND_URL || "https://alquilercanchasnorte.netlify.app";
    const BACKEND_URL = process.env.BACKEND_URL || "https://alquiler-cancha-proyecto-final-backend.onrender.com";

    // 3. Crear la preferencia
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: itemsMP,
        external_reference: String(idEntrante),
        notification_url: `${BACKEND_URL}/api/pagoCancha/webhook`,
        back_urls: {
          success: `${FRONTEND_URL}/checkout/resultado`,
          failure: `${FRONTEND_URL}/checkout/resultado`,
          pending: `${FRONTEND_URL}/checkout/resultado`,
        },
        auto_return: "approved",
      },
    });

    // Guardar preferenceId en las reservas
    await Reserva.updateMany(
      { _id: { $in: reservas.map((r) => r._id) } },
      { $set: { preferenceId: result.id, estado: "pendiente" } }
    );

    return res.status(200).json({
      success: true,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      id: result.id,
    });
  } catch (error) {
    console.error("Error al crear preferencia:", error);
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