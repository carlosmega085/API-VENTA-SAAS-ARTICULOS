🎯 1. VISIÓN DEL SISTEMA
🎯 Objetivo

Construir una API SaaS multi-tenant para gestión de rifas/loterías que permita:

Multiempresa (cada negocio aislado)
Multiusuario (admin + vendedores)
Control de números por límite
Ventas en tiempo real con concurrencia segura
Reportes optimizados
Sistema de suscripciones manual validado
🧠 2. PRINCIPIOS CLAVE (NO NEGOCIABLES)
🔥 Multi-tenant obligatorio

Todo lleva:

empresa_id
🔥 Consistencia de datos
❌ NO eliminar registros
✅ usar:
estado: 'activo' | 'inactivo' | 'anulado'
🔥 Concurrencia (CRÍTICO)
Uso de transacciones Sequelize
Evitar doble venta simultánea
🔥 Performance
Uso de acumulado🏢 3. MODELO DE BASE DE DATOS (ARQUITECTURA v2.0)

### juegos
- id | empresa_id
- nombre | tipo_numero (2D, 3D, fecha)
- timezone (ej: America/Costa_Rica)
- multiplicador_default | estado

### empresas
- id | nombre
- **mensaje_ticket** (Configurable por negocio para leyenda legal)
- estado

### turnos
- id | juego_id | empresa_id
- nombre | hora_sorteo (HH:MM:SS)
- minutos_cierre_antes | dias_activos (JSON) | estado

### limite_numeros (Global) | limite_vendedor (Específico)
- id | empresa_id | juego_id | turno_id | usuario_id (solo en vendedor)
- numero | monto_maximo | fecha (Opcional para límites temporales)

### configuracion_pagos
- id | empresa_id | punto_venta_id (NULL para global) | juego_id
- multiplicador | estado

### ventas (CABECERA)
- id | empresa_id | usuario_id | punto_venta_id
- juego_id | turno_id | **fecha** (Dimensión Obligatoria)
- **codigo_ticket** (UUID) | **request_id** (Idempotencia) | total | estado

### detalles_ventas
- id | venta_id | numero | monto
- estado_premio (pendiente | ganador | perdedor | pagado)
- monto_premio (Liquidación final)
- **monto_premio_potencial** (Proyección inicial en ticket)

### acumulado_numeros
- id | empresa_id | juego_id | turno_id | **fecha** | numero | total_vendido

---

🧠 4. PRINCIPIOS DE INTEGRIDAD v2.0

1. **Segmentación por Fecha Absoluta**: Toda operación transaccional requiere la triada `juego_id + turno_id + fecha`. Esto evita drift de datos entre sorteos.
2. **Idempotencia Nativa**: El uso de `request_id` en la capa de servicio previene duplicados accidentales.
3. **Bloqueo de Concurrencia**: Uso de `SELECT FOR UPDATE` (via Sequelize `LOCK.UPDATE`) en la tabla de acumulados durante la transacción de venta.
4. **Motor de Tiempo**: La lógica de cierre no vive en la DB, sino en `TurnoService`, validando la hora local del juego contra la hora del sorteo.

---

💰 VENTAS (LÓGICA v2.0)
1. **Validación Pre-Transacción**: Idempotencia (`request_id`) y Estado de Turno (`TurnoService`).
2. **Inicio de Transacción**.
3. **Validación de Formato**: Según el `tipo_numero` del juego.
4. **Reserva de Cupo**: `findOrCreate` con bloqueo en `AcumuladoNumero`.
5. **Control de Riesgo**: Validación contra `LimiteNumero` y `LimiteVendedor`.
6. **Emisión**: Generación de UUID y Firma Hash para QR.
7. **Commit**.

---

🏆 PREMIACIÓN v2.0
1. **Registro**: Se ingresa resultado para `juego_id`, `turno_id` y `fecha`.
2. **Cálculo de Multiplicador**: Búsqueda jerárquica (POS -> Empresa -> Juego Default).
3. **Liquidación**: Actualización masiva de `detalles_ventas` filtrando por las 3 dimensiones obligatorias.

---

🚀 5. FLUJO OPERATIVO DEL ADMINISTRADOR (ONBOARDING PLUG & PLAY)

Para garantizar una operación sin errores y un inicio rápido, el sistema sigue este flujo:

1. **Registro de Empresa (`AuthService`)**:
   - Al registrarse, el sistema ejecuta el `CatalogService` que siembra automáticamente los juegos y turnos de **Nicaragua, Costa Rica, Honduras y El Salvador**.
   - Se configuran automáticamente los tipos (2D, 3D, Fecha), rangos y zonas horarias.

2. **Alta de Sucursales (`PuntoVenta`)**:
   - El Admin crea sus puntos físicos de venta.
   - Cada sucursal heredará los juegos del catálogo general pero puede tener sus propios límites.

3. **Gestión de Vendedores (`Usuario`)**:
   - El Admin crea cuentas para sus vendedores y los asigna a un Punto de Venta específico.

4. **Personalización (Opcional)**:
   - **Límites**: El Admin puede ajustar el riesgo global o por vendedor para números específicos.
   - **Premios**: Puede configurar multiplicadores especiales para incentivar ventas en sucursales específicas.

5. **Operación Real**:
   - Los vendedores inician sesión y el sistema ya tiene cargados todos los juegos y turnos vigentes del día.
   - El cierre de ventas se aplica automáticamente 1 minuto antes de cada sorteo.

---

TECNOLOGÍAS: Node.js, Express, Sequelize (MySQL), JWT, Joi, Bcrypt, Crypto (QR Hash), Date-fns.
ESQUEMA: ES Modules. Diseño: Controllers -> Services -> Models.