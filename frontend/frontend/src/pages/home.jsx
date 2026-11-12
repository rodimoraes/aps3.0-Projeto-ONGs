import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import { ChevronLeft, ChevronRight, Heart, ArrowRight } from "lucide-react";
import Footer from "../components/footer";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?w=600&auto=format&fit=crop";

function Home() {
  const carouselSlides = [
    {
      id: 1,
      image: "https://images.pexels.com/photos/6646868/pexels-photo-6646868.jpeg",
      title: "Conecte-se com causas que transformam vidas",
      subtitle:
        "Descubra ONGs sérias perto de você, conheça seus projetos e encontre a melhor forma de ajudar — seja doando tempo, recursos ou visibilidade.",
    },
    {
      id: 2,
      image: "https://images.pexels.com/photos/7156157/pexels-photo-7156157.jpeg",
      title: "Encontre a ONG certa para você apoiar",
      subtitle:
        "Explore organizações por causa, cidade e categoria. Compare campanhas ativas, acompanhe metas e escolha quem faz sentido para o seu propósito.",
    },
    {
      id: 3,
      image: "https://images.pexels.com/photos/7469220/pexels-photo-7469220.jpeg",
      title: "Sua ONG também pode estar aqui",
      subtitle:
        "Cadastre sua organização em minutos, divulgue campanhas de arrecadação e voluntariado, e conecte-se a uma rede de pessoas prontas para ajudar.",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [ongsDestaque, setOngsDestaque] = useState([]);
  const [loadingOngs, setLoadingOngs] = useState(true);

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

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  useEffect(() => {
    const carregarOngsDestaque = async () => {
      try {
        setLoadingOngs(true);
        const res = await fetch("http://127.0.0.1:8000/ongs");
        if (res.ok) {
          const data = await res.json();
          const ultimasOngs = [...data]
            .sort((a, b) => b.id_ong - a.id_ong)
            .slice(0, 3);

          const ongsComImagem = await Promise.all(
            ultimasOngs.map(async (ong) => {
              try {
                const resImg = await fetch(
                  `http://127.0.0.1:8000/imagens/ong/${ong.id_ong}`,
                );
                if (resImg.ok) {
                  const imgs = await resImg.json();
                  return {
                    ...ong,
                    imagemUrl:
                      imgs[0]?.url || ong.banner_url || ong.logo_url || null,
                  };
                }
              } catch (err) {
                console.error("Erro ao buscar imagem da ONG:", err);
              }
              return {
                ...ong,
                imagemUrl: ong.banner_url || ong.logo_url || null,
              };
            }),
          );

          setOngsDestaque(ongsComImagem);
        }
      } catch (error) {
        console.error("Erro ao carregar ONGs em destaque:", error);
      } finally {
        setLoadingOngs(false);
      }
    };

    carregarOngsDestaque();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
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
                  <Link
                    to="/explorar-ongs"
                    className="flex items-center gap-2 px-6 py-3 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Conhecer ONGs</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <button className="flex items-center gap-2 px-6 py-3 font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all cursor-pointer">
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
                    <span>Fazer Doação</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

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

      {/* SEÇÃO SOBRE ONGs */}
      <section className="py-16 bg-blue-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-extrabold mb-4">
              O que é uma ONG e por que ela importa?
            </h2>
            <p className="text-blue-100 mb-4 leading-relaxed">
              Organizações Não Governamentais (ONGs) são entidades da sociedade
              civil, sem fins lucrativos, que atuam em causas de interesse
              público — como educação, saúde, meio ambiente, cultura e
              assistência social. Elas existem para suprir demandas que o Estado
              sozinho não consegue atender, mobilizando recursos, voluntários e
              parcerias em favor de quem mais precisa.
            </p>
            <p className="text-blue-200 mb-6 leading-relaxed">
              Apoiar uma ONG é transformar intenção em impacto real. Cada
              doação, cada hora de voluntariado e cada compartilhamento
              fortalecem redes de solidariedade que mudam a vida de milhares de
              pessoas todos os dias. Aqui no EncontreONG, acreditamos que
              aproximar pessoas de causas é o primeiro passo para uma sociedade
              mais justa.
            </p>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-blue-700/50">
            <img
              src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop"
              alt="ONGs em ação"
              className="w-full h-80 object-cover"
            />
          </div>
        </div>
      </section>

      {/* SEÇÃO DINÂMICA: ONGs EM DESTAQUE */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Projetos e ONGs em Destaque
          </h2>
          <p className="text-slate-600">
            Conheça as últimas organizações sociais cadastradas e faça a
            diferença apoiando suas causas!
          </p>
        </div>

        {loadingOngs ? (
          <p className="text-center text-slate-500 py-8 font-medium">
            Carregando ONGs em destaque...
          </p>
        ) : ongsDestaque.length === 0 ? (
          <p className="text-center text-slate-500 py-8 font-medium">
            Nenhuma ONG cadastrada até o momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {ongsDestaque.map((ong) => {
              const imagemBase =
                ong.imagemUrl || ong.banner_url || ong.logo_url || PLACEHOLDER;
              return (
                <div
                  key={ong.id_ong}
                  className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col justify-between"
                >
                  <div>
                    <div className="h-48 overflow-hidden relative bg-slate-100">
                      <img
                        src={imagemBase}
                        alt={ong.nome}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = PLACEHOLDER;
                        }}
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                        {ong.nome}
                      </h3>
                      <p className="text-sm text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                        {ong.objetivo_social_finalidade ||
                          "Sem descrição disponível."}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-0">
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                      <Link
                        to={`/ongs/${ong.id_ong}`}
                        className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Saiba mais &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/explorar-ongs"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all"
          >
            <span>Ver todas as ONGs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* SEÇÃO INFORMATIVA COMO FUNCIONA */}
      <section className="py-16 bg-blue-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-extrabold mb-4">
              Como o EncontreONG Funciona?
            </h2>
            <p className="text-blue-100 mb-4 leading-relaxed">
              O EncontreONG é uma ponte entre quem quer ajudar e quem precisa de
              ajuda. Reunimos em um só lugar organizações sociais de diferentes
              causas, com informações claras sobre cada projeto, campanhas
              ativas, metas de arrecadação e formas de voluntariado.
            </p>
            <p className="text-blue-200 mb-6 leading-relaxed">
              É simples: explore as ONGs por categoria ou cidade, conheça as
              campanhas em andamento, inscreva-se como voluntário ou apoie
              financeiramente a causa que mais combina com você. Se você
              representa uma ONG, cadastre sua organização e comece a divulgar
              suas ações para uma rede engajada de doadores e voluntários.
            </p>
            <div className="flex gap-4">
              <Link
                to="/cadastrar-ong"
                className="px-5 py-2.5 bg-white text-blue-900 font-semibold rounded-xl hover:bg-blue-50 transition-colors cursor-pointer"
              >
                Cadastrar Minha ONG
              </Link>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-blue-700/50">
            <img
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop"
              alt="Voluntários"
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
