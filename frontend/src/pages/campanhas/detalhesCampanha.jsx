import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Building2,
  Image as ImageIcon,
  Plus,
  Upload,
  Loader2,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { uploadImageToImgBB } from "../../services/imgbb.js";

function DetalhesCampanha() {
  const { id_campanha } = useParams();
  const navigate = useNavigate();
  const [campanha, setCampanha] = useState(null);
  const [ong, setOng] = useState(null);
  const [imagens, setImagens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para upload de imagem no ImgBB
  const [uploading, setUploading] = useState(false);
  const [novaImagem, setNovaImagem] = useState({
    url: "",
    descricao: "",
  });

  // Carrega os dados da campanha, da ONG dona e das imagens
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const resCampanha = await fetch(
          `http://127.0.0.1:8000/campanhas/${id_campanha}`,
        );
        if (!resCampanha.ok) {
          alert("Campanha não encontrada!");
          navigate("/ongs");
          return;
        }
        const dataCampanha = await resCampanha.json();
        setCampanha(dataCampanha);

        const [resOng, resImagens] = await Promise.all([
          fetch(`http://127.0.0.1:8000/ongs/${dataCampanha.id_ong}`),
          fetch(`http://127.0.0.1:8000/imagens/campanha/${id_campanha}`),
        ]);

        if (resOng.ok) {
          const dataOng = await resOng.json();
          setOng(dataOng);
        }
        if (resImagens.ok) {
          const dataImagens = await resImagens.json();
          setImagens(dataImagens);
        }
      } catch (error) {
        console.error("Erro ao carregar detalhes da campanha:", error);
        alert("Erro ao conectar com o servidor.");
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, [id_campanha, navigate]);

  // Handler para upload de arquivo no ImgBB
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

  // Cadastra nova foto associada a esta campanha no Banco de Dados
  const handleCadastrarFoto = async (e) => {
    e.preventDefault();
    if (!novaImagem.url) {
      alert("Por favor, faça o upload de uma imagem primeiro.");
      return;
    }
    if (!novaImagem.descricao) {
      alert("Por favor, informe uma descrição para a foto.");
      return;
    }
    try {
      const response = await fetch("http://127.0.0.1:8000/imagens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_ong: campanha.id_ong,
          id_campanha: Number(id_campanha),
          url: novaImagem.url,
          descricao: novaImagem.descricao,
        }),
      });
      if (response.ok) {
        alert("Imagem da campanha adicionada!");
        const res = await fetch(
          `http://127.0.0.1:8000/imagens/campanha/${id_campanha}`,
        );
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
      console.error("Erro ao cadastrar foto:", error);
      alert("Erro ao conectar com o servidor.");
    }
  };

  // Exclui uma imagem
  const handleDeleteFoto = async (id_img) => {
    if (!window.confirm("Deseja realmente remover esta foto da campanha?"))
      return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/imagens/${id_img}`, {
        method: "DELETE",
      });
      if (response.ok) {
        alert("Foto removida!");
        setImagens((prev) => prev.filter((img) => img.id_img !== id_img));
      } else {
        alert("Erro ao remover foto.");
      }
    } catch (error) {
      console.error("Erro ao deletar foto:", error);
      alert("Erro de conexão com o servidor.");
    }
  };

  // Exclui a campanha
  const handleDeleteCampanha = async () => {
    if (
      !window.confirm(
        `Deseja realmente excluir a campanha "${campanha?.titulo}"?`,
      )
    )
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
        navigate(`/ongs/${campanha.id_ong}`);
      } else {
        alert("Erro ao excluir a campanha.");
      }
    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert("Erro ao conectar com o servidor.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium">
          Carregando detalhes da campanha...
        </p>
      </div>
    );
  }

  const meta = Number(campanha?.meta_arrecadacao || 0);
  const arrecadado = Number(campanha?.valor_arrecadado || 0);
  const percentual =
    meta > 0 ? Math.min(100, Math.round((arrecadado / meta) * 100)) : 0;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navegação e Ações */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to={`/ongs/${campanha?.id_ong}`}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-700 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para o Painel da ONG ({ong?.nome})</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to={`/campanhas/editar/${id_campanha}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all"
            >
              <Pencil className="w-4 h-4" />
              <span>Editar Campanha</span>
            </Link>
            <button
              onClick={handleDeleteCampanha}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-600 bg-white hover:bg-red-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir Campanha</span>
            </button>
          </div>
        </div>

        {/* Card Principal da Campanha */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  {campanha?.status}
                </span>
                <Link
                  to={`/ongs/${ong?.id_ong}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{ong?.nome}</span>
                </Link>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                {campanha?.titulo}
              </h1>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {campanha?.descricao}
          </p>

          {/* Card de Progresso */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between text-sm font-bold text-slate-800">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Meta da Campanha
              </span>
              <span className="text-emerald-700">{percentual}% Atingido</span>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-3 rounded-full transition-all duration-700"
                style={{ width: `${percentual}%` }}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs">
              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">
                  Meta Final
                </p>
                <p className="text-lg font-black text-slate-800">
                  R${" "}
                  {meta.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">
                  Arrecadado
                </p>
                <p className="text-lg font-black text-emerald-600">
                  R${" "}
                  {arrecadado.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-slate-400 uppercase font-semibold text-[10px]">
                  Período
                </p>
                <p className="font-semibold text-slate-700 mt-0.5">
                  {new Date(campanha?.data_inicio).toLocaleDateString("pt-BR")}
                  {campanha?.data_fim &&
                    ` até ${new Date(campanha?.data_fim).toLocaleDateString(
                      "pt-BR",
                    )}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Fotos da Campanha com Upload ImgBB */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-600" />
            Fotos da Campanha ({imagens.length})
          </h2>

          <form
            onSubmit={handleCadastrarFoto}
            className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 space-y-3"
          >
            <p className="text-xs font-semibold text-purple-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-purple-600" />
              Adicionar foto (Upload via ImgBB):
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-purple-900 mb-1">
                  Selecione uma imagem
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
                  Descrição da Foto
                </label>
                <input
                  type="text"
                  placeholder="Ex: Entrega de cestas básicas"
                  value={novaImagem.descricao}
                  onChange={(e) =>
                    setNovaImagem({ ...novaImagem, descricao: e.target.value })
                  }
                  required
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
            </div>

            {/* Status do Upload */}
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
              <span>Anexar Foto</span>
            </button>
          </form>

          {/* Grid de Imagens */}
          {imagens.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
              <p className="text-xs text-slate-400">
                Nenhuma foto adicionada para esta campanha ainda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imagens.map((img) => (
                <div
                  key={img.id_img}
                  className="group relative h-40 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex flex-col justify-between"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex items-end justify-between gap-2">
                    <p className="text-[11px] text-white font-medium line-clamp-2">
                      {img.descricao}
                    </p>
                    <button
                      onClick={() => handleDeleteFoto(img.id_img)}
                      className="p-1.5 text-white bg-red-600 hover:bg-red-700 rounded-lg shrink-0 cursor-pointer"
                      title="Excluir foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetalhesCampanha;
