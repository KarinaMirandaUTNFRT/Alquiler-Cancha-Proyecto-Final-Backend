import mongoose from "mongoose";
import { Reserva } from "../models/reserva.js";
import Cancha from "../models/cancha.js";
import { MAPA_TURNOS, HORARIOS } from "../helpers/constants.js";
import { OrdenListaReservas } from "../models/ordenListaReservas.js";


export const obtenerHorariosDisponibles = async (req, res) => {
  try {
    const idCancha = req.query.canchaId || req.query.canchasId;
    const { fecha } = req.query;

    console.log("--> Consultando disponibilidad para:", { idCancha, fecha });

    if (!idCancha || !fecha) {
      return res.status(400).json({
        success: false,
        mensaje: "Tanto la cancha como la fecha son obligatorias.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(idCancha)) {
      return res.status(400).json({
        success: false,
        mensaje: "El ID de la cancha no es un ObjectId válido.",
      });
    }

    // 1. Buscar la cancha
    const cancha = await Cancha.findById(idCancha).select(
      "nombreCancha precio",
    );
    if (!cancha) {
      return res.status(404).json({
        success: false,
        mensaje: "Cancha no encontrada.",
      });
    }

    // 2. Buscar reservas ocupadas (ajusta 'fechaJornada' si tu campo en la BD se llama 'fecha')
    const reservasOcupadas = await Reserva.find({
      cancha: idCancha,
      $or: [{ fechaJornada: fecha }, { fecha: fecha }],
      estado: { $ne: "cancelada" },
    }).select("horaInicio");

    const horasOcupadas = reservasOcupadas.map((r) => r.horaInicio);

    // 3. Filtrar turnos libres usando HORARIOS de constants.js
    const turnosLibres = HORARIOS.filter(
      (hora) => !horasOcupadas.includes(hora),
    );

    return res.status(200).json({
      success: true,
      fecha,
      canchas: [
        {
          _id: cancha._id,
          canchaId: cancha._id,
          nombreCancha: cancha.nombreCancha,
          precio: cancha.precio,
          fecha,
          turnosLibres,
          turnosOcupados: horasOcupadas,
        },
      ],
    });
  } catch (error) {
    console.error("DETALLE DEL ERROR 500 EN BACKEND:", error);
    return res.status(500).json({
      success: false,
      error: {
        mensaje: "Error al consultar disponibilidad",
        detalle: error.message,
      },
    });
  }
};
export const crearReservaCancha = async (req, res) => {
  try {
    const { nombreCliente } = req.body;
    const userId = req.user?.id || req.user?._id || req.usuario?._id;

    // Normalizar si viene en formato lote ({ reservas: [...] }) o individual (canchaId, fecha, turnos)
    let listaLote = [];
    if (Array.isArray(req.body.reservas) && req.body.reservas.length > 0) {
      listaLote = req.body.reservas;
    } else if (req.body.canchaId && req.body.fecha && Array.isArray(req.body.turnos)) {
      listaLote = [
        {
          canchaId: req.body.canchaId,
          fecha: req.body.fecha,
          turnos: req.body.turnos,
          precio: req.body.precio,
        },
      ];
    }

    if (listaLote.length === 0) {
      return res.status(400).json({
        mensaje: "Debes enviar al menos una reserva para procesar",
      });
    }

    // Resolver nombre del cliente
    let nombreFinal = nombreCliente;
    if (!nombreFinal && userId) {
      const usuarioEncontrado = await mongoose.model("Usuario").findById(userId).catch(() => null);
      nombreFinal = usuarioEncontrado?.nombre || usuarioEncontrado?.email?.split("@")[0];
    }
    if (!nombreFinal) {
      nombreFinal = "Cliente RollingClub";
    }

    // PASO 3: Validación de canchas y turnos para evitar colisiones
    const hace15Minutos = new Date(Date.now() - 15 * 60 * 1000);
    const turnosAInsertar = [];
    let totalGeneral = 0;

    for (const item of listaLote) {
      const { canchaId, fecha, turnos, precio } = item;

      if (!canchaId || !fecha || !Array.isArray(turnos) || turnos.length === 0) {
        return res.status(400).json({
          mensaje: "Cada item debe incluir canchaId, fecha y turnos válidos",
        });
      }

      const turnosLimpios = [...new Set(turnos.map((h) => String(h).trim()))];

      // Validar mapa de turnos si existe
      if (MAPA_TURNOS) {
        const invalidos = turnosLimpios.filter((hora) => !MAPA_TURNOS[hora]);
        if (invalidos.length > 0) {
          return res.status(400).json({
            mensaje: `Los siguientes horarios no son válidos: ${invalidos.join(", ")}`,
          });
        }
      }

      // Validar existencia de la cancha y precio
      const canchaExiste = await Cancha.findById(canchaId);
      if (!canchaExiste) {
        return res.status(404).json({
          mensaje: `La cancha solicitada (${canchaId}) no existe`,
        });
      }

      const precioUnitario = Number(precio) || Number(canchaExiste.precio) || 0;

      // Comprobar colisiones de turnos
      const turnosOcupados = await Reserva.find({
        cancha: canchaId,
        fechaJornada: fecha,
        horaInicio: { $in: turnosLimpios },$or: [
          { estado: "confirmada" },
          { estado: "pendiente", createdAt: { $gte: hace15Minutos } },
        ],
      }).select("horaInicio");

      if (turnosOcupados.length > 0) {
        const horasEnFalta = turnosOcupados.map((t) => t.horaInicio);
        return res.status(409).json({
          mensaje: `Conflicto: Los turnos ${horasEnFalta.join(", ")} en la cancha ${canchaExiste.nombreCancha || ""} ya no están disponibles.`,
        });
      }

      // Estructurar items temporales
      for (const hora of turnosLimpios) {
        totalGeneral += precioUnitario;
        turnosAInsertar.push({
          usuario: userId || null,
          cancha: canchaId,
          fechaJornada: fecha,
          nombreCliente: nombreFinal,
          horaInicio: hora,
          precio: precioUnitario,
          estado: "pendiente",
        });
      }
    }

    // Crear la instancia de OrdenListaReservas para obtener el ID de grupo
    const nuevaOrden = new OrdenListaReservas({
      usuario: userId || null,
      nombreCliente: nombreFinal,
      reservas: [],
      total: totalGeneral,
      estado: "pendiente",
    });

    // PASO 4: Asignar el mismo grupoId a todas las reservas e insertar con insertMany
    const reservasConGrupo = turnosAInsertar.map((reserva) => ({
      ...reserva,
      grupoId: nuevaOrden._id,
    }));

    const reservasGuardadas = await Reserva.insertMany(reservasConGrupo);

    // Asociar las reservas a la orden y guardar
    nuevaOrden.reservas = reservasGuardadas.map((r) => r._id);
    await nuevaOrden.save();

    // PASO 5: Devolver el ordenId / grupoId en la respuesta
    return res.status(201).json({
      success: true,
      mensaje: `Reserva registrada con éxito para ${reservasGuardadas.length} turno(s)`,
      ordenId: nuevaOrden._id,
      grupoId: nuevaOrden._id,
      reservas: reservasGuardadas,
    });
  } catch (error) {
    console.error("Error en crearReservaCancha:", error);
    return res.status(500).json({
      mensaje: "Error al procesar el lote de reservas",
      detalle: error.message,
    });
  }
};
export const obtenerMisReservasCancha = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("ID del usuario en el token:", userId);
    // Prueba temporal: ver todas las reservas sin filtrar por usuario
    const todas = await Reserva.find();
    console.log("Total de reservas en la base de datos:", todas.length);
    if (todas.length > 0) {
      console.log("Campo 'usuario' de la primera reserva:", todas[0].usuario);
    }

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
    const reserva = await Reserva.findOne({ _id: id, usuario: userId });

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
    const { estado } = req.query;
    const filtro = {};

    if (estado && ["pendiente", "confirmada", "cancelada"].includes(estado)) {
      filtro.estado = estado;
    }

    const reservas = await Reserva.find(filtro)
      .populate("cancha", "nombreCancha precio")
      .populate("usuario", "nombre email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      total: reservas.length,
      reservas,
    });
  } catch (error) {
    console.error("Error al listar reservas:", error);
    res.status(500).json({ mensaje: "Error al obtener las reservas" });
  }
};

// PATCH /api/reservas/:id/cancelar
export const cancelarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const reserva = await Reserva.findById(id);

    if (!reserva) {
      return res.status(404).json({ mensaje: "Reserva no encontrada" });
    }

    if (reserva.estado === "cancelada") {
      return res.status(400).json({ mensaje: "La reserva ya está cancelada" });
    }

    reserva.estado = "cancelada";
    await reserva.save();

    res.status(200).json({
      mensaje: "Reserva cancelada exitosamente",
      reserva,
    });
  } catch (error) {
    console.error("Error al cancelar la reserva:", error);
    res.status(500).json({ mensaje: "Error al cancelar la reserva" });
  }
};
