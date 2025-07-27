const axios = require('axios');

const API_BASE_URL = 'https://proyect-mercado-backend.fly.dev/api';

// Obtener el token de los argumentos de línea de comandos
const token = process.argv[2];

if (!token) {
  console.log('❌ Error: Debes proporcionar un token JWT como argumento');
  console.log('Uso: node test-with-token.js TU_TOKEN_JWT');
  process.exit(1);
}

// Configurar axios con el token
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

async function testWithToken() {
  console.log('🔍 Probando APIs con token JWT...\n');

  // 1. Probar perfil de usuario
  console.log('1. Probando GET /usuarios/perfil...');
  try {
    const response = await api.get('/usuarios/perfil');
    console.log('✅ GET /usuarios/perfil - ÉXITO');
    console.log(`   Usuario: ${response.data.nombre} ${response.data.apellido}`);
    console.log(`   Rol: ${response.data.rol}`);
    console.log(`   ID: ${response.data.usuario_id}`);
    
    const userId = response.data.usuario_id;
    
    // 2. Probar dashboard del vendedor (NUEVA API)
    console.log('\n2. Probando GET /vendedores/{vendedor_id}/dashboard...');
    try {
      const dashboardResponse = await api.get(`/vendedores/${userId}/dashboard`);
      console.log('✅ GET /vendedores/{id}/dashboard - ÉXITO');
      console.log(`   Productos activos: ${dashboardResponse.data.dashboard.productos_activos}`);
      console.log(`   Pedidos pendientes: ${dashboardResponse.data.dashboard.pedidos_pendientes}`);
      console.log(`   Ventas hoy: Bs. ${dashboardResponse.data.dashboard.ventas_hoy}`);
      console.log(`   Calificación promedio: ${dashboardResponse.data.dashboard.calificacion_promedio}`);
    } catch (error) {
      console.log('❌ GET /vendedores/{id}/dashboard - ERROR');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message || error.message}`);
    }

    // 3. Probar productos del vendedor (NUEVA API)
    console.log('\n3. Probando GET /vendedores/{vendedor_id}/productos...');
    try {
      const productsResponse = await api.get(`/vendedores/${userId}/productos`);
      console.log('✅ GET /vendedores/{id}/productos - ÉXITO');
      console.log(`   Total productos: ${productsResponse.data.total}`);
      console.log(`   Productos en respuesta: ${productsResponse.data.productos.length}`);
    } catch (error) {
      console.log('❌ GET /vendedores/{id}/productos - ERROR');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message || error.message}`);
    }

    // 4. Probar pedidos del vendedor (NUEVA API)
    console.log('\n4. Probando GET /vendedores/{vendedor_id}/pedidos...');
    try {
      const ordersResponse = await api.get(`/vendedores/${userId}/pedidos`);
      console.log('✅ GET /vendedores/{id}/pedidos - ÉXITO');
      console.log(`   Total pedidos: ${ordersResponse.data.total}`);
      console.log(`   Pedidos en respuesta: ${ordersResponse.data.pedidos.length}`);
    } catch (error) {
      console.log('❌ GET /vendedores/{id}/pedidos - ERROR');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message || error.message}`);
    }

    // 5. Probar obtener vendedor específico
    console.log('\n5. Probando GET /vendedores/{vendedor_id}...');
    try {
      const sellerResponse = await api.get(`/vendedores/${userId}`);
      console.log('✅ GET /vendedores/{id} - ÉXITO');
      console.log(`   Número identificación: ${sellerResponse.data.numero_identificacion}`);
      console.log(`   Estado onboarding: ${sellerResponse.data.estado_onboarding}`);
      console.log(`   Calificación promedio: ${sellerResponse.data.calificacion_promedio}`);
    } catch (error) {
      console.log('❌ GET /vendedores/{id} - ERROR');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message || error.message}`);
    }

  } catch (error) {
    console.log('❌ GET /usuarios/perfil - ERROR');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Message: ${error.response?.data?.message || error.message}`);
  }

  // 6. Probar listar todos los vendedores
  console.log('\n6. Probando GET /vendedores...');
  try {
    const allSellersResponse = await api.get('/vendedores');
    console.log('✅ GET /vendedores - ÉXITO');
    console.log(`   Total vendedores: ${allSellersResponse.data.length}`);
    if (allSellersResponse.data.length > 0) {
      console.log(`   Primer vendedor: ${allSellersResponse.data[0].vendedor_id}`);
    }
  } catch (error) {
    console.log('❌ GET /vendedores - ERROR');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Message: ${error.response?.data?.message || error.message}`);
  }

  // 7. Probar productos con filtro de vendedor
  console.log('\n7. Probando GET /productos/buscar?vendedor_id=...');
  try {
    const userResponse = await api.get('/usuarios/perfil');
    const userId = userResponse.data.usuario_id;
    const productsResponse = await api.get(`/productos/buscar?vendedor_id=${userId}`);
    console.log('✅ GET /productos/buscar?vendedor_id=... - ÉXITO');
    console.log(`   Productos encontrados: ${productsResponse.data.length}`);
  } catch (error) {
    console.log('❌ GET /productos/buscar?vendedor_id=... - ERROR');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Message: ${error.response?.data?.message || error.message}`);
  }

  console.log('\n🎯 PRUEBA COMPLETADA');
  console.log('Si todas las APIs funcionan correctamente, el dashboard del vendedor debería mostrar datos reales.');
}

testWithToken().catch(console.error); 