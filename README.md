# Retail SaaS API — Platform Backend

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5-blue.svg)](https://expressjs.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-ORM-blueviolet.svg)](https://sequelize.org/)
[![MySQL](https://img.shields.io/badge/MySQL-Database-orange.svg)](https://www.mysql.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Storage-emerald.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/license-ISC-brightgreen.svg)]()

Bienvenido al repositorio oficial del backend de la plataforma **Retail SaaS API**. Un sistema de gestión multi-tenant para comercios de retail (tiendas de ropa, calzado, accesorios y puntos de venta físicos).

Esta API provee un ecosistema completo que abarca desde la administración global de empresas y suscripciones por parte del **SaaS Owner** (Superadmin), hasta la operación diaria de sucursales, inventarios variantes, caja registradora, crédito/abonos, ventas e informes analíticos.

---

## Características Principales

### 1. Arquitectura Multi-Tenant Aislada

- **Aislamiento Estricto**: Filtrado automático de consultas por `empresa_id` y `tienda_id` mediante middlewares tenant.
- **Auto-Onboarding**: Registro simplificado de empresas con creación automática de sucursal principal, usuario administrador y catálogo base.

### 2. Ecosistema SaaS Global (Superadmin Dashboard)

- **Monitoreo Global**: Dashboard con métricas agregadas de facturación diaria, ventas globales y ranking de tiendas.
- **Gestión de Planes y Suscripciones**: Definición de planes, límites de uso y flujo de validación de pago con comprobantes bancarios.
- **Configuración Centralizada**: Gestión de categorías globales y estado operativo de tenants.

### 3. Catálogo Inteligente y Variantes de Productos

- **Modelado Flexible**: Soporte para productos con variantes infinitas (combinación de Atributos como Talla, Color, Material, etc.).
- **Imágenes en la Nube**: Integración nativa con **Supabase Storage** para la subida de imágenes de productos y comprobantes de pago.
- **Códigos de Barra y SKUs**: Asignación y búsqueda rápida mediante lectoras de código de barras en POS.

### 4. Inventarios y Transferencias Inter-Sucursales

- **Control de Stock Dinámico**: Registro de movimientos de entrada, salida, ajustes y devoluciones.
- **Transferencias entre Tiendas**: Envío y recepción de mercancía entre diferentes sucursales con validación de estados.
- **Alertas de Reorden**: Identificación de stock bajo en tiempo real.

### 5. Punto de Venta (POS), Cajas y Facturación

- **Operación Transaccional de Venta**: Garantía de idempotencia a través de `request_id` para evitar duplicados en redes inestables.
- **Arqueo y Apertura/Cierre de Caja**: Control estricto de dinero en efectivo, movimientos de entrada/salida y cierre de turno.
- **Ventas a Crédito y Abonos**: Historial de cartera de clientes, estados de cuenta y registro de abonos parciales.

### 6. Gastos, Devoluciones y Reportes

- **Control de Gastos Operativos**: Categorización de egresos por sucursal.
- **Gestión de Devoluciones**: Reembolsos e reincorporación de productos al inventario.
- **Reportes Analíticos**: Exportación e inspección de reportes de ventas, rendimiento por vendedor y márgenes de ganancia.

---

## Tecnologías Utilizadas

- **Core**: Node.js (ES Modules)
- **Framework Web**: Express.js (v5)
- **ORM / Base de Datos**: Sequelize ORM con MySQL (mysql2 driver)
- **Almacenamiento de Archivos**: Supabase Storage & Multer
- **Seguridad**: JWT (JSON Web Tokens), Helmet, Bcryptjs, CORS
- **Validación de Datos**: Joi
- **Pruebas de Carga & Tareas**: AutoCannon, Node-cron
- **Logging & Monitoreo**: Morgan

---

## Estructura del Proyecto

```text
API-VENTA-SAAS-MOVIL/
├── config/                # Configuraciones de Sequelize DB, JWT y Entorno
├── controllers/           # Controladores de la lógica de aplicación por dominio
│   └── saas/              # Controladores exclusivos del Superadmin SaaS
├── database/              # Conexión y scripts de inicialización de la base de datos
├── docs/                  # Documentación técnica adicional en Markdown
├── empresas/              # Módulo de administración de empresas
├── middlewares/           # Tenant, Auth, Roles, Idempotencia, Uploads y Validaciones
├── models/                # Modelos Sequelize (Empresa, Venta, Producto, Usuario, etc.)
├── planes/                # Módulo de gestión de planes SaaS
├── routes/                # Rutas Express (Auth, Productos, Inventario, Ventas, etc.)
├── scripts/               # Scripts de sincronización, semillas y parches de base de datos
├── services/              # Capa de servicios de negocio
├── suscripciones/         # Módulo de suscripciones y facturación SaaS
├── tests/                 # Scripts de prueba e integración
├── utils/                 # Helpers (Supabase, Multer, Respuestas, WhatsApp)
├── validations/           # Schemas de validación Joi
├── .env.example           # Plantilla de variables de entorno
├── index.js               # Punto de entrada principal del servidor Express
└── package.json           # Dependencias y scripts del proyecto
```

---

## Instalación y Configuración

### 1. Requisitos Previos

- **Node.js**: v18.0.0 o superior
- **MySQL**: v8.0 o superior (o servicio gestionado como Railway, PlanetScale, Aven, etc.)
- **Cuenta de Supabase**: Para la gestión del Bucket de imágenes.

### 2. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/API-VENTA-SAAS-MOVIL.git
cd API-VENTA-SAAS-MOVIL
```

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env` y ajusta las credenciales:

```bash
cp .env.example .env
```

Edita `.env` con tus datos de base de datos MySQL, JWT y Supabase:

```env
PORT=3000
NODE_ENV=development

MYSQLHOST=localhost
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=tu_password
MYSQLDATABASE=app_retail_saas

JWT_SECRET=super_secret_key_pro
JWT_EXPIRES_IN=24h

SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_supabase_anon_key
SUPABASE_BUCKET=comprobantes
```

### 5. Sincronizar Base de Datos y Cargar Datos Iniciales

Ejecuta el script de sincronización de la base de datos:

```bash
npm run db:force
```

_(Opcional)_ Para poblar los planes iniciales del SaaS:

```bash
node scripts/seed_retail_plans.js
```

---

## Ejecución del Proyecto

### Modo Desarrollo (con live-reload via Nodemon)

```bash
npm run dev
```

### Modo Producción

```bash
npm start
```

El servidor iniciará en el puerto especificado (por defecto `http://localhost:3000`). Puedes realizar una prueba de salud consultando:

```http
GET http://localhost:3000/
```

Respuesta esperada:

```json
{
  "success": true,
  "message": "RETAIL SAAS API",
  "status": "online",
  "version": "1.0.0"
}
```

---

## Resumen de Endpoints Principales

| Módulo           | Método     | Ruta                         | Descripción                                | Rol Mínimo   |
| :--------------- | :--------- | :--------------------------- | :----------------------------------------- | :----------- |
| **Auth**         | `POST`     | `/api/auth/login`            | Inicio de sesión y generación de JWT       | Público      |
| **Auth**         | `POST`     | `/api/auth/register-empresa` | Registro de empresa + admin + plan inicial | Público      |
| **SaaS Admin**   | `GET`      | `/api/saas/monitoreo`        | Dashboard global de métricas SaaS          | `superadmin` |
| **SaaS Admin**   | `GET`      | `/api/saas/empresas`         | Listado y administración de tenants        | `superadmin` |
| **SaaS Admin**   | `POST`     | `/api/saas/planes`           | Crear nuevos planes de suscripción         | `superadmin` |
| **Tiendas**      | `GET/POST` | `/api/tiendas`               | Listar / Crear sucursales                  | `admin`      |
| **Usuarios**     | `GET/POST` | `/api/usuarios`              | Gestión de personal y asignación de rol    | `admin`      |
| **Productos**    | `GET/POST` | `/api/productos`             | Crear y consultar productos con variantes  | `vendedor`   |
| **Inventario**   | `POST`     | `/api/inventario/transferir` | Crear transferencia entre sucursales       | `supervisor` |
| **Cajas**        | `POST`     | `/api/cajas/abrir`           | Apertura de turno de caja registradora     | `vendedor`   |
| **Ventas (POS)** | `POST`     | `/api/ventas`                | Procesamiento transaccional de venta       | `vendedor`   |
| **Clientes**     | `POST`     | `/api/clientes/:id/abonos`   | Registrar abono a cuenta corriente         | `vendedor`   |
| **Reportes**     | `GET`      | `/api/reportes/ventas`       | Reportes detallados de facturación         | `admin`      |

Para una referencia exhaustiva de payloads y parámetros HTTP, consulta los documentos de la carpeta `/docs` o los archivos `API_DOCS.md` y `SAAS_ADMIN_API.md`.

---

## Roles y Seguridad

El sistema maneja un control de acceso basado en roles (**RBAC**):

1. **`superadmin`**: Propietario de la plataforma SaaS. Acceso total al panel `/api/saas/*`.
2. **`admin`**: Administrador de la Empresa / Tenant. Control total sobre sucursales, usuarios, precios e inventarios.
3. **`supervisor`**: Supervisa operaciones de caja, inventario y transferencias en sucursales asignadas.
4. **`vendedor`**: Operador de POS. Realiza aperturas/cierres de caja, cobros y ventas directas.

---

## Licencia

Este proyecto se encuentra bajo la licencia **ISC**.
