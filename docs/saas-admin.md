# Documentación API - SAAS Admin

Esta documentación detalla los endpoints para la gestión exclusiva de la plataforma SaaS. 

> [!IMPORTANT]
> **Seguridad (Vía Clerk):** Todos los endpoints listados a continuación están protegidos mediante **Clerk**.
> - **URL Base:** `http://localhost:3000/api/saas`
> - **Header:** `Authorization: Bearer <clerk_session_token>`.
> - **Aislamiento:** Esta autenticación y estas rutas son independientes del sistema de ventas.

### Estructura de Respuesta Estándar
```json
{
  "success": true | false,
  "message": "Descripción (opcional)",
  "data": { ... } // o un Array []
}
```

---

## 🏢 EMPRESAS

Endpoints para gestionar las empresas (clientes SaaS).

### `POST /api/saas/empresas` (Crear empresa completa)
Crea una empresa nueva con todo su ecosistema: usuario admin, suscripción pendiente, y catálogo de juegos+turnos por país.
- **Body:**
  ```json
  {
    "nombre_empresa": "Loteria El Sol",    // Requerido
    "nombre_admin": "Juan Pérez",          // Requerido
    "username": "juanperez",               // Requerido
    "password": "123456",                  // Requerido (mín. 6 caracteres)
    "email": "juan@loteriaelsol.com",      // Opcional (se genera automáticamente si no viene)
    "plan_id": 1,                          // Opcional (por defecto 1)
    "referencia_pago": "TRANSF-12345",     // Opcional
    "mensaje_ticket": "Gracias por su compra", // Opcional
    "whatsapp_enabled": true               // Opcional
  }
  ```
- **¿Qué sucede internamente?**
  1. Se crea la **Empresa**
  2. Se crea el **Usuario Admin** (rol `admin`, password hasheada)
  3. Se crea una **Suscripción pendiente** al plan indicado
  4. Se siembran **Juegos y Turnos** por defecto (Nicaragua, Costa Rica, Honduras, El Salvador)
  5. Todo en una **transacción** (si algo falla, se revierte todo)

- **Response (201):**
  ```json
  {
    "success": true,
    "message": "Empresa creada exitosamente con usuario admin, suscripción pendiente y catálogo de juegos.",
    "data": {
      "empresa": { "id": 5, "nombre": "Loteria El Sol", "estado": "activo" },
      "admin": { "id": 12, "nombre": "Juan Pérez", "username": "juanperez", "rol": "admin" },
      "suscripcion": { "id": 8, "estado": "pendiente", "plan_id": 1 }
    }
  }
  ```

### `GET /api/saas/empresas` (Listar empresas)
Obtiene todas las empresas con sus suscripciones y planes.
- **Response (200):**
  ```json
  {
    "success": true,
    "data": [
      { 
        "id": 1, 
        "nombre": "Loteria El Sol", 
        "estado": "activo",
        "Suscripcions": [{ "id": 1, "estado": "activa", "Plan": { "nombre": "Básico" } }]
      }
    ]
  }
  ```

### `GET /api/saas/empresas/:id` (Obtener detalle completo)
- **Params:** `id` = ID numérico de la empresa
- **Response (200):** Devuelve la empresa con sus suscripciones, planes y usuarios.
- **Response Error (404):** Si no existe.

### `PUT /api/saas/empresas/:id` (Editar empresa)
- **Params:** `id` = ID de la empresa
- **Body:** (Envía solo los campos que deseas actualizar)
  ```json
  {
    "nombre": "Lotería El Sol Update",
    "estado": "inactivo"
  }
  ```
- **Response (200):** Retorna la empresa actualizada.

### `DELETE /api/saas/empresas/:id` (Anular / Soft delete)
Cambia automáticamente el `estado` de la empresa a `inactivo`.

---

## 🔑 CREDENCIALES DE ADMINISTRADOR
Gestión de accesos para el dueño/admin de cada empresa.

### `GET /api/saas/empresas/:id/admin` (Ver Admin)
Obtiene los datos del usuario administrador de la empresa.
- **Response (200):**
  ```json
  {
    "success": true,
    "data": { "id": 12, "nombre": "Admin Sol", "username": "admin_sol", "rol": "admin" }
  }
  ```

### `PUT /api/saas/empresas/:id/admin/:usuarioId` (Cambiar Credenciales)
Permite resetear el `username` o `password` del administrador de la empresa.
- **Body:**
  ```json
  {
    "username": "nuevo_username", // Opcional
    "password": "nueva_password"   // Opcional (mín. 6 carcateres)
  }
  ```
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Credenciales de administrador actualizadas exitosamente"
  }
  ```

---
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Empresa anulada (inactiva) exitosamente",
    "data": { "id": 1, "estado": "inactivo" }
  }
  ```

