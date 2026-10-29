import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Building2,
  Image as ImageIcon,
  Plus,
  TrendingUp,
  HeartHandshake,
  UserCheck,
  CheckCircle2,
  Users,
  Mail,
  Phone,
  Calendar,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { uploadImageToImgBB } from "../../services/imgbb.js";

function DetalhesCampanha() {
  const { id_campanha } = useParams();
  const navigate = useNavigate();
  const [campanha, setCampanha] = useState(null);
  const [ong, setOng] = useState(null);
  const [imagens, setImagens] = useState([]);
  const [voluntarios, setVoluntarios] = useState([]);
  const [inscrito, setInscrito] = useState(false);
  const [submittingInscricao, setSubmittingInscricao] = useState(false);
  const [loading, setLoading] = useState(true);
  const [novaImagem, setNovaImagem] = useState({ url: "", descricao: "" });
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const usuarioLogado = JSON.parse(localStorage.getItem("usuario") || "null");

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

        const [resOng, resImagens, resVoluntarios] = await Promise.all([
          fetch(`http://127.0.0.1:8000/ongs/${dataCampanha.id_ong}`),
          fetch(`http://127.0.0.1:8000/imagens/campanha/${id_campanha}`),
          fetch(`http://127.0.0.1:8000/campanhas/${id_campanha}/voluntarios`),
        ]);

        if (resOng.ok) setOng(await resOng.json());
        if (resImagens.ok) setImagens(await resImagens.json());
        if (resVoluntarios.ok) setVoluntarios(await resVoluntarios.json());

        if (usuarioLogado) {
          const resChecagem = await fetch(
            `http://127.0.0.1:8000/campanhas/${id_campanha}/inscricao/${usuarioLogado.id_usuario}`,
          );
          if (resChecagem.ok) {
            const dataChecagem = await resChecagem.json();
            setInscrito(dataChecagem.inscrito);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, [id_campanha, navigate]);

  const handleFotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingFoto(true);
      const url = await uploadImageToImgBB(file);
      setNovaImagem((prev) => ({ ...prev, url }));
    } catch (error) {
      alert(`Erro no upload da imagem: ${error.message}`);
    } finally {
      setUploadingFoto(false);
    }
  };

  const handleCadastrarFoto = async (e) => {
    e.preventDefault();
    if (!novaImagem.url || !novaImagem.descricao) {
      alert("Por favor, selecione uma foto e preencha a descrição.");
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
        alert("Imagem anexada à campanha com sucesso!");
        const res = await fetch(
          `http://127.0.0.1:8000/imagens/campanha/${id_campanha}`,
        );
        if (res.ok) setImagens(await res.json());
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
    }
  };

  const handleInscricaoVoluntario = async () => {
    if (!usuarioLogado) {
      alert("Você precisa estar logado para se inscrever como voluntário!");
      navigate("/login", {
        state: { redirectTo: `/campanhas/${id_campanha}` },
      });
      return;
    }
    try {
      setSubmittingInscricao(true);
      const response = await fetch(
        `http://127.0.0.1:8000/campanhas/${id_campanha}/inscrever`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_usuario: usuarioLogado.id_usuario }),
        },
      );
      if (response.ok) {
        alert("Parabéns! Sua candidatura de voluntário foi enviada!");
        setInscrito(true);
        const resVol = await fetch(
          `http://127.0.0.1:8000/campanhas/${id_campanha}/voluntarios`,
        );
        if (resVol.ok) setVoluntarios(await resVol.json());
      } else {
        const err = await response.json();
        alert(err.detail || "Erro na inscrição.");
      }
    } catch (error) {
      console.error("Erro ao se inscrever:", error);
    } finally {
      setSubmittingInscricao(false);
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

  const ehVoluntariado = campanha?.id_tipo_campanha === 2;
  const meta = Number(campanha?.meta_arrecadacao || 0);
  const atual = ehVoluntariado
    ? voluntarios.length
    : Number(campanha?.valor_arrecadado || 0);
  const percentual =
    meta > 0 ? Math.min(100, Math.round((atual / meta) * 100)) : 0;

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
          </div>
        </div>

        {/* Card Principal da Campanha */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                    ehVoluntariado
                      ? "bg-purple-100 text-purple-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {campanha?.tipo_nome ||
                    (ehVoluntariado ? "Voluntariado" : "Arrecadação")}
                </span>
                <span
                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase ${
                    campanha?.status === "ativa"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {campanha?.status}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                {campanha?.titulo}
              </h1>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Realizado por: <strong>{ong?.nome}</strong>
                </span>
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {campanha?.descricao}
          </p>

          {/* PAINEL DINÂMICO DE PROGRESSO E METAS */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between text-sm font-bold text-slate-800">
              <span className="flex items-center gap-2">
                <TrendingUp
                  className={`w-4 h-4 ${
                    ehVoluntariado ? "text-purple-600" : "text-emerald-600"
                  }`}
                />
                {ehVoluntariado
                  ? "Meta da Campanha"
                  : "Progresso da Arrecadação"}
              </span>
              <span
                className={
                  ehVoluntariado ? "text-purple-700" : "text-emerald-700"
                }
              >
                {percentual}% Atingido
              </span>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-700 ${
                  ehVoluntariado ? "bg-purple-600" : "bg-emerald-500"
                }`}
                style={{ width: `${percentual}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs">
              {ehVoluntariado ? (
                <>
                  <div>
                    <p className="text-slate-400 uppercase font-semibold text-[10px]">
                      Meta:
                    </p>
                    <p className="text-lg font-black text-slate-800">
                      {meta} voluntários
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 uppercase font-semibold text-[10px]">
                      Inscritos Atualmente
                    </p>
                    <p className="text-lg font-black text-purple-700">
                      {voluntarios.length} voluntários
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-slate-400 uppercase font-semibold text-[10px]">
                      Meta Financeira
                    </p>
                    <p className="text-lg font-black text-slate-800">
                      R${" "}
                      {meta.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 uppercase font-semibold text-[10px]">
                      Valor Arrecadado
                    </p>
                    <p className="text-lg font-black text-emerald-600">
                      R${" "}
                      {atual.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </>
              )}
              <div className="col-span-2 sm:col-span-1">
                <p className="text-slate-400 uppercase font-semibold text-[10px]">
                  Período da Ação
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

          {/* CTA EXCLUSIVO PARA VOLUNTARIADO */}
          {ehVoluntariado && (
            <div className="p-5 bg-purple-50 rounded-2xl border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-purple-900 flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-purple-600" />
                  Seja um Voluntário nesta Causa!
                </h3>
                <p className="text-xs text-purple-700 mt-1">
                  Inscreva-se para participar ativamente e ajudar a ONG no dia a
                  dia.
                </p>
              </div>
              {inscrito ? (
                <button
                  disabled
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-xl shrink-0 cursor-default"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Você está inscrito!</span>
                </button>
              ) : (
                <button
                  onClick={handleInscricaoVoluntario}
                  disabled={submittingInscricao}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>
                    {submittingInscricao
                      ? "Inscrevendo..."
                      : "Quero ser voluntário"}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* LISTA DE VOLUNTÁRIOS INSCRITOS (Apenas para Voluntariado) */}
        {ehVoluntariado && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Equipe de Voluntários ({voluntarios.length})
              </h2>
            </div>
            {voluntarios.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                <p className="text-xs text-slate-400">
                  Nenhum voluntário inscrito até o momento.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {voluntarios.map((v) => (
                  <div
                    key={v.id_voluntario_campanha}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:border-purple-200 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 text-sm truncate">
                        {v.nome}
                      </h3>
                      <span className="px-2 py-0.5 text-[10px] font-bold text-purple-700 bg-purple-100 rounded-md uppercase">
                        {v.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                      {v.email && (
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{v.email}</span>
                        </div>
                      )}
                      {v.celular && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{v.celular}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>
                          Inscrito em{" "}
                          {new Date(v.data_inscricao).toLocaleDateString(
                            "pt-BR",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FOTOS DA CAMPANHA */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-600" />
            Galeria da Campanha ({imagens.length})
          </h2>

          <form
            onSubmit={handleCadastrarFoto}
            className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 space-y-3"
          >
            <p className="text-xs font-semibold text-purple-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-purple-600" />
              Anexar foto a esta campanha via ImgBB:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Selecione o arquivo de imagem
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoUpload}
                  disabled={uploadingFoto}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 bg-white border border-slate-300 rounded-xl cursor-pointer"
                />
                {uploadingFoto && (
                  <div className="flex items-center gap-1.5 text-xs text-purple-700 mt-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                    <span>Enviando imagem para o ImgBB...</span>
                  </div>
                )}
                {novaImagem.url && !uploadingFoto && (
                  <div className="flex items-center gap-1 text-xs text-emerald-700 mt-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Imagem pronta!</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição da Foto
                </label>
                <input
                  type="text"
                  placeholder="Descrição (ex: Foto da ação comunitária)"
                  value={novaImagem.descricao}
                  onChange={(e) =>
                    setNovaImagem({ ...novaImagem, descricao: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={uploadingFoto || !novaImagem.url}
              className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 rounded-xl transition-all cursor-pointer"
            >
              Anexar Foto
            </button>
          </form>

          {imagens.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
              <p className="text-xs text-slate-400">
                Nenhuma foto anexada a esta campanha ainda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imagens.map((img) => (
                <div
                  key={img.id_img}
                  className="group relative h-40 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200"
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
