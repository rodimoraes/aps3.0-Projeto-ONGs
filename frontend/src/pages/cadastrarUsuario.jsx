import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

function CadastrarUsuario() {
  const [formUser, setFormUser] = useState({
    nome: "",
    cpf: "",
    endereco: "",
    estado_civil: "",
    rg: "",
    email: "",
    data_nascimento: "",
    voluntario: "",
    celular: "",
    representante_ong: "",
  });

  // Função que escuta os eventos e salvando os campos sempre que o usuario digita nos campos
  //Sem isso ele não consegue escrever nos campos, pois fica voltando para o estado padrão
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormUser((prev) => ({ ...prev, [name]: value }));
  };

  // Função dispara o subimit ao enviar o formulario
  const handleSubmit = async (e) => {
    // Previne o comportamento padrão do navegador de recarregar a página ao enviar um formulário
    e.preventDefault();

    try {
      // Executa a requisição assíncrona HTTP POST para o servidor FastAPI
      const response = await fetch("http://localhost:8000/usuarios", {
        method: "POST", // Define o método HTTP como POST
        headers: {
          "Content-Type": "application/json", // Informa ao servidor que o corpo da requisição é um JSON
        },
        // Converte o objeto JavaScript em uma string formatada em JSON
        body: JSON.stringify(formUser),
      });

      // Verifica se a resposta retornou um código de sucesso HTTP
      if (response.ok) {
        alert("Usuário cadastrado com sucesso!");

        // Reseta todos os campos do formulário para o estado inicial (vazios)
        setFormUser({
          nome: "",
          cpf: "",
          endereco: "",
          estado_civil: "",
          rg: "",
          email: "",
          data_nascimento: "",
          voluntario: "",
          celular: "",
          representante_ong: "",
        });
      } else {
        // Se o backend retornar erro, extrai os detalhes do JSON retornado
        const errorData = await response.json();
        alert(
          `Erro ao cadastrar: ${errorData.detail || "Falha na requisição"}`,
        );
      }
    } catch (error) {
      // Captura erros de rede ou conexão
      console.error("Erro na requisição:", error);
      alert("Não foi possível se conectar ao servidor backend.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50  px-4">
      <div className="max-w-2xl mx-auto">
        {/* Botão para Voltar para a Home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-700 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar para o início</span>
        </Link>

        {/* Card do Formulário */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">
            Cadastrar Usuario
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* nome */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                nome
              </label>
              <input
                type="text"
                name="nome"
                value={formUser.nome}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              />
            </div>

            {/* cpf */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                cpf
              </label>
              <input
                type="number"
                name="cpf"
                value={formUser.cpf}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              />
            </div>

            {/* endereco */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                endereco
              </label>
              <input
                type="text"
                name="endereco"
                value={formUser.endereco}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              />
            </div>

            {/* estado_civil */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                estado_civil
              </label>

              <select
                type="text"
                name="estado_civil"
                value={formUser.estado_civil}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              >
                <option value="">Selecione uma Opção</option>
                <option value="solteiro">Solteiro(a)</option>
                <option value="casado">Casado(a)</option>
                <option value="viuvo">Viúvo(a)</option>
              </select>
            </div>

            {/* rg */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                rg
              </label>
              <input
                type="number"
                name="rg"
                value={formUser.rg}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              />
            </div>

            {/* email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                email
              </label>
              <input
                type="email"
                name="email"
                value={formUser.email}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              />
            </div>

            {/* data_nascimento */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                data_nascimento
              </label>
              <input
                type="date"
                name="data_nascimento"
                value={formUser.data_nascimento}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              />
            </div>

            {/* voluntario */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                voluntario
              </label>

              <select
                type="text"
                name="voluntario"
                value={formUser.voluntario}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              >
                <option value="">Selecione uma Opção</option>
                <option value="1">Sim</option>
                <option value="0">Não</option>
              </select>
            </div>

            {/* celular */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                celular
              </label>
              <input
                type="number"
                name="celular"
                value={formUser.celular}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              />
            </div>

            {/* representante_ong */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                representante_ong
              </label>
              <select
                type="text"
                name="representante_ong"
                value={formUser.representante_ong}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              >
                <option value="">Selecione uma Opção</option>
                <option value="1">Sim</option>
                <option value="0">Não</option>
              </select>
            </div>

            {/* Botão de Envio */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <span>Salvar Cadastro</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CadastrarUsuario;
