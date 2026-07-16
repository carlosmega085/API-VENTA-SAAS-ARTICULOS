# 📚 Manual Técnico de Integración: API Retail SaaS (v3.2)

Este documento detalla los endpoints y la obligatoriedad de sus campos.
- **(R)** = Requerido (Obligatorio)
- **(O)** = Opcional

---

## 🔐 1. Autenticación y Acceso
Base URL: `/api/auth`

### Login (`POST /login`)
- **JSON Request**:
```json
{
  "username": "admin", // (R)
  "password": "123"    // (R)
}
```

### Registro de Empresa (`POST /register-empresa`)
*Multipart/form-data*
- `nombre_empresa` (R)
- `plan_id` (R)
- `nombre_admin` (R)
- `username` (R)
- `password` (R)
- `referencia_pago` (O)
- `comprobante` (O) - Imagen de soporte.

**Nota**: El registro crea automáticamente una "Sucursal Principal" y vincula al usuario administrador a ella. También siembra un catálogo básico (Categorías y Atributos).

- **Response Highlights**:
```json
{
  "success": true,
  "data": {
    "empresa": { "id": 1, "nombre": "..." },
    "admin": { "id": 1, "username": "...", "tienda_id": 1 },
    "tienda": { "id": 1, "nombre": "Sucursal Principal" }
  }
}
```

---

## 🏢 2. Administración de Empresa y Tiendas
Base URL: `/api`

### Configurar Perfil Empresa (`PUT /empresa/me`)
- **JSON Request**:
```json
{
  "nombre": "Nueva Moda",          // (O)
  "mensaje_ticket": "¡Gracias!"    // (O)
}
```

### Crear Tienda/Sucursal (`POST /tiendas`)
- **JSON Request**:
```json
{
  "nombre": "Sucursal Central", // (R)
  "ubicacion": "Av. Principal",  // (O)
  "telefono": "809-000-0000"    // (O)
}
```

### Gestión de Personal (`POST /usuarios`)
- **JSON Request**:
```json
{
  "nombre": "Juan Pérez",      // (R)
  "username": "juan.v",        // (R)
  "password": "abc",           // (R)
  "rol": "vendedor",           // (R) [admin, supervisor, vendedor]
  "tienda_id": 1               // (R)
}
```

---

## 🏷️ 3. Catálogo y Productos

### Crear Producto Completo (`POST /api/productos`)
*Multipart/form-data*
- **productData (JSON String)**:
```json
{
  "nombre": "Camisa Denim", // (R)
  "categoria_id": 1,        // (R)
  "codigo_barra": "750123456789", // (O) - Código Base
  "descripcion": "..."      // (O)
}
```
- **variantsData (JSON String Array)**:
```json
[
  { 
    "sku": "DENIM-S",          // (R)
    "codigo_barra": "750123456789-S", // (O) - Código Específico
    "precio_venta": 35.0,      // (R)
    "costo": 15.0,             // (R)
    "atributo_valor_ids": [1]  // (O)
  }
]
```

---

## 📦 4. Inventario y Stock

### Ajuste Manual (`POST /api/inventario/ajuste`)
- **JSON Request**:
```json
{
  "producto_variante_id": 10,   // (R)
  "cantidad": 5,                // (R)
  "tipo": "entrada",            // (R) [entrada, salida]
  "motivo": "Ajuste de inventario" // (O)
}
```

### Listar Movimientos (`GET /api/inventario/movimientos`)
- **Query Params**: `tienda_id` (R), `tipo` (O*), `producto_variante_id` (O).
*Tipos: compra, venta, devolucion, ajuste_positivo, ajuste_negativo, transferencia_entrada, transferencia_salida.*

- **Response Structure**:
```json
{
  "id": 10,
  "tipo": "ajuste_positivo",
  "cantidad": 15,
  "ProductoVariante": {
    "Producto": { "nombre": "Camisa Denim" },
    "atributos": [
      { "valor": "M", "Atributo": { "nombre": "Talla" } }
    ]
  }
}
```

---

## 👥 5. Gestión de Clientes
Base URL: `/api/clientes`

### Listar Clientes (`GET /`)
- **Response**: Array de objetos de cliente con `saldo_pendiente`.

### Crear Cliente (`POST /`)
- **JSON Request**:
```json
{
  "nombre": "Pedro Lopez", // (R)
  "cedula": "001-0000000-1", // (O)
  "telefono": "809-111-2222", // (O)
  "direccion": "Calle Falsa 123" // (O)
}
```

