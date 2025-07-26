'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth';
import { API_BASE_URL } from '@/constants';

export const ApiTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult('Probando conexión...');
    
    try {
      // Test 1: Verificar si el backend responde
      const response = await fetch(API_BASE_URL);
      setTestResult(`✅ Backend responde: ${response.status} ${response.statusText}`);
      
      // Test 2: Probar endpoint de login
      const loginResponse = await fetch(`${API_BASE_URL}/autenticacion/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@test.com',
          password: '123456'
        })
      });
      
      const loginData = await loginResponse.json();
      setTestResult(prev => prev + `\n✅ Login endpoint: ${loginResponse.status} - ${loginData.message || 'OK'}`);
      
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAuthService = async () => {
    setIsLoading(true);
    setTestResult('Probando servicio de autenticación...');
    
    try {
      await authService.login({
        email: 'test@test.com',
        password: '123456'
      });
      setTestResult('❌ Login exitoso (no debería serlo con credenciales de prueba)');
    } catch (error: any) {
      if (error.response?.status === 401) {
        setTestResult('✅ Servicio de autenticación funciona correctamente (401 esperado)');
      } else {
        setTestResult(`❌ Error inesperado: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Prueba de Conexión API</h2>
      
      <div className="space-y-4 mb-6">
        <Button 
          onClick={testConnection}
          loading={isLoading}
          className="mr-4"
        >
          Probar Conexión
        </Button>
        
        <Button 
          onClick={testAuthService}
          loading={isLoading}
          variant="outline"
        >
          Probar Servicio Auth
        </Button>
      </div>
      
      {testResult && (
        <div className="bg-gray-50 rounded-md p-4">
          <h3 className="font-medium text-gray-900 mb-2">Resultado:</h3>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
            {testResult}
          </pre>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>URL del Backend:</strong> {API_BASE_URL}</p>
        <p><strong>Endpoint de Login:</strong> {API_BASE_URL}/autenticacion/login</p>
      </div>
    </div>
  );
};

export default ApiTest; 