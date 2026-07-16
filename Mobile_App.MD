# Plan de Implementación - Mobile App (React Native) - Retail Edition

Este documento es el blueprint para construir la aplicación móvil que consumirá la API de **Retail SaaS**.

## 🏗️ Arquitectura Técnica Recomendada
- **Framework**: React Native (Expo recomendado).
- **Estado**: Redux Toolkit (para carrito de compras y sesión).
- **Networking**: Axios con interceptores para inyectar el header `Authorization`.

## 🔐 Flujo: Autenticación
Todas las pantallas (excepto Login) requieren validación del token.
- **Login**: `POST /api/auth/login` -> Guarda Token, Rol y `tienda_id`.

## 👤 Perfil: Vendedor (Ventas & Inventario)

### Pantalla 1: Dashboard Vendedor
- **Vista**: Resumen de caja abierta, ventas del turno y alertas de stock bajo.
- **Backend**: `GET /api/inventario/stock` y `GET /api/cajas`.

### Pantalla 2: Nueva Venta (POS Móvil)
- **Vista**: 
  1. Catálogo por Categorías (`GET /api/catalogo/categorias`).
  2. Búsqueda de Productos con Variantes (`GET /api/productos`).
  3. Carrito de Compras (Selección de variantes y cantidades).
- **Acción "Finalizar Venta"**:
  - **Backend**: `POST /api/ventas`
  - **Body**: `{ "tipo_pago": "contado", "metodo_pago": "efectivo", "caja_id": X, "items": [...] }`

### Pantalla 3: Gestión de Caja
- **Acción**: Reportar apertura/cierre de caja.
- **Backend**: `POST /api/cajas/abrir` / `POST /api/cajas/:id/cerrar`.

## 👑 Perfil: Administrador / Gestor

### Pantalla 4: Panel de Control Maestro
- **Vista**: Indicadores globales de ventas por tienda y rendimiento de inventario.
- **Backend**: `GET /api/ventas` (con filtros globales).

### Pantalla 5: Auditoría de Inventario
- **Vista**: Escaneo de códigos de barra para consulta de stock y ajustes rápidos.
- **Backend**: `POST /api/inventario/ajuste`.

## 📊 Mapa de Navegación (React Navigation)
1. **Login Stack**
2. **Main Tab Navigator** (Dashboard, Ventas, Inventario, Perfil).

---
*Nota: Se ha eliminado toda la lógica de Resultados/Sorteos ya que el sistema es ahora 100% Retail.*
