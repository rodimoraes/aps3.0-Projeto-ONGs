import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function CadastrarUsuario() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Formulário enviado!");
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
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              />
            </div>

            {/* estado_civil */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                estado_civil
              </label>
              <input
                type="text"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              />
            </div>

            {/* rg */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                rg
              </label>
              <input
                type="number"
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
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              />
            </div>

            {/* voluntario */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                voluntario
              </label>
              <input
                type="text"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              />
            </div>

            {/* celular */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                celular
              </label>
              <input
                type="number"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              />
            </div>

            {/* representante_ong */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                representante_ong
              </label>
              <input
                type="text"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              />
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