---

## 💰 6. Flujo de Caja y Ventas

### Caja Activa (`GET /api/cajas/activa`)
- **Descripción**: Obtiene la caja que se encuentra actualmente abierta en la tienda del usuario.
- **Response**: Devuelve el objeto `Caja` o `null` si no hay cajas abiertas en la tienda.

### Abrir Caja (`POST /api/cajas/abrir`)
- **JSON Request**: 
```json
{ 
  "monto_inicial": 500.00,
  "usuario_id": 10 // (O*) Solo permitido para rol 'admin' (para aperturar caja a otro usuario)
} 
```
- **Nota**: Si un `vendedor` envía `usuario_id`, el sistema lo ignorará y usará su propio ID por seguridad.
- **Error (400)**: `"La caja '...' ya se encuentra abierta..."` (Indica que la sesión sigue activa).

### Listado de Ventas (`GET /api/ventas`)
- **Query Params**: `fecha_inicio`, `fecha_fin` (Formato: YYYY-MM-DD)
- **Response Structure**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 150,
      "numero_factura": "000045",
      "total": 150.00,
      "Tienda": { "nombre": "Tienda Central" },
      "Cliente": { "nombre": "Consumidor Final", "identificacion": "..." },
      "detalles": [
        {
          "cantidad": 2,
          "precio_unitario": 75.00,
          "ProductoVariante": {
            "Producto": { "nombre": "Nombre del Producto" }
          }
        }
      ]
    }
  ]
}
```

### Registro de Venta Atómica (`POST /api/ventas`)
- **JSON Request**:
```json
{
  "tipo_pago": "contado",       // (R) [contado, credito]
  "metodo_pago": "efectivo",    // (R) [efectivo, tarjeta, transferencia]
  "items": [                    // (R)
    { "producto_variante_id": 5, "cantidad": 2 }
  ],
  "cliente_id": 10,             // (O*) - Requerido si tipo_pago es 'credito'
  "descuento": 0.00             // (O)
}
```
- **Response Highlight**: 
La respuesta incluye los nuevos campos de auditoría y facturación:
```json
{
  "id": 150,
  "secuencia_venta": 45,        // Número entero correlativo por empresa
  "numero_factura": "000045",   // Formato 6 dígitos para tickets
  "total": 70.00,
  "detalles": [...]
}
```

---

## 7. Gestión de Compras y Proveedores
Base URL: `/api/compras`

### Registrar Proveedor (`POST /proveedores`)
- **Body**: `{ "nombre": "Distribuidora X", "rnc": "123", "telefono": "...", "direccion": "..." }`
- **Response**: `{ "success": true, "data": { "id": 1, "nombre": "Distribuidora X" } }`

### Registrar Compra (`POST /`)
- **Body**:
```json
{
  "proveedor_id": 1,        // (R)
  "metodo_pago": "efectivo",// (R)
  "tienda_id": 1,           // (R)
  "items": [                // (R)
    { "producto_variante_id": 10, "cantidad": 100, "costo_unitario": 10.00 }
  ]
}
```

---

## 🔁 8. Devoluciones y Garantías
Base URL: `/api/devoluciones` (Require: `supervisor` o `admin`)

### Listar Devoluciones (`GET /`)
- **Query Params**: `tienda_id` (O), `desde` (O), `hasta` (O).
- **Response Structure**:
```json
{
  "id": 1,
  "monto_total": "150.00",
  "motivo": "Defecto",
  "Venta": { "id": 100, "numero_factura": "000045" },
  "Tienda": { "id": 1, "nombre": "Tienda A" },
  "Usuario": { "id": 5, "nombre": "Juan Pérez" }
}
```

### Obtener Detalle de Devolución (`GET /:id`)
- **Response**: Mismo objeto que el listado, pero incluye arreglo `detalles` con productos devueltos y sus atributos.

### Procesar Devolución (`POST /`)
- **Body**:
```json
{
  "venta_id": 500,          // (R)
  "items": [                // (R)
    { "producto_variante_id": 5, "cantidad": 1, "precio_unitario": 35.00 }
  ],
  "motivo": "Defecto de fábrica", // (O)
  "tipo_reembolso": "efectivo",   // (R) [efectivo, credito_tienda]
  "caja_id": 1                    // (R si es reembolso efectivo)
}
```
*Efecto: Stock +X, Caja -monto, auditoría generada.*

---

## 💸 9. Finanzas: Gastos y Créditos
Base URL: `/api`

### Registrar Gasto Administrativo (`POST /gastos`)
- **Body**: `{ "categoria": "Luz", "monto": 150.00, "descripcion": "Pago Marzo", "caja_id": 1 }`
*Efecto: Registro contable y salida de efectivo de la caja activa.*

### Registrar Abono a Deuda (`POST /creditos/abono`)
- **Body**:
```json
{
  "venta_id": 101,          // (R)
  "monto": 50.00,           // (R)
  "metodo_pago": "efectivo",// (R)
  "caja_id": 1              // (R)
}
```
*Efecto: Saldo Pendiente reducido en Venta y entrada a Caja.*

---

## 🔄 10. Logística: Transferencia entre Tiendas
Base URL: `/api/transferencias`

### Enviar Mercancía (`POST /enviar`)
- **Body**:
```json
{
  "tienda_origen_id": 1,   // (R)
  "tienda_destino_id": 2,  // (R)
  "items": [               // (R)
    { "producto_variante_id": 50, "cantidad": 10 }
  ]
}
```

### Recibir Mercancía (`POST /:id/recibir`)
- **Descripción**: Confirma la entrada física en la tienda destino.
*Efecto: Stock -10 en Origen al enviar, Stock +10 en Destino al recibir.*

### Listar Transferencias (`GET /`)
- **Query Params**: `tienda_origen_id` (O), `tienda_destino_id` (O), `estado` (O).
- **Response Structure**:
```json
{
  "id": 1,
  "estado": "enviado",
  "tiendaOrigen": { "id": 1, "nombre": "Tienda A" },
  "tiendaDestino": { "id": 2, "nombre": "Tienda B" },
  "detalles": [
    {
      "cantidad": 5,
      "ProductoVariante": {
        "Producto": { "nombre": "Sudadera" },
        "atributos": [
          { "valor": "Rojo", "Atributo": { "nombre": "Color" } }
        ]
      }
    }
  ]
}
```

### Obtener Detalle de Transferencia (`GET /:id`)
- **Response**: Mismo objeto detallado que el listado, filtrado por ID.

---

### 2. Catálogo

#### GET /api/productos
Lista todos los productos con sus variantes e inventario.

#### POST /api/productos
Crea un nuevo producto con sus variantes.
**Payload:** Multipart/Form-Data
- `productData`: JSON string con nombre, descripción, etc.
- `variantsData`: JSON string con lista de variantes y sus atributos.
- `imagenes`: Archivos de imagen (uno por variante).

#### PUT /api/productos/:id
Actualiza un producto existente y sus variantes.
**ID:** ID del producto a editar.
**Payload:** Multipart/Form-Data (Igual que POST)
- Si una variante incluye `id`, se actualiza.
- Si una variante NO incluye `id`, se crea como nueva.
- `imagenes`: Nuevas imágenes para las variantes en orden de aparición.

---

### 💡 Guía de Variantes y Atributos (Frontend)

Para productos con múltiples características (ej: Talla M + Color Rojo), el Frontend debe enviar los IDs de los valores de atributo dentro del array `atributo_valor_ids`.

**Ejemplo de Payload Completo:**
```json
{
  "productData": {
    "nombre": "Camiseta Premium",
    "categoria_id": 2,
    "descripcion": "Algodón 100%"
  },
  "variantsData": [
    {
      "sku": "CAM-RED-M",
      "precio_venta": 450,
      "costo": 200,
      "atributo_valor_ids": [5, 12] // 5=M, 12=Rojo
    }
  ]
}
```

**Reglas de Validación:**
- `productData.nombre`: Obligatorio.
- `variantsData`: Debe contener al menos 1 variante.
- `precio_venta` y `costo`: Deben ser números mayores o iguales a 0.

---

### 💡 Guía Maestra de Variantes y Atributos (Frontend)

Para que el servidor acepte los productos, **siempre** debe existir al menos un registro en `variantsData`.

#### 1. Variante con Múltiples Atributos (Ej: Talla M + Color Rojo)
Se envían todos los IDs necesarios en el array `atributo_valor_ids`.
```json
{
  "variantsData": [
    {
      "sku": "CAM-M-ROJO",
      "precio_venta": 450,
      "costo": 200,
      "atributo_valor_ids": [5, 12] 
    }
  ]
}
```

#### 2. Campos de Identificación
- `codigo_barra` (o `codigo_barras`): Opcional. Se puede enviar en `productData` para el código general del producto, y en cada objeto de `variantsData` para códigos específicos por variante.
- `marca`: Opcional en `productData`.

#### Ejemplo Práctico (Frontend):
```javascript
const formData = new FormData();
formData.append('productData', JSON.stringify({ nombre: "Camisa", categoria_id: 1 }));
formData.append('variantsData', JSON.stringify([
  { sku: "C-01", precio_venta: 200, costo: 100, fileIndex: 0 }
]));
formData.append('imagenes', archivoInput.files[0]); 

