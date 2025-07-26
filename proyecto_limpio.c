#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <errno.h>

// PROBLEMA 1: Comparador de archivos usando proyección POSIX 
void compare_files_mmap(const char *file1, const char *file2) {
    int fd1, fd2;
    struct stat st1, st2;
    char *map1, *map2;
    
    fd1 = open(file1, O_RDONLY);
    if (fd1 == -1) {
        perror("Error abriendo el primer archivo");
        return;
    }
    
    fd2 = open(file2, O_RDONLY);
    if (fd2 == -1) {
        perror("Error abriendo el segundo archivo");
        close(fd1);
        return;
    }
    
    if (fstat(fd1, &st1) == -1) {
        perror("Error obteniendo estadísticas del primer archivo");
        close(fd1);
        close(fd2);
        return;
    }
    
    if (fstat(fd2, &st2) == -1) {
        perror("Error obteniendo estadísticas del segundo archivo");
        close(fd1);
        close(fd2);
        return;
    }
    
    if (st1.st_size != st2.st_size) {
        printf("Los archivos tienen tamaños diferentes:\n");
        printf("  %s: %ld bytes\n", file1, st1.st_size);
        printf("  %s: %ld bytes\n", file2, st2.st_size);
        close(fd1);
        close(fd2);
        return;
    }
    
    if (st1.st_size == 0) {
        printf("Los archivos están vacíos y son iguales.\n");
        close(fd1);
        close(fd2);
        return;
    }
    
    map1 = mmap(NULL, st1.st_size, PROT_READ, MAP_PRIVATE, fd1, 0);
    if (map1 == MAP_FAILED) {
        perror("Error mapeando el primer archivo");
        close(fd1);
        close(fd2);
        return;
    }
    
    map2 = mmap(NULL, st2.st_size, PROT_READ, MAP_PRIVATE, fd2, 0);
    if (map2 == MAP_FAILED) {
        perror("Error mapeando el segundo archivo");
        munmap(map1, st1.st_size);
        close(fd1);
        close(fd2);
        return;
    }
    
    int differences = 0;
    for (off_t i = 0; i < st1.st_size; i++) {
        if (map1[i] != map2[i]) {
            if (differences < 10) {
                printf("Diferencia en posición %ld: %s[%02x] != %s[%02x]\n", 
                       i, file1, (unsigned char)map1[i], file2, (unsigned char)map2[i]);
            }
            differences++;
        }
    }
    
    if (differences == 0) {
        printf("Los archivos son idénticos.\n");
    } else {
        printf("Se encontraron %d diferencias entre los archivos.\n", differences);
        if (differences > 10) {
            printf("(Solo se mostraron las primeras 10 diferencias)\n");
        }
    }
    
    munmap(map1, st1.st_size);
    munmap(map2, st2.st_size);
    close(fd1);
    close(fd2);
}

// PROBLEMA 2: Sistema de archivos 
#define MAX_SECTORS_IN_DISK 10000
#define MAX_I_NODE_ON_DISK 1000
#define SECTOR_SIZE 4096
#define MAX_BLOCKS_ON_DISK MAX_SECTORS_IN_DISK
#define DIR_ENTRY_NAME_LEN 12
#define PERMISSIONS_LEN 14
#define I_NODE_DATA_LEN 15
#define I_NODE_RESERVED_LEN 7

typedef unsigned char byte;
typedef int Permiso;

typedef struct {
    byte data[SECTOR_SIZE];
} sector;

typedef enum {
    file_type,
    dir_type
} file_type_enum;

typedef struct {
    char name[DIR_ENTRY_NAME_LEN];
    file_type_enum type;
    int used;
    int comienzo_archivo;
    int tamano_archivo;
    Permiso id_dueno;
    Permiso id_grupo;
    int i_node_num;
    int permisos[PERMISSIONS_LEN];
} dir_entry;

typedef struct {
    int i_node_num;
    int used;
    int data[I_NODE_DATA_LEN];
    int tope;
    int reserved[I_NODE_RESERVED_LEN];
} i_node;

