# San Rafael - Sistema Médico API

API REST para la gestión integral de un sistema médico que incluye administración de pacientes, doctores, citas médicas, historias clínicas, departamentos y reseñas.

## Descripción

San Rafael es un backend completo desarrollado con Node.js y Express que proporciona una solución robusta para la gestión de servicios médicos. El sistema implementa autenticación JWT, control de acceso basado en roles (admin/doctor/paciente), recuperación de contraseña, almacenamiento de archivos en Cloudinary y validaciones exhaustivas con mensajes de error en español.

### Características principales

- **Autenticación y Autorización**: Sistema JWT con roles diferenciados y protección de rutas
- **Gestión de Usuarios**: Registro y administración de pacientes y doctores
- **Citas Médicas**: Programación y seguimiento de citas entre pacientes y doctores
- **Historias Clínicas**: Registro de diagnósticos, tratamientos y archivos adjuntos
- **Departamentos**: Organización de especialidades médicas
- **Reseñas**: Sistema de calificación y comentarios de pacientes hacia doctores
- **Recuperación de Contraseña**: Flujo completo con códigos de verificación por email
- **Almacenamiento en la Nube**: Integración con Cloudinary para imágenes y documentos
- **Seguridad**: Encriptación de contraseñas, rate limiting, CORS configurado, helmet para headers HTTP

## Tecnologías Utilizadas

- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de Datos**: MongoDB con Mongoose ODM
- **Autenticación**: JSON Web Tokens (JWT)
- **Almacenamiento**: Cloudinary
- **Validación**: Express Validator
- **Email**: Nodemailer
- **Seguridad**: Helmet, CORS, bcryptjs, express-rate-limit

## Requerimientos

Antes de instalar y ejecutar la aplicación, asegúrate de tener instalado:

- **Node.js**: versión 16.x o superior
- **npm**: versión 8.x o superior
- **MongoDB**: instancia local o MongoDB Atlas

## Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd San_Rafael
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables proporcionadas por el administrador.

## 4. Ejecución

### Modo desarrollo

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:4000`

### Modo producción

```bash
npm start
```

## Estructura del Proyecto

```
San_Rafael/
├── src/
│   ├── config.js                 # Configuración centralizada
│   ├── controllers/              # Lógica de negocio
│   │   ├── auth.controller.js
│   │   ├── pacientes.controller.js
│   │   ├── doctores.controller.js
│   │   ├── citas.controller.js
│   │   ├── departamentos.controller.js
│   │   ├── historias.controller.js
│   │   └── resenas.controller.js
│   ├── middlewares/              # Middlewares personalizados
│   │   ├── auth.middleware.js
│   │   └── validation.middleware.js
│   ├── models/                   # Modelos de Mongoose
│   │   ├── Paciente.js
│   │   ├── Doctor.js
│   │   ├── CitaMedica.js
│   │   ├── Departamento.js
│   │   ├── HistoriaClinica.js
│   │   └── Resena.js
│   ├── routes/                   # Definición de rutas
│   │   ├── auth.routes.js
│   │   ├── pacientes.routes.js
│   │   ├── doctores.routes.js
│   │   ├── citas.routes.js
│   │   ├── departamentos.routes.js
│   │   ├── historias.routes.js
│   │   └── resenas.routes.js
│   └── utils/                    # Utilidades
│       ├── cloudinary.js
│       └── email.js
├── app.js                        # Configuración de Express
├── database.js                   # Conexión a MongoDB
├── index.js                      # Punto de entrada
├── package.json
└── .env                          # Variables de entorno (no incluir en git)
```

## Endpoints Principales

### Autenticación
- `POST /api/registrarPacientes` - Registrar nuevo paciente
- `POST /api/iniciarSesion` - Iniciar sesión
- `POST /api/cerrarSesion` - Cerrar sesión
- `POST /api/recuperarContrasena/solicitarCodigo` - Solicitar código de recuperación
- `POST /api/recuperarContrasena/verificarCodigo` - Verificar código
- `POST /api/recuperarContrasena/nuevaContrasena` - Establecer nueva contraseña

### Pacientes
- `GET /api/pacientes` - Obtener todos los pacientes (Admin)
- `GET /api/pacientes/:id` - Obtener paciente por ID
- `PUT /api/pacientes/:id` - Actualizar paciente
- `DELETE /api/pacientes/:id` - Eliminar paciente (Admin)

### Doctores
- `GET /api/doctores` - Obtener todos los doctores
- `GET /api/doctores/:id` - Obtener doctor por ID
- `POST /api/doctores` - Crear doctor (Admin)
- `PUT /api/doctores/:id` - Actualizar doctor (Admin)
- `DELETE /api/doctores/:id` - Eliminar doctor (Admin)

### Citas Médicas
- `GET /api/citas` - Obtener todas las citas (Doctor/Admin)
- `GET /api/citas/:id` - Obtener cita por ID
- `POST /api/citas` - Crear cita
- `PUT /api/citas/:id` - Actualizar cita (Doctor/Admin)
- `DELETE /api/citas/:id` - Eliminar cita (Doctor/Admin)

### Departamentos
- `GET /api/departamentos` - Obtener todos los departamentos
- `GET /api/departamentos/:id` - Obtener departamento por ID
- `POST /api/departamentos` - Crear departamento (Admin)
- `PUT /api/departamentos/:id` - Actualizar departamento (Admin)
- `DELETE /api/departamentos/:id` - Eliminar departamento (Admin)

### Historias Clínicas
- `GET /api/historias` - Obtener todas las historias (Doctor/Admin)
- `GET /api/historias/:id` - Obtener historia por ID (Doctor/Admin)
- `POST /api/historias` - Crear historia clínica (Doctor/Admin)
- `PUT /api/historias/:id` - Actualizar historia (Doctor/Admin)
- `DELETE /api/historias/:id` - Eliminar historia (Doctor/Admin)

### Reseñas
- `GET /api/resenas` - Obtener todas las reseñas
- `GET /api/resenas/:id` - Obtener reseña por ID
- `POST /api/resenas` - Crear reseña
- `PUT /api/resenas/:id` - Actualizar reseña
- `DELETE /api/resenas/:id` - Eliminar reseña

## Roles y Permisos

### Admin
- Acceso completo a todos los endpoints
- Gestión de doctores y pacientes
- Administración de departamentos

### Doctor
- Gestión de citas médicas
- Creación y edición de historias clínicas
- Visualización de pacientes asignados

### Paciente
- Gestión de su propio perfil
- Creación de citas médicas
- Visualización de sus propias historias clínicas
- Creación de reseñas

## Seguridad

- Contraseñas encriptadas con bcryptjs
- Tokens JWT con expiración configurable
- Rate limiting para prevenir ataques de fuerza bruta
- CORS configurado para orígenes permitidos
- Helmet para headers HTTP seguros
- Validación de datos con express-validator
- Protección contra inyección NoSQL

## Manejo de Archivos

- Imágenes de perfil para pacientes y doctores
- Documentos adjuntos en historias clínicas (PDF, DOC, DOCX, imágenes)
- Límite de tamaño: 5MB por archivo
- Almacenamiento organizado por carpetas en Cloudinary
- Eliminación automática de archivos antiguos al actualizar