await fetch('/api/productos', { method: 'POST', body: formData });
```

---

### 🚦 Estados de Error Comunes:
- **400 Bad Request**: Datos mal formateados o faltantes. El mensaje indica el campo exacto.
- **403 Forbidden**: El usuario no tiene permisos de administrador o no pertenece a una empresa.
- **404 Not Found**: El ID del producto no existe en la edición.

---

### 3. Reportes (Retail Pro)

## 📊 11. Inteligencia de Negocio (Reportes)
Base URL: `/api/reportes` (Exclusivo: `admin`)

### Ventas por Periodo (`GET /ventas`)
- **Query Params**: `desde` (YYYY-MM-DD), `hasta` (YYYY-MM-DD), `tienda_id` (O)
- **Response**:
```json
{
  "total_ventas": "1500.50",
  "cantidad_transacciones": 45,
  "ticket_promedio": "33.34"
}
```

### Top Productos Vendidos (`GET /top-productos`)
- **Query Params**: `desde`, `hasta`, `tienda_id` (O), `limit` (O, default 10)
- **Response**: Array de objetos con cantidad y montos acumulados por variante.

### Flujo de Caja (`GET /flujo-caja`)
- **Query Params**: `desde` (YYYY-MM-DD), `hasta` (YYYY-MM-DD), `tienda_id` (O)
- **Response**:
```json
{
  "ingresos": 2500.00,
  "egresos": 450.00,
  "balance_neto": 2050.00
}
```

### Utilidad Real (`GET /utilidad`)
- **Query Params**: `desde` (YYYY-MM-DD), `hasta` (YYYY-MM-DD), `tienda_id` (O)
- **Response**:
```json
{
  "ventas_totales": 5000.00,
  "costo_mercancia": 2000.00,
  "gastos_operativos": 500.00,
  "utilidad_bruta": 3000.00,
  "utilidad_neta": 2500.00,
  "margen_porcentaje": 50.0
}
```

---

## 🗄️ 13. Estructura de Modelos (Data Schemas)
Para que el frontend conozca los campos disponibles en los objetos principales.

### Modelo: Venta (`ventas`)
| Campo | Tipo | Notas |
| :--- | :--- | :--- |
| `id` | Integer | Clave primaria |
| `tienda_id` | Integer | Sucursal donde ocurrió |
| `usuario_id` | Integer | Vendedor que procesó |
| `cliente_id` | Integer | Opcional (obligatorio en crédito) |
| `total` | Decimal | Monto final pagado |
| `subtotal` | Decimal | Antes de impuestos/descuentos |
| `tipo_pago` | Enum | `contado`, `credito` |
| `metodo_pago`| Enum | `efectivo`, `tarjeta`, `transferencia` |
| `estado` | Enum | `pagada`, `pendiente`, `anulada` |
| `numero_factura`| String | Correlativo (ej: "000001") |
| `created_at` | Date | Fecha de creación |

### Modelo: Producto / Variante (`productos` / `producto_variantes`)
- **Producto**: Nombre, descripción, categoría, empresa_id.
- **Variante**: SKU, precio_venta, costo, codigo_barra, stock (vía Inventario).

### Modelo: Tienda (`tiendas`)
| Campo | Tipo | Notas |
| :--- | :--- | :--- |
| `id` | Integer | Clave primaria |
| `nombre` | String | Nombre de la sucursal |
| `ubicacion` | Text | Dirección física |
| `telefono` | String | Contacto de la tienda |

---

## 🚀 Notas Finales
1. **Multi-Tenant**: El aislamiento por `empresa_id` es mandatorio en cada consulta interna. El frontend no necesita enviarlo (se extrae del Token).
2. **Fechas**: Usar formato `YYYY-MM-DD` para parámetros de búsqueda.
3. **Roles**: Los reportes solo son accesibles para usuarios con `rol: 'admin'`.

---
*Manual Retail SaaS v5.0 - Estructura Multi-tenant Unificada*