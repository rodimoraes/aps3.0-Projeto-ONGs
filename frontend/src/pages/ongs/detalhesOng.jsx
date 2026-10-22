import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Megaphone,
  Image as ImageIcon,
  Plus,
  Mail,
  Phone,
  MapPin,
  Building2,
  TrendingUp,
  Trash2,
  CheckCircle,
  FileText,
  Eye,
  Upload,
  Loader2,
} from "lucide-react";
import { uploadImageToImgBB } from "../../services/imgbb.js";

function DetalhesOng() {
  const { id_ong } = useParams();
  const navigate = useNavigate();
  const [ong, setOng] = useState(null);
  const [campanhas, setCampanhas] = useState([]);
  const [imagens, setImagens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para upload de imagem na Galeria da ONG
  const [uploading, setUploading] = useState(false);
  const [novaImagem, setNovaImagem] = useState({
    url: "",
    descricao: "",
  });

  // Carrega todos os dados da ONG (Cadastro, Campanhas e Fotos)
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

  // Handler para upload de imagem no ImgBB
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const urlEnvio = await uploadImageToImgBB(file);
      setNovaImagem((prev) => ({ ...prev, url: urlEnvio }));
    } catch (error) {
      alert(`Erro no upload da imagem: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Cadastra foto na Galeria da ONG
  const handleCadastrarFoto = async (e) => {
    e.preventDefault();
    if (!novaImagem.url || !novaImagem.descricao) {
      alert("Por favor, faça o upload da imagem e preencha a descrição.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/imagens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_ong: Number(id_ong),
          id_campanha: null,
          url: novaImagem.url,
          descricao: novaImagem.descricao,
        }),
      });

      if (response.ok) {
        alert("Foto adicionada à galeria da ONG!");
        const res = await fetch(`http://127.0.0.1:8000/imagens/ong/${id_ong}`);
        if (res.ok) {
          const data = await res.json();
          setImagens(data);
        }
        setNovaImagem({ url: "", descricao: "" });
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.detail}`);
      }
    } catch (error) {
      console.error("Erro ao cadastrar foto na ONG:", error);
      alert("Erro de conexão com o servidor.");
    }
  };

  // Função para excluir foto da galeria
  const handleDeleteFoto = async (id_img) => {
    if (!window.confirm("Deseja realmente excluir esta foto da galeria?"))
      return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/imagens/${id_img}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Foto removida!");
        setImagens((prev) => prev.filter((img) => img.id_img !== id_img));
      } else {
        alert("Erro ao remover foto.");
      }
    } catch (error) {
      console.error("Erro ao deletar foto:", error);
      alert("Erro ao se conectar com o servidor.");
    }
  };

  // Função para excluir uma campanha diretamente do painel
  const handleDeleteCampanha = async (id_campanha, titulo) => {
    if (!window.confirm(`Deseja realmente excluir a campanha "${titulo}"?`))
      return;

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/campanhas/${id_campanha}`,
        { method: "DELETE" },
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
      alert("Erro ao se conectar com o servidor.");
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
        {/* Barra Superior de Navegação */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/ongs"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-700 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Lista de ONGs</span>
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/editar-ong/${id_ong}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs"
            >
              <Pencil className="w-4 h-4 text-slate-500" />
              <span>Editar ONG</span>
            </Link>
            <Link
              to={`/ongs/${id_ong}/campanhas/cadastrar`}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Campanha</span>
            </Link>
          </div>
        </div>

        {/* Banner do Perfil da ONG */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-2xl">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                    {ong?.nome}
                  </h1>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Ativa
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
                  {ong?.objetivo_social_finalidade ||
                    "Sem objetivo cadastrado."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2.5 text-slate-600">
              <FileText className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">
                  RCPJ
                </p>
                <p className="font-semibold text-slate-700">{ong?.RCPJ}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Mail className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">
                  CNAE
                </p>
                <p className="font-semibold text-slate-700">
                  {ong?.CNAE || "Não informado"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Phone className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">
                  Telefone
                </p>
                <p className="font-semibold text-slate-700">
                  {ong?.telefone || "Não informado"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">
                  Endereço
                </p>
                <p className="font-semibold text-slate-700 line-clamp-1">
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
              <span className="text-xs font-semibold text-slate-400 uppercase">
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
              <span className="text-xs font-semibold text-slate-400 uppercase">
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

        {/* Seção 1: Galeria de Fotos da ONG com Form de Upload via ImgBB */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-600" />
            Galeria de Fotos da ONG ({imagens.length})
          </h2>

          <form
            onSubmit={handleCadastrarFoto}
            className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 space-y-3"
          >
            <p className="text-xs font-semibold text-purple-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-purple-600" />
              Adicionar nova foto à galeria da ONG (Upload ImgBB):
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-purple-900 mb-1">
                  Selecione a Imagem
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer bg-white border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-purple-900 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  placeholder="Ex: Fachada da sede da ONG"
                  value={novaImagem.descricao}
                  onChange={(e) =>
                    setNovaImagem({ ...novaImagem, descricao: e.target.value })
                  }
                  required
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
            </div>

            {uploading && (
              <div className="flex items-center gap-2 text-xs text-purple-700 font-medium pt-1">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span>Enviando imagem...</span>
              </div>
            )}

            {novaImagem.url && !uploading && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">Imagem pronta!</span>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || !novaImagem.url}
              className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Salvar na Galeria</span>
            </button>
          </form>

          {imagens.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
              <p className="text-xs text-slate-400">
                Nenhuma foto adicionada à galeria ainda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imagens.map((img) => (
                <div
                  key={img.id_img}
                  className="group relative h-36 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200"
                >
                  <img
                    src={img.url}
                    alt={img.descricao}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/300x200?text=Foto";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex items-end justify-between">
                    <p className="text-[11px] text-white font-medium line-clamp-1">
                      {img.descricao}
                    </p>
                    <button
                      onClick={() => handleDeleteFoto(img.id_img)}
                      className="p-1 text-white bg-red-600 hover:bg-red-700 rounded-lg shrink-0 cursor-pointer"
                      title="Excluir foto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seção 2: Campanhas de Arrecadação */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-emerald-600" />
              Campanhas de Arrecadação ({campanhas.length})
            </h2>
            <Link
              to={`/ongs/${id_ong}/campanhas/cadastrar`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              <Plus className="w-4 h-4" />
              <span>Criar nova campanha</span>
            </Link>
          </div>

          {campanhas.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
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
                    className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-slate-800 text-base">
                          {c.titulo}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase shrink-0 ${
                            c.status === "ativa"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                        {c.descricao}
                      </p>

                      {meta > 0 && (
                        <div className="space-y-1.5 mb-4">
                          <div className="flex justify-between text-xs font-semibold text-slate-700">
                            <span>Progresso</span>
                            <span>{percentual}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentual}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-2 border-t border-slate-200/60 mb-4">
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
                          <p className="text-[10px] uppercase text-slate-400">
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

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/60">
                      <Link
                        to={`/campanhas/${c.id_campanha}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Detalhes</span>
                      </Link>
                      <Link
                        to={`/campanhas/editar/${c.id_campanha}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </Link>
                      <button
                        onClick={() =>
                          handleDeleteCampanha(c.id_campanha, c.titulo)
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
