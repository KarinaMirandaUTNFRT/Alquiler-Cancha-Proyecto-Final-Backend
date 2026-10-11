import crypto from "crypto";

export const validarFirmaMercadoPago = (req) => {
  const secret = process.env.MP_WEBHOOK_SECRET?.trim();

  if (!secret) {
    console.error("❌ Error de seguridad: MP_WEBHOOK_SECRET no está configurado en las variables de entorno.");
    return false;
  }

  const xSignature = req.headers["x-signature"];
  const xRequestId = req.headers["x-request-id"];

  if (!xSignature || !xRequestId) {
    console.warn("⚠️ Petición rechazada: Faltan cabeceras x-signature o x-request-id.");
    return false;
  }

  // Extraer ts y v1 del header "ts=...,v1=..."
  const partes = xSignature.split(",");
  let ts = "";
  let v1 = "";

  partes.forEach((parte) => {
    const [clave, valor] = parte.split("=");
    if (clave && valor) {
      const claveLimpia = clave.trim().toLowerCase();
      if (claveLimpia === "ts") ts = valor.trim();
      if (claveLimpia === "v1") v1 = valor.trim();
    }
  });

  if (!ts || !v1) {
    console.warn("⚠️ Petición rechazada: Estructura de x-signature incompleta.");
    return false;
  }

  // Obtener el ID del recurso (Mercado Pago lo envía habitualmente como query parameter)
  const dataId =
    req.query?.["data.id"] ||
    req.query?.id ||
    req.body?.data?.id;

  // Formato oficial de Mercado Pago: id:[data.id];request-id:[x-request-id];ts:[ts];
  let manifest = "";
  if (dataId) {
    manifest += `id:${String(dataId).toLowerCase()};`;
  }
  manifest += `request-id:${xRequestId};ts:${ts};`;

  // Generar hash HMAC SHA-256
  const hashGenerado = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  return hashGenerado === v1;
};