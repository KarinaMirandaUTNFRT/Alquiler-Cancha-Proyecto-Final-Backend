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
      auto_return: "approved",
      
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
    // 1. Validar autenticidad de la firma HMAC SHA-256
    const esFirmaValida = validarFirmaMercadoPago(req);
    if (!esFirmaValida) {
      console.error("🚫 Intento de webhook rechazado: Firma inválida o no coincide.");
      return res.status(403).json({ error: "Firma inválida" });
    }

    // 2. Extraer el tipo de evento y el paymentId
    const tipo = req.body?.type || req.query?.type || req.body?.topic;

    if (tipo === "payment") {
      const paymentId =
        req.body?.data?.id || req.query?.["data.id"] || req.query?.id;

      if (paymentId) {
        // 3. Consultar el pago directamente a la API de Mercado Pago
        const paymentClient = new Payment(client);
        const pago = await paymentClient.get({ id: paymentId });

        console.log(`🔔 Webhook recibido: Pago ${paymentId} | Estado: ${pago.status}`);

        // 4. Si fue aprobado, actualizar la base de datos
        if (pago.status === "approved") {
          const ordenId = pago.external_reference;

          if (ordenId) {
            const orden = await OrdenCancha.findById(ordenId);

            if (orden && orden.estado !== "pagada") {
              orden.estado = "pagada";
              orden.paymentId = String(paymentId);
              await orden.save();

              // Extraer IDs de reservas y confirmarlas
              const idsReservas = orden.items.map((item) => item.reserva);

              await Reserva.updateMany(
                { _id: { $in: idsReservas } },
                { $set: { estado: "confirmada" } }
              );

              console.log(`✅ Orden ${ordenId} y Reservas ${idsReservas.join(", ")} confirmadas con éxito.`);
            }
          }
        }
      }
    }

    // Mercado Pago requiere un status 200 para dar por entregada la notificación
    return res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Error interno al procesar el webhook:", error);
    return res.status(500).json({ error: "Error al procesar notificación" });
  }
};