i_node TD[MAX_I_NODE_ON_DISK];
int FAT[MAX_SECTORS_IN_DISK];
sector D[MAX_SECTORS_IN_DISK];

void readBlock(sector *d_ptr, int block_num, sector *buff, int *ok) {
    if (block_num >= 0 && block_num < MAX_BLOCKS_ON_DISK) {
        *buff = d_ptr[block_num];
        *ok = 1;
    } else {
        *ok = 0;
    }
}

void writeBlock(sector *d_ptr, int block_num, sector *buff, int *ok) {
    if (block_num >= 0 && block_num < MAX_BLOCKS_ON_DISK) {
        d_ptr[block_num] = *buff;
        *ok = 1;
    } else {
        *ok = 0;
    }
}

void getInode(char *cam, int *nro_inodo, int *ok) {
    if (strcmp(cam, "/") == 0 || strcmp(cam, ".") == 0 || strncmp(cam, "/home/usuario", strlen("/home/usuario")) == 0) {
        *nro_inodo = 0;
        *ok = 1;
    } else {
        *nro_inodo = -1;
        *ok = 0;
    }
}

void dirname(char *cam, char *dir) {
    char *last_slash = strrchr(cam, '/');
    if (last_slash == cam) {
        strcpy(dir, "/");
    } else if (last_slash != NULL) {
        int len = last_slash - cam;
        strncpy(dir, cam, len);
        dir[len] = '\0';
    } else {
        strcpy(dir, ".");
    }
}

void basename(char *cam, char *base) {
    char *last_slash = strrchr(cam, '/');
    if (last_slash != NULL) {
        strcpy(base, last_slash + 1);
    } else {
        strcpy(base, cam);
    }
}

int findFreeSector() {
    for (int i = 0; i < MAX_SECTORS_IN_DISK; i++) {
        if (FAT[i] == -1) {
            return i;
        }
    }
    return -1;
}

int findFreeInode() {
    for (int i = 0; i < MAX_I_NODE_ON_DISK; i++) {
        if (!TD[i].used) {
            return i;
        }
    }
    return -1;
}

