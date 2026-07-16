# Estructura del Proyecto: API Retail SaaS

Este esquema describe la organización desacoplada y escalable del sistema.

```text
API-RETAIL-SAAS-MOVIL/
│
├── config/              # 🔧 Configuración central (DB, JWT, Supabase)
│
├── controllers/         # 🎮 Controladores (Reciben HTTP -> Llaman Services)
│   ├── saas/            # 👑 Motor Operativo para el Gestor de la APP
│   ├── auth.controller.js
│   ├── producto.controller.js
│   └── venta.controller.js
│
├── middlewares/         # 🔐 Auth, Tenant isolation, Roles
│
├── models/              # 🧩 Sequelize models y Asociaciones
│   ├── index.js 🔥      # Punto central de relaciones
│   ├── Producto.js
│   ├── Variante.js
│   └── Venta.js
│
├── routes/              # 🚏 Definición de Endpoints
│   ├── saas.routes.js   # Rutas para el Gestor Global
│   └── index.js         # Rutas de Empresa/Tienda
│
├── services/            # 🧠 Lógica de Negocio (El Corazón de la API)
│   ├── saas/            # Monitoreo Maestro
│   ├── catalogo.service.js
│   ├── producto.service.js
│   └── venta.service.js
│
├── utils/               # 🧰 Helpers, Responses, Multer Config
│
├── validations/         # ✅ Esquemas JOI de validación Retail
│   └── venta.validation.js
│
├── scripts/             # 🛠️ Utilidades de sincronización y mantenimiento
│
├── API_DOCS.md          # 📖 Documentación técnica de referencia
├── Mobile_App.MD        # 📱 Guía para el equipo móvil
└── index.js             # 🚀 Punto de entrada del servidor
```

*Nota: Toda la lógica antigua de Lotería ha sido eliminada para evitar confusiones.*