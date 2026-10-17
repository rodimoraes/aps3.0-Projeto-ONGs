import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LogIn } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", senha: "" });
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const response = await fetch("http://localhost:8000/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        alert(`Bem-vindo(a), ${data.usuario.nome}!`);
        navigate("/");
      } else {
        setErro(data.detail || "Falha no login.");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-700 font-medium mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para o início</span>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <LogIn className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Entrar na Conta
            </h1>
            <p className="text-xs text-slate-500">Acesse com e-mail e senha</p>
          </div>
        </div>

        {erro && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              E-mail <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Senha <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="senha"
              value={credentials.senha}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Ainda não possui conta?{" "}
          <Link
            to="/cadastrar-usuario"
            className="text-blue-600 font-semibold hover:underline"
          >
            Cadastre-se aqui
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
