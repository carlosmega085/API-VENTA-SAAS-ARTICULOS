import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const API_URL = 'http://localhost:3000/api';
const TOKEN = 'TU_TOKEN_AQUI'; // Necesitas un token válido para probar

const testSalesFlow = async () => {
  console.log('🚀 Iniciando pruebas de arquitectura Loto SaaS...');

  const requestId = uuidv4();
  const saleData = {
    juego_id: 1,
    turno_id: 1,
    request_id: requestId,
    detalles: [
      { numero: '25', monto: 50 },
      { numero: '10', monto: 20 }
    ]
  };

  try {
    // 1. Prueba de Venta Normal
    console.log('1. Probando venta normal...');
    const res1 = await axios.post(`${API_URL}/ventas`, saleData, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    console.log('✅ Venta exitosa:', res1.data.data.codigo_ticket);
    console.log('🔒 Hash QR:', res1.data.data.qr_hash);

    // 2. Prueba de Idempotencia (Mismo request_id)
    console.log('2. Probando idempotencia (reintento con mismo request_id)...');
    const res2 = await axios.post(`${API_URL}/ventas`, saleData, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    if (res1.data.data.id === res2.data.data.id) {
      console.log('✅ Idempotencia validada: se devolvió la misma venta.');
    } else {
      console.error('❌ Error de idempotencia: se creó una venta duplicada.');
    }

    // 3. Prueba de Validación de Formato (Número inválido para 2D)
    console.log('3. Probando formato de número inválido (3 dígitos en juego 2D)...');
    try {
      await axios.post(`${API_URL}/ventas`, {
        ...saleData,
        request_id: uuidv4(),
        detalles: [{ numero: '123', monto: 10 }]
      }, { headers: { Authorization: `Bearer ${TOKEN}` } });
    } catch (err) {
      console.log('✅ Validación de formato controlada:', err.response.data.message);
    }

    // 4. Verificación de Ticket
    console.log('4. Probando verificación de ticket...');
    const ticketCode = res1.data.data.codigo_ticket;
    const resVerify = await axios.get(`${API_URL}/ventas/verificar-ticket/${ticketCode}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    console.log('✅ Verificación exitosa. Ticket válido:', resVerify.data.data.valido);

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.response?.data?.message || error.message);
  }
};

// testSalesFlow();
console.log('Script listo. Ejecutar manualmente con un token válido.');
