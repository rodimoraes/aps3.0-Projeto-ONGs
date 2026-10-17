import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

function CadastrarOng() {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormOng((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dadosFormatados = {
      ...formOng,
      // Converte apenas os IDs para inteiro
      id_usuario_representante: Number(formOng.id_usuario_representante),
      id_categoria: Number(formOng.id_categoria),
      // telefone e RCPJ permanecem como string (texto)
    };
    try {
      const response = await fetch("http://localhost:8000/ongs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosFormatados),
      });
      if (response.ok) {
        alert("ONG cadastrada com sucesso!");
      } else {
        const errorData = await response.json();
        console.log("Detalhes da validação 422:", errorData.detail);
        alert(
          `Erro 422 - Verifique os campos: ${JSON.stringify(errorData.detail)}`,
        );
      }
    } catch (error) {
      console.error("Erro na conexão:", error);
    }
  };

  // Lista com as configurações dos campos do formulário
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
    { label: "Telefone", name: "telefone", type: "number", required: true },
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
    { label: "RCPJ", name: "RCPJ", type: "number", required: true },
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

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xs border border-slate200 p-6 sm:p-8">
        <Link
          to="/ongs"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-700
font-medium mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          Cadastrar ONG
        </h1>
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
          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bgblue-700 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              Salvar Cadastro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default CadastrarOng;
