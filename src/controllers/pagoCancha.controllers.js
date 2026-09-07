import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import OrdenCancha from "../models/ordenCancha";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

export const crearPreferenciaPagoDirecta = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      canchaId,
      titulo,
      precioUnitario,
      cantidad = 1,
      imagen_url,
    } = req.body;

    if (!titulo || !precioUnitario) {
      return res.status(400).json({
        mensaje: "La cancha y el precio son obligatorios",
      });
    }

    const precioNumero = Number(precioUnitario);
    const cantidadNumero = Number(cantidad);
    const montoTotal = precioNumero * cantidadNumero;

    const nuevaOrden = new OrdenCancha({
      usuario: userId,
      items: [
        {
          ...(canchaId && { cancha: canchaId }),
          nombreCancha: titulo,
          precioUnitario: precioNumero,
          cantidad: cantidadNumero,
        },
      ],
      montoTotal,
      estado: "pendiente",
    });

    await nuevaOrden.save();

    // 3. Crear la preferencia de pago en Mercado Pago
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: canchaId ? canchaId.toString() : "DIRECT-PAYMENT",
            title: title,
            unit_price: precioNumero,
            quantity: cantidadNumero,
            currency_id: "ARS",
            ...(imagen_url && { imagen_url }),
          },
        ],
        external_reference: nuevaOrden._id.toString(), // ID de la orden en la BD
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

    return res.status(201).json({
      mensaje: "Preferencia de pago creada con éxito",
      init_point: result.init_point, // Checkout Oficial
      sandbox_init_point: result.sandbox_init_point,
      ordenId: nuevaOrden._id,
    });
  } catch (error) {
    console.error("Error al crear preferencia de pago directa:", error);
    return res.status(500).json({
      mensaje: "Ocurrió un error al crear la preferencia de pago",
      error: error.message,
    });
  }
};

export const recibirWebhook = async (req, res) => {
  try {
    console.log("🚨 CUIDADO: El Webhook se está ejecutando!");
    const { type, "data.id": paymentId } = req.query;

    if (type === "payment" && paymentId) {
      const payment = new Payment(client);
      const pagoData = await payment.get({ id: paymentId });

      // 3. Si fue aprobado, actualizamos nuestra Orden en MongoDB usando el external_reference
      if (pagoData.status === "approved") {
        const ordenActualizada = await OrdenCancha.findByIdAndUpdate(
          pagoData.external_reference,
          {
            estado: "aprobado",
            paymentId: paymentId,
          },
          { new: true },
        );
        await OrdenCancha.save();
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error en Webhook:", error.message);
    res.status(500).json({ error: error.message });
  }
};
