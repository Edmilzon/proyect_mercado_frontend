/******************************************************************************

                            Online C Compiler.
                  Code, Compile, Run and Debug C program online.
Write your code in this editor and press "Run" button to compile and execute it.

*******************************************************************************/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <errno.h>

// ============================================================================
// PROBLEMA 1: Comparador de archivos usando proyección POSIX
// ============================================================================

void compare_files_mmap(const char *file1, const char *file2) {
    int fd1, fd2;
    struct stat st1, st2;
    char *map1, *map2;
    
    // Abrir el primer archivo
    fd1 = open(file1, O_RDONLY);
    if (fd1 == -1) {
        perror("Error abriendo el primer archivo");
        return;
    }
    
    // Abrir el segundo archivo
    fd2 = open(file2, O_RDONLY);
    if (fd2 == -1) {
        perror("Error abriendo el segundo archivo");
        close(fd1); // Asegurarse de cerrar el primer archivo si el segundo falla
        return;
    }
    
    // Obtener estadísticas del primer archivo (tamaño, etc.)
    if (fstat(fd1, &st1) == -1) {
        perror("Error obteniendo estadísticas del primer archivo");
        close(fd1);
        close(fd2);
        return;
    }
    
    // Obtener estadísticas del segundo archivo
    if (fstat(fd2, &st2) == -1) {
        perror("Error obteniendo estadísticas del segundo archivo");
        close(fd1);
        close(fd2);
        return;
    }
    
    // Comparar tamaños de archivo
    if (st1.st_size != st2.st_size) {
        printf("Los archivos tienen tamaños diferentes:\n");
        printf("  %s: %ld bytes\n", file1, st1.st_size);
        printf("  %s: %ld bytes\n", file2, st2.st_size);
        close(fd1);
        close(fd2);
        return;
    }
    
    // Si ambos archivos están vacíos, son iguales
    if (st1.st_size == 0) {
        printf("Los archivos están vacíos y son iguales.\n");
        close(fd1);
        close(fd2);
        return;
    }
    
    // Mapear el primer archivo a memoria
    map1 = mmap(NULL, st1.st_size, PROT_READ, MAP_PRIVATE, fd1, 0);
    if (map1 == MAP_FAILED) {
        perror("Error mapeando el primer archivo");
        close(fd1);
        close(fd2);
        return;
    }
    
    // Mapear el segundo archivo a memoria
    map2 = mmap(NULL, st2.st_size, PROT_READ, MAP_PRIVATE, fd2, 0);
    if (map2 == MAP_FAILED) {
        perror("Error mapeando el segundo archivo");
        munmap(map1, st1.st_size); // Desmapear el primer archivo si el segundo falla
        close(fd1);
        close(fd2);
        return;
    }
    
    // Comparar byte a byte
    int differences = 0;
    for (off_t i = 0; i < st1.st_size; i++) {
        if (map1[i] != map2[i]) {
            // Mostrar solo las primeras 10 diferencias para evitar una salida excesiva
            if (differences < 10) {
                printf("Diferencia en posición %ld: %s[%02x] != %s[%02x]\n", 
                               i, file1, (unsigned char)map1[i], file2, (unsigned char)map2[i]);
            }
            differences++;
        }
    }
    
    // Reportar el resultado de la comparación
    if (differences == 0) {
        printf("Los archivos son idénticos.\n");
    } else {
        printf("Se encontraron %d diferencias entre los archivos.\n", differences);
        if (differences > 10) {
            printf("(Solo se mostraron las primeras 10 diferencias)\n");
        }
    }
    
    // Desmapear la memoria y cerrar los descriptores de archivo
    munmap(map1, st1.st_size);
    munmap(map2, st2.st_size);
    close(fd1);
    close(fd2);
}

// ============================================================================
// PROBLEMA 2: Sistema de archivos
// ============================================================================

