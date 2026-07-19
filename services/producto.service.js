import { Producto, ProductoVariante, VarianteValor, AtributoValor, Inventario, sequelize } from '../models/index.js';
import { supabase } from '../utils/supabase.js';
import suscripcionService from './suscripcion.service.js';

class ProductoService {
  /**
   * Sube una imagen a Supabase Storage
   */
  async _uploadImagen(empresa_id, file) {
    const bucket = process.env.SUPABASE_BUCKET || 'media';
    const fileName = `productos/${empresa_id}/${Date.now()}-${file.originalname}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) throw new Error(`Error Supabase: ${error.message}`);

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  }

  async getAll(empresa_id, { tienda_id } = {}) {
    const { Categoria, Atributo } = await import('../models/index.js');
    
    const inventarioInclude = {
      model: Inventario,
      attributes: ['tienda_id', 'stock_actual']
    };

    if (tienda_id) {
      inventarioInclude.where = { tienda_id };
      inventarioInclude.required = true;
    }

    return await Producto.findAll({
      where: { empresa_id },
      include: [
        { model: Categoria, as: 'categoria' },
        { 
          model: ProductoVariante, 
          as: 'variantes',
          required: tienda_id ? true : false,
          include: [
            { 
              model: AtributoValor, 
              as: 'atributos',
              include: [{ model: Atributo, as: 'Atributo' }]
            },
            inventarioInclude
          ]
        }
      ]
    });
  }

  async create(empresa_id, { productData, variantsData }, files = []) {
    // 1. Validar límites de plan
    const limits = await suscripcionService.getPlanLimits(empresa_id);
    const currentProductsCount = await Producto.count({ where: { empresa_id } });
    
    if (currentProductsCount >= limits.limite_productos) {
      throw new Error(`Ha alcanzado el límite máximo de ${limits.limite_productos} productos permitidos en su plan.`);
    }

    if (files.length > 0 && !limits.permite_fotos) {
      throw new Error('Su plan actual no permite subir imágenes de productos.');
    }

    const transaction = await sequelize.transaction();
    try {
      // 2. Crear el producto base
      const producto = await Producto.create({ 
        ...productData, 
        codigo_barra: productData.codigo_barra || productData.codigo_barras,
        empresa_id 
      }, { transaction });

      // 3. Crear las variantes
      for (let i = 0; i < variantsData.length; i++) {
        const variant = variantsData[i];
        
        // Mapear imagen si corresponde
        let imagen_url = null;
        
        // Prioridad: fileIndex explícito, si no, usar índice secuencial i
        const targetFileIndex = (typeof variant.fileIndex === 'number') ? variant.fileIndex : i;
        
        if (files[targetFileIndex] && limits.permite_fotos) {
          imagen_url = await this._uploadImagen(empresa_id, files[targetFileIndex]);
        }

        const nuevaVariante = await ProductoVariante.create({
          producto_id: producto.id,
          sku: variant.sku,
          codigo_barra: variant.codigo_barra || variant.codigo_barras,
          precio_venta: variant.precio_venta,
          costo: variant.costo,
          imagen_url
        }, { transaction });

        // 3. Asociar atributos (valores)
        if (variant.atributo_valor_ids && variant.atributo_valor_ids.length > 0) {
          const associations = variant.atributo_valor_ids.map(valorId => ({
            producto_variante_id: nuevaVariante.id,
            atributo_valor_id: valorId
          }));
          await VarianteValor.bulkCreate(associations, { transaction });
        }
      }

      await transaction.commit();
      return await Producto.findByPk(producto.id, {
        include: [
          { 
            model: ProductoVariante, 
            as: 'variantes',
            include: [{ model: AtributoValor, as: 'atributos' }]
          }
        ]
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async update(id, empresa_id, { productData, variantsData }, files = []) {
    const limits = await suscripcionService.getPlanLimits(empresa_id);
    const transaction = await sequelize.transaction();
    
    try {
      // 1. Buscar y actualizar producto base
      const producto = await Producto.findOne({ where: { id, empresa_id }, transaction });
      if (!producto) throw new Error('Producto no encontrado');
      await producto.update(productData, { transaction });

      // 2. Procesar variantes
      // Usaremos un contador para las imágenes recibidas (Multer las manda en orden)
      for (let i = 0; i < variantsData.length; i++) {
        const variant = variantsData[i];
        let imagen_url = variant.imagen_url || null;

        // Prioridad: fileIndex explícito, si no, usar índice secuencial i
        const targetFileIndex = (typeof variant.fileIndex === 'number') ? variant.fileIndex : i;

        if (files[targetFileIndex] && limits.permite_fotos) {
          imagen_url = await this._uploadImagen(empresa_id, files[targetFileIndex]);
        }

        if (variant.id) {
          // Actualización de variante existente
          const v = await ProductoVariante.findOne({ 
            where: { id: variant.id, producto_id: producto.id }, 
            transaction 
          });
          if (v) {
            await v.update({
              sku: variant.sku,
              codigo_barra: variant.codigo_barra || variant.codigo_barras,
              precio_venta: variant.precio_venta,
              costo: variant.costo,
              imagen_url
            }, { transaction });

            // Actualizar atributos si se proveen
            if (variant.atributo_valor_ids) {
              await VarianteValor.destroy({ where: { producto_variante_id: v.id }, transaction });
              const associations = variant.atributo_valor_ids.map(valorId => ({
                producto_variante_id: v.id,
                atributo_valor_id: valorId
              }));
              await VarianteValor.bulkCreate(associations, { transaction });
            }
          }
        } else {
          // Creación de nueva variante
          const nuevaVariante = await ProductoVariante.create({
            producto_id: producto.id,
            sku: variant.sku,
            codigo_barra: variant.codigo_barra || variant.codigo_barras,
            precio_venta: variant.precio_venta,
            costo: variant.costo,
            imagen_url
          }, { transaction });

          if (variant.atributo_valor_ids) {
            const associations = variant.atributo_valor_ids.map(valorId => ({
              producto_variante_id: nuevaVariante.id,
              atributo_valor_id: valorId
            }));
            await VarianteValor.bulkCreate(associations, { transaction });
          }
        }
      }

      await transaction.commit();
      return await this.getById(id, empresa_id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getById(id, empresa_id) {
    const { Categoria, Atributo } = await import('../models/index.js');
    const producto = await Producto.findOne({
      where: { id, empresa_id },
      include: [
        { model: Categoria, as: 'categoria' },
        { 
          model: ProductoVariante, 
          as: 'variantes',
          include: [
            { 
              model: AtributoValor, 
              as: 'atributos',
              include: [{ model: Atributo, as: 'Atributo' }]
            },
            {
              model: Inventario,
              attributes: ['tienda_id', 'stock_actual']
            }
          ]
        }
      ]
    });
    if (!producto) throw new Error('Producto no encontrado');
    return producto;
  }

  async delete(id, empresa_id) {
    const { ProductoVariante, DetalleVenta, Inventario, VarianteValor } = await import('../models/index.js');
    const transaction = await sequelize.transaction();

    try {
      // 1. Buscar producto y sus variantes
      const producto = await Producto.findOne({ 
        where: { id, empresa_id },
        include: [{ model: ProductoVariante, as: 'variantes' }],
        transaction
      });

      if (!producto) throw new Error('Producto no encontrado');

      // 2. Verificar si alguna variante tiene ventas
      const variantIds = producto.variantes.map(v => v.id);
      
      if (variantIds.length > 0) {
        const hasSales = await DetalleVenta.count({ 
          where: { producto_variante_id: variantIds },
          transaction
        });

        if (hasSales > 0) {
          throw new Error('Seguridad: No se puede eliminar un producto que ya tiene ventas registradas. Considere desactivarlo o dejarlo sin stock.');
        }

        // 3. Si no hay ventas, procedemos a borrar asociaciones
        // Borrar Inventario vinculado
        await Inventario.destroy({ where: { producto_variante_id: variantIds }, transaction });
        
        // Borrar asociaciones de atributos (VarianteValor)
        await VarianteValor.destroy({ where: { producto_variante_id: variantIds }, transaction });

        // Borrar variantes
        await ProductoVariante.destroy({ where: { id: variantIds }, transaction });
      }

      // 4. Borrar el producto base
      await producto.destroy({ transaction });

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default new ProductoService();
