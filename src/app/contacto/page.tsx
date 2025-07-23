'use client';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  HeartIcon,
  SparklesIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { 
  FaFacebookF, 
  FaInstagram, 
  FaTiktok, 
  FaWhatsapp, 
  FaTwitter, 
  FaYoutube,
  FaLinkedinIn,
  FaTelegram
} from 'react-icons/fa';

export default function ContactPage() {
  const socialLinks = [
    {
      name: "Facebook",
      url: "https://www.facebook.com/share/1E5oV6Gmbo/",
      icon: FaFacebookF,
      color: "from-blue-600 to-blue-700",
      description: "Síguenos para ver fotos de nuestros productos, recetas y novedades",
      handle: "@proyectomorita"
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/sumaq_mermeladas?igsh=MXBhMWxxc2tnajNsZQ==",
      icon: FaInstagram,
      color: "from-pink-500 to-purple-600",
      description: "Descubre nuestras mermeladas artesanales en stories y posts",
      handle: "@proyectomorita"
    },
    {
      name: "TikTok",
      url: "https://www.tiktok.com/@sumaq.mermelada?_t=ZM-8y5jBzvaAv0&_r=1",
      icon: FaTiktok,
      color: "from-black to-gray-800",
      description: "Videos divertidos sobre nuestras mermeladas y recetas",
      handle: "@proyectomorita"
    },
    {
      name: "WhatsApp",
      url: "https://wa.me/59176485910",
      icon: FaWhatsapp,
      color: "from-green-500 to-green-600",
      description: "Pedidos directos y atención personalizada",
      handle: "+591 76485910"
    },
    {
      name: "Twitter",
      url: "#", 
      icon: FaTwitter,
      color: "from-blue-400 to-blue-500",
      description: "Noticias, tips y actualizaciones del proyecto",
      handle: "@proyectomorita"
    },
    {
      name: "YouTube",
      url: "#",
      icon: FaYoutube,
      color: "from-red-600 to-red-700",
      description: "Tutoriales y videos sobre nuestras mermeladas",
      handle: "Proyecto Morita"
    },
    {
      name: "LinkedIn",
      url: "#", 
      icon: FaLinkedinIn,
      color: "from-blue-700 to-blue-800",
      description: "Conecta con nuestro equipo profesional",
      handle: "Proyecto Morita"
    },
    {
      name: "Telegram",
      url: "#",
      icon: FaTelegram,
      color: "from-blue-500 to-blue-600",
      description: "Canal oficial para noticias y promociones",
      handle: "@proyectomorita"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white bg-opacity-20 p-4 rounded-full">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              ¡Conecta con <span className="text-amber-200">Nosotros</span>!
            </h1>
            <p className="text-xl md:text-2xl text-amber-100 max-w-3xl mx-auto leading-relaxed">
              Somos el Grupo #4 del Proyecto Morita. Estamos aquí para atenderte, 
              resolver tus dudas y recibir tus pedidos de mermeladas artesanales.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Información de Contacto */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <HeartIcon className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Información de Contacto
            </h2>
            <div className="w-24 h-1 bg-amber-500 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <EnvelopeIcon className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600 mb-4">sumaq.mermelada@gmail.com</p>
              <a 
                href="mailto:sumaq.mermelada@gmail.com" 
                className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Enviar Email
              </a>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhoneIcon className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Teléfono</h3>
              <p className="text-gray-600 mb-4">+591 76485910</p>
              <a 
                href="tel:+59176485910" 
                className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Llamar Ahora
              </a>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ubicación</h3>
              <p className="text-gray-600 mb-4">Universidad Mayor de San Simón<br />Cochabamba, Bolivia</p>
              <button className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                Ver Mapa
              </button>
            </div>
          </div>
        </div>

        {/* Horarios de Atención */}
        <div className="mb-20">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-8 md:p-12 text-white">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
                <ClockIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Horarios de Atención</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4 text-amber-200">Atención Presencial</h3>
                <div className="space-y-2 text-amber-100">
                  <p><span className="font-semibold">Lunes a Viernes:</span> 8:00 AM - 6:00 PM</p>
                  <p><span className="font-semibold">Sábados:</span> 9:00 AM - 2:00 PM</p>
                  <p><span className="font-semibold">Domingos:</span> Cerrado</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4 text-amber-200">Atención Digital</h3>
                <div className="space-y-2 text-amber-100">
                  <p><span className="font-semibold">Redes Sociales:</span> 24/7</p>
                  <p><span className="font-semibold">WhatsApp:</span> 8:00 AM - 8:00 PM</p>
                  <p><span className="font-semibold">Email:</span> Respuesta en 24h</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Redes Sociales */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <SparklesIcon className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Síguenos en Redes Sociales
            </h2>
            <div className="w-24 h-1 bg-amber-500 mx-auto"></div>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
              Mantente conectado con el Proyecto Morita. Descubre nuestras mermeladas artesanales, 
              recetas exclusivas y las últimas novedades en todas nuestras plataformas digitales.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${social.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                      {social.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {social.description}
                    </p>
                    <p className="text-amber-600 font-semibold text-sm">
                      {social.handle}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Formulario de Contacto */}
        <div className="mb-20">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                <UsersIcon className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Envíanos un Mensaje
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                ¿Tienes alguna pregunta específica, sugerencia o quieres hacer un pedido especial? 
                ¡Nos encantaría escucharte!
              </p>
            </div>
            
            <form className="max-w-2xl mx-auto space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="asunto" className="block text-sm font-medium text-gray-700 mb-2">
                  Asunto
                </label>
                <input
                  type="text"
                  id="asunto"
                  name="asunto"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                  placeholder="¿En qué podemos ayudarte?"
                />
              </div>
              
              <div>
                <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Cuéntanos más detalles sobre tu consulta o pedido..."
                ></textarea>
              </div>
              
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold py-4 px-8 rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Enviar Mensaje
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-8 md:p-12 text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-6">
            <HeartIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¡Únete a Nuestra Comunidad!
          </h2>
          <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
            Sé parte del Proyecto Morita. Descubre nuestras mermeladas artesanales de uchuva 
            y otras frutas exóticas de Bolivia. ¡Cada like, comentario y compra nos motiva a seguir creciendo!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://linktr.ee/proyectomorita"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-amber-600 hover:bg-amber-50 font-bold py-3 px-8 rounded-lg transition-colors duration-300"
            >
              Ver Todos los Enlaces
            </a>
            <a 
              href="https://wa.me/59176485910"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white hover:bg-white hover:text-amber-600 font-bold py-3 px-8 rounded-lg transition-colors duration-300"
            >
              WhatsApp Directo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 