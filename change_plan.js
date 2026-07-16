import { Plan, Empresa, Suscripcion } from './models/index.js';

async function run() {
  try {
    console.log("=== PLANES ===");
    const planes = await Plan.findAll({ raw: true });
    planes.forEach(p => {
      console.log(`Plan ID: ${p.id} | Nombre: ${p.nombre} | Límite usuarios: ${p.limite_usuarios} | Límite turnos: ${p.limite_turnos} | Precio: ${p.precio}`);
    });

    console.log("\n=== EMPRESAS ===");
    const empresas = await Empresa.findAll({ raw: true });
    empresas.forEach(e => {
      console.log(`Empresa ID: ${e.id} | Nombre: ${e.nombre_empresa} | Email: ${e.email}`);
    });

    console.log("\n=== SUSCRIPCIONES ===");
    const subscripciones = await Suscripcion.findAll({ raw: true });
    subscripciones.forEach(s => {
      console.log(`Suscripcion ID: ${s.id} | Empresa ID: ${s.empresa_id} | Plan ID: ${s.plan_id} | Estado: ${s.estado}`);
    });

    const sortedPlanes = [...planes].sort((a, b) => {
      // Sort by price, then by user limits to find the absolute premium plan
      const priceDiff = (Number(b.precio) || 0) - (Number(a.precio) || 0);
      if (priceDiff !== 0) return priceDiff;
      return (Number(b.limite_usuarios) || 0) - (Number(a.limite_usuarios) || 0);
    });
    
    const highestPlan = sortedPlanes[0];
    if (!highestPlan) {
      console.log("No se encontraron planes en la base de datos.");
      return;
    }
    console.log(`\nEl plan más alto en el sistema es: ID ${highestPlan.id} (${highestPlan.nombre})`);

    if (subscripciones.length > 0) {
      for (const s of subscripciones) {
        console.log(`Actualizando suscripción ID ${s.id} (Empresa ID ${s.empresa_id}) al Plan ID ${highestPlan.id} (${highestPlan.nombre})...`);
        await Suscripcion.update(
          { plan_id: highestPlan.id, estado: 'activa' },
          { where: { id: s.id } }
        );
      }
      console.log("¡Suscripciones actualizadas con éxito!");
    } else {
      if (empresas.length > 0) {
        for (const emp of empresas) {
          console.log(`Creando suscripción activa para la empresa ID ${emp.id} al Plan ID ${highestPlan.id}...`);
          await Suscripcion.create({
            empresa_id: emp.id,
            plan_id: highestPlan.id,
            fecha_inicio: new Date(),
            fecha_fin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            estado: 'activa'
          });
        }
        console.log("¡Suscripciones creadas con éxito!");
      } else {
        console.log("No hay empresas registradas.");
      }
    }
  } catch (err) {
    console.error("Error al ejecutar el script:", err);
  } finally {
    process.exit();
  }
}

run();