// Definiciones de constantes
#define MAX_SECTORS_IN_DISK 10000
#define MAX_I_NODE_ON_DISK 1000
#define SECTOR_SIZE 4096
#define MAX_BLOCKS_ON_DISK MAX_SECTORS_IN_DISK // Enunciado usa block y sector indistintamente
#define DIR_ENTRY_NAME_LEN 12
#define PERMISSIONS_LEN 14
#define I_NODE_DATA_LEN 15
#define I_NODE_RESERVED_LEN 7

// Tipos de datos según el enunciado
typedef unsigned char byte;
typedef int Permiso; // El enunciado usa Permiso para id_dueno y id_grupo

// Estructura de un sector de disco
typedef struct {
    byte data[SECTOR_SIZE];
} sector;

// Enumeración para el tipo de entrada de directorio
typedef enum {
    file_type, // Archivo
    dir_type   // Directorio
} file_type_enum;

// Estructura de una entrada de directorio
typedef struct {
    char name[DIR_ENTRY_NAME_LEN]; // 12 bytes
    file_type_enum type;           // 1 bit (usamos int para simplicidad en C)
    int used;                      // 1 bit (usamos int para simplicidad en C)
    int comienzo_archivo;          // 4 bytes
    int tamano_archivo;            // 4 bytes
    Permiso id_dueno;              // 3 bytes (usamos int para simplicidad en C)
    Permiso id_grupo;              // 3 bytes (usamos int para simplicidad en C)
    int i_node_num;                // 4 bytes
    int permisos[PERMISSIONS_LEN]; // 14 bits (usamos array de int para simplicidad en C)
} dir_entry;

// Estructura de un i-nodo
typedef struct {
    int i_node_num;                // 16 bits (usamos int para simplicidad en C)
    int used;                      // 1 bit (usamos int para simplicidad en C)
    int data[I_NODE_DATA_LEN];     // 60 bytes (array de 15 enteros, 4 bytes/int = 60)
    int tope;                      // 4 bytes
    int reserved[I_NODE_RESERVED_LEN]; // 7 bits (usamos array de int para simplicidad en C)
} i_node;

// Variables globales del sistema de archivos
i_node TD[MAX_I_NODE_ON_DISK];      // Tabla de inodos (inode_table)
int FAT[MAX_SECTORS_IN_DISK];       // Tabla de asignación de archivos (fat)
sector D[MAX_SECTORS_IN_DISK];      // Disco (disk)

// Procedimiento para leer un bloque de disco
void readBlock(sector *d_ptr, int block_num, sector *buff, int *ok) {
    if (block_num >= 0 && block_num < MAX_BLOCKS_ON_DISK) {
        *buff = d_ptr[block_num]; // Copia el contenido del sector
        *ok = 1; // Operación exitosa
    } else {
        *ok = 0; // Bloque fuera de rango
    }
}

// Procedimiento para escribir un bloque en disco
void writeBlock(sector *d_ptr, int block_num, sector *buff, int *ok) {
    if (block_num >= 0 && block_num < MAX_BLOCKS_ON_DISK) {
        d_ptr[block_num] = *buff; // Copia el contenido del buffer al sector
        *ok = 1; // Operación exitosa
    } else {
        *ok = 0; // Bloque fuera de rango
    }
}

// Procedimiento para obtener el número de inodo de un camino absoluto
// NOTA: Esta es una implementación simplificada para el examen.
// En un sistema de archivos real, implicaría recorrer la estructura de directorios.
void getInode(char *cam, int *nro_inodo, int *ok) {
    // Para simplificar, asumimos que el inodo del directorio padre es el inodo raíz (0).
    // En un sistema real, esto implicaría buscar el inodo del directorio 'cam'.
    if (strcmp(cam, "/") == 0 || strcmp(cam, ".") == 0 || strncmp(cam, "/home/usuario", strlen("/home/usuario")) == 0) {
        *nro_inodo = 0; // Inodo del directorio raíz o un inodo conocido para pruebas
        *ok = 1;
    } else {
        *nro_inodo = -1; // No encontrado
        *ok = 0;
    }
}

