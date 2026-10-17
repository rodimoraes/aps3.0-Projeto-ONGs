import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { maskCPF, maskCelular } from "../../../js/masks";

function EditarUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formUser, setFormUser] = useState({
    nome: "",
    cpf: "",
    endereco: "",
    estado_civil: "",
    email: "",
    data_nascimento: "",
    celular: "",
    voluntario: false,
    representante_ong: false,
  });

  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        const response = await fetch(`http://localhost:8000/usuarios/${id}`);
        if (response.ok) {
          const data = await response.json();
          setFormUser({
            nome: data.nome || "",
            cpf: data.cpf || "",
            endereco: data.endereco || "",
            estado_civil: data.estado_civil || "",
            email: data.email || "",
            data_nascimento: data.data_nascimento || "",
            celular: data.celular || "",
            voluntario: Boolean(data.voluntario),
            representante_ong: Boolean(data.representante_ong),
          });
        } else {
          alert("Usuário não encontrado.");
          navigate("/usuarios");
        }
      } catch (error) {
        console.error("Erro na busca:", error);
        alert("Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    };
    carregarUsuario();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let formattedValue = type === "checkbox" ? checked : value;

    if (name === "cpf") formattedValue = maskCPF(value);
    if (name === "celular") formattedValue = maskCelular(value);

    setFormUser((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:8000/usuarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formUser),
      });

      if (response.ok) {
        alert("Usuário atualizado com sucesso!");
        navigate("/usuarios");
      } else {
        const errorData = await response.json();
        alert(
          `Erro ao atualizar: ${errorData.detail || "Falha na requisição"}`,
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert("Não foi possível conectar ao servidor.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium">
          Carregando dados do usuário...
        </p>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-slate-800">
              Editar Usuário
            </h1>
          </div>

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

              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="representante_ong"
                  checked={formUser.representante_ong}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                Sou Representante de ONG
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
                className="w-1/2 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditarUsuario;
