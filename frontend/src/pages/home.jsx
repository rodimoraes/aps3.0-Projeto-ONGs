import { useState, useEffect } from "react";
import Header from "../components/header";
import { ChevronLeft, ChevronRight, Heart, ArrowRight } from "lucide-react";
import Footer from "../components/footer";

function Home() {
  const carouselSlides = [
    {
      id: 1,
      image: "#",
      title: "Imagem 1",
      subtitle:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis.",
    },
    {
      id: 2,
      image: "#",
      title: "Imagem 2",
      subtitle:
        "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
    },
    {
      id: 3,
      image: "#",
      title: "Imagem 3",
      subtitle:
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    },
  ];

  // Estado do Carrossel
  const [currentSlide, setCurrentSlide] = useState(0);

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? carouselSlides.length - 1 : prev - 1,
    );
  };

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === carouselSlides.length - 1 ? 0 : prev + 1,
    );
  };

  // Autoplay para o carrossel (muda a cada 5 segundos)
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Cabeçalho */}
      <Header />

      {/* SEÇÃO HERO & CARROSSEL */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        <div className="relative h-[480px] sm:h-[550px] w-full overflow-hidden">
          {carouselSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover opacity-45"
              />
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 max-w-4xl mx-auto">
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-md">
                  {slide.title}
                </h1>
                <p className="text-base sm:text-lg text-slate-200 mb-8 max-w-2xl drop-shadow-xs">
                  {slide.subtitle}
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <button className="flex items-center gap-2 px-6 py-3 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer">
                    <span>Conhecer ONGs</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all cursor-pointer">
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
                    <span>Fazer Doação</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Botões do Carrossel (Anterior / Próximo) */}
          <button
            onClick={prevSlide}
            aria-label="Slide anterior"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/50 hover:bg-slate-900/80 text-white transition-all cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Próximo slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/50 hover:bg-slate-900/80 text-white transition-all cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicadores (Dots) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {carouselSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Ir para slide ${index + 1}`}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  index === currentSlide
                    ? "w-8 bg-blue-500"
                    : "w-2.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-blue-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-extrabold mb-4">
              Texto sobre ONGs / o que é uma ONGs e sua importancia
            </h2>
            <p className="text-blue-100 mb-4 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras nec
              ex hendrerit, placerat libero at, finibus diam. Vivamus nec dui
              nec elit vestibulum dapibus.
            </p>
            <p className="text-blue-200 mb-6 leading-relaxed">
              Quisque vulputate sodales porta. Donec hendrerit ante sit amet
              euismod scelerisque. Fusce sed elit sodales, aliquet quam non,
              vestibulum leo.
            </p>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-blue-700/50">
            <img
              src="###"
              alt="Colocar Imagem"
              className="w-full h-80 object-cover"
            />
          </div>
        </div>
      </section>

      {/* SEÇÃO GRID DE CARDS COM IMAGENS E LOREM IPSUM */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Projetos e ONGs em Destaque
          </h2>
          <p className="text-slate-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
            <div className="h-48 overflow-hidden relative">
              <img
                src="#"
                alt="ONG1"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-6">
              <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                Lorem Ipsum Dolor Sit Amet
              </h3>
              <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                labore et dolore magna aliqua. Ut enim ad minim veniam.
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                <span className="font-medium text-blue-600">
                  Saiba mais &rarr;
                </span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
            <div className="h-48 overflow-hidden relative">
              <img
                src="#"
                alt="ONG2"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-6">
              <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                Sed Do Eiusmod Tempor
              </h3>
              <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat.
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                <span className="font-medium text-blue-600">
                  Saiba mais &rarr;
                </span>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
            <div className="h-48 overflow-hidden relative">
              <img
                src="#"
                alt="ONG3"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-6">
              <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                Ut Enim Ad Minim Veniam
              </h3>
              <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
                aut fugit, sed quia consequuntur magni dolores eos qui.
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                <span className="font-medium text-blue-600">
                  Saiba mais &rarr;
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO INFORMATIVA COM TEXTO E IMAGEM */}
      <section className="py-16 bg-blue-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-extrabold mb-4">
              Como o EncontreONG Funciona?
            </h2>
            <p className="text-blue-100 mb-4 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras nec
              ex hendrerit, placerat libero at, finibus diam. Vivamus nec dui
              nec elit vestibulum dapibus.
            </p>
            <p className="text-blue-200 mb-6 leading-relaxed">
              Quisque vulputate sodales porta. Donec hendrerit ante sit amet
              euismod scelerisque. Fusce sed elit sodales, aliquet quam non,
              vestibulum leo.
            </p>
            <div className="flex gap-4">
              <button className="px-5 py-2.5 bg-white text-blue-900 font-semibold rounded-xl hover:bg-blue-50 transition-colors cursor-pointer">
                Cadastrar Minha ONG
              </button>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-blue-700/50">
            <img
              src="#"
              alt="Imagem Legal"
              className="w-full h-80 object-cover"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
