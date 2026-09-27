import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { Reserva } from "../models/reserva.js";
import OrdenCancha from "../models/ordenCancha.js";
import { validarFirmaMercadoPago } from "../helpers/validarWebhookMP.js";

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
      notification_url: `${backendUrl}/api/pagoCancha/webhook`,
      back_urls: {
        success: `${frontendUrl}/checkout/resultado?status=success`,
        failure: `${frontendUrl}/checkout/resultado?status=failure`,
        pending: `${frontendUrl}/checkout/resultado?status=pending`,
      },
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
    // 1. Validar la autenticidad de la firma[cite: 20]
    const esFirmaValida = validarFirmaMercadoPago(req);
    if (!esFirmaValida) {
      console.error("Firma de webhook de Mercado Pago no válida o ausente.");
      return res.status(403).json({ error: "Firma inválida" });
    }

    const tipo = req.body?.type || req.query?.type;

    if (tipo === "payment") {
      const paymentId = req.body?.data?.id || req.query?.["data.id"] || req.query?.id;

      // 2. Consultar el pago en Mercado Pago (SDK o Fetch) para obtener external_reference real
      // const pago = await paymentClient.get({ id: paymentId });
      // const idReserva = pago.external_reference;

      const idReserva = req.body?.external_reference || req.query?.external_reference;

      // 3. Verificar que la reserva exista antes de actualizar su estado[cite: 20]
      if (idReserva) {
        const reserva = await Reserva.findById(idReserva);
        if (!reserva) {
          console.warn(`Reserva con ID ${idReserva} no encontrada en BD`);
          return res.status(404).json({ error: "Reserva no encontrada" });
        }

        if (reserva.estado !== "confirmada") {
          reserva.estado = "confirmada";
          await reserva.save();
        }
      }
    }

    // Mercado Pago requiere un status 200 para confirmar la recepción
    return res.status(200).send("OK");
  } catch (error) {
    console.error("Error al procesar webhook de pago:", error);
    return res.status(500).json({ error: "Error interno al procesar webhook" });
  }
};
