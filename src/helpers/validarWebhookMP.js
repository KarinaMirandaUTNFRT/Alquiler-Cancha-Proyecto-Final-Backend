import crypto from "crypto";

export const validarFirmaMercadoPago = (req) => {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("Advertencia: MP_WEBHOOK_SECRET no está configurado.");
    return false;
  }

  const xSignature = req.headers["x-signature"];
  const xRequestId = req.headers["x-request-id"];

  if (!xSignature || !xRequestId) {
    return false;
  }

  // x-signature tiene el formato: "ts=1700000000,v1=hash..."
  const partes = xSignature.split(",");
  let ts = "";
  let v1 = "";

  partes.forEach((parte) => {
    const [clave, valor] = parte.split("=");
    if (clave && valor) {
      const claveLimpia = clave.trim();
      if (claveLimpia === "ts") ts = valor.trim();
      if (claveLimpia === "v1") v1 = valor.trim();
    }
  });

  if (!ts || !v1) {
    return false;
  }

  // Obtener el ID del recurso que envía MP en query o body
  const dataId =
    req.body?.data?.id ||
    req.query?.["data.id"] ||
    req.query?.id;

  // Construir el manifest según la especificación de Mercado Pago
  // Formato: id:[data.id_url];request-id:[x-request-id_header];ts:[ts_header];
  let manifest = "";
  if (dataId) {
    manifest += `id:${dataId};`;
  }
  manifest += `request-id:${xRequestId};ts:${ts};`;

  // Calcular el hash HMAC SHA-256
  const hashGenerado = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  return hashGenerado === v1;
};