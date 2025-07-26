# Sistema de Archivos Experimental y Comparador de Archivos

Este proyecto implementa dos funcionalidades principales:

## 1. Comparador de Archivos usando Proyección POSIX (mmap)

### Descripción
Programa que utiliza los servicios POSIX de proyección de archivos (`mmap`) para comparar dos archivos byte por byte de manera eficiente.

### Características
- Comparación eficiente usando mapeo de memoria
- Detección de diferencias de tamaño
- Reporte detallado de diferencias (hasta 10 primeras diferencias)
- Manejo de errores robusto
- Liberación automática de recursos

### Uso
```bash
# Compilar el programa
gcc -o proyecto proyecto.c

# Comparar dos archivos
./proyecto archivo1.txt archivo2.txt
```

## 2. Sistema de Archivos Experimental

### Descripción
Implementación de un sistema de archivos experimental que combina:
- **Asignación en lista (Linked Allocation)** para archivos (tipo FAT)
- **Asignación indexada (Indexed Allocation)** para directorios

### Estructura del Sistema

#### Tipos de Datos
- **sector**: 4096 bytes de datos
- **dir_entry**: Entrada de directorio con metadatos del archivo
- **i_node**: Nodo índice con información de asignación
- **FAT**: Tabla de asignación de archivos
- **TD**: Tabla de inodos
- **D**: Disco virtual

#### Características
- Archivos almacenados usando estrategia FAT
- Directorios almacenados usando asignación indexada directa
- Inodo 0 reservado para directorio raíz
- Valores FAT: 0 (fin de archivo), -1 (sector libre), -2 (sector de directorio)

### Función createFile

#### Prototipo
```c
void createFile(char *cam, Permiso id_dueno, Permiso id_grupo, int size, int *p, int *ok);
```

#### Parámetros
- `cam`: Camino absoluto al archivo (ej: "/home/usuario/archivo.txt")
- `id_dueno`: Identificador del dueño del archivo
- `id_grupo`: Identificador del grupo del archivo
- `size`: Tamaño en bytes del archivo
- `p`: Array de 14 bits con los permisos
- `ok`: Parámetro de salida que indica éxito de la operación

#### Funcionalidad
1. Valida el nombre del archivo (máximo 12 caracteres)
2. Obtiene el directorio padre y nombre del archivo
3. Busca un inodo libre
4. Asigna sectores en cadena usando FAT
5. Inicializa los sectores con ceros
6. Crea la entrada de directorio
7. Actualiza las estructuras del sistema

### Uso del Sistema
```bash
# Compilar
gcc -o proyecto proyecto.c

# Ejecutar (demostración del sistema de archivos)
./proyecto

# Ejecutar con comparación de archivos
./proyecto archivo1.txt archivo2.txt
```

## Compilación

```bash
gcc -Wall -Wextra -o proyecto proyecto.c
```

## Requisitos del Sistema
- Sistema operativo Linux/Unix
- Compilador GCC
- Librerías POSIX estándar

## Ejemplo de Salida

```
=== SISTEMA DE ARCHIVOS EXPERIMENTAL ===

Inicializando sistema de archivos...
Sistema inicializado correctamente.

--- Ejemplo de creación de archivos ---
Archivo 'documento.txt' creado exitosamente:
  - Tamaño: 1000 bytes
  - Inodo: 1
  - Sector inicial: 0
  - Sectores asignados: 1
✓ Archivo creado exitosamente

Archivo 'vacio.txt' creado exitosamente:
  - Tamaño: 0 bytes
  - Inodo: 2
  - Sector inicial: -1
  - Sectores asignados: 0
✓ Archivo vacío creado exitosamente
```

## Notas de Implementación

### Funciones Auxiliares Simuladas
- `readBlock()`: Simula lectura de bloques del disco
- `writeBlock()`: Simula escritura de bloques al disco
- `getInode()`: Simula búsqueda de inodos por camino
- `dirname()`: Extrae el directorio padre de un camino
- `basename()`: Extrae el nombre del archivo de un camino

### Limitaciones de la Implementación
- Las funciones auxiliares están simplificadas para demostración
- No implementa persistencia real en disco
- La gestión de directorios está simplificada
- No maneja concurrencia

### Mejoras Futuras
- Implementación completa de gestión de directorios
- Persistencia real en archivos de disco
- Manejo de concurrencia
- Optimizaciones de rendimiento
- Interfaz de línea de comandos más completa 