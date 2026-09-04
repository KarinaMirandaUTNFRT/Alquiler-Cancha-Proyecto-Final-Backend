import { Reserva } from "../models/reserva.js";
import Cancha from "../models/cancha.js";

const MAPA_TURNOS = {
  "08:00": "09:00",
  "09:00": "10:00",
  "10:00": "11:00",
  "11:00": "12:00",
  "12:00": "13:00",
  "13:00": "14:00",
  "14:00": "15:00",
  "15:00": "16:00",
  "16:00": "17:00",
  "17:00": "18:00",
  "18:00": "19:00",
  "19:00": "20:00",
  "20:00": "21:00",
  "21:00": "22:00",
  "22:00": "23:00",
  "23:00": "00:00",
  "00:00": "01:00",
};

export const crearReservaCancha = async (req, res) => {
  try {
    const { canchaId, fecha, turnos } = req.body;
    const userId = req.user.id;

    if (
      !canchaId ||
      !fecha ||
      !Array.isArray(turnos) ||
      turnos.length === 0
    ) {
      return res.status(400).json({
        mensaje: "Debes enviar cancha, fecha y al menos un turno",
      });
    }

    const turnosUnicos = [...new Set(turnos)];

    const invalidos = turnosUnicos.filter((hora) => !MAPA_TURNOS[hora]);
    if (invalidos.length > 0) {
      return res.status(400).json({
        mensaje: `Los siguientes horarios no son válidos: ${invalidos.join(", ")}`,
      });
    }

    const canchaExiste = await Cancha.findById(canchaId);
    if (!canchaExiste) {
      return res
        .status(404)
        .json({ mensaje: "La cancha solicitada no existe" });
    }

    const turnosOcupados = await Reserva.find({
      cancha: canchaId,
      fechaJornada: fecha,
      horaInicio: { $in: turnosUnicos },
      estado: "confirmada",
    }).select("horaInicio");

    if (turnosOcupados.length > 0) {
      const horasReservadas = turnosOcupados.map((t) => t.horaInicio);
      return res.status(409).json({
        mensaje: `No se pudo reservar. Los siguientes turnos ya están ocupados: ${horasReservadas.join(", ")}`,
        turnosEnConflicto: horasReservadas,
      });
    }

    const nuevasReservas = turnosUnicos.map((hora) => ({
      usuario: userId,
      cancha: canchaId,
      fechaJornada: fecha,
      horaInicio: hora,
      horaFin: MAPA_TURNOS[hora],
      estado: "confirmada",
    }));

    const reservasGuardadas = await Reserva.insertMany(nuevasReservas);

    res.status(201).json({
      mensaje: `Reserva confirmada con éxito para ${reservasGuardadas.length} turno(s)`,
      reservas: reservasGuardadas,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Error al procesar la reserva de la cancha" });
  }
};
