import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
function EditarOng() {
  const { id } = useParams(); // Obtém o ID da ONG a partir da URL (/editar-ong/:id)
  const navigate = useNavigate();
  const [formOng, setFormOng] = useState({
    nome: "",
    id_usuario_representante: "",
    id_categoria: "",
    telefone: "",
    endereco: "",
    denominacao_social: "",
    sigla: "",
    objetivo_social_finalidade: "",
    RCPJ: "",
    CNAE: "",
    inscricao_municipal: "",
    como_ajudar: "",
  });
  const [loading, setLoading] = useState(true);
  // 1. Busca os dados atuais da ONG no backend para preencher o formulário
  useEffect(() => {
    const carregarOng = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/ongs/${id}`);
        if (response.ok) {
          const data = await response.json();
          // Converte garantindo o tipo String para evitar divergências com o Pydantic
          setFormOng({
            nome: data.nome || "",
            id_usuario_representante: data.id_usuario_representante || "",
            id_categoria: data.id_categoria || "",
            telefone: String(data.telefone ?? ""),
            endereco: data.endereco || "",
            denominacao_social: data.denominacao_social || "",
            sigla: data.sigla || "",
            objetivo_social_finalidade: data.objetivo_social_finalidade || "",
            RCPJ: String(data.RCPJ ?? ""),
            CNAE: String(data.CNAE ?? ""),
            inscricao_municipal: String(data.inscricao_municipal ?? ""),
            como_ajudar: data.como_ajudar || "",
          });
        } else {
          alert("Erro ao carregar os dados da ONG.");
          navigate("/ongs");
        }
      } catch (error) {
        console.error("Erro na busca:", error);
        alert("Não foi possível conectar ao servidor backend.");
      } finally {
        setLoading(false);
      }
    };
    carregarOng();
  }, [id, navigate]);

  // Atualiza o estado conforme o usuário digita nos campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormOng((prev) => ({ ...prev, [name]: value }));
  };
  // 2. Envia as alterações para o backend via PUT
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Garante a formatação exata esperada pelo OngSchema no FastAPI
    const dadosFormatados = {
      ...formOng,
      id_usuario_representante: Number(formOng.id_usuario_representante),
      id_categoria: Number(formOng.id_categoria),
      telefone: String(formOng.telefone),
      RCPJ: String(formOng.RCPJ),
      CNAE: String(formOng.CNAE),
      inscricao_municipal: String(formOng.inscricao_municipal),
    };
    try {
      const response = await fetch(`http://127.0.0.1:8000/ongs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosFormatados),
      });
      if (response.ok) {
        alert("ONG atualizada com sucesso!");
        navigate("/ongs"); // Redireciona de volta para a lista
      } else {
        const errorData = await response.json();
        alert(
          `Erro ao atualizar: ${JSON.stringify(errorData.detail || "Falha na requisição")}`,
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert("Não foi possível conectar ao servidor.");
    }
  };
  const camposFormulario = [
    { label: "Nome Fantasia", name: "nome", type: "text", required: true },
    {
      label: "ID Representante",
      name: "id_usuario_representante",
      type: "number",
      required: true,
    },
    {
      label: "ID Categoria",
      name: "id_categoria",
      type: "number",
      required: true,
    },
    { label: "Telefone", name: "telefone", type: "text", required: true },
    { label: "Endereço", name: "endereco", type: "text", required: true },
    {
      label: "Denominação Social",
      name: "denominacao_social",
      type: "text",
      required: true,
    },
    { label: "Sigla", name: "sigla", type: "text", required: false },
    {
      label: "Objetivo Social",
      name: "objetivo_social_finalidade",
      type: "text",
      required: true,
    },
    { label: "RCPJ", name: "RCPJ", type: "text", required: true },
    { label: "CNAE", name: "CNAE", type: "text", required: true },
    {
      label: "Inscrição Municipal",
      name: "inscricao_municipal",
      type: "text",
      required: true,
    },
    {
      label: "Como Ajudar",
      name: "como_ajudar",
      type: "text",
      required: false,
    },
  ];
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium">Carregando dados da ONG...</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xs border border-slate200 p-6 sm:p-8">
        <Link
          to="/ongs"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-700
font-medium mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a lista</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Editar ONG</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {camposFormulario.map((campo) => (
            <div key={campo.name}>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {campo.label}{" "}
                {campo.required && <span className="text-red-500">*</span>}
              </label>
              <input
                type={campo.type}
                name={campo.name}
                value={formOng[campo.name]}
                onChange={handleChange}
                required={campo.required}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 textslate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky500 transition-all"
              />
            </div>
          ))}
          <div className="pt-4 border-t border-slate-100 flex gap-3">
            <Link
              to="/ongs"
              className="w-1/2 py-2.5 text-center text-sm font-medium text-slate-700 bgslate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="w-1/2 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bgblue-700 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default EditarOng;
