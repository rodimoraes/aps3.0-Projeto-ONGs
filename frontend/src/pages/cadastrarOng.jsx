import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function CadastrarOng() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Formulário enviado!");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Botão para Voltar para a Home */}
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-700 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar para o início</span>
        </Link>

        {/* Card do Formulário */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">
            Cadastrar ONG
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

            {/* id_usuario_representante */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                id_usuario_representante
              </label>
              <input
                type="number"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              />
            </div>

            {/* id_categoria */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                id_categoria
              </label>
              <input
                type="number"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              />
            </div>

            {/* telefone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                telefone
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

            {/* denominacao_social */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                denominacao_social
              </label>
              <input
                type="text"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              />
            </div>

            {/* sigla */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                sigla
              </label>
              <input
                type="text"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              />
            </div>

            {/* objetivo_social_finalidade */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                objetivo_social_finalidade
              </label>
              <textarea
                rows="3"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all resize-none"
              ></textarea>
            </div>

            {/* RCPJ */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                RCPJ
              </label>
              <input
                type="number"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              />
            </div>

            {/* CNAE */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                CNAE
              </label>
              <input
                type="text"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              />
            </div>

            {/* inscricao_municipal */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                inscricao_municipal
              </label>
              <input
                type="text"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              />
            </div>

            {/* como_ajudar */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                como_ajudar
              </label>
              <textarea
                rows="3"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all resize-none"
              ></textarea>
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

export default CadastrarOng;
