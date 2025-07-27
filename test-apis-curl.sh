#!/bin/bash

# Script para probar las APIs del backend
# Uso: ./test-apis-curl.sh [TOKEN_JWT]

API_BASE_URL="https://proyect-mercado-backend.fly.dev/api"
TOKEN=$1

echo "🔍 Probando APIs del backend..."
echo "URL Base: $API_BASE_URL"
echo "Token: ${TOKEN:-'No proporcionado'}"
echo ""

# Función para hacer requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    echo "📡 $method $endpoint"
    
    if [ -n "$TOKEN" ]; then
        if [ -n "$data" ]; then
            curl -s -X $method "$API_BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $TOKEN" \
                -d "$data"
        else
            curl -s -X $method "$API_BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $TOKEN"
        fi
    else
        if [ -n "$data" ]; then
            curl -s -X $method "$API_BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data"
        else
            curl -s -X $method "$API_BASE_URL$endpoint" \
                -H "Content-Type: application/json"
        fi
    fi
    
    echo ""
    echo "---"
    echo ""
}

# APIs públicas (sin token)
echo "🌐 APIS PÚBLICAS"
echo "=================="

make_request "GET" "/usuarios"
make_request "GET" "/productos"
make_request "GET" "/categorias"
make_request "GET" "/vendedores"
make_request "GET" "/zonas"

# APIs que requieren token
if [ -n "$TOKEN" ]; then
    echo "🔐 APIS CON AUTENTICACIÓN"
    echo "=========================="
    
    make_request "GET" "/usuarios/perfil"
    make_request "GET" "/pedidos/mis-pedidos"
    make_request "GET" "/resenas"
    make_request "GET" "/conversaciones"
    
    # APIs específicas de vendedor (si el usuario es vendedor)
    echo "🏪 APIS DE VENDEDOR"
    echo "==================="
    
    # Nota: Necesitarías el vendedor_id específico
    # make_request "GET" "/vendedores/{vendedor_id}/dashboard"
    # make_request "GET" "/vendedores/{vendedor_id}/productos"
    # make_request "GET" "/vendedores/{vendedor_id}/pedidos"
fi

echo "✅ Pruebas completadas"
echo ""
echo "💡 Para probar APIs específicas de vendedor, necesitas:"
echo "   1. Un token JWT válido"
echo "   2. El vendedor_id específico"
echo "   3. Que el servidor backend esté funcionando" 