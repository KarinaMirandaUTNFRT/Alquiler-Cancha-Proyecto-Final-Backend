#  Backend "Reserva de Cancha"

API RESTful desarrollada con **Node.js**, **Express** y **MongoDB** para la gestión del alquiler de canchas futbol 5 incluido un ecommerce de productos. Permite realizar operaciones CRUD (Crear, Leer, Actualizar y Eliminar canchas y productos) integrándose directamente con una base de datos en MongoDB Atlas y el pago con MercadoPago.

---

## 🚀 Características principales

- **Gestión de Canchas y productos:** Consulta de disponibilidad de turnos por fecha y hora sin solapamientos.
- **Reserva y Pago Directo:** Flujo optimizado para reservar y pagar en un solo paso mediante Mercado Pago (sin necesidad de carrito para el alquiler).
- **Módulo de Ecommerce:** Carrito de compras y gestión de órdenes para productos adicionales.
- **Sincronización vía Webhook:** Confirmación y cambio de estado de reservas/órdenes en tiempo real tras la acreditación del pago.
- **Autenticación y Autorización:** Registro, login y control de accesos mediante JWT (JSON Web Tokens) y contraseñas hasheadas con bcrypt.
- **Carga de Archivos:** Gestión de imágenes para canchas y productos (Multer).

---

## 🛠️ Tecnologías utilizadas

- **Entorno de ejecución:** [Node.js](https://nodejs.org/)
- **Framework web:** [Express.js](https://expressjs.com/)
- **Base de datos:** [MongoDB](https://www.mongodb.com/) con [Mongoose ODM](https://mongoosejs.com/)
- **Pasarela de pagos:** [Mercado Pago SDK](https://www.mercadopago.com.ar/developers/)
- **Seguridad:** [JSON Web Token (JWT)](https://jwt.io/), [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Gestión de variables de entorno:** [dotenv](https://github.com/motdotla/dotenv)
- **Herramientas de desarrollo:** [pnpm](https://pnpm.io/) / [nodemon](https://nodemon.io/)

---
## 📚 Documentación y Referencias

Enlaces oficiales a las librerías, middlewares y estándares utilizados en el desarrollo de la API:

* **[Express.js](https://expressjs.com/en/)**: Framework web minimalista para Node.js.
* **[CORS Middleware](https://expressjs.com/en/resources/middleware/cors/)**: Middleware para habilitar el intercambio de recursos de origen cruzado.
* **[Morgan](https://expressjs.com/en/resources/middleware/morgan/)**: Logger HTTP para registrar solicitudes en la consola.
* **[Mongoose ODM](https://mongoosejs.com/)**: Modelado de objetos y conexión para MongoDB.
* **[Express Validator](https://express-validator.github.io/docs/)**: Middleware de validación y sanitización de datos de entrada.
* **[JSON Web Tokens (JWT)](https://www.jwt.io/)**: Estándar para autenticación y manejo de sesiones seguras.
* **[Nodemailer](https://nodemailer.com/)**: Módulo para envío de correos electrónicos y notificaciones.
* **[Métodos de Petición HTTP (MDN)](https://developer.mozilla.org/es/docs/Web/HTTP/Reference/Methods)**: Referencia oficial sobre verbos REST (GET, POST, PUT, DELETE, etc.).
* **[Tabla de Códigos de Estado HTTP (HTTP Cats)](https://http.cat/)**: Guía visual de códigos de respuesta HTTP.
## 📁 Estructura del proyecto

```text
├── src/
│   ├── config/             # Configuración de base de datos y productos
│   ├── controllers/        # Controladores de lógica de negocio (pago, reservas, etc.)
│   ├── middlewares/        # Middlewares (autenticación JWT, subida de imágenes)
│   ├── models/             # Modelos y esquemas de Mongoose (Reserva, Producto, Usuario, Orden)
│   ├── routes/             # Definición de rutas y endpoints
│   ├── utils/              # Funciones auxiliares y helpers
│   └── index.js            # Punto de entrada de la aplicación
├── .env.example            # Variables de entorno de ejemplo
├── package.json
└── README.md

---

## 🛠️ Requisitos Previos

Antes de ejecutar este proyecto, asegúrate de tener instalado:

* [Node.js](https://nodejs.org/) (versión 18 o superior)
* [pnpm](https://pnpm.io/) o `npm`
* Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (o MongoDB ejecutándose de forma local)

---

## 📦 Instalación y Configuración

1. **Clonar el repositorio o navegar a la carpeta del proyecto:**
  https://github.com/KarinaMirandaUTNFRT/Alquiler-Cancha-Proyecto-Final-Backend.git
2. ** Instala dependencias y librerias utilizadas
   pnpm install

   "bcryptjs": "^3.0.3",
    "cloudinary": "^2.11.0",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.6",
    "express": "^5.2.1",
    "express-validator": "^7.3.2",
    "jsonwebtoken": "^9.0.3",
    "mercadopago": "^3.6.0",
    "mongoose": "^9.9.4",
    "morgan": "^1.11.0",
    "multer": "^2.3.0",
    "multer-storage-cloudinary": "^4.0.0",
    "nodemailer": "^9.0.6"


  ## Autores: Karina Miranda , Nair Paez