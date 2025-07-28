#!/usr/bin/env node

/**
 * Script para probar el flujo completo de registro de vendedor
 * Uso: node test-seller-flow.js
 */

const axios = require('axios');

const API_BASE_URL = 'https://proyect-mercado-backend.fly.dev/api';

// Datos de prueba
const testUser = {
  email: `test-vendedor-${Date.now()}@example.com`,
  password: '123456',
  nombre: 'Test',
  apellido: 'Vendedor',
  numero_telefono: `7123456${Math.floor(Math.random() * 1000)}`,
  rol: 'comprador'
};

const sellerData = {
  numero_identificacion: `1234567${Math.floor(Math.random() * 1000)}`,
  estado_onboarding: 'pendiente'
};

let authToken = null;
let userId = null;

async function testSellerFlow() {
  console.log('🧪 Iniciando pruebas del flujo de vendedor...\n');

  try {
    // 1. Registrar usuario
    console.log('1️⃣ Registrando usuario...');
    const registerResponse = await axios.post(`${API_BASE_URL}/usuarios/registro`, testUser);
    console.log('✅ Usuario registrado:', registerResponse.data.usuario.usuario_id);
    userId = registerResponse.data.usuario.usuario_id;

    // 2. Login para obtener token
    console.log('\n2️⃣ Haciendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/autenticacion/login`, {
      email: testUser.email,
      password: testUser.password
    });
    authToken = loginResponse.data.token;
    console.log('✅ Login exitoso, token obtenido');

    // 3. Convertir a vendedor
    console.log('\n3️⃣ Convirtiendo a vendedor...');
    const convertResponse = await axios.post(
      `${API_BASE_URL}/vendedores/convertir-usuario`,
      {
        usuario_id: userId,
        numero_identificacion: sellerData.numero_identificacion,
        estado_onboarding: sellerData.estado_onboarding
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Conversión exitosa:', convertResponse.data.mensaje);

    // 4. Verificar perfil actualizado
    console.log('\n4️⃣ Verificando perfil actualizado...');
    const profileResponse = await axios.get(`${API_BASE_URL}/usuarios/perfil`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✅ Rol actualizado a:', profileResponse.data.rol);

    // 5. Probar dashboard de vendedor
    console.log('\n5️⃣ Probando dashboard de vendedor...');
    const dashboardResponse = await axios.get(`${API_BASE_URL}/vendedores/${userId}/dashboard`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✅ Dashboard accesible:', dashboardResponse.data);

    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   • Usuario: ${testUser.email}`);
    console.log(`   • ID: ${userId}`);
    console.log(`   • Rol: ${profileResponse.data.rol}`);
    console.log(`   • Estado onboarding: ${convertResponse.data.vendedor.estado_onboarding}`);

  } catch (error) {
    console.error('\n❌ Error en las pruebas:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

// Ejecutar pruebas
testSellerFlow(); 