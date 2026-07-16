import { Categoria, Atributo, AtributoValor } from '../models/index.js';

class CategoriaService {
  async getAll(empresa_id) {
    return await Categoria.findAll({ where: { empresa_id } });
  }

  async create(empresa_id, { nombre }) {
    return await Categoria.create({ nombre, empresa_id });
  }

  async update(id, empresa_id, data) {
    const categoria = await Categoria.findOne({ where: { id, empresa_id } });
    if (!categoria) throw new Error('Categoría no encontrada');
    return await categoria.update(data);
  }

  async delete(id, empresa_id) {
    const { Producto } = await import('../models/index.js');
    const hasProducts = await Producto.count({ where: { categoria_id: id } });
    if (hasProducts > 0) {
      throw new Error('No se puede eliminar una categoría que tiene productos asociados. Reubique los productos primero.');
    }
    const categoria = await Categoria.findOne({ where: { id, empresa_id } });
    if (!categoria) throw new Error('Categoría no encontrada');
    return await categoria.destroy();
  }
}

class AtributoService {
  async getAll(empresa_id) {
    return await Atributo.findAll({ 
      where: { empresa_id },
      include: [{ model: AtributoValor, as: 'valores' }]
    });
  }

  async create(empresa_id, { nombre, valores = [] }) {
    const atributo = await Atributo.create({ nombre, empresa_id });
    if (valores.length > 0) {
      const valoresData = valores.map(v => ({ atributo_id: atributo.id, valor: v }));
      await AtributoValor.bulkCreate(valoresData);
    }
    return await Atributo.findByPk(atributo.id, { include: [{ model: AtributoValor, as: 'valores' }] });
  }

  async addValores(atributo_id, empresa_id, input) {
    const atributo = await Atributo.findOne({ where: { id: atributo_id, empresa_id } });
    if (!atributo) throw new Error('Atributo no encontrado o no pertenece a la empresa');

    // Normalizar entrada: si es un string, convertir a array. Si es nulo, array vacío.
    let valoresList = [];
    if (Array.isArray(input)) {
      valoresList = input;
    } else if (typeof input === 'string' && input.trim() !== '') {
      valoresList = [input];
    }

    if (valoresList.length > 0) {
      const valoresData = valoresList.map(v => ({ atributo_id: atributo.id, valor: v }));
      await AtributoValor.bulkCreate(valoresData);
    }
    
    return await Atributo.findByPk(atributo.id, { include: [{ model: AtributoValor, as: 'valores' }] });
  }

  async updateValor(valor_id, empresa_id, nuevo_valor) {
    const valor = await AtributoValor.findByPk(valor_id, {
      include: [{ model: Atributo, as: 'Atributo', where: { empresa_id } }]
    });
    if (!valor) throw new Error('Valor de atributo no encontrado o no pertenece a la empresa');
    
    return await valor.update({ valor: nuevo_valor });
  }
}

export const categoriaService = new CategoriaService();
export const atributoService = new AtributoService();

export default {
  categoriaService,
  atributoService,
  seedRetailCatalog: async (empresa_id, transaction) => {
    try {
      
      // 1. Categorías por defecto
      const categorias = await Categoria.bulkCreate([
        { nombre: 'General', empresa_id },
        { nombre: 'Ropa', empresa_id },
        { nombre: 'Calzado', empresa_id },
        { nombre: 'Accesorios', empresa_id }
      ], { transaction });

      // 2. Atributos compartidos (Talla, Color)
      const color = await Atributo.create({ nombre: 'Color', empresa_id }, { transaction });
      await AtributoValor.bulkCreate([
        { atributo_id: color.id, valor: 'Negro' },
        { atributo_id: color.id, valor: 'Blanco' },
        { atributo_id: color.id, valor: 'Rojo' }
      ], { transaction });

      const talla = await Atributo.create({ nombre: 'Talla', empresa_id }, { transaction });
      await AtributoValor.bulkCreate([
        { atributo_id: talla.id, valor: 'S' },
        { atributo_id: talla.id, valor: 'M' },
        { atributo_id: talla.id, valor: 'L' },
        { atributo_id: talla.id, valor: 'XL' }
      ], { transaction });

      return true;
    } catch (error) {
      console.error('Error in seedRetailCatalog:', error);
      throw error;
    }
  }
};