---

## 💳 PLANES

### `POST /api/saas/planes` (Crear plan)
Crea un nuevo paquete para suscripciones
- **Body:**
  ```json
  {
    "nombre": "Plan Básico", // Requerido
    "precio": 29.99, // Opcional
    "limite_usuarios": 5, // Opcional
    "limite_turnos": 3, // Opcional
    "limite_numeros": 100, // Opcional
    "max_vendedores_por_punto": 1 // Opcional
  }
  ```

### `GET /api/saas/planes` (Listar planes)
- **Response (200):** Arreglo con la lista de planes disponibles.

### `PUT /api/saas/planes/:id` (Editar plan)
- **Params:** `id`
- **Body:** Solo los campos que se quieran modificar. 

### `DELETE /api/saas/planes/:id` (Anular plan)
- Cambia el `estado` a `inactivo`.

---

## 🎮 JUEGOS

Gestión global de reglas de juegos creadas para las empresas.

### `POST /api/saas/juegos`
- **Body:**
  ```json
  {
    "empresa_id": 1, // Requerido
    "nombre": "Loto 3D", // Requerido
    "tipo_numero": "3D", // Requerido (valores permitidos: '2D', '3D', 'fecha')
    "rango_min": 0, // Opcional
    "rango_max": 999, // Opcional
    "multiplicador_default": 600.00 // Opcional
  }
  ```

### `GET /api/saas/juegos` (Listar)
- **Response (200):** Retorna todos los juegos registrados.

### `PUT /api/saas/juegos/:id` (Editar)
- **Body:** Cualquier campo modificable como `nombre`, `tipo_numero`, `estado`.

### `DELETE /api/saas/juegos/:id` (Soft delete)
- Cambia `estado` a `inactivo`.

---

## ⏰ TURNOS

### `POST /api/saas/turnos`
Crea turnos vinculados de operación para los juegos de las empresas.
- **Body:**
  ```json
  {
    "empresa_id": 1, // Requerido
    "juego_id": 1, // Requerido
    "nombre": "Tarde", // Requerido
    "hora_sorteo": "15:00", // Requerido (formato HH:mm)
    "minutos_cierre_antes": 5, // Opcional
    "dias_activos": ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"] // Opcional
  }
  ```

### `GET /api/saas/turnos` (Listar turnos y filtrar)
- **Query Params:** `?juego_id=1` (Opcional. Retorna solo los turnos del juego ID 1).
- **Response (200):** Arreglo de turnos ordenados por `hora_sorteo`.

### `PUT /api/saas/turnos/:id` (Editar turno)
- Modifica campos como la hora o los días activos.

### `DELETE /api/saas/turnos/:id`
- Cambia `estado` a `inactivo`.

---

## 📄 SUSCRIPCIONES

Registros de cuando una empresa adquiere un plan determinado. Cuentan con flujo de aprobación e integración WhatsApp.

### `POST /api/saas/suscripciones` (Crear suscripción)
Registra que una empresa adquiere un plan. Su estado será `pendiente` inicialmente.
- **Body:**
  ```json
  {
    "empresa_id": 1, // Requerido
    "plan_id": 2, // Requerido
    "referencia_pago": "TRANSFERENCIA-12345", // Opcional
    "imagen_pago": "url-de-la-imagen.png" // Opcional
  }
  ```

### `GET /api/saas/suscripciones` (Listar suscripciones)
- **Response (200):** Retorna el historial de suscripciones, incluye datos poblados (Join) para que el Frontend muestre `nombre` de la empresa y del plan.

### `PUT /api/saas/suscripciones/:id/aprobar`
Aprueba una suscripción `pendiente`. Realiza el alta e ingresa fechas de validación.
- **Body (Opcional):**
  ```json
  {
    "telefono": "50499112233" 
  }
  ```
  *(Requerido si `whatsapp_enabled` de la empresa es true y quieres retornar un link de WhatsApp).*
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Suscripción aprobada exitosamente",
    "data": {
       "id": 1,
       "estado": "activa",
       "fecha_inicio": "...",
       "fecha_fin": "..."
    },
    "whatsappLink": "https://wa.me/50499112233?text=%C2%A1Hola%21..."
  }
  ```
  *(El frontend puede chequear si existe `whatsappLink` y abrirlo en una ventana nueva)*.

### `PUT /api/saas/suscripciones/:id/denegar`
- Rechaza transaccionalmente una suscripción.
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Suscripción denegada (rechazada)",
    "data": { "id": 1, "estado": "rechazada" }
  }
  ```
