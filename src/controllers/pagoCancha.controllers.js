import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { Reserva } from "../models/reserva.js";
import OrdenCancha from "../models/ordenCancha.js"; // Importación de tu modelo de orden

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

    // 1. Obtener las reservas desde MongoDB con la información de la cancha
    const reservas = await Reserva.find({
      _id: { $in: idsAProcesar },
      usuario: userId,
    }).populate("cancha", "nombreCancha precio");

    if (reservas.length === 0) {
      return res.status(404).json({
        mensaje: "No se encontraron reservas válidas para este usuario",
      });
    }

    // 2. Mapear items y calcular el total acumulado
    let montoTotal = 0;
    const itemsMP = [];
    const itemsOrden = [];

    for (const reserva of reservas) {
      const precioUnitario = Number(reserva.cancha.precio);
      montoTotal += precioUnitario;

      // Estructura para Mercado Pago
      itemsMP.push({
        id: reserva._id.toString(),
        title: `Reserva ${reserva.cancha.nombreCancha} (${reserva.fechaJornada} - ${reserva.horaInicio} hs)`,
        unit_price: precioUnitario,
        quantity: 1,
        currency_id: "ARS",
      });

      // Estructura para la Orden en MongoDB
      itemsOrden.push({
        reserva: reserva._id,
        cancha: reserva.cancha._id,
        nombreCancha: `Reserva ${reserva.cancha.nombreCancha} (${reserva.fechaJornada} ${reserva.horaInicio}hs)`,
        precioUnitario,
        cantidad: 1,
      });
    }

    // 3. GUARDADO EN MONGODB (1): Instanciar y crear la orden con estado 'pendiente'
    const nuevaOrden = new OrdenCancha({
      usuario: userId,
      items: itemsOrden,
      montoTotal,
      estado: "pendiente",
    });

    await nuevaOrden.save(); // Se guarda en MongoDB y genera el nuevaOrden._id

    // 4. Crear la preferencia en Mercado Pago asociando el ID de la nueva Orden
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: itemsMP,
        external_reference: nuevaOrden._id.toString(), // ID de la Orden en MongoDB
        notification_url: `${process.env.BACKEND_URL}/api/pagoCancha/webhook`,
        back_urls: {
          success: `${process.env.PAYMENT_FRONTEND_URL}/checkout/resultado?status=success`,
          failure: `${process.env.PAYMENT_FRONTEND_URL}/checkout/resultado?status=failure`,
          pending: `${process.env.PAYMENT_FRONTEND_URL}/checkout/resultado?status=pending`,
        },
        auto_return: "approved",
      },
    });

    // 5. GUARDADO EN MONGODB (2): Actualizar la orden con el preferenceId devuelto por MP
    nuevaOrden.preferenceId = result.id;
    await nuevaOrden.save();

    // 6. Vincular el preferenceId en las reservas (Opcional)
    await Reserva.updateMany(
      { _id: { $in: idsAProcesar } },
      { $set: { preferenceId: result.id } }
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
    // 1. Capturar el tipo de evento y el ID según formato IPN o Webhook V2
    const topic = req.query.topic || req.query.type || req.body?.type;
    const paymentId = req.query["data.id"] || req.body?.data?.id || req.query.id;

    // 2. Si no es un evento de pago (ej. merchant_order), ignorar y responder 200
    if (topic !== "payment") {
      return res.status(200).send("Notificación no corresponde a pago, ignorada.");
    }

    // 3. Si es un pago y tiene ID, consultar a Mercado Pago
    if (paymentId) {
      const payment = new Payment(client);
      const pagoData = await payment.get({ id: paymentId });

      if (pagoData.status === "approved") {
        const idReferencia = pagoData.external_reference;

        // Actualizar la reserva a confirmada
        await Reserva.findByIdAndUpdate(idReferencia, {
          estado: "confirmada",
        });

        console.log("✅ Turno confirmado para la reserva:", idReferencia);
      }
    }

    // 4. Confirmación obligatoria a Mercado Pago
    return res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error en Webhook:", error.message);
    // Responder 200 para evitar reintentos continuos si el recurso no existe
    return res.status(200).json({ error: error.message });
  }
};












// import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
// import Cancha from "../models/cancha.js"

// const client = new MercadoPagoConfig({
//   accessToken: process.env.MP_ACCESS_TOKEN,
// });

// export const crearPreferenciaPagoDirecta = async (req, res) => {
//   try {
//     const { canchaId, fecha, hora } = req.body;

//     // 1. Buscas la cancha y su precio en la DB
//     const cancha = await Cancha.findById(canchaId);
//     if (!cancha)
//       return res.status(404).json({ message: "Cancha no encontrada" });