// Procedimiento para obtener el directorio padre de un camino absoluto
void dirname(char *cam, char *dir) {
    char *last_slash = strrchr(cam, '/'); // Encuentra la última barra
    if (last_slash == cam) { // Si la última barra es la primera (ej. "/archivo")
        strcpy(dir, "/"); // El directorio es la raíz
    } else if (last_slash != NULL) { // Si se encontró una barra y no es la primera
        int len = last_slash - cam; // Longitud del directorio
        strncpy(dir, cam, len);     // Copia el directorio
        dir[len] = '\0';            // Termina la cadena
    } else { // No hay barras (ej. "archivo.txt")
        strcpy(dir, "."); // El directorio es el actual
    }
}

// Procedimiento para obtener el nombre base de un camino absoluto
void basename(char *cam, char *base) {
    char *last_slash = strrchr(cam, '/'); // Encuentra la última barra
    if (last_slash != NULL) { // Si se encontró una barra
        strcpy(base, last_slash + 1); // Copia la parte después de la última barra
    } else { // No hay barras
        strcpy(base, cam); // El nombre base es el camino completo
    }
}

// Función para encontrar un sector libre en la FAT
int findFreeSector() {
    for (int i = 0; i < MAX_SECTORS_IN_DISK; i++) {
        if (FAT[i] == -1) { // -1 indica sector libre
            return i;
        }
    }
    return -1; // No se encontraron sectores libres
}

// Función para encontrar un inodo libre en la tabla de inodos
int findFreeInode() {
    for (int i = 0; i < MAX_I_NODE_ON_DISK; i++) {
        if (!TD[i].used) { // Si el inodo no está en uso
            return i;
        }
    }
    return -1; // No se encontraron inodos libres
}

