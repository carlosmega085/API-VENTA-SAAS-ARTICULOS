import { Venta, DetalleVenta, Inventario, Caja, Gasto, Abono, ProductoVariante, Producto, sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import { sendSuccess, sendError } from '../utils/response.js';

class ReporteController {
  
  /**
   * Resumen de ventas por periodo y tienda.
   */
  async reporteVentas(req, res) {
    try {
      const { empresa_id } = req.user;
      const { desde, hasta, tienda_id, usuario_id } = req.query;

      const where = { empresa_id };
      if (tienda_id) where.tienda_id = tienda_id;
      if (usuario_id) where.usuario_id = usuario_id;
      if (desde && hasta) {
        where.created_at = { [Op.between]: [`${desde} 00:00:00`, `${hasta} 23:59:59`] };
      }

      const ventas = await Venta.findAll({
        where,
        attributes: [
          [sequelize.fn('SUM', sequelize.col('total')), 'total_ventas'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad_transacciones'],
          [sequelize.fn('AVG', sequelize.col('total')), 'ticket_promedio']
        ]
      });

      return sendSuccess(res, ventas[0], 'Reporte de ventas generado');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  /**
   * Estado consolidado de inventario.
   */
  async reporteInventario(req, res) {
    try {
      const { empresa_id } = req.user;
      const { tienda_id } = req.query;

      const where = {};
      if (tienda_id) where.tienda_id = tienda_id;

      const stock = await Inventario.findAll({
        where,
        include: [{
          model: Inventario.associations.ProductoVariante.target,
          as: 'ProductoVariante',
          where: { '$ProductoVariante.Producto.empresa_id$': empresa_id }
        }]
      });

      return sendSuccess(res, stock, 'Reporte de inventario generado');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  /**
   * Flujo de caja neto (Ventas - Gastos).
   */
  async flujoCaja(req, res) {
    try {
      const { empresa_id, rol, tienda_id: userTiendaId } = req.user;
      const { tienda_id, desde, hasta, usuario_id } = req.query;

      // Seguridad: Si no es admin, forzar su tienda activa
      const targetTiendaId = (rol === 'admin') ? tienda_id : userTiendaId;

      const dateFilter = (desde && hasta) ? { created_at: { [Op.between]: [`${desde} 00:00:00`, `${hasta} 23:59:59`] } } : {};

      // Sumar solo ventas al contado que no estén anuladas
      const totalVentasContado = await Venta.sum('total', { 
        where: { 
          empresa_id, 
          tipo_pago: 'contado',
          estado: { [Op.ne]: 'anulada' },
          ...dateFilter, 
          ... (targetTiendaId ? { tienda_id: targetTiendaId } : {}),
          ... (usuario_id ? { usuario_id } : {})
        } 
      }) || 0;

      // Sumar los abonos recibidos a créditos en el mismo periodo
      const totalAbonos = await Abono.sum('monto', {
        where: (desde && hasta) ? { created_at: { [Op.between]: [`${desde} 00:00:00`, `${hasta} 23:59:59`] } } : {},
        include: [{
          model: Venta,
          required: true,
          where: {
            empresa_id,
            ... (targetTiendaId ? { tienda_id: targetTiendaId } : {}),
            ... (usuario_id ? { usuario_id } : {})
          }
        }]
      }) || 0;

      const ingresosTotales = parseFloat(totalVentasContado) + parseFloat(totalAbonos);

      const totalGastos = await Gasto.sum('monto', { 
        where: { empresa_id, ...dateFilter, ... (targetTiendaId ? { tienda_id: targetTiendaId } : {}) } 
      }) || 0;

      return sendSuccess(res, {
        ingresos: ingresosTotales,
        egresos: totalGastos,
        balance_neto: ingresosTotales - totalGastos
      }, 'Flujo de caja consolidado');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  /**
   * UTILIDAD REAL: Ventas - Costo de Ventas - Gastos
   */
  async reporteUtilidad(req, res) {
    try {
      const { empresa_id } = req.user;
      const { desde, hasta, tienda_id, usuario_id } = req.query;

      const dateFilter = (desde && hasta) ? { created_at: { [Op.between]: [`${desde} 00:00:00`, `${hasta} 23:59:59`] } } : {};
      const tiendaFilter = tienda_id ? { tienda_id } : {};
      const usuarioFilter = usuario_id ? { usuario_id } : {};

      // 1. Total Ventas (Ingreso Neto)
      const totalVentas = await Venta.sum('total', { 
        where: { empresa_id, estado: { [Op.ne]: 'anulada' }, ...dateFilter, ...tiendaFilter, ...usuarioFilter } 
      }) || 0;

      // 2. Costo de lo vendido
      // Obtenemos los IDs de las ventas que califican
      const ventasIds = await Venta.findAll({
        where: { empresa_id, estado: { [Op.ne]: 'anulada' }, ...dateFilter, ...tiendaFilter, ...usuarioFilter },
        attributes: ['id']
      });

      const ids = ventasIds.map(v => v.id);
      
      let costOfGoodsSold = 0;
      if (ids.length > 0) {
        const resultCost = await DetalleVenta.findOne({
          where: { venta_id: { [Op.in]: ids } },
          attributes: [
            [sequelize.fn('SUM', sequelize.literal('cantidad * costo_unitario')), 'total_costo']
          ],
          raw: true
        });
        costOfGoodsSold = parseFloat(resultCost?.total_costo || 0);
      }

      // 3. Gastos Operativos
      const totalGastos = await Gasto.sum('monto', { 
        where: { empresa_id, ...dateFilter, ...tiendaFilter } 
      }) || 0;

      const utilidadBruta = totalVentas - costOfGoodsSold;
      const utilidadNeta = utilidadBruta - totalGastos;

      return sendSuccess(res, {
        ventas_totales: totalVentas,
        costo_mercancia: costOfGoodsSold,
        gastos_operativos: totalGastos,
        utilidad_bruta: utilidadBruta,
        utilidad_neta: utilidadNeta,
        margen_porcentaje: totalVentas > 0 ? (utilidadNeta / totalVentas) * 100 : 0
      }, 'Reporte de utilidad generado');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  /**
   * TOP PRODUCTOS: Ranking de los más vendidos
   */
  async topProductos(req, res) {
    try {
      const { empresa_id } = req.user;
      const { desde, hasta, tienda_id, usuario_id, limit = 10 } = req.query;

      const dateFilter = (desde && hasta) ? { created_at: { [Op.between]: [`${desde} 00:00:00`, `${hasta} 23:59:59`] } } : {};
      const tiendaFilter = tienda_id ? { tienda_id } : {};
      const usuarioFilter = usuario_id ? { usuario_id } : {};

      const topVendidos = await DetalleVenta.findAll({
        attributes: [
          'producto_variante_id',
          [sequelize.fn('SUM', sequelize.col('DetalleVenta.cantidad')), 'cantidad_total'],
          [sequelize.fn('SUM', sequelize.col('DetalleVenta.subtotal')), 'monto_total']
        ],
        include: [
          {
            model: Venta,
            where: { empresa_id, estado: { [Op.ne]: 'anulada' }, ...dateFilter, ...tiendaFilter, ...usuarioFilter },
            attributes: []
          },
          {
            model: ProductoVariante,
            attributes: ['id', 'producto_id'],
            include: [{
              model: Producto,
              attributes: ['nombre']
            }]
          }
        ],
        group: ['producto_variante_id', 'ProductoVariante.id', 'ProductoVariante->Producto.id'],
        order: [[sequelize.literal('cantidad_total'), 'DESC']],
        limit: parseInt(limit)
      });

      const formatted = topVendidos.map(item => {
        const pName = item.ProductoVariante?.Producto?.nombre || 'Producto';
        return {
          producto_id: item.producto_variante_id,
          nombre: pName,
          cantidad: parseInt(item.getDataValue('cantidad_total') || 0),
          total_vendido: parseFloat(item.getDataValue('monto_total') || 0)
        };
      });

      return sendSuccess(res, formatted, 'Top de productos generado');
    } catch (error) {
      console.error('[TOP_PRODUCTOS_ERROR]', error);
      return sendError(res, error.message);
    }
  }

  /**
   * RANKING VENDEDORES: Ventas por usuario vendedor
   */
  async ventasPorVendedor(req, res) {
    try {
      const { empresa_id } = req.user;
      const { desde, hasta, tienda_id } = req.query;

      const where = { 
        empresa_id,
        estado: { [Op.ne]: 'anulada' }
      };
      if (tienda_id) where.tienda_id = tienda_id;
      if (desde && hasta) {
        where.created_at = { [Op.between]: [`${desde} 00:00:00`, `${hasta} 23:59:59`] };
      }

      const { Usuario } = await import('../models/index.js');

      const ranking = await Venta.findAll({
        where,
        attributes: [
          'usuario_id',
          [sequelize.fn('SUM', sequelize.col('total')), 'total_ventas'],
          [sequelize.fn('COUNT', sequelize.col('Venta.id')), 'cantidad_transacciones'],
          [sequelize.fn('AVG', sequelize.col('total')), 'ticket_promedio']
        ],
        include: [{
          model: Usuario,
          attributes: ['nombre', 'username']
        }],
        group: ['usuario_id', 'Usuario.id'],
        order: [[sequelize.literal('total_ventas'), 'DESC']]
      });

      return sendSuccess(res, ranking, 'Reporte de ventas por vendedor generado');
    } catch (error) {
      return sendError(res, error.message);
    }
  }
}

export default new ReporteController();
