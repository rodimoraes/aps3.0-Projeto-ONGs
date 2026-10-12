import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trash2, Plus, Building2, Pencil } from "lucide-react";
function ListarOngs() {
  const [ongs, setOngs] = useState([]);
  const [loading, setLoading] = useState(true);
  // 1. READ: Função para buscar as ONGs salvas no MySQL via API
  const carregarOngs = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/ongs");
      if (response.ok) {
        const data = await response.json();
        setOngs(data);
      } else {
        alert("Erro ao carregar a lista de ONGs.");
      }
    } catch (error) {
      console.error("Erro na busca:", error);
      alert("Não foi possível se conectar ao servidor backend.");
    } finally {
      setLoading(false);
    }
  };
  // Carrega os dados automaticamente ao abrir a página
  useEffect(() => {
    carregarOngs();
  }, []);
  // 2. DELETE: Função para remover uma ONG pelo ID
  const handleDelete = async (id_ong, nome) => {
    const confirmacao = window.confirm(
      `Tem certeza que deseja excluir a ONG "${nome}"?`,
    );
    if (!confirmacao) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/ongs/${id_ong}`, {
        method: "DELETE",
      });
      if (response.ok) {
        alert("ONG removida com sucesso!");
        // Atualiza a lista local removendo o item sem recarregar a tela
        setOngs((prevOngs) => prevOngs.filter((ong) => ong.id_ong !== id_ong));
      } else {
        const errorData = await response.json();
        alert(`Erro ao excluir: ${errorData.detail || "Falha na requisição"}`);
      }
    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert("Erro ao se comunicar com o servidor.");
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho de Navegação */}

        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-700
font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para o início</span>
          </Link>
          <Link
            to="/cadastrar-ong"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium textwhite bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nova ONG</span>
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          ONGs Cadastradas
        </h1>
        {/* Indicador de Carregamento */}
        {loading ? (
          <p className="text-slate-500 text-center py-8">Carregando ONGs...</p>
        ) : ongs.length === 0 ? (
          /* Mensagem para lista vazia */
          <div
            className="bg-white p-8 rounded-2xl border border-slate-200 text-center
shadow-xs"
          >
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium mb-2">
              Nenhuma ONG cadastrada ainda.
            </p>
            <Link
              to="/cadastrar-ong"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Cadastrar a primeira ONG
            </Link>
          </div>
        ) : (
          /* Grid com os Cards das ONGs */
          <div className="grid gap-4 md:grid-cols-2">
            {ongs.map((ong) => (
              <div
                key={ong.id_ong}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex
flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className="font-bold text-slate-800 text-lg">
                      {ong.nome}
                    </h2>
                    {ong.sigla && (
                      <span
                        className="px-2.5 py-0.5 text-xs font-semibold text-blue-700
bg-blue-50 rounded-full shrink-0"
                      >
                        {ong.sigla}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-2">
                    <strong>Denominação Social:</strong>{" "}
                    {ong.denominacao_social}
                  </p>
                  <p className="text-xs text-slate-600 mb-1">
                    <strong>Endereço:</strong> {ong.endereco}
                  </p>
                  <p className="text-xs text-slate-600 mb-1">
                    <strong>Telefone:</strong> {ong.telefone}
                  </p>
                  <p className="text-xs text-slate-600 mb-3">
                    <strong>Objetivo:</strong> {ong.objetivo_social_finalidade}
                  </p>
                </div>
                {/* Ações (Editar e Deletar) */}
                <div className="pt-3 border-t border-slate-100 flex items-center justifyend gap-2">
                  <Link
                    to={`/editar-ong/${ong.id_ong}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs fontmedium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar ONG"
                  >
                    <Pencil className="w-4 h-4" />
                    <span>Editar</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(ong.id_ong, ong.nome)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs fontmedium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Excluir ONG"
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
export default ListarOngs;
