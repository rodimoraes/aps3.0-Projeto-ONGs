import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Megaphone,
  Image as ImageIcon,
  Plus,
  MapPin,
  Mail,
  Phone,
  TrendingUp,
  Trash2,
  CheckCircle,
  FileText,
  Eye,
} from "lucide-react";
function DetalhesOng() {
  const { id_ong } = useParams();
  const navigate = useNavigate();
  const [ong, setOng] = useState(null);
  const [campanhas, setCampanhas] = useState([]);
  const [imagens, setImagens] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const carregarPainel = async () => {
      try {
        setLoading(true);
        const [resOng, resCampanhas, resImagens] = await Promise.all([
          fetch(`http://127.0.0.1:8000/ongs/${id_ong}`),
          fetch(`http://127.0.0.1:8000/campanhas/ong/${id_ong}`),
          fetch(`http://127.0.0.1:8000/imagens/ong/${id_ong}`),
        ]);
        if (resOng.ok) {
          const dataOng = await resOng.json();
          setOng(dataOng);
        } else {
          alert("ONG não encontrada!");
          navigate("/ongs");
          return;
        }
        if (resCampanhas.ok) {
          const dataCampanhas = await resCampanhas.json();
          setCampanhas(dataCampanhas);
        }
        if (resImagens.ok) {
          const dataImagens = await resImagens.json();
          setImagens(dataImagens);
        }
      } catch (error) {
        console.error("Erro ao carregar detalhes da ONG:", error);
        alert("Erro ao conectar com o servidor.");
      } finally {
        setLoading(false);
      }
    };
    carregarPainel();
  }, [id_ong, navigate]);
  const handleDeleteCampanha = async (id_campanha, titulo) => {
    if (!window.confirm(`Deseja realmente excluir a campanha "${titulo}"?`))
      return;
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/campanhas/${id_campanha}`,
        {
          method: "DELETE",
        },
      );
      if (res.ok) {
        alert("Campanha excluída!");
        setCampanhas((prev) =>
          prev.filter((c) => c.id_campanha !== id_campanha),
        );
      } else {
        alert("Erro ao excluir campanha.");
      }
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium">
          Carregando painel da ONG...
        </p>
      </div>
    );
  }
  const totalArrecadado = campanhas.reduce(
    (acc, c) => acc + Number(c.valor_arrecadado || 0),
    0,
  );
  const campanhasAtivas = campanhas.filter((c) => c.status === "ativa").length;
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navegação Superior */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/ongs"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-700
font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Lista de ONGs</span>
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/editar-ong/${id_ong}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold
text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transitionall shadow-2xs"
            >
              <Pencil className="w-4 h-4 text-slate-500" />
              <span>Editar ONG</span>
            </Link>
            <Link
              to={`/ongs/${id_ong}/imagens`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold
text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl
transition-all"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Gerenciar Galeria</span>
            </Link>
            <Link
              to={`/ongs/${id_ong}/campanhas/cadastrar`}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold
text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Campanha</span>
            </Link>
          </div>
        </div>
        {/* HERO BANNER - Logo à esquerda e Banner à direita com Efeito de Esmaecimento */}
        <div
          className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-md border
border-slate-800 text-white min-h-[220px]"
        >
          {/* Banner no Canto Direito com Sobreposição de Gradiente para Esmaecer */}
          <div className="absolute inset-0 z-0 flex justify-end">
            {ong?.banner_url ? (
              <div className="relative w-full md:w-3/4 h-full">
                <img
                  src={ong.banner_url}
                  alt={`Banner ${ong.nome}`}
                  className="w-full h-full object-cover object-right"
                />
                {/* Gradiente Lateral (Esmaecer da direita para a esquerda) */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate900/80 to-transparent" />
                {/* Gradiente Inferior (Suavizar borda de baixo) */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 viatransparent to-transparent" />
              </div>
            ) : (
              <div
                className="w-full h-full bg-gradient-to-r from-slate-900 via-indigo-950
to-purple-900/50"
              />
            )}
          </div>
          {/* Conteúdo sobreposto ao Banner */}
          <div
            className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-start
md:items-center justify-between gap-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Logo no Canto Esquerdo */}
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-2 border-2
border-white/20 shadow-2xl shrink-0 backdrop-blur-md"
              >
                {ong?.logo_url ? (
                  <img
                    src={ong.logo_url}
                    alt={ong.nome}
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/150?text=ONG";
                    }}
                  />
                ) : (
                  <div
                    className="w-full h-full bg-blue-600 text-white rounded-xl flex
items-center justify-center font-black text-3xl"
                  >
                    {ong?.sigla || ong?.nome?.charAt(0)}
                  </div>
                )}
              </div>
              {/* Textos Principais */}
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-white trackingtight">
                    {ong?.nome}
                  </h1>
                  {ong?.sigla && (
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-blue500/30 text-blue-300 border border-blue-400/30">
                      {ong.sigla}
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-slate-300">
                  {ong?.denominacao_social}
                </p>
                <p className="text-xs text-slate-300/90 leading-relaxed line-clamp-2 mt-2">
                  {ong?.objetivo_social_finalidade}
                </p>
              </div>
            </div>
          </div>
          {/* Rodapé Interno com Dados de Contato */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap4 px-6 sm:px-8 py-4 bg-slate-950/60 backdrop-blur-md border-t border-white/10 text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <FileText className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">
                  CNPJ
                </p>
                <p className="font-semibold">{ong?.cnpj}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">
                  E-mail
                </p>
                <p className="font-semibold">{ong?.email || "Não informado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <Phone className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">
                  Telefone
                </p>
                <p className="font-semibold">
                  {ong?.telefone || "Não informado"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">
                  Endereço
                </p>
                <p className="font-semibold line-clamp-1">
                  {ong?.endereco || "Não informado"}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Cards de Métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-xs font-semibold text-slate-400
uppercase"
              >
                Campanhas
              </span>
              <Megaphone className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-slate-800">
              {campanhas.length}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {campanhasAtivas} em andamento
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">
                Total Arrecadado
              </span>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-800">
              R${" "}
              {totalArrecadado.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Soma de todas as campanhas
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-xs font-semibold text-slate-400
uppercase"
              >
                Galeria
              </span>
              <ImageIcon className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-black text-slate-800">
              {imagens.length}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Fotos vinculadas</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">
                Inscrição Mun.
              </span>
              <CheckCircle className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-base font-bold text-slate-800 truncate">
              {ong?.inscricao_municipal || "Isento"}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Cadastro de Tributos
            </p>
          </div>
        </div>
        {/* Galeria de Fotos */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-600" />
              Galeria de Fotos ({imagens.length})
            </h2>
            <Link
              to={`/ongs/${id_ong}/imagens`}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700
hover:underline"
            >
              Gerenciar galeria &rarr;
            </Link>
          </div>
          {imagens.length === 0 ? (
            <div
              className="p-8 text-center border-2 border-dashed border-slate-100
rounded-2xl"
            >
              <p className="text-xs text-slate-400">
                Nenhuma foto adicionada ainda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imagens.slice(0, 4).map((img) => (
                <div
                  key={img.id_img}
                  className="group relative h-36 rounded-2xl overflow-hidden bg-slate-100
border border-slate-200"
                >
                  <img
                    src={img.url}
                    alt={img.descricao}
                    className="w-full h-full object-cover group-hover:scale-105 transitiontransform duration-300"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/300x200?text=Foto";
                    }}
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/60 viatransparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex
items-end"
                  >
                    <p className="text-[11px] text-white font-medium line-clamp-1">
                      {img.descricao}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Lista de Campanhas */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-emerald-600" />
              Campanhas de Arrecadação ({campanhas.length})
            </h2>
            <Link
              to={`/ongs/${id_ong}/campanhas/cadastrar`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold textemerald-600 hover:text-emerald-700 hover:underline"
            >
              <Plus className="w-4 h-4" />
              <span>Criar nova campanha</span>
            </Link>
          </div>
          {campanhas.length === 0 ? (
            <div
              className="p-8 text-center border-2 border-dashed border-slate-100
rounded-2xl"
            >
              <p className="text-xs text-slate-400">
                Esta ONG ainda não criou nenhuma campanha.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {campanhas.map((c) => {
                const meta = Number(c.meta_arrecadacao || 0);
                const arrecadado = Number(c.valor_arrecadado || 0);
                const percentual =
                  meta > 0
                    ? Math.min(100, Math.round((arrecadado / meta) * 100))
                    : 0;
                return (
                  <div
                    key={c.id_campanha}
                    className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200 flex
flex-col justify-between hover:border-slate-300 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-slate-800 text-base">
                          {c.titulo}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full
uppercase shrink-0 ${
                            c.status === "ativa"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-4 line-clamp-2 leadingrelaxed">
                        {c.descricao}
                      </p>
                      {meta > 0 && (
                        <div className="space-y-1.5 mb-4">
                          <div className="flex justify-between text-xs font-semibold textslate-700">
                            <span>Progresso</span>
                            <span>{percentual}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflowhidden">
                            <div
                              className="bg-emerald-500 h-2 rounded-full transition-all
duration-500"
                              style={{ width: `${percentual}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <div
                        className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-2
border-t border-slate-200/60 mb-4"
                      >
                        <div>
                          <p className="text-[10px] uppercase text-slate-400">
                            Meta
                          </p>
                          <p className="font-bold text-slate-700">
                            R${" "}
                            {meta.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-slate400">
                            Arrecadado
                          </p>
                          <p className="font-bold text-emerald-600">
                            R${" "}
                            {arrecadado.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex items-center justify-end gap-2 pt-3 border-t
border-slate-200/60"
                    >
                      <Link
                        to={`/campanhas/${c.id_campanha}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs fontsemibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Detalhes</span>
                      </Link>
                      <Link
                        to={`/campanhas/editar/${c.id_campanha}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs fontmedium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </Link>
                      <button
                        onClick={() =>
                          handleDeleteCampanha(c.id_campanha, c.titulo)
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs fontmedium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default DetalhesOng;
