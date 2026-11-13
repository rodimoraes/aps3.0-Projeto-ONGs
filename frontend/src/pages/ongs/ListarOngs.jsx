import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  Plus,
  Building2,
  Pencil,
  Megaphone,
  Image as ImageIcon,
  Eye,
  MapPin,
  Phone,
  Search,
} from "lucide-react";
import Header from "../../components/header.jsx";

function ListarOngs() {
  const navigate = useNavigate();
  const [ongs, setOngs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  const usuarioLogado = JSON.parse(localStorage.getItem("usuario") || "null");

  useEffect(() => {
    fetchOngs();
  }, []);

  const fetchOngs = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/ongs");
      if (response.ok) {
        const data = await response.json();
        setOngs(data);
      }
    } catch (error) {
      console.error("Erro ao buscar ONGs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNovaOng = () => {
    if (!usuarioLogado) {
      alert("Você precisa estar logado para cadastrar uma ONG!");
      navigate("/login", { state: { redirectTo: "/cadastrar-ong" } });
      return;
    }
    // Sem restrição de "já é representante" — agora pode ter várias ONGs
    navigate("/cadastrar-ong");
  };

  const handleDelete = async (id, nome) => {
    if (!usuarioLogado) {
      alert("Você precisa estar logado.");
      return;
    }
    if (!window.confirm(`Deseja realmente excluir a ONG "${nome}"?`)) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://127.0.0.1:8000/ongs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        alert("ONG excluída com sucesso!");
        setOngs((prev) => prev.filter((ong) => ong.id_ong !== id));
      } else {
        const err = await response.json();
        alert(`Erro ao excluir: ${err.detail || "Tente novamente."}`);
      }
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium">Carregando ONGs...</p>
      </div>
    );
  }

  // Filtra: se logado, mostra apenas as ONGs do representante.
  // Se não logado, mostra todas (público).
  const minhasOngs = usuarioLogado
    ? ongs.filter(
        (ong) => ong.id_usuario_representante === usuarioLogado.id_usuario,
      )
    : ongs;

  // Filtro de busca por nome
  const termo = busca.trim().toLowerCase();
  const ongsFiltradas = termo
    ? minhasOngs.filter((ong) =>
        `${ong.nome} ${ong.sigla || ""} ${ong.denominacao_social || ""}`
          .toLowerCase()
          .includes(termo),
      )
    : minhasOngs;

  const tituloPagina = usuarioLogado
    ? "Gerenciar Minhas ONGs"
    : "ONGs Cadastradas";
  const subtitulo = usuarioLogado
    ? "Gerencie suas organizações, campanhas e galerias em um só lugar."
    : "Explore as organizações sociais da plataforma.";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-0">
      <Header />
      <div className="max-w-6xl mx-auto py-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-700 font-medium text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para o Início</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {tituloPagina}
            </h1>
            <p className="text-xs text-slate-500 mt-1">{subtitulo}</p>
          </div>
          <div className="flex items-center gap-2">
            {usuarioLogado && (
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar nas minhas ONGs..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white w-full sm:w-56"
                />
              </div>
            )}
            <button
              onClick={handleNovaOng}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nova ONG</span>
            </button>
          </div>
        </div>

        {ongsFiltradas.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center shadow-xs">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-700 font-semibold mb-1">
              {usuarioLogado
                ? "Você ainda não cadastrou nenhuma ONG."
                : "Nenhuma ONG cadastrada ainda."}
            </p>
            <p className="text-xs text-slate-500 mb-4">
              {usuarioLogado
                ? "Clique em 'Nova ONG' para cadastrar a primeira."
                : "Seja o primeiro a cadastrar uma ONG na plataforma."}
            </p>
            <button
              onClick={handleNovaOng}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Cadastrar ONG
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
            {ongsFiltradas.map((ong) => {
              const podeEditar =
                usuarioLogado &&
                ong.id_usuario_representante === usuarioLogado.id_usuario;
              return (
                <div
                  key={ong.id_ong}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-all h-full"
                >
                  <div>
                    <div className="h-32 w-full bg-slate-200 relative">
                      {ong.banner_url ? (
                        <img
                          src={ong.banner_url}
                          alt={`Banner ${ong.nome}`}
                          className="w-full h-full object-cover"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90" />
                      )}
                      <div className="absolute -bottom-5 left-5 w-14 h-14 rounded-2xl bg-white p-1 border-2 border-white shadow-md overflow-hidden shrink-0">
                        {ong.logo_url ? (
                          <img
                            src={ong.logo_url}
                            alt={ong.nome}
                            className="w-full h-full object-cover rounded-xl"
                            onError={(e) =>
                              (e.target.src =
                                "https://placehold.co/100x100/94a3b8/ffffff?text=ONG")
                            }
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold text-lg">
                            {ong.sigla || ong.nome?.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-8 px-5 pb-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h2 className="font-bold text-slate-800 text-base line-clamp-1">
                            {ong.nome}
                          </h2>
                          {ong.sigla && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                              {ong.sigla}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                          {ong.objetivo_social_finalidade}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                        {ong.endereco && (
                          <div className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{ong.endereco}</span>
                          </div>
                        )}
                        {ong.telefone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{ong.telefone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <Link
                        to={`/ongs/${ong.id_ong}`}
                        className="inline-flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-semibold text-blue-700 bg-blue-100/70 hover:bg-blue-100 rounded-xl transition-colors"
                        title="Ver Painel Completo"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Painel</span>
                      </Link>
                      <Link
                        to={`/ongs/${ong.id_ong}/campanhas`}
                        className="inline-flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-semibold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-100 rounded-xl transition-colors"
                        title="Ver Campanhas"
                      >
                        <Megaphone className="w-3.5 h-3.5" />
                        <span>Ações</span>
                      </Link>
                      <Link
                        to={`/ongs/${ong.id_ong}/imagens`}
                        className="inline-flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-semibold text-purple-700 bg-purple-100/70 hover:bg-purple-100 rounded-xl transition-colors"
                        title="Ver Fotos"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Fotos</span>
                      </Link>
                    </div>

                    {podeEditar && (
                      <div className="flex items-center justify-between pt-1">
                        <Link
                          to={`/editar-ong/${ong.id_ong}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-200/50 px-2 py-1 rounded-lg transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5 text-slate-500" />
                          <span>Editar ONG</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(ong.id_ong, ong.nome)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-100/60 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                          title="Excluir ONG"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Excluir</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ListarOngs;
