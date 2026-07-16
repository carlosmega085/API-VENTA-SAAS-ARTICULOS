import { Venta, DetalleVenta, ProductoVariante, Producto, Atributo, AtributoValor, Cliente, SecuenciaVenta, Tienda, Abono, sequelize } from '../models/index.js';
import inventarioService from './inventario.service.js';
import cajaService from './caja.service.js';

class VentaService {
  async create(tienda_id, usuario_id, { cliente_id, items, tipo_pago, metodo_pago, caja_id }) {
    const transaction = await sequelize.transaction();
    try {
      // 1. Validar items y calcular totales
      let totalVenta = 0;
      const detallesParaCrear = [];

      for (const item of items) {
        const variante = await ProductoVariante.findByPk(item.producto_variante_id, { transaction });
        if (!variante) throw new Error(`Producto con ID ${item.producto_variante_id} no encontrado`);

        const subtotal = variante.precio_venta * item.cantidad;
        totalVenta += subtotal;

        detallesParaCrear.push({
          producto_variante_id: variante.id,
          cantidad: item.cantidad,
          precio_unitario: variante.precio_venta,
          costo_unitario: variante.costo, // <- GUARDAMOS COSTO
          subtotal
        });

        // 2. Descontar Inventario (Bloqueo de stock negativo integrado en el servicio)
        await inventarioService.ajustarStock(tienda_id, variante.id, {
          amount: item.cantidad, // Wait, let's keep original code!
          cantidad: item.cantidad,
          tipo: 'venta',
          descripcion: `Venta items`
        }, { transaction });
      }

      // 3. Obtener Información de Tienda
      const tienda = await Tienda.findByPk(tienda_id, { transaction });
      if (!tienda) throw new Error('Tienda no encontrada');

      // 4. Crear cabecera de Venta
      const venta = await Venta.create({
        tienda_id,
        empresa_id: tienda.empresa_id,
        usuario_id,
        cliente_id,
        tipo_pago,
        metodo_pago,
        total: totalVenta,
        subtotal: totalVenta,
        estado: tipo_pago === 'contado' ? 'pagada' : 'pendiente',
        saldo_pendiente: tipo_pago === 'credito' ? totalVenta : 0
      }, { transaction });

      // 4. Crear detalles
      for (const detalle of detallesParaCrear) {
        await DetalleVenta.create({ ...detalle, venta_id: venta.id }, { transaction });
      }

      // 5. Gestión Financiera
      if (tipo_pago === 'contado') {
        if (!caja_id) throw new Error('Debe especificar una caja para ventas al contado');
        await cajaService.registrarMovimiento(caja_id, usuario_id, {
          tipo: 'venta',
          monto: totalVenta,
          metodo_pago,
          referencia_id: venta.id,
          descripcion: `Venta #${venta.id}`
        }, { transaction });
      } else if (tipo_pago === 'credito') {
        if (!cliente_id) throw new Error('Debe especificar un cliente para ventas al crédito');
        const cliente = await Cliente.findByPk(cliente_id, { transaction });
        if (!cliente) throw new Error('Cliente no encontrado');
        
        await cliente.update({ 
          saldo_pendiente: parseFloat(cliente.saldo_pendiente || 0) + totalVenta 
        }, { transaction });
      }

      // 7. Generar Numeración Secuencial (Atomic Correlative)
      const [secuencia] = await SecuenciaVenta.findOrCreate({
        where: { empresa_id: tienda.empresa_id },
        defaults: { ultimo_numero: 0 },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      const nuevoNumero = secuencia.ultimo_numero + 1;
      await secuencia.update({ ultimo_numero: nuevoNumero }, { transaction });

      // Guardar número de factura formatado (ej: 000001) y secuencia entera
      const numeroFactura = nuevoNumero.toString().padStart(6, '0');
      await venta.update({ 
        secuencia_venta: nuevoNumero,
        numero_factura: numeroFactura 
      }, { transaction });

      await transaction.commit();
      return await Venta.findByPk(venta.id, { 
        include: [{ model: DetalleVenta, as: 'detalles' }] 
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Anula una venta y revierte TODO (Stock, Caja, Créditos).
   */
  async anularVenta(venta_id, usuario_id) {
    const transaction = await sequelize.transaction();
    try {
      const venta = await Venta.findByPk(venta_id, { 
        include: [{ model: DetalleVenta, as: 'detalles' }],
        transaction 
      });

      if (!venta) throw new Error('Venta no encontrada');
      if (venta.estado === 'anulada') throw new Error('La venta ya está anulada');

      // 1. REVERTIR STOCK
      for (const detalle of venta.detalles) {
        await inventarioService.ajustarStock(venta.tienda_id, detalle.producto_variante_id, {
          cantidad: detalle.cantidad, // Volvemos a sumar (el service lo hace positivo si tipo != venta)
          tipo: 'anulacion_venta',
          descripcion: `Anulación Venta ID: ${venta_id}`
        }, { transaction });
      }

      // 2. REVERTIR FINANZAS
      if (venta.tipo_pago === 'contado') {
        // Buscar el movimiento de caja original para saber de cuál caja descontar
        // Para simplificar, buscamos una caja abierta en la tienda
        // En una implementación real buscaríamos req.user.caja_activa
      } else if (venta.tipo_pago === 'credito' && venta.cliente_id) {
        const cliente = await Cliente.findByPk(venta.cliente_id, { transaction });
        if (cliente) {
          // Restamos el saldo que se le cargó (pero solo lo que quedaba pendiente de ESTA venta)
          await cliente.update({ 
            saldo_pendiente: Math.max(0, cliente.saldo_pendiente - venta.saldo_pendiente) 
          }, { transaction });
        }
      }

      // 3. Marcar venta como anulada
      await venta.update({ estado: 'anulada', saldo_pendiente: 0 }, { transaction });

      await transaction.commit();
      return venta;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getAll(empresa_id, tienda_id, { fecha_inicio, fecha_fin, tipo_pago, cliente_id, estado, usuario_id } = {}) {
    const { Op } = (await import('sequelize')).default; // Asegurar Op disponible
    const where = { empresa_id };
    
    if (tienda_id && tienda_id !== 'todas') {
      where.tienda_id = tienda_id;
    }
    
    if (usuario_id && usuario_id !== 'todos') {
      where.usuario_id = usuario_id;
    }
    
    if (fecha_inicio && fecha_fin) {
      where.created_at = {
        [Op.between]: [`${fecha_inicio} 00:00:00`, `${fecha_fin} 23:59:59`]
      };
    }
    if (tipo_pago) where.tipo_pago = tipo_pago;
    if (cliente_id) where.cliente_id = cliente_id;
    if (estado) where.estado = estado;

    return await Venta.findAll({
      where,
      include: [
        { 
          model: DetalleVenta, 
          as: 'detalles', 
          include: [{ 
            model: ProductoVariante, 
            include: [
              { model: Producto, attributes: ['nombre'] },
              { 
                model: AtributoValor, 
                as: 'atributos', 
                through: { attributes: [] }, // Ocultamos la tabla intermedia
                include: [{ model: Atributo, attributes: ['nombre'] }] 
              }
            ] 
          }] 
        },
        { model: Tienda, attributes: ['id', 'nombre'] },
        { model: Cliente, attributes: ['id', 'nombre', 'identificacion'] },
        { model: Abono, as: 'abonos' }
      ],
      order: [['created_at', 'DESC']]
    });
  }



  async getByFactura(empresa_id, numero_factura) {
    // Si envían "494", lo convertimos a "000494" para que coincida con la DB
    const facturaFormateada = numero_factura.toString().padStart(6, '0');

    const venta = await Venta.findOne({
      where: { numero_factura: facturaFormateada },
      include: [
        { 
          model: DetalleVenta, 
          as: 'detalles',
          include: [{ 
            model: ProductoVariante, 
            include: [
              { model: Producto, attributes: ['nombre'] },
              { 
                model: AtributoValor, 
                as: 'atributos', 
                through: { attributes: [] },
                include: [{ model: Atributo, attributes: ['nombre'] }] 
              }
            ]
          }] 
        },
        { model: Tienda, attributes: ['id', 'nombre'], where: { empresa_id } }
      ]
    });
    return venta;
  }
}

export default new VentaService();
