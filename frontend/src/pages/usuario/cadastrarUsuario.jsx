import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useState } from "react";
import { maskCPF, maskCelular } from "../../../js/masks";

// Configuração dos campos do formulário para mapeamento (.map)
const CAMPOS_FORMULARIO = [
  {
    name: "nome",
    label: "Nome Completo",
    type: "text",
    placeholder: "Ex: Maria Silva",
    required: true,
  },
  {
    name: "cpf",
    label: "CPF",
    type: "text",
    placeholder: "000.000.000-00",
    required: true,
  },
  {
    name: "celular",
    label: "Celular",
    type: "text",
    placeholder: "(00) 00000-0000",
    required: true,
  },
  {
    name: "email",
    label: "E-mail",
    type: "email",
    placeholder: "exemplo@email.com",
    required: true,
  },
  {
    name: "endereco",
    label: "Endereço",
    type: "text",
    placeholder: "Rua, número, bairro, cidade",
    required: true,
  },
  {
    name: "estado_civil",
    label: "Estado Civil",
    type: "select",
    required: true,
    options: [
      { value: "", label: "Selecione uma Opção" },
      { value: "solteiro", label: "Solteiro(a)" },
      { value: "casado", label: "Casado(a)" },
      { value: "divorciado", label: "Divorciado(a)" },
      { value: "viuvo", label: "Viúvo(a)" },
    ],
  },
  {
    name: "data_nascimento",
    label: "Data de Nascimento",
    type: "date",
    required: true,
  },
];

function CadastrarUsuario() {
  const navigate = useNavigate();
  const [formUser, setFormUser] = useState({
    nome: "",
    cpf: "",
    endereco: "",
    estado_civil: "",
    email: "",
    data_nascimento: "",
    celular: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cpf") formattedValue = maskCPF(value);
    if (name === "celular") formattedValue = maskCelular(value);

    setFormUser((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Envia voluntario e representante_ong definidos estritamente como false
    const payload = {
      ...formUser,
      voluntario: false,
      representante_ong: false,
    };

    try {
      const response = await fetch("http://localhost:8000/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Usuário cadastrado com sucesso!");
        navigate("/usuarios");
      } else {
        const errorData = await response.json();
        alert(
          `Erro ao cadastrar: ${errorData.detail || "Verifique os dados digitados"}`,
        );
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Não foi possível se conectar ao servidor backend.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/usuarios"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-700 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar para a lista</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <UserPlus className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              Cadastrar Novo Usuário
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mapeamento dinâmico dos campos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CAMPOS_FORMULARIO.map((campo) => {
                const isFullWidth =
                  campo.name === "nome" ||
                  campo.name === "endereco" ||
                  campo.name === "email";

                return (
                  <div
                    key={campo.name}
                    className={isFullWidth ? "sm:col-span-2" : "col-span-1"}
                  >
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {campo.label}{" "}
                      {campo.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>

                    {campo.type === "select" ? (
                      <select
                        name={campo.name}
                        value={formUser[campo.name]}
                        onChange={handleChange}
                        required={campo.required}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all bg-white"
                      >
                        {campo.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={campo.type}
                        name={campo.name}
                        value={formUser[campo.name]}
                        onChange={handleChange}
                        required={campo.required}
                        placeholder={campo.placeholder}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Botão de Envio */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                Salvar Cadastro
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CadastrarUsuario;