// Implementación de la función createFile
void createFile(char *cam, Permiso id_dueno, Permiso id_grupo, int size, int *p, int *ok) {
    *ok = 0; // Inicialmente, la operación no es exitosa
    
    char dir_path[256];
    dirname(cam, dir_path); // Obtener el camino del directorio padre
    
    char file_name[256];
    basename(cam, file_name); // Obtener el nombre del archivo
    
    // Validar la longitud del nombre del archivo
    if (strlen(file_name) >= DIR_ENTRY_NAME_LEN) { // Usar DIR_ENTRY_NAME_LEN para consistencia
        printf("Error: El nombre del archivo '%s' es demasiado largo (máx %d caracteres).\n", file_name, DIR_ENTRY_NAME_LEN - 1);
        return;
    }
    
    // Obtener el inodo del directorio padre (simplificado)
    int parent_inode;
    int parent_ok;
    getInode(dir_path, &parent_inode, &parent_ok);
    
    if (!parent_ok) {
        printf("Error: No se pudo encontrar el directorio padre '%s'.\n", dir_path);
        return;
    }
    
    // Encontrar un inodo libre para el nuevo archivo
    int new_inode_num = findFreeInode();
    if (new_inode_num == -1) {
        printf("Error: No hay inodos libres disponibles.\n");
        return;
    }
    
    // Inicializar el nuevo inodo
    TD[new_inode_num].i_node_num = new_inode_num;
    TD[new_inode_num].used = 1; // Marcar como usado
    TD[new_inode_num].tope = 0; // Inicialmente no apunta a ningún bloque de datos
    
    // Limpiar los punteros de datos y campos reservados del inodo
    for (int i = 0; i < I_NODE_DATA_LEN; i++) {
        TD[new_inode_num].data[i] = 0; // 0 podría significar fin de cadena o no usado
    }
    for (int i = 0; i < I_NODE_RESERVED_LEN; i++) {
        TD[new_inode_num].reserved[i] = 0;
    }
    
    int start_sector = -1; // Sector inicial del archivo
    int current_sector = -1;
    // Calcular cuántos sectores se necesitan (redondeo hacia arriba)
    int sectors_needed = (size + SECTOR_SIZE - 1) / SECTOR_SIZE; 
    
    // Si el archivo tiene tamaño 0, no se asignan bloques de disco
    if (size > 0 && sectors_needed > 0) {
        // Encontrar el primer sector libre
        start_sector = findFreeSector();
        if (start_sector == -1) {
            printf("Error: No hay sectores libres disponibles en el disco para el archivo.\n");
            TD[new_inode_num].used = 0; // Liberar el inodo si no hay espacio
            return;
        }
        
        current_sector = start_sector;
        int sectors_allocated = 0;
        
        // Asignar y encadenar los sectores en la FAT
        while (sectors_allocated < sectors_needed) {
            // Si es el último sector, marcar con 0 (fin de archivo)
            if (sectors_allocated == sectors_needed - 1) {
                FAT[current_sector] = 0; // Fin de archivo
            } else {
                // Encontrar el siguiente sector libre
                int next_sector = findFreeSector();
                if (next_sector != -1) {
                    FAT[current_sector] = next_sector; // Apuntar al siguiente sector
                    current_sector = next_sector;      // Moverse al siguiente sector
                } else {
                    // No hay suficientes sectores libres para todo el archivo
                    FAT[current_sector] = 0; // Marcar el último sector asignado como fin de archivo
                    printf("Advertencia: Solo se pudieron asignar %d sectores de %d necesarios para '%s'.\n", 
                                    sectors_allocated + 1, sectors_needed, file_name);
                    break; // Salir del bucle de asignación
                }
            }
            sectors_allocated++;
        }
        
        // Llenar los sectores asignados con ceros
        sector zero_sector;
        memset(&zero_sector, 0, sizeof(sector)); // Crear un sector lleno de ceros
        
        current_sector = start_sector;
        int sectors_written = 0;
        
        // Recorrer la cadena de FAT para escribir ceros en los bloques de datos
        while (current_sector != 0 && current_sector != -1 && sectors_written < sectors_allocated) {
            int write_ok;
            writeBlock(D, current_sector, &zero_sector, &write_ok);
            if (!write_ok) {
                printf("Error: No se pudo escribir en el sector %d durante la inicialización.\n", current_sector);
                // Si falla la escritura, liberar los sectores ya asignados
                int temp_sector = start_sector;
                while (temp_sector != 0 && temp_sector != -1) {
                    int next_in_chain = FAT[temp_sector];
                    FAT[temp_sector] = -1; // Marcar como libre
                    temp_sector = next_in_chain;
                }
                TD[new_inode_num].used = 0; // Liberar el inodo
                return;
            }
            current_sector = FAT[current_sector]; // Mover al siguiente sector en la cadena
            sectors_written++;
        }
        
        // El primer puntero de datos del inodo apunta al sector inicial del archivo
        TD[new_inode_num].data[0] = start_sector;
        TD[new_inode_num].tope = 1; // Indica que se está usando el primer puntero de datos
    } else {
        // Archivo de tamaño 0, no se asignan sectores.
        // El comienzo_archivo en dir_entry seguirá siendo -1 o el valor inicial,
        // lo cual es consistente con no tener bloques de datos.
        start_sector = -1; // Asegurarse de que el comienzo_archivo sea -1 si size es 0
    }
    
    // Crear la entrada de directorio para el nuevo archivo
    dir_entry new_entry;
    strncpy(new_entry.name, file_name, DIR_ENTRY_NAME_LEN - 1); // Copiar el nombre, dejando espacio para '\0'
    new_entry.name[DIR_ENTRY_NAME_LEN - 1] = '\0'; // Asegurar terminación nula
    new_entry.type = file_type;
    new_entry.used = 1;
    new_entry.comienzo_archivo = start_sector; // El sector inicial del archivo
    new_entry.tamano_archivo = size;
    new_entry.id_dueno = id_dueno;
    new_entry.id_grupo = id_grupo;
    new_entry.i_node_num = new_inode_num;
    
    // Copiar los permisos
    for (int i = 0; i < PERMISSIONS_LEN; i++) {
        new_entry.permisos[i] = p[i];
    }
    
    printf("Archivo '%s' creado exitosamente:\n", file_name);
    printf("  - Camino: %s\n", cam);
    printf("  - Tamaño: %d bytes\n", size);
    printf("  - Inodo asignado: %d\n", new_inode_num);
    printf("  - Sector inicial de datos: %d\n", start_sector);
    printf("  - Sectores asignados: %d\n", sectors_needed);
    
    *ok = 1; // Operación exitosa
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

int main(int argc, char *argv[]) {
    printf("=== SISTEMA DE ARCHIVOS EXPERIMENTAL ===\n\n");
    
    printf("Inicializando sistema de archivos...\n");
    
    // Inicializar la FAT: todos los sectores libres (-1)
    for (int i = 0; i < MAX_SECTORS_IN_DISK; i++) {
        FAT[i] = -1; 
    }
    
    // Inicializar la tabla de inodos: todos los inodos no usados (0)
    for (int i = 0; i < MAX_I_NODE_ON_DISK; i++) {
        TD[i].used = 0;
        TD[i].i_node_num = i; // Asignar número de inodo
    }
    
    // Marcar el inodo 0 como usado (para el directorio raíz)
    TD[0].used = 1;
    TD[0].tope = 0; // El inodo raíz no tiene bloques de datos directos en este modelo simplificado
    // Podrías inicializar el inodo 0 con más detalles si representara un directorio real
    
    printf("Sistema inicializado correctamente.\n\n");
    
    printf("--- Ejemplo de creación de archivos ---\n");
    
    // Permisos de ejemplo (lectura/escritura para dueño, solo lectura para grupo y otros)
    int permisos[PERMISSIONS_LEN] = {1,1,0, 1,0,0, 1,0,0, 0,0,0, 0,0}; 
    
    int ok_status; // Variable para recibir el estado de éxito
    
    // Crear un archivo de 1000 bytes
    createFile("/home/usuario/doc.txt", 1001, 1001, 1000, permisos, &ok_status);
    
    if (ok_status) {
        printf("createFile: Archivo 'doc.txt' procesado exitosamente.\n\n");
    } else {
        printf("createFile: Error al procesar el archivo 'doc.txt'.\n\n");
    }
    
    // Crear un archivo vacío (0 bytes)
    createFile("/home/usuario/vacio.txt", 1001, 1001, 0, permisos, &ok_status);
    
    if (ok_status) {
        printf("createFile: Archivo 'vacio.txt' procesado exitosamente.\n\n");
    } else {
        printf("createFile: Error al procesar el archivo 'vacio.txt'.\n\n");
    }

    // Crear un archivo con un nombre muy largo para probar la validación
    createFile("/home/usuario/este_es_un_nombre_de_archivo_muy_largo_que_excede_el_limite.txt", 1001, 1001, 500, permisos, &ok_status);
    if (ok_status) {
        printf("createFile: Archivo con nombre largo procesado exitosamente.\n\n");
    } else {
        printf("createFile: Error al procesar el archivo con nombre largo (esperado).\n\n");
    }
    
    // Sección para la comparación de archivos (Problema 1)
    if (argc == 3) {
        printf("--- Comparación de archivos (Problema 1) ---\n");
        printf("Comparando '%s' con '%s':\n", argv[1], argv[2]);
        compare_files_mmap(argv[1], argv[2]);
    } else if (argc > 1) {
        printf("Uso para comparación: %s <archivo1> <archivo2>\n", argv[0]);
    } else {
        printf("Para probar la comparación de archivos, ejecute con dos argumentos:\n");
        printf("Ejemplo: ./a.out archivo1.txt archivo2.txt\n\n");
    }
    
    return 0;
}
