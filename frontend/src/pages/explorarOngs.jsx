import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import {
  Search,
  MapPin,
  Megaphone,
  ArrowRight,
  Heart,
  Sparkles,
  TrendingUp,
  X,
  Loader2,
  Building2,
  Image as ImageIcon,
} from "lucide-react";

const CATEGORIAS = [
  {
    id: 1,
    nome: "Educação / Assistência",
    grad: "from-blue-500 to-indigo-600",
    emoji: "📚",
  },
  {
    id: 2,
    nome: "Meio Ambiente",
    grad: "from-emerald-500 to-teal-600",
    emoji: "🌱",
  },
  {
    id: 3,
    nome: "Saúde",
    grad: "from-rose-500 to-pink-600",
    emoji: "❤️",
  },
  {
    id: 4,
    nome: "Cultura / Esporte",
    grad: "from-purple-500 to-fuchsia-600",
    emoji: "🎭",
  },
];

const ITENS_POR_PAGINA = 6;

function extrairCidade(endereco) {
  if (!endereco) return "";
  const m = endereco.match(/([A-Za-zÀ-ú\s]+)\/([A-Z]{2})/);
  return m ? m[1].trim() : "";
}

// ============================================================
// Card individual — CORRIGIDO
// ============================================================
function OngCard({ ong, categoria }) {
  const cat = categoria || CATEGORIAS[0];
  const cidade = extrairCidade(ong.endereco);
  const imagemBase = ong.imagemUrl || ong.banner_url || ong.logo_url || null;

  return (
    <Link
      to={`/ongs/${ong.id_ong}`}
      className="group relative bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {/* Wrapper do banner SEM overflow → permite a logo "sair" para baixo */}
      <div className="relative">
        {/* Área com overflow-hidden APENAS para a imagem e o gradiente do banner */}
        <div className="relative h-44 overflow-hidden bg-slate-100">
          {imagemBase ? (
            <img
              src={imagemBase}
              alt={`Imagem ${ong.nome}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => (e.target.style.display = "none")}
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${cat.grad} opacity-90`}
            />
          )}

          {/* Gradiente sobre a imagem */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        {/* Badge de categoria — fixado ao topo do banner */}
        <div className="absolute top-3 right-3 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-[11px] font-bold text-slate-700 shadow-md flex items-center gap-1.5">
          <span>{cat.emoji}</span>
          <span>{cat.nome.split(" / ")[0]}</span>
        </div>

        {/* Badge de campanhas ativas */}
        {ong.campanhasAtivas > 0 && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-emerald-500 text-white rounded-full text-[11px] font-bold shadow-md flex items-center gap-1.5 animate-pulse-slow">
            <span className="w-1.5 h-1.5 bg-white rounded-full" />
            <span>
              {ong.campanhasAtivas} campanha{ong.campanhasAtivas > 1 ? "s" : ""}{" "}
              ativa{ong.campanhasAtivas > 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Logo flutuante — FORA do overflow do banner, então aparece inteira */}
        <div className="absolute -bottom-8 left-5 w-16 h-16 rounded-2xl bg-white p-1 border-4 border-white shadow-lg overflow-hidden z-10">
          {ong.logo_url ? (
            <img
              src={ong.logo_url}
              alt={ong.nome}
              className="w-full h-full object-cover rounded-xl"
              onError={(e) =>
                (e.target.src = "https://via.placeholder.com/100?text=ONG")
              }
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${cat.grad} text-white rounded-xl flex items-center justify-center font-black text-xl`}
            >
              {ong.sigla || ong.nome?.charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo — o pt-10 abre espaço para a logo descer */}
      <div className="pt-10 px-5 pb-5 flex-1 flex flex-col relative">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
            {ong.nome}
          </h3>
          {ong.sigla && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
              {ong.sigla}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
          {ong.objetivo_social_finalidade || "Sem descrição disponível."}
        </p>

        {cidade && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{cidade}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 mt-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Megaphone className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-semibold">{ong.totalCampanhas}</span>
            <span className="text-slate-400">
              campanha{ong.totalCampanhas !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <ImageIcon className="w-3.5 h-3.5 text-purple-500" />
            <span className="font-semibold">{ong.totalImagens}</span>
            <span className="text-slate-400">
              foto{ong.totalImagens !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-bold text-blue-600 group-hover:text-blue-700 inline-flex items-center gap-1">
            Conhecer ONG
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="p-1.5 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Heart className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="h-44 bg-slate-200" />
      <div className="pt-10 px-5 pb-5 space-y-3">
        <div className="h-5 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-2/3" />
        <div className="h-3 bg-slate-100 rounded w-1/2 mt-4" />
      </div>
    </div>
  );
}

function ExplorarOngs() {
  const [ongs, setOngs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState(null);
  const [cidadeFiltro, setCidadeFiltro] = useState("");
  const [paginaVisivel, setPaginaVisivel] = useState(ITENS_POR_PAGINA);

  useEffect(() => {
    const carregar = async () => {
      try {
        const resOngs = await fetch("http://127.0.0.1:8000/ongs");
        if (!resOngs.ok) throw new Error("Falha ao carregar ONGs");
        const lista = await resOngs.json();

        const enriquecidas = await Promise.all(
          lista.map(async (ong) => {
            try {
              const [imgs, camps] = await Promise.all([
                fetch(`http://127.0.0.1:8000/imagens/ong/${ong.id_ong}`).then(
                  (r) => (r.ok ? r.json() : []),
                ),
                fetch(`http://127.0.0.1:8000/campanhas/ong/${ong.id_ong}`).then(
                  (r) => (r.ok ? r.json() : []),
                ),
              ]);
              return {
                ...ong,
                imagemUrl:
                  imgs[0]?.url || ong.banner_url || ong.logo_url || null,
                totalImagens: imgs.length,
                totalCampanhas: camps.length,
                campanhasAtivas: camps.filter((c) => c.status === "ativa")
                  .length,
              };
            } catch {
              return {
                ...ong,
                imagemUrl: ong.banner_url || ong.logo_url || null,
                totalImagens: 0,
                totalCampanhas: 0,
                campanhasAtivas: 0,
              };
            }
          }),
        );

        setOngs(enriquecidas);
      } catch (error) {
        console.error("Erro ao carregar ONGs:", error);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  const handleBuscaChange = (valor) => {
    setBusca(valor);
    setPaginaVisivel(ITENS_POR_PAGINA);
  };

  const handleCategoriaChange = (id) => {
    setCategoriaFiltro(id);
    setPaginaVisivel(ITENS_POR_PAGINA);
  };

  const handleCidadeChange = (valor) => {
    setCidadeFiltro(valor);
    setPaginaVisivel(ITENS_POR_PAGINA);
  };

  const limparFiltros = () => {
    setBusca("");
    setCategoriaFiltro(null);
    setCidadeFiltro("");
    setPaginaVisivel(ITENS_POR_PAGINA);
  };

  const ongsFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return ongs.filter((ong) => {
      if (termo) {
        const alvo = `${ong.nome} ${ong.denominacao_social || ""} ${
          ong.objetivo_social_finalidade || ""
        } ${ong.sigla || ""}`.toLowerCase();
        if (!alvo.includes(termo)) return false;
      }
      if (
        categoriaFiltro &&
        Number(ong.id_categoria) !== Number(categoriaFiltro)
      ) {
        return false;
      }
      if (cidadeFiltro) {
        const cidadeOng = extrairCidade(ong.endereco).toLowerCase();
        if (!cidadeOng.includes(cidadeFiltro.toLowerCase())) return false;
      }
      return true;
    });
  }, [ongs, busca, categoriaFiltro, cidadeFiltro]);

  const ongsVisiveis = ongsFiltradas.slice(0, paginaVisivel);
  const temMais = ongsFiltradas.length > paginaVisivel;
  const temFiltroAtivo = busca || categoriaFiltro || cidadeFiltro;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      {/* HERO */}
      <section className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-32 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs font-semibold backdrop-blur-sm mb-6">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Descubra causas que transformam vidas</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6">
            Encontre a ONG
            <span className="block bg-gradient-to-r from-yellow-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
              que combina com você
            </span>
          </h1>

          <p className="text-base sm:text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
            Explore organizações sociais, conheça suas causas e faça parte de
            projetos que geram impacto real na comunidade.
          </p>

          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-2 flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Busque por nome, causa ou sigla..."
                value={busca}
                onChange={(e) => handleBuscaChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
              />
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30 cursor-pointer">
              Buscar
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mt-10">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">
                {ongs.length}
              </p>
              <p className="text-xs text-blue-200 mt-1">ONGs cadastradas</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">
                {ongs.reduce((acc, o) => acc + (o.campanhasAtivas || 0), 0)}
              </p>
              <p className="text-xs text-blue-200 mt-1">Campanhas ativas</p>
            </div>
          </div>
        </div>
      </section>

      {/* FILTROS */}
      <section className="sticky top-16 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoriaChange(null)}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  !categoriaFiltro
                    ? "bg-slate-800 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Todas as causas
              </button>
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() =>
                    handleCategoriaChange(
                      categoriaFiltro === cat.id ? null : cat.id,
                    )
                  }
                  className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                    categoriaFiltro === cat.id
                      ? `bg-gradient-to-r ${cat.grad} text-white shadow-md`
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.nome.split(" / ")[0]}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-none lg:w-56">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrar por cidade..."
                  value={cidadeFiltro}
                  onChange={(e) => handleCidadeChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
                />
              </div>
              {temFiltroAtivo && (
                <button
                  onClick={limparFiltros}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              )}
            </div>
          </div>

          {!loading && (
            <p className="mt-3 text-xs text-slate-500">
              {ongsFiltradas.length === 0
                ? "Nenhuma ONG encontrada"
                : `Mostrando ${Math.min(
                    paginaVisivel,
                    ongsFiltradas.length,
                  )} de ${ongsFiltradas.length} ONG${
                    ongsFiltradas.length !== 1 ? "s" : ""
                  }`}
            </p>
          )}
        </div>
      </section>

      {/* LISTA */}
      <section className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : ongsVisiveis.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-4">
              <Building2 className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Nenhuma ONG encontrada
            </h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              {temFiltroAtivo
                ? "Tente ajustar os filtros ou usar outro termo de busca."
                : "Ainda não há ONGs cadastradas no sistema."}
            </p>
            {temFiltroAtivo ? (
              <button
                onClick={limparFiltros}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Limpar filtros</span>
              </button>
            ) : (
              <Link
                to="/ongs"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all"
              >
                <Building2 className="w-4 h-4" />
                <span>Gerenciar ONGs</span>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ongsVisiveis.map((ong) => (
                <OngCard
                  key={ong.id_ong}
                  ong={ong}
                  categoria={CATEGORIAS.find(
                    (c) => Number(c.id) === Number(ong.id_categoria),
                  )}
                />
              ))}
            </div>

            {temMais && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setPaginaVisivel((p) => p + ITENS_POR_PAGINA)}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  <Loader2 className="w-4 h-4 text-slate-500" />
                  <span>
                    Carregar mais ({ongsFiltradas.length - paginaVisivel}{" "}
                    restantes)
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* CTA FINAL */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <TrendingUp className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Sua causa também pode estar aqui
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Cadastre sua ONG, compartilhe suas campanhas e conecte-se com
            voluntários e doadores que querem transformar o mundo junto com
            você.
          </p>
          <Link
            to="/cadastrar-ong"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-blue-900 bg-white hover:bg-blue-50 rounded-xl shadow-2xl transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Cadastrar Minha ONG</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ExplorarOngs;
