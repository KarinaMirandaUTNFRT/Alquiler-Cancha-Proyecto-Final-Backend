import jwt from "jsonwebtoken";

export const autenticador = (req, res, next) => {
  try {
    const token = req.cookies.token;
   
    if (!token) {
      return res
        .status(401)
        .json({ mensaje: "Acceso no autorizado, token faltante." });
    }
  
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

     req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    res.status(403).json({mensaje:'Token inválido o expirado'})
  }
};

export const esAdmin = (req, res, next)=>
{
        if(!req.user || req.user.rol !== 'Admin'){
        return res.status(403).json({mensaje: 'Acceso denegado: permisos insuficientes'})
    }
    next()
}