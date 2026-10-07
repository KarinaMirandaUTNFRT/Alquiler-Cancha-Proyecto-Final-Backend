import { Reserva } from "../models/reserva.js";
import Cancha from "../models/cancha.js";
import mongoose from "mongoose";
import { MAPA_TURNOS, HORARIOS } from "../helpers/constants.js";

export const crearReservaCancha = async (req, res) => {
  try {
    const { canchaId, fecha, turnos } = req.body;
    const userId = req.user.id;

    if (!canchaId || !fecha || !Array.isArray(turnos) || turnos.length === 0) {
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
      horaInicio: HORARIOS,
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
export const obtenerHorariosDisponibles = async (req, res) => {
  try {
    const idCancha = req.query.canchaId || req.query.canchasId;
    const { fecha } = req.query;

    const { error, value } = validaciónSchema.validate({
      canchaId: req.query.canchaId,
      fecha: req.query.fecha,
    });

    if (error) return res.status(400).json({ error: error.details });
    if (!idCancha || !fecha) {
      return res.status(400).json({ mensaje: "La fecha es obligatoria" });
    }
    if (!mongoose.Types.ObjectId.isValid(idCancha)) {
      return res.status(400).json({
        mensaje: "El ID de la cancha proporcionado no es válido.",
      });
    }
    const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexFecha.test(fecha) || isNaN(Date.parse(fecha))) {
      return res.status(400).json({
        mensaje:
          "El formato de fecha debe ser YYYY-MM-DD y ser una fecha válida.",
      });
    }
    let listaIds = [];
    if (idCancha) {
      listaIds = idCancha.split(",").map((id) => id.trim());
    } else if (idCancha) {
      listaIds = [idCancha.trim()];
    }

    if (listaIds.length === 0) {
      return res
        .status(400)
        .json({ mensaje: "Debes enviar al menos una cancha " });
    }

    const canchas = await Cancha.find({ _id: { $in: listaIds } }).select(
      "nombreCancha precio",
    );

    const reservasOcupadas = await Reserva.find({
      cancha: { $in: listaIds },
      fechaJornada: fecha,
      estado: { $ne: "cancelada" },
    }).select("cancha horaInicio");

    const todosLosTurnos = Object.keys(MAPA_TURNOS);

    const disponibilidadCanchas = canchas.map((srv) => {
      const srvIdStr = srv._id.toString();

      const horasOcupadas = reservasOcupadas
        .filter((r) => r.cancha.toString() === srvIdStr)
        .map((r) => r.horaInicio);

      const turnosLibres = todosLosTurnos.filter(
        (hora) => !horasOcupadas.includes(hora),
      );

      return {
        cand: srv._id,
        nombreCancha: srv.nombreCancha,
        precio: srv.precio,
        fecha,
        turnosLibres,
        turnosOcupados: horasOcupadas,
      };
    });

    return res.status(200).json({
      fecha,
      canchas: disponibilidadCanchas,
    });
  } catch (error) {
    console.error("Error al consultar disponibilidad:", error);
    return res.status(500).json({
      success: false,
      error: {
        mensaje: "Error al consultar disponibilidad",
        ...(process.env.NODE_ENV === "development" && {
          detalle: error.message,
        }),
      },
    });
  }
};

export const obtenerMisReservasCancha = async (req, res) => {
  try {
    const userId = req.user.id;
    const misReservas = await Reserva.find({ usuario: userId })
      .populate("cancha", "nombreCancha precio")
      .sort({ fechaJornada: -1, horaInicio: 1 });

    res.status(200).json(misReservas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener las reservas" });
  }
};
export const cancelarReservaCancha = async (req, res) => {
  try {
    
    const userId = req.user.id;
    const { id } = req.params;
    const reserva = await Reserva.findOne({ _id:id, usuario: userId });

    if (!reserva) {
      return res.status(404).json({
        mensaje:
          "Reserva no encontrada o no tienes autorización para cancelarla",
      });
    }

    if (reserva.estado === "cancelada") {
      return res
        .status(400)
        .json({ mensaje: "Esta reserva ya está cancelada" });
    }

    const ahora = new Date();
    const fechaHoraTurno = new Date(
      `${reserva.fechaJornada}T${reserva.horaInicio}:00`,
    );
    if (fechaHoraTurno < ahora) {
      return res.status(400).json({
        mensaje:
          "No se puede cancelar una reserva cuya fecha u hora ya ha transcurrido",
      });
    }

    reserva.estado = "cancelada";
    await reserva.save();

    res.status(200).json({
      mensaje: "Reserva cancelada correctamente. El horario quedó disponible.",
      reserva,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al cancelar la reserva" });
  }
};
export const listarReservas = async (req, res) => {
  try {
    const limite = Math.max(1, parseInt(req.query.limite) || 10);
    const pagina = Math.max(1, parseInt(req.query.pagina) || 1);
    const salto = (pagina - 1) * limite;
    
    const [totalReservas, reservas] = await Promise.all([
  Reserva.countDocuments(),
  Reserva.find()
      .populate("usuario", "nombreUsuario  email")
      .populate("cancha", "nombreCancha  precio imagen")
      .sort({ fechaJornada: -1, horaInicio: 1 })
      .skip(salto)
      .limit(limite)
    ]);

    res.status(200).json({
      total: totalReservas,
      totalPaginas: Math.ceil(totalReservas / limite),
      paginaActual: pagina,
      limitePorPagina: limite,
      reservas,
    });
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    res.status(500).json({
      mensaje: "Ocurrió un error al obtener el historial de reservas",
    });
  }
};
