#!/bin/bash

echo "=========================================="
echo "DEMOSTRACIÓN DEL SISTEMA DE ARCHIVOS"
echo "=========================================="
echo

# Compilar el programa
echo "1. Compilando el programa..."
make clean
make
echo

# Ejecutar el sistema de archivos
echo "2. Ejecutando el sistema de archivos experimental..."
./proyecto
echo

# Comparar archivos diferentes
echo "3. Comparando archivos diferentes..."
./proyecto archivo1.txt archivo2.txt
echo

# Comparar archivos idénticos
echo "4. Comparando archivos idénticos..."
./proyecto archivo1.txt archivo3.txt
echo

# Probar con archivos que no existen
echo "5. Probando con archivos inexistentes..."
./proyecto archivo1.txt archivo_inexistente.txt
echo

echo "=========================================="
echo "DEMOSTRACIÓN COMPLETADA"
echo "==========================================" 