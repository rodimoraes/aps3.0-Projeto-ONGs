import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "../../components/header.jsx"
function EditarCampanha() {
  const { id_campanha } = useParams();
  const navigate = useNavigate();
  const [formCampanha, setFormCampanha] = useState({
    id_ong: "",
    id_tipo_campanha: 1, // 1 = Arrecadação, 2 = Voluntariado
    titulo: "",
    descricao: "",
    data_inicio: "",
    data_fim: "",
    meta_arrecadacao: 0,
    valor_arrecadado: 0,
    status: "ativa",
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const carregarCampanha = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/campanhas/${id_campanha}`,
        );
        if (response.ok) {
          const data = await response.json();
          setFormCampanha({
            id_ong: data.id_ong || "",
            id_tipo_campanha: data.id_tipo_campanha || 1,
            titulo: data.titulo || "",
            descricao: data.descricao || "",
            data_inicio: data.data_inicio || "",
            data_fim: data.data_fim || "",
            meta_arrecadacao: data.meta_arrecadacao || 0,
            valor_arrecadado: data.valor_arrecadado || 0,
            status: data.status || "ativa",
          });
        } else {
          alert("Campanha não encontrada!");
          navigate("/ongs");
        }
      } catch (error) {
        console.error("Erro ao carregar campanha:", error);
        alert("Não foi possível conectar ao servidor.");
      } finally {
        setLoading(false);
      }
    };
    carregarCampanha();
  }, [id_campanha, navigate]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormCampanha((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const dadosFormatados = {
      id_ong: Number(formCampanha.id_ong),
      id_tipo_campanha: Number(formCampanha.id_tipo_campanha),
      titulo: formCampanha.titulo,
      descricao: formCampanha.descricao,
      data_inicio: formCampanha.data_inicio,
      data_fim: formCampanha.data_fim || null,
      meta_arrecadacao: Number(formCampanha.meta_arrecadacao || 0),
      valor_arrecadado: Number(formCampanha.valor_arrecadado || 0),
      status: formCampanha.status,
    };
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/campanhas/${id_campanha}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dadosFormatados),
        },
      );
      if (response.ok) {
        alert("Campanha atualizada com sucesso!");
        navigate(`/campanhas/${id_campanha}`);
      } else {
        const errorData = await response.json();
        alert(`Erro ao atualizar: ${JSON.stringify(errorData.detail)}`);
      }
    } catch (error) {
      console.error("Erro na atualização:", error);
      alert("Não foi possível conectar ao servidor.");
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium">
          Carregando dados da campanha...
        </p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-0">
      <Header />
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xs border border-slate-200 p-6 py-5 sm:p-8">
        <Link
          to={`/campanhas/${id_campanha}`}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-700
font-medium mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Detalhes da Campanha</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          Editar Campanha
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo de Campanha <span className="text-red-500">*</span>
              </label>
              <select
                name="id_tipo_campanha"
                value={formCampanha.id_tipo_campanha}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs
text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value={1}>Arrecadação (Doações / Itens)</option>
                <option value={2}>Voluntariado (Engajamento de Pessoas)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formCampanha.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs
text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="ativa">Ativa</option>
                <option value="concluida">Concluída</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Título da Campanha <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="titulo"
              value={formCampanha.titulo}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs
text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descrição <span className="text-red-500">*</span>
            </label>
            <textarea
              name="descricao"
              rows="3"
              value={formCampanha.descricao}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs
text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data de Início <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="data_inicio"
                value={formCampanha.data_inicio}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs
text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data de Fim
              </label>
              <input
                type="date"
                name="data_fim"
                value={formCampanha.data_fim}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs
text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {Number(formCampanha.id_tipo_campanha) === 2
                  ? "Meta de Voluntários (Pessoas)"
                  : "Meta Financeira (R$)"}
              </label>
              <input
                type="number"
                name="meta_arrecadacao"
                value={formCampanha.meta_arrecadacao}
                onChange={handleChange}
                step="any"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs
text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
            {Number(formCampanha.id_tipo_campanha) === 1 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valor Arrecadado (R$)
                </label>
                <input
                  type="number"
                  name="valor_arrecadado"
                  value={formCampanha.valor_arrecadado}
                  onChange={handleChange}
                  step="any"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs
text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            )}
          </div>
          <div className="pt-4 border-t border-slate-100 flex gap-3">
            <Link
              to={`/campanhas/${id_campanha}`}
              className="w-1/2 py-2.5 text-center text-xs font-semibold text-slate-700 bgslate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="w-1/2 py-2.5 text-xs font-semibold text-white bg-emerald-600
hover:bg-emerald-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default EditarCampanha;
