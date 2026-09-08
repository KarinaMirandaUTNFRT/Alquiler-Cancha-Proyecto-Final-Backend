import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { Reserva } from "../models/reserva.js";
import OrdenCancha from "../models/ordenCancha.js"; 

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
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

    
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: itemsMP,
        external_reference: nuevaOrden._id.toString(), 
        notification_url: `${process.env.BACKEND_URL}/api/pagoCancha/webhook`,
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

   
    await Reserva.updateMany(
      { _id: { $in: idsAProcesar } },
      { $set: { preferenceId: result.id } },
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
    const topic = req.query.topic || req.query.type || req.body?.type;
    const paymentId =
      req.query["data.id"] || req.body?.data?.id || req.query.id;

    if (topic !== "payment") {
      return res
        .status(200)
        .send("Notificación no corresponde a pago, ignorada.");
    }

    if (paymentId) {
      const payment = new Payment(client);
      const pagoData = await payment.get({ id: paymentId });

      if (pagoData.status === "approved") {
        const ordenId = pagoData.external_reference;

        const ordenActualizada = await OrdenCancha.findByIdAndUpdate(
          ordenId,
          {
            estado: "aprobado",
            paymentId: paymentId.toString(),
          },
          { new: true },
        );
        if (ordenActualizada) {
          console.log(
            "✅ OrdenCancha aprobada con éxito:",
            ordenActualizada._id,
          );

          await Reserva.updateMany(
            { preferenceId: ordenActualizada.preferenceId },
            { $set: { estado: "confirmada" } },
          );
          console.log("✅ Reservas asociadas confirmadas.");
        } else {
          console.warn("⚠️ No se encontró OrdenCancha con el ID:", ordenId);
        }
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error en Webhook:", error.message);

    return res.status(200).json({ error: error.message });
  }
};
