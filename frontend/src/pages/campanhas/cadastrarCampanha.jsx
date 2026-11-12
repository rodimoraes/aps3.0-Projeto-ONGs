import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "../../components/header.jsx";
function CadastrarCampanha() {
  const { id_ong, id_campanha } = useParams();
  const navigate = useNavigate();
  const isEdicao = Boolean(id_campanha);
  const [formCampanha, setFormCampanha] = useState({
    id_ong: id_ong || "",
    id_tipo_campanha: 1, // 1 = Arrecadação (Padrão), 2 = Voluntariado
    titulo: "",
    descricao: "",
    data_inicio: "",
    data_fim: "",
    meta_arrecadacao: "",
    valor_arrecadado: "0",
    status: "ativa",
  });
  const [loading, setLoading] = useState(isEdicao);
  // Se for edição, carrega os dados atuais da campanha
  useEffect(() => {
    if (isEdicao) {
      const carregarCampanha = async () => {
        try {
          const res = await fetch(
            `http://127.0.0.1:8000/campanhas/${id_campanha}`,
          );
          if (res.ok) {
            const data = await res.json();
            setFormCampanha({
              id_ong: data.id_ong,
              titulo: data.titulo || "",
              descricao: data.descricao || "",
              data_inicio: data.data_inicio || "",
              data_fim: data.data_fim || "",
              meta_arrecadacao: data.meta_arrecadacao || "",
              valor_arrecadado: data.valor_arrecadado || "0",
              status: data.status || "ativa",
            });
          } else {
            alert("Erro ao carregar dados da campanha.");
            navigate("/ongs");
          }
        } catch (error) {
          console.error("Erro:", error);
          alert("Não foi possível conectar ao servidor.");
        } finally {
          setLoading(false);
        }
      };
      carregarCampanha();
    }
  }, [id_campanha, isEdicao, navigate]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormCampanha((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ---- Validação de datas ----
    if (
      formCampanha.data_fim &&
      formCampanha.data_fim < formCampanha.data_inicio
    ) {
      alert("A data de fim não pode ser anterior à data de início.");
      return;
    }
    const dadosFormatados = {
      ...formCampanha,
      id_ong: Number(formCampanha.id_ong),
      meta_arrecadacao: formCampanha.meta_arrecadacao
        ? Number(formCampanha.meta_arrecadacao)
        : 0,
      valor_arrecadado: formCampanha.valor_arrecadado
        ? Number(formCampanha.valor_arrecadado)
        : 0,
      data_fim: formCampanha.data_fim ? formCampanha.data_fim : null,
    };
    const url = isEdicao
      ? `http://127.0.0.1:8000/campanhas/${id_campanha}`
      : "http://127.0.0.1:8000/campanhas";
    const method = isEdicao ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosFormatados),
      });
      if (res.ok) {
        alert(isEdicao ? "Campanha atualizada!" : "Campanha cadastrada!");
        navigate(`/ongs/${dadosFormatados.id_ong}/campanhas`);
      } else {
        const errorData = await res.json();
        alert(`Erro: ${JSON.stringify(errorData.detail)}`);
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Não foi possível conectar ao servidor.");
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Carregando dados da campanha...</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-0">
      <Header />
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xs border border-slate-200 sm:p-8">
        <Link
          to={`/ongs/${formCampanha.id_ong}/campanhas`}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-700
font-medium mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para as Campanhas</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          {isEdicao ? "Editar Campanha" : "Nova Campanha"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald500"
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
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 textslate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
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
                min={formCampanha.data_inicio || undefined}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tipo de Campanha <span className="text-red-500">*</span>
            </label>
            <select
              name="id_tipo_campanha"
              value={formCampanha.id_tipo_campanha}
              onChange={(e) =>
                setFormCampanha({
                  ...formCampanha,
                  id_tipo_campanha: Number(e.target.value),
                })
              }
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800
focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value={1}>Arrecadação (Doações / Itens)</option>
              <option value={2}>Voluntariado (Engajamento de Pessoas)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meta de Arrecadação (R\$)
              </label>
              <input
                type="number"
                step="0.01"
                name="meta_arrecadacao"
                value={formCampanha.meta_arrecadacao}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 textslate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Valor Arrecadado (R\$)
              </label>
              <input
                type="number"
                step="0.01"
                name="valor_arrecadado"
                value={formCampanha.valor_arrecadado}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 textslate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb1">
              Status
            </label>
            <select
              name="status"
              value={formCampanha.status}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="ativa">Ativa</option>
              <option value="encerrada">Encerrada</option>
              <option value="pausada">Pausada</option>
            </select>
          </div>
          <div className="pt-4 border-t border-slate-100 flex gap-3">
            <Link
              to={`/ongs/${formCampanha.id_ong}/campanhas`}
              className="w-1/2 py-2.5 text-center text-sm font-medium text-slate-700 bgslate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="w-1/2 py-2.5 text-sm font-medium text-white bg-emerald-600
hover:bg-emerald-700 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              {isEdicao ? "Salvar Alterações" : "Cadastrar Campanha"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default CadastrarCampanha;
