import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Megaphone,
  Trash2,
  Pencil,
  Calendar,
  DollarSign,
  Eye
} from "lucide-react";
import Header from "../../components/header.jsx"
function ListarCampanhas() {
  const { id_ong } = useParams(); // Pega o ID da ONG vindo da URL
  const [ong, setOng] = useState(null);
  const [campanhas, setCampanhas] = useState([]);
  const [loading, setLoading] = useState(true);
  // Carrega os dados da ONG e a lista de campanhas associadas a ela
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Busca os detalhes da ONG
        const resOng = await fetch(`http://127.0.0.1:8000/ongs/${id_ong}`);
        if (resOng.ok) {
          const dataOng = await resOng.json();
          setOng(dataOng);
        }
        // Busca as campanhas desta ONG
        const resCampanhas = await fetch(
          `http://127.0.0.1:8000/campanhas/ong/${id_ong}`,
        );
        if (resCampanhas.ok) {
          const dataCampanhas = await resCampanhas.json();
          setCampanhas(dataCampanhas);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        alert("Erro ao conectar com o servidor.");
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, [id_ong]);
  // Função para excluir uma campanha
  const handleDelete = async (id_campanha, titulo) => {
    const confirmacao = window.confirm(
      `Deseja excluir a campanha "${titulo}"?`,
    );
    if (!confirmacao) return;
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/campanhas/${id_campanha}`,
        {
          method: "DELETE",
        },
      );
      if (response.ok) {
        alert("Campanha excluída com sucesso!");
        setCampanhas((prev) =>
          prev.filter((c) => c.id_campanha !== id_campanha),
        );
      } else {
        alert("Erro ao excluir a campanha.");
      }
    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert("Erro ao se conectar com o servidor.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium">Carregando campanhas...</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-0">
      <Header/>
      <div className="max-w-4xl mx-auto py-5">
        {/* Navegação */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/ongs"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-700
font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Lista de ONGs</span>
          </Link>
          <Link
            to={`/ongs/${id_ong}/campanhas/cadastrar`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium textwhite bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Campanha</span>
          </Link>
        </div>
        {/* Cabeçalho da ONG Selecionada */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald600">
            Campanhas da ONG
          </span>
          <h1 className="text-2xl font-bold text-slate-800 mt-1">
            {ong ? ong.nome : `ONG #${id_ong}`}
          </h1>
          {ong?.objetivo_social_finalidade && (
            <p className="text-xs text-slate-500 mt-1">
              {ong.objetivo_social_finalidade}
            </p>
          )}
        </div>
        {/* Lista de Campanhas */}
        {campanhas.length === 0 ? (
          <div
            className="bg-white p-8 rounded-2xl border border-slate-200 text-center
shadow-xs"
          >
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium mb-2">
              Nenhuma campanha cadastrada para esta ONG ainda.
            </p>
            <Link
              to={`/ongs/${id_ong}/campanhas/cadastrar`}
              className="text-emerald-600 hover:underline text-sm font-medium"
            >
              Criar a primeira campanha
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {campanhas.map((c) => (
              <div
                key={c.id_campanha}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex
flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className="font-bold text-slate-800 text-lg">
                      {c.titulo}
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-semibold rounded-full shrink-0
${
  c.status === "ativa"
    ? "bg-emerald-50 text-emerald-700"
    : "bg-slate-100 text-slate-600"
}`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3 line-clamp-3">
                    {c.descricao}
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Início:{" "}
                        {new Date(c.data_inicio).toLocaleDateString("pt-BR")}
                        {c.data_fim &&
                          ` | Fim: ${new Date(c.data_fim).toLocaleDateString(
                            "pt-BR",
                          )}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Meta: R\${" "}
                        {Number(c.meta_arrecadacao || 0).toLocaleString(
                          "pt-BR",
                          { minimumFractionDigits: 2 },
                        )}
                        {" | "}
                        Arrecadado: R\${" "}
                        {Number(c.valor_arrecadado || 0).toLocaleString(
                          "pt-BR",
                          { minimumFractionDigits: 2 },
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Ações */}
                <div className="pt-3 border-t border-slate-100 flex items-center justifyend gap-2">
                  <Link
                    to={`/campanhas/${c.id_campanha}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold textemerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver Detalhes</span>
                  </Link>

                  <Link
                    to={`/campanhas/editar/${c.id_campanha}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs fontmedium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    <span>Editar</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(c.id_campanha, c.titulo)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs fontmedium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default ListarCampanhas;
