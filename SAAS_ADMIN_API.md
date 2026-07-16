# 🚀 API de Administración Global (SaaS Owner Dashboard)

Este documento detalla el ecosistema de endpoints para el panel de administración global (dueño/owner de la aplicación SaaS). El desarrollador de la aplicación móvil debe utilizar esta guía para integrar la administración de empresas, usuarios administradores, planes, suscripciones y métricas globales.

---

## 🔐 1. Flujo de Autenticación del Dueño (SaaS Admin)

El **Dueño de la App (SaaS Owner)** se gestiona y autentica de la misma manera que los demás usuarios locales de la aplicación, utilizando credenciales locales y un token **JWT**.

### Paso 1: Inicio de Sesión (`POST /api/auth/login`)
El dueño debe iniciar sesión enviando las credenciales asignadas al rol `superadmin`.

* **Request Body (JSON)**:
```json
{
  "username": "superadmin",
  "password": "superadmin123" // Contraseña por defecto (se aconseja cambiar en producción)
}
```

* **Response JSON (200)**:
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // <-- TOKEN A GUARDAR
    "user": {
      "id": 1,
      "nombre": "Dueño del SaaS",
      "username": "superadmin",
      "rol": "superadmin",
      "empresa_id": null,
      "tienda_id": null
    },
    "empresa": null,
    "tienda": null
  }
}
```

### Paso 2: Interceptor del Token
Todas las rutas de administración global bajo `/api/saas/*` están protegidas. El desarrollador de la app móvil debe enviar el JWT obtenido en el inicio de sesión en los headers de cada petición HTTP:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

## 📊 2. Monitoreo y Métricas Globales (Dashboard)

Endpoints diseñados para dar visibilidad global de las operaciones del SaaS.

### 📈 Obtener Métricas Generales (`GET /api/saas/monitoreo`)
Muestra un resumen de ingresos y rendimiento general de las empresas hoy.

* **Response JSON (200)**:
```json
{
  "success": true,
  "message": "Métricas globales obtenidas",
  "data": {
    "totalEmpresas": 12,
    "ventasHoyGlobales": 5280.50,
    "rankingEmpresas": [
      { "nombre": "Tienda Calzado Sol", "total": 2450.00 },
      { "nombre": "Ropa y Moda VIP", "total": 1830.50 }
    ]
  }
}
```

### 🏢 Estado y Salud de Empresas (`GET /api/saas/status-empresas`)
Lista todas las empresas indicando su cantidad de sucursales activas y si tienen suscripción activa.

* **Response JSON (200)**:
```json
{
  "success": true,
  "message": "Estado de empresas obtenido",
  "data": [
    {
      "id": 1,
      "nombre": "Calzado Walner",
      "tiendasCount": 2,
      "activeStatus": "activo"
    },
    {
      "id": 2,
      "nombre": "Boutique Bella",
      "tiendasCount": 1,
      "activeStatus": "inactivo"
    }
  ]
}
```

---

## 🏢 3. Gestión de Empresas y sus Administradores

Permite crear una nueva empresa desde cero, asignarle su primer administrador, editar su perfil o desactivarla.

### 🆕 Registrar Empresa y Admin (`POST /api/saas/empresas`)
Crea la empresa, siembra automáticamente el catálogo básico de inicio, configura la primera sucursal ("Sucursal Principal"), crea las credenciales del Administrador de la empresa, y genera una suscripción inicial en estado `'pendiente'`.

* **Request JSON (Body)**:
```json
{
  "nombre_empresa": "Distribuidora del Norte", // (R) Nombre de la empresa
  "nombre_admin": "Juan Pérez",                // (R) Nombre completo del administrador de la empresa
  "username": "juan.admin",                     // (R) Username para el login del admin de la empresa
  "password": "passwordSegura123",              // (R) Contraseña del admin (Mín. 6 caracteres)
  "email": "juan@distribuidoranorte.com",       // (O) Correo electrónico
  "plan_id": 1,                                 // (O) ID del plan inicial (Default: 1)
  "referencia_pago": "REF-9988",                // (O) Referencia de pago inicial si aplica
  "mensaje_ticket": "¡Gracias por su compra!",  // (O) Pie de página de factura
  "whatsapp_enabled": true                      // (O) Notificaciones de cobro/suscripción por WhatsApp
}
```

* **Response JSON (201)**:
```json
{
  "success": true,
  "message": "Empresa creada exitosamente con usuario admin, suscripción pendiente y catálogo de juegos.",
  "data": {
    "empresa": {
      "id": 5,
      "nombre": "Distribuidora del Norte",
      "estado": "activo",
      "updatedAt": "2026-07-16T12:00:00.000Z",
      "createdAt": "2026-07-16T12:00:00.000Z"
    },
    "admin": {
      "id": 15,
      "nombre": "Juan Pérez",
      "username": "juan.admin",
      "rol": "admin"
    },
    "suscripcion": {
      "id": 8,
      "empresa_id": 5,
      "plan_id": 1,
      "estado": "pendiente",
      "referencia_pago": "REF-9988"
    }
  }
}
```

### 📋 Listar y Editar Empresas
* **Listar todas las empresas**: `GET /api/saas/empresas`
* **Ver detalle de una empresa**: `GET /api/saas/empresas/:id`
* **Editar Perfil**: `PUT /api/saas/empresas/:id`
  * *Request Body*: `{ "nombre": "Nuevo Nombre", "mensaje_ticket": "...", "whatsapp_enabled": true, "estado": "activo" }`
* **Desactivar Empresa (Soft Delete)**: `DELETE /api/saas/empresas/:id`

### 🔑 Gestión de Credenciales del Administrador de la Empresa
Si el cliente olvida su clave o quiere actualizar su usuario administrador principal.

* **Obtener credenciales del Admin**: `GET /api/saas/empresas/:id/admin`
* **Actualizar usuario o clave del Admin**: `PUT /api/saas/empresas/:id/admin/:usuarioId`
  * *Request Body*:
  ```json
  {
    "username": "nuevo.admin.user", // (O)
    "password": "nuevaClaveSuperSegura" // (O)
  }
  ```

---

## 💳 4. Gestión de Planes de Suscripción

Los planes controlan las restricciones del sistema para cada empresa (número de usuarios, sucursales, límites de productos, etc.).

* **Listar Planes**: `GET /api/saas/planes`
* **Crear Plan**: `POST /api/saas/planes`
  * *Request Body*:
  ```json
  {
    "nombre": "Plan Premium Ropa",         // (R)
    "precio": 39.99,                       // (O)
    "limite_usuarios": 10,                 // (O) Límite de empleados creados
    "limite_turnos": 30,                   // (O) Límite de cierres/aperturas de caja al mes
    "limite_numeros": 1000,                // (O)
    "max_vendedores_por_punto": 4,         // (O)
    "estado": "activo"                     // (O) [activo, inactivo]
  }
  ```
* **Editar Plan**: `PUT /api/saas/planes/:id` (Permite actualizar precios o límites)
* **Desactivar Plan (Soft Delete)**: `DELETE /api/saas/planes/:id`

---

## 📆 5. Flujo de Suscripciones (Aprobación y Renovación)

El motor financiero se apoya en aprobaciones manuales de los comprobantes de pago cargados por los clientes.

### 📋 Listar Suscripciones (`GET /api/saas/suscripciones`)
Permite ver las suscripciones para auditoría y aprobación.

* **Query Params (Filtros Opcionales)**:
  * `estado`: `pendiente`, `activa`, `rechazada`
  * `empresa_id`: ID numérico de una empresa específica.
* **Response JSON (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 8,
      "empresa_id": 5,
      "plan_id": 1,
      "estado": "pendiente",
      "referencia_pago": "REF-9988",
      "imagen_pago": "https://supabase.../comprobantes/...",
      "fecha_inicio": null,
      "fecha_fin": null,
      "Empresa": {
        "id": 5,
        "nombre": "Distribuidora del Norte",
        "whatsapp_enabled": true
      },
      "Plan": {
        "id": 1,
        "nombre": "Plan Básico",
        "precio": 19.99
      }
    }
  ]
}
```

### ✅ Aprobar Pago y Activar/Renovar Suscripción (`PUT /api/saas/suscripciones/:id/aprobar`)
Este endpoint es el **núcleo de las activaciones y renovaciones**. Realiza automáticamente los siguientes cálculos inteligentes en base al estado de la empresa:
1. **Caso A (Mismo Plan - Renovación)**: Si la empresa ya tiene un plan activo y decide pagar otra cuota del mismo plan, la nueva fecha de inicio se encadena exactamente al final de la anterior (`fecha_fin` del anterior) por 30 días más, acumulando el tiempo sin solaparse.
2. **Caso B (Diferente Plan - Upgrade/Downgrade)**: Si la empresa decide cambiar de plan, la suscripción anterior se da por terminada hoy mismo y el nuevo plan entra en efecto inmediato respetando la fecha de vencimiento extendida.
3. **Caso C (Primer Pago o Vencido)**: Activa la suscripción inmediatamente por 30 días a partir de hoy.

* **Request JSON (Body)**:
```json
{
  "telefono": "8095551234" // (O) Teléfono del administrador de la empresa para notificar
}
```
* **Response JSON (200)**:
  * Retorna la suscripción actualizada y, si la empresa tiene WhatsApp activo, genera un `whatsappLink` pre-formateado que permite al dueño abrir WhatsApp y enviarle un mensaje pre-diseñado al cliente notificando la aprobación.
```json
{
  "success": true,
  "message": "Suscripción aprobada exitosamente",
  "data": {
    "id": 8,
    "estado": "activa",
    "fecha_inicio": "2026-07-16T12:00:00.000Z",
    "fecha_fin": "2026-08-16T12:00:00.000Z"
  },
  "whatsappLink": "https://api.whatsapp.com/send?phone=8095551234&text=..."
}
```

### ❌ Denegar/Rechazar Pago (`PUT /api/saas/suscripciones/:id/denegar`)
Marca la suscripción como `rechazada` (por ejemplo, si el comprobante de transferencia es falso o inválido).

### 📝 Editar Suscripción Manual (`PUT /api/saas/suscripciones/:id`)
Permite corregir de manera forzada fechas de inicio, vencimiento, o cambiar el plan manualmente.

* **Request JSON (Body)**:
```json
{
  "plan_id": 2, // (O)
  "estado": "activa", // (O) [pendiente, activa, rechazada]
  "fecha_inicio": "2026-07-10T12:00:00.000Z", // (O)
  "fecha_fin": "2026-08-20T12:00:00.000Z" // (O)
}
```
