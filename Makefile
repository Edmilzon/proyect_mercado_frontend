CC = gcc
CFLAGS = -Wall -Wextra -std=c99 -pedantic
TARGET = proyecto
SOURCE = proyecto.c

# Compilación por defecto
all: $(TARGET)

# Regla para compilar el programa
$(TARGET): $(SOURCE)
	$(CC) $(CFLAGS) -o $(TARGET) $(SOURCE)

# Regla para limpiar archivos generados
clean:
	rm -f $(TARGET)

# Regla para ejecutar el programa
run: $(TARGET)
	./$(TARGET)

# Regla para probar la comparación de archivos
test: $(TARGET)
	./$(TARGET) archivo1.txt archivo2.txt

# Regla para instalar dependencias (Arch Linux)
install-deps:
	sudo pacman -S --needed base-devel

# Regla para verificar el compilador
check-compiler:
	@echo "Verificando compilador..."
	@which $(CC) || echo "Compilador $(CC) no encontrado"
	@$(CC) --version || echo "Error al obtener versión del compilador"

.PHONY: all clean run test install-deps check-compiler 