# Mermeladas Artesanales - Frontend

Aplicación web para la venta de mermeladas artesanales construida con Next.js 15, TypeScript y Tailwind CSS.

## 🚀 Características

- **Splash screen** con logo de mermeladas y redirección automática
- **Autenticación completa** con registro e inicio de sesión
- **Catálogo de mermeladas** con imágenes y descripciones detalladas
- **Página de detalle** para cada mermelada con selector de cantidad
- **Carrito de compras** con persistencia local y contador
- **Sistema de pagos** integrado
- **Diseño responsive** con tema de mermeladas (colores ámbar/naranja)
- **Arquitectura escalable** con separación de responsabilidades

## 🏗️ Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── (auth)/            # Rutas de autenticación
│   │   ├── login/         # Página de inicio de sesión
│   │   └── register/      # Página de registro
│   ├── dashboard/         # Catálogo de mermeladas
│   ├── producto/[id]/     # Detalle de mermelada
│   ├── pago/              # Sistema de pagos
│   └── layout.tsx         # Layout principal
├── components/            # Componentes React
│   ├── common/            # Componentes comunes
│   │   ├── Button/        # Botón reutilizable
│   │   ├── Card/          # Tarjeta de imagen
│   │   └── Header/        # Barra de búsqueda
│   ├── ui/                # Componentes de UI
│   │   └── Spinner/       # Indicador de carga
│   └── feature/           # Componentes específicos
│       └── ProductList/   # Lista de mermeladas
├── config/                # Configuración
├── hooks/                 # Hooks personalizados
├── lib/                   # Utilidades y servicios
├── models/                # Modelos de datos
├── store/                 # Estado global (Zustand)
├── types/                 # Tipos TypeScript
└── utils/                 # Datos mock de mermeladas
```

## 🛠️ Tecnologías

- **Next.js 15** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS
- **Zustand** - Gestión de estado
- **Heroicons** - Iconografía
- **React Icons** - Iconos adicionales

## 📦 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd admi-ventas-frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en desarrollo**
```bash
npm run dev
   ```

## 🔧 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Servidor de producción
- `npm run lint` - Linter de código

## 🌐 Flujo de la Aplicación

1. **Splash Screen** (`/`) - Pantalla de bienvenida con logo
2. **Login/Register** (`/login`, `/register`) - Autenticación
3. **Dashboard** (`/dashboard`) - Catálogo de mermeladas
4. **Detalle de Mermelada** (`/producto/[id]`) - Vista detallada con selector de cantidad
5. **Pago** (`/pago`) - Resumen de compra y confirmación

## 🍯 Mermeladas Disponibles

- **Mermelada de Uchuba** - Dulce y aromática
- **Mermelada de Tomate** - Con toque especial de especias
- **Mermelada de Fresa** - 100% natural sin conservantes
- **Mermelada de Mora** - Artesanal con textura suave
- **Mermelada de Durazno** - Con trozos de fruta natural
- **Mermelada de Piña** - Tropical con toque de canela

## 🎨 Componentes Principales

### Button
Componente reutilizable con variantes y tamaños configurables.

### ProductCard
Tarjeta de mermelada con link al detalle y funcionalidad de carrito.

### SearchBar
Barra de búsqueda con autocompletado para mermeladas.

### PaymentCard
Tarjeta de pago con gestión de cantidades.

## 📱 Estado Global

### AuthStore
Maneja el estado de autenticación del usuario.

### CartStore
Gestiona el carrito de compras con persistencia local.

## 🔒 Autenticación

El sistema incluye:
- Registro de usuarios
- Inicio de sesión
- Persistencia de tokens
- Protección de rutas (pendiente)

## 🚀 Despliegue

El proyecto está configurado para desplegarse en Vercel:

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte, email: soporte@mermeladasartesanales.com
