# Instrucciones para OnlineGDB

## Cómo usar este proyecto en OnlineGDB

### 1. Acceso a OnlineGDB
1. Ve a [OnlineGDB](https://www.onlinegdb.com/)
2. Selecciona "C" como lenguaje de programación
3. El compilador por defecto será GCC

### 2. Copiar el código
1. Abre el archivo `proyecto.c` en tu editor local
2. Copia todo el contenido del archivo
3. Pega el código en el editor de OnlineGDB

### 3. Compilar y ejecutar
1. Haz clic en el botón "Run" (▶️)
2. El programa se compilará y ejecutará automáticamente
3. Verás la salida en la consola

### 4. Probar la comparación de archivos
Para probar la funcionalidad de comparación de archivos:

1. **Crear archivos de prueba**:
   - En la pestaña "Files" de OnlineGDB, crea dos archivos:
     - `archivo1.txt`
     - `archivo2.txt`

2. **Contenido sugerido para archivo1.txt**:
   ```
   Este es el primer archivo de prueba.
   Contiene algunas líneas de texto.
   Línea 3: Esta línea es diferente.
   ```

3. **Contenido sugerido para archivo2.txt**:
   ```
   Este es el primer archivo de prueba.
   Contiene algunas líneas de texto.
   Línea 3: Esta línea es DIFERENTE.
   ```

4. **Modificar el main()**:
   Cambia la función main para incluir la comparación:
   ```c
   int main(int argc, char *argv[]) {
       printf("=== SISTEMA DE ARCHIVOS EXPERIMENTAL ===\n\n");
       
       // Inicializar el sistema de archivos
       printf("Inicializando sistema de archivos...\n");
       
       // Inicializar FAT con sectores libres
       for (int i = 0; i < MAX_SECTORS_IN_DISK; i++) {
           FAT[i] = -1;
       }
       
       // Inicializar tabla de inodos
       for (int i = 0; i < MAX_I_NODE_ON_DISK; i++) {
           TD[i].used = 0;
           TD[i].i_node_num = i;
       }
       
       // Reservar el inodo 0 para el directorio raíz
       TD[0].used = 1;
       TD[0].tope = 0;
       
       printf("Sistema inicializado correctamente.\n\n");
       
       // Ejemplo de uso de createFile
       printf("--- Ejemplo de creación de archivos ---\n");
       
       int permisos[14] = {1,1,0, 1,0,0, 1,0,0, 0,0,0, 0,0};
       
       int ok;
       createFile("/home/usuario/doc.txt", 1001, 1001, 1000, permisos, &ok);
       
       if (ok) {
           printf("✓ Archivo creado exitosamente\n\n");
       } else {
           printf("✗ Error al crear el archivo\n\n");
       }
       
       // Comparar archivos
       printf("--- Comparación de archivos ---\n");
       compare_files_mmap("archivo1.txt", "archivo2.txt");
       
       return 0;
   }
   ```

### 5. Resultados esperados

#### Salida del sistema de archivos:
```
=== SISTEMA DE ARCHIVOS EXPERIMENTAL ===

Inicializando sistema de archivos...
Sistema inicializado correctamente.

--- Ejemplo de creación de archivos ---
Archivo 'doc.txt' creado exitosamente:
  - Tamaño: 1000 bytes
  - Inodo: 1
  - Sector inicial: 0
  - Sectores asignados: 1
✓ Archivo creado exitosamente
```

#### Salida de la comparación:
```
--- Comparación de archivos ---
Diferencia en posición 52: archivo1.txt[64] != archivo2.txt[44]
Diferencia en posición 53: archivo1.txt[69] != archivo2.txt[49]
Diferencia en posición 54: archivo1.txt[66] != archivo2.txt[46]
Se encontraron 3 diferencias entre los archivos.
```

### 6. Notas importantes para OnlineGDB

1. **Limitaciones del entorno**:
   - No todos los archivos de cabecera POSIX pueden estar disponibles
   - Algunas funciones del sistema pueden no funcionar
   - El mapeo de memoria (mmap) puede no estar disponible

2. **Alternativa si mmap no funciona**:
   Si `mmap` no está disponible, puedes usar una versión simplificada:
   ```c
   void compare_files_simple(const char *file1, const char *file2) {
       FILE *f1 = fopen(file1, "rb");
       FILE *f2 = fopen(file2, "rb");
       
       if (!f1 || !f2) {
           printf("Error abriendo archivos\n");
           return;
       }
       
       int c1, c2;
       int pos = 0;
       int differences = 0;
       
       while ((c1 = fgetc(f1)) != EOF && (c2 = fgetc(f2)) != EOF) {
           if (c1 != c2) {
               if (differences < 10) {
                   printf("Diferencia en posición %d: %02x != %02x\n", pos, c1, c2);
               }
               differences++;
           }
           pos++;
       }
       
       if (differences == 0) {
           printf("Los archivos son idénticos.\n");
       } else {
           printf("Se encontraron %d diferencias.\n", differences);
       }
       
       fclose(f1);
       fclose(f2);
   }
   ```

3. **Compilación exitosa**:
   - El código está diseñado para ser compatible con GCC
   - Usa solo librerías estándar de C
   - No requiere dependencias externas

### 7. Verificación de funcionalidad

Para verificar que todo funciona correctamente:

1. **Sistema de archivos**: Debe mostrar la creación exitosa de archivos
2. **Comparador**: Debe detectar diferencias entre archivos
3. **Manejo de errores**: Debe manejar archivos inexistentes correctamente

### 8. Solución de problemas

- **Error de compilación**: Verifica que el código esté completo
- **Archivos no encontrados**: Asegúrate de crear los archivos de prueba
- **Funciones no disponibles**: Usa la versión simplificada del comparador

### 9. Envío del proyecto

Una vez que hayas verificado que todo funciona:

1. Copia el código final
2. Toma capturas de pantalla de la ejecución
3. Documenta cualquier problema encontrado
4. Sube el proyecto a la plataforma según las instrucciones del curso 