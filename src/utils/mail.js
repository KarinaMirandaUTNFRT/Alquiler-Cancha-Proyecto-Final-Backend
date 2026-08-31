import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
transporter
  .verify()
  .then(() => console.info("📬 Servidor de correos listo para usar"))
  .catch((error) =>
    console.error("Error al configurar el transportador de mails", error),
  );
  export default transporter;