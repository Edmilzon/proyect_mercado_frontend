'use client';
import { useRouter } from 'next/navigation';
import { 
  AcademicCapIcon, 
  HeartIcon, 
  SparklesIcon, 
  UsersIcon,
  MapPinIcon,
  TrophyIcon,
  BeakerIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

export default function AboutPage() {
  const router = useRouter();

  const handleExplorarProductos = () => {
    router.push('/productos');
  };

  const handleContactarEquipo = () => {
    router.push('/contacto');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white bg-opacity-20 p-4 rounded-full">
                <HeartIcon className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Acerca de <span className="text-amber-200">Nosotros</span>
            </h1>
            <p className="text-xl md:text-2xl text-amber-100 max-w-3xl mx-auto leading-relaxed">
              Un equipo de 11 estudiantes apasionados de la Universidad Mayor de San Simón, 
              creando la mejor experiencia digital para la venta de mermeladas artesanales.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Nuestra Historia */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <SparklesIcon className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nuestra Historia
            </h2>
            <div className="w-24 h-1 bg-amber-500 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Como estudiantes de la Universidad Mayor de San Simón, nos embarcamos en un proyecto 
                innovador que combina tecnología moderna con tradición culinaria. Nuestro objetivo 
                era crear una plataforma digital que revolucionara la forma en que se comercializan 
                las mermeladas artesanales en Bolivia.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Este proyecto nació de la pasión por la tecnología y el deseo de apoyar a productores 
                locales que mantienen viva la tradición de las mermeladas caseras. Cada línea de código 
                y cada funcionalidad fue diseñada pensando en crear la mejor experiencia posible para 
                nuestros usuarios.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Trabajamos incansablemente para desarrollar una aplicación que no solo sea funcional, 
                sino que también refleje la calidad y autenticidad de los productos que representamos.
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-8 rounded-2xl shadow-lg">
              <div className="text-center">
                <AcademicCapIcon className="w-16 h-16 text-amber-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Universidad Mayor de San Simón</h3>
                <p className="text-gray-600 mb-4">Cochabamba, Bolivia</p>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600">
                    &ldquo;Formando profesionales comprometidos con la innovación y el desarrollo tecnológico&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nuestro Equipo */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <UsersIcon className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nuestro Equipo
            </h2>
            <div className="w-24 h-1 bg-amber-500 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrophyIcon className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Liderazgo</h3>
                <p className="text-gray-600">
                  Coordinación y gestión del proyecto con enfoque en resultados excepcionales
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BeakerIcon className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Desarrollo</h3>
                <p className="text-gray-600">
                  Programación y diseño de la aplicación con tecnologías modernas y mejores prácticas
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GlobeAltIcon className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Innovación</h3>
                <p className="text-gray-600">
                  Investigación y aplicación de soluciones creativas para el comercio digital
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Nuestra Misión */}
        <div className="mb-20">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-8 md:p-12 text-white">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
                <HeartIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestra Misión</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4 text-amber-200">Innovación Tecnológica</h3>
                <p className="text-amber-100 leading-relaxed mb-6">
                  Desarrollar soluciones digitales que conecten a productores artesanales con consumidores 
                  conscientes, utilizando las últimas tecnologías web y móviles para crear experiencias 
                  únicas y memorables.
                </p>
                <p className="text-amber-100 leading-relaxed">
                  Nuestro compromiso es mantenernos a la vanguardia de la innovación tecnológica, 
                  implementando las mejores prácticas de desarrollo y diseño de interfaces de usuario.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4 text-amber-200">Apoyo a Productores Locales</h3>
                <p className="text-amber-100 leading-relaxed mb-6">
                  Promover y facilitar la comercialización de productos artesanales de alta calidad, 
                  especialmente mermeladas elaboradas con ingredientes naturales y métodos tradicionales.
                </p>
                <p className="text-amber-100 leading-relaxed">
                  Creemos en el valor de preservar las tradiciones culinarias mientras las adaptamos 
                  a las necesidades del mercado digital actual.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Nuestros Valores</h2>
            <div className="w-24 h-1 bg-amber-500 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Excelencia",
                description: "Buscamos la perfección en cada detalle de nuestro trabajo",
                color: "from-blue-500 to-blue-600"
              },
              {
                title: "Innovación",
                description: "Aplicamos soluciones creativas y tecnologías emergentes",
                color: "from-purple-500 to-purple-600"
              },
              {
                title: "Colaboración",
                description: "Trabajamos en equipo para lograr objetivos comunes",
                color: "from-green-500 to-green-600"
              },
              {
                title: "Responsabilidad",
                description: "Asumimos el compromiso con la calidad y el servicio",
                color: "from-red-500 to-red-600"
              }
            ].map((valor, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 bg-gradient-to-r ${valor.color} rounded-lg flex items-center justify-center mb-4`}>
                  <span className="text-white font-bold text-lg">{valor.title[0]}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{valor.title}</h3>
                <p className="text-gray-600 text-sm">{valor.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-2xl p-8 md:p-12 shadow-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
            <MapPinIcon className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ¡Únete a Nuestra Revolución Digital!
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Descubre cómo la tecnología puede transformar la forma en que disfrutas de las mejores 
            mermeladas artesanales de Bolivia. Nuestro equipo está comprometido en brindarte 
            la mejor experiencia digital.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleExplorarProductos}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300"
            >
              Explorar Productos
            </button>
            <button 
              onClick={handleContactarEquipo}
              className="border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300"
            >
              Contactar Equipo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 