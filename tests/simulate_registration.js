import { sequelize, Juego, Turno, Empresa, Usuario } from '../models/index.js';
import AuthService from '../services/auth.service.js';

async function simulateRegistration() {
  console.log('🚀 Iniciando simulación de registro de empresa regional...');
  
  try {
    // 1. Datos de prueba
    const testData = {
      nombre_empresa: 'Loto Mega Region ' + Date.now(),
      nombre_admin: 'Admin Regional',
      username: 'admin_test_' + Math.floor(Math.random() * 1000),
      email: 'test@lotoregional.com',
      password: 'password123'
    };

    // 2. Ejecutar registro (esto dispara el CatalogService.seedDefaultCatalog)
    console.log(`📝 Registrando empresa: ${testData.nombre_empresa}`);
    const result = await AuthService.registerEmpresa(testData);
    const { empresa } = result;
    console.log(`✅ Empresa creada con ID: ${empresa.id}`);

    // 3. Verificaciones de Catálogo
    console.log('\n🔍 Verificando inyección de catálogo...');

    const juegos = await Juego.findAll({ where: { empresa_id: empresa.id } });
    console.log(`📊 Juegos creados: ${juegos.length} (Esperados: 7)`);

    const turnos = await Turno.findAll({ where: { empresa_id: empresa.id } });
    console.log(`📊 Turnos creados: ${turnos.length} (Esperados: 22)`);

    // Detalle por país
    const paises = ['Nicaragua', 'Costa Rica', 'Honduras', 'El Salvador'];
    for (const pais of paises) {
      const juegosPais = juegos.filter(j => j.pais === pais);
      const turnosPais = turnos.filter(t => {
          const juego = juegos.find(j => j.id === t.juego_id);
          return juego && juego.pais === pais;
      });
      console.log(`   📍 ${pais}: ${juegosPais.length} juegos, ${turnosPais.length} turnos.`);
      
      // Validar tipos de número en Nicaragua como muestra crítica
      if (pais === 'Nicaragua') {
          const diaria = juegosPais.find(j => j.nombre === 'Diaria');
          const juega3 = juegosPais.find(j => j.nombre === 'Juega 3');
          const fecha = juegosPais.find(j => j.nombre === 'Fecha');
          console.log(`      - Diaria: ${diaria.tipo_numero} (${diaria.rango_min}-${diaria.rango_max})`);
          console.log(`      - Juega 3: ${juega3.tipo_numero} (${juega3.rango_min}-${juega3.rango_max})`);
          console.log(`      - Fecha: ${fecha.tipo_numero} (${fecha.rango_min}-${fecha.rango_max})`);
      }
    }

    if (juegos.length === 7 && turnos.length === 22) {
      console.log('\n🎉 SIMULACIÓN EXITOSA: La empresa está lista para operar en toda la región.');
    } else {
      console.error('\n⚠️ ADVERTENCIA: Algunos datos no coinciden con lo esperado.');
    }

  } catch (error) {
    console.error('❌ Error en la simulación:', error.message);
  } finally {
    await sequelize.close();
  }
}

simulateRegistration();