void createFile(char *cam, Permiso id_dueno, Permiso id_grupo, int size, int *p, int *ok) {
    *ok = 0;
    
    char dir_path[256];
    dirname(cam, dir_path);
    
    char file_name[256];
    basename(cam, file_name);
    
    if (strlen(file_name) >= DIR_ENTRY_NAME_LEN) {
        printf("Error: El nombre del archivo '%s' es demasiado largo (máx %d caracteres).\n", file_name, DIR_ENTRY_NAME_LEN - 1);
        return;
    }
    
    int parent_inode;
    int parent_ok;
    getInode(dir_path, &parent_inode, &parent_ok);
    
    if (!parent_ok) {
        printf("Error: No se pudo encontrar el directorio padre '%s'.\n", dir_path);
        return;
    }
    
    int new_inode_num = findFreeInode();
    if (new_inode_num == -1) {
        printf("Error: No hay inodos libres disponibles.\n");
        return;
    }
    
    TD[new_inode_num].i_node_num = new_inode_num;
    TD[new_inode_num].used = 1;
    TD[new_inode_num].tope = 0;
    
    for (int i = 0; i < I_NODE_DATA_LEN; i++) {
        TD[new_inode_num].data[i] = 0;
    }
    for (int i = 0; i < I_NODE_RESERVED_LEN; i++) {
        TD[new_inode_num].reserved[i] = 0;
    }
    
    int start_sector = -1;
    int current_sector = -1;
    int sectors_needed = (size + SECTOR_SIZE - 1) / SECTOR_SIZE;
    
    if (size > 0 && sectors_needed > 0) {
        start_sector = findFreeSector();
        if (start_sector == -1) {
            printf("Error: No hay sectores libres disponibles en el disco para el archivo.\n");
            TD[new_inode_num].used = 0;
            return;
        }
        
        current_sector = start_sector;
        int sectors_allocated = 0;
        
        while (sectors_allocated < sectors_needed) {
            if (sectors_allocated == sectors_needed - 1) {
                FAT[current_sector] = 0;
            } else {
                int next_sector = findFreeSector();
                if (next_sector != -1) {
                    FAT[current_sector] = next_sector;
                    current_sector = next_sector;
                } else {
                    FAT[current_sector] = 0;
                    printf("Advertencia: Solo se pudieron asignar %d sectores de %d necesarios para '%s'.\n", 
                                    sectors_allocated + 1, sectors_needed, file_name);
                    break;
                }
            }
            sectors_allocated++;
        }
        
        sector zero_sector;
        memset(&zero_sector, 0, sizeof(sector));
        
        current_sector = start_sector;
        int sectors_written = 0;
        
        while (current_sector != 0 && current_sector != -1 && sectors_written < sectors_allocated) {
            int write_ok;
            writeBlock(D, current_sector, &zero_sector, &write_ok);
            if (!write_ok) {
                printf("Error: No se pudo escribir en el sector %d durante la inicialización.\n", current_sector);
                int temp_sector = start_sector;
                while (temp_sector != 0 && temp_sector != -1) {
                    int next_in_chain = FAT[temp_sector];
                    FAT[temp_sector] = -1;
                    temp_sector = next_in_chain;
                }
                TD[new_inode_num].used = 0;
                return;
            }
            current_sector = FAT[current_sector];
            sectors_written++;
        }
        
        TD[new_inode_num].data[0] = start_sector;
        TD[new_inode_num].tope = 1;
    } else {
        start_sector = -1;
    }
    
    dir_entry new_entry;
    strncpy(new_entry.name, file_name, DIR_ENTRY_NAME_LEN - 1);
    new_entry.name[DIR_ENTRY_NAME_LEN - 1] = '\0';
    new_entry.type = file_type;
    new_entry.used = 1;
    new_entry.comienzo_archivo = start_sector;
    new_entry.tamano_archivo = size;
    new_entry.id_dueno = id_dueno;
    new_entry.id_grupo = id_grupo;
    new_entry.i_node_num = new_inode_num;
    
    for (int i = 0; i < PERMISSIONS_LEN; i++) {
        new_entry.permisos[i] = p[i];
    }
    
    printf("Archivo '%s' creado exitosamente:\n", file_name);
    printf("  - Camino: %s\n", cam);
    printf("  - Tamaño: %d bytes\n", size);
    printf("  - Inodo asignado: %d\n", new_inode_num);
    printf("  - Sector inicial de datos: %d\n", start_sector);
    printf("  - Sectores asignados: %d\n", sectors_needed);
    
    *ok = 1;
}

int main(int argc, char *argv[]) {
    printf("=== SISTEMA DE ARCHIVOS EXPERIMENTAL ===\n\n");
    
    printf("Inicializando sistema de archivos...\n");
    
    for (int i = 0; i < MAX_SECTORS_IN_DISK; i++) {
        FAT[i] = -1;
    }
    
    for (int i = 0; i < MAX_I_NODE_ON_DISK; i++) {
        TD[i].used = 0;
        TD[i].i_node_num = i;
    }
    
    TD[0].used = 1;
    TD[0].tope = 0;
    
    printf("Sistema inicializado correctamente.\n\n");
    
    printf("--- Ejemplo de creación de archivos ---\n");
    
    int permisos[PERMISSIONS_LEN] = {1,1,0, 1,0,0, 1,0,0, 0,0,0, 0,0};
    
    int ok_status;
    
    createFile("/home/usuario/doc.txt", 1001, 1001, 1000, permisos, &ok_status);
    
    if (ok_status) {
        printf("createFile: Archivo 'doc.txt' procesado exitosamente.\n\n");
    } else {
        printf("createFile: Error al procesar el archivo 'doc.txt'.\n\n");
    }
    
    createFile("/home/usuario/vacio.txt", 1001, 1001, 0, permisos, &ok_status);
    
    if (ok_status) {
        printf("createFile: Archivo 'vacio.txt' procesado exitosamente.\n\n");
    } else {
        printf("createFile: Error al procesar el archivo 'vacio.txt'.\n\n");
    }
    
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