//     // 2. Creas la preferencia directa en Mercado Pago
//     const preference = new Preference(client);
//     const response = await preference.create({
//       body: {
//         items: [
//           {
//             title: `Reserva ${cancha.nombreCancha} - ${fecha} ${turnos}`,
//             quantity: 1,
//             unit_price: Number(cancha.precio),
//             currency_id: "ARS",
//           },
//         ],
//         back_urls: {
//           success: `${process.env.PAYMENT_FRONTEND_URL}/checkout/resultado?status=success`,
//           failure: `${process.env.PAYMENT_FRONTEND_URL}/checkout/resultado?status=failure`,
//           pending: `${process.env.PAYMENT_FRONTEND_URL}/checkout/resultado?status=pending`
//         },
//         auto_return: "approved",
//       },
//     });

//     // 3. Devuelves el enlace directo
//     res.json({ init_point: response.init_point });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };




// import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
// import OrdenCancha from "../models/ordenCancha.js";

// const client = new MercadoPagoConfig({
//   accessToken: process.env.MP_ACCESS_TOKEN,
// });

// export const crearPreferenciaPagoDirecta = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const {
//       cancha,
//       titulo,
//       precioUnitario,
//       cantidad = 1,
//       imagen_url,
//     } = req.body;

//     if (!titulo || !precioUnitario) {
//       return res.status(400).json({
//         mensaje: "La cancha y el precio son obligatorios",
//       });
//     }

//     const precioNumero = Number(precioUnitario);
//     const cantidadNumero = Number(cantidad);
//     const montoTotal = precioNumero * cantidadNumero;

//     const nuevaOrden = new OrdenCancha({
//       usuario: userId,
//       items: [
//         {
//           ...(canchaId && { cancha: canchaId }),
//           nombreCancha:cancha,
//           precioUnitario: precioNumero,
//           cantidad: cantidadNumero,
//         },
//       ],
//       montoTotal,
//       estado: "pendiente",
//     });

//     await nuevaOrden.save();

//     // 3. Crear la preferencia de pago en Mercado Pago
//     const preference = new Preference(client);

//     const result = await preference.create({
//       body: {
//         items: [
//           {
//             id: canchaId ? canchaId.toString() : "DIRECT-PAYMENT",
//             title: title,
//             unit_price: precioNumero,
//             quantity: cantidadNumero,
//             currency_id: "ARS",
//             ...(imagen_url && { imagen_url }),
//           },
//         ],
//         external_reference: nuevaOrden._id.toString(), // ID de la orden en la BD
//         notification_url: `${process.env.BACKEND_URL}/api/pagoCancha/webhook`,
//         back_urls: {
//           success: `${process.env.PAYMENT_FRONTEND_URL}/checkout/resultado?status=success`,
//           failure: `${process.env.PAYMENT_FRONTEND_URL}/checkout/resultado?status=failure`,
//           pending: `${process.env.PAYMENT_FRONTEND_URL}/checkout/resultado?status=pending`,
//         },
//         auto_return: "approved",
//       },
//     });

//     nuevaOrden.preferenceId = result.id;
//     await nuevaOrden.save();

//     return res.status(201).json({
//       mensaje: "Preferencia de pago creada con éxito",
//       init_point: result.init_point, // Checkout Oficial
//       sandbox_init_point: result.sandbox_init_point,
//       ordenId: nuevaOrden._id,
//     });
//   } catch (error) {
//     console.error("Error al crear preferencia de pago directa:", error);
//     return res.status(500).json({
//       mensaje: "Ocurrió un error al crear la preferencia de pago",
//       error: error.message,
//     });
//   }
// };

// export const recibirWebhook = async (req, res) => {
//   try {
//     console.log("🚨 CUIDADO: El Webhook se está ejecutando!");
//     const { type, "data.id": paymentId } = req.query;

//     if (type === "payment" && paymentId) {
//       const payment = new Payment(client);
//       const pagoData = await payment.get({ id: paymentId });

//       // 3. Si fue aprobado, actualizamos nuestra Orden en MongoDB usando el external_reference
//       if (pagoData.status === "approved") {
//         const ordenActualizada = await OrdenCancha.findByIdAndUpdate(
//           pagoData.external_reference,
//           {
//             estado: "aprobado",
//             paymentId: paymentId,
//           },
//           { new: true },
//         );
//         await OrdenCancha.save();
//       }
//     }

//     res.sendStatus(200);
//   } catch (error) {
//     console.error("❌ Error en Webhook:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// };
