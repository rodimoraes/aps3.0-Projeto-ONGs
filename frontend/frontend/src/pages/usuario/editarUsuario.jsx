import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, AlertCircle } from "lucide-react";
import { maskCPF, maskCelular } from "../../../js/validador";

const API = "http://127.0.0.1:8000";

function EditarUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erroCarregar, setErroCarregar] = useState("");
  const [erroSalvar, setErroSalvar] = useState("");
  const [formUser, setFormUser] = useState({
    nome: "",
    cpf: "",
    endereco: "",
    estado_civil: "",
    email: "",
    data_nascimento: "",
    celular: "",
    voluntario: false,
  });

  // ----------------------------------------------------------
  // GET — carrega o usuário
  // ----------------------------------------------------------
  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        console.log(`[EditarUsuario] GET ${API}/usuarios/${id}`);
        const response = await fetch(`${API}/usuarios/${id}`);
        console.log(`[EditarUsuario] Status GET: ${response.status}`);

        if (response.ok) {
          const data = await response.json();
          console.log("[EditarUsuario] Dados recebidos:", data);

          setFormUser({
            nome: data.nome || "",
            cpf: data.cpf || "",
            endereco: data.endereco || "",
            estado_civil: data.estado_civil || "",
            email: data.email || "",
            data_nascimento: data.data_nascimento || "",
            celular: data.celular || "",
            voluntario: Boolean(data.voluntario),
          });
        } else {
          const err = await response.json().catch(() => ({}));
          const msg =
            typeof err.detail === "string"
              ? err.detail
              : JSON.stringify(err.detail || err);
          setErroCarregar(
            `Erro ${response.status}: ${msg || "Usuário não encontrado."}`,
          );
        }
      } catch (error) {
        console.error("[EditarUsuario] Erro GET:", error);
        setErroCarregar(
          `Não foi possível conectar ao servidor em ${API}. Verifique se o backend está rodando.`,
        );
      } finally {
        setLoading(false);
      }
    };
    carregarUsuario();
  }, [id]);

  // ----------------------------------------------------------
  // PUT — salva alterações
  // ----------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setErroSalvar("");

    const payload = {
      nome: formUser.nome,
      cpf: formUser.cpf,
      endereco: formUser.endereco,
      estado_civil: formUser.estado_civil,
      email: formUser.email,
      data_nascimento: formUser.data_nascimento,
      celular: formUser.celular,
      voluntario: formUser.voluntario,
    };

    try {
      console.log(`[EditarUsuario] PUT ${API}/usuarios/${id}`, payload);
      const response = await fetch(`${API}/usuarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log(`[EditarUsuario] Status PUT: ${response.status}`);

      if (response.ok) {
        alert("Usuário atualizado com sucesso!");
        navigate("/usuarios");
        return;
      }

      const err = await response.json().catch(() => ({}));
      let msg = "Falha ao salvar";
      if (typeof err.detail === "string") {
        msg = err.detail;
      } else if (Array.isArray(err.detail)) {
        msg = err.detail
          .map((x) => `${x.loc?.join(".") || "campo"}: ${x.msg}`)
          .join(", ");
      } else if (err.detail) {
        msg = JSON.stringify(err.detail);
      }
      setErroSalvar(`Erro ${response.status}: ${msg}`);
    } catch (error) {
      console.error("[EditarUsuario] Erro PUT:", error);
      setErroSalvar(
        `Não foi possível conectar ao servidor em ${API}. Verifique se o backend está rodando.`,
      );
    } finally {
      setSalvando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let v = type === "checkbox" ? checked : value;
    if (name === "cpf") v = maskCPF(value);
    if (name === "celular") v = maskCelular(value);
    setFormUser((prev) => ({ ...prev, [name]: v }));
  };

  // ----------------------------------------------------------
  // Tela de loading
  // ----------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium">
          Carregando dados do usuário...
        </p>
      </div>
    );
  }

  // ----------------------------------------------------------
  // Tela de erro ao carregar (GET falhou)
  // ----------------------------------------------------------
  if (erroCarregar && !formUser.nome) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 shadow-sm p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">
            Não foi possível carregar
          </h2>
          <p className="text-sm text-slate-600 mb-4 break-words">
            {erroCarregar}
          </p>
          <div className="flex gap-2">
            <Link
              to="/usuarios"
              className="flex-1 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Voltar
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------
  // Formulário
  // ----------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/usuarios"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-700 font-medium mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a lista</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Pencil className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Editar Usuário
              </h1>
              <p className="text-xs text-slate-500">ID #{id}</p>
            </div>
          </div>

          {erroSalvar && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="break-words">{erroSalvar}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nome Completo
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formUser.cpf}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Celular
                </label>
                <input
                  type="text"
                  name="celular"
                  value={formUser.celular}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                E-mail
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Endereço
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Estado Civil
                </label>
                <select
                  name="estado_civil"
                  value={formUser.estado_civil}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all bg-white"
                >
                  <option value="">Selecione</option>
                  <option value="solteiro">Solteiro(a)</option>
                  <option value="casado">Casado(a)</option>
                  <option value="divorciado">Divorciado(a)</option>
                  <option value="viuvo">Viúvo(a)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Data de Nascimento
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
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-4 border-t border-slate-100 mt-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="voluntario"
                  checked={formUser.voluntario}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                Desejo ser Voluntário
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <Link
                to="/usuarios"
                className="w-1/2 py-2.5 text-center text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={salvando}
                className="w-1/2 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {salvando ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditarUsuario;
