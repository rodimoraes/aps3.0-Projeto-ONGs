import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import Header from "../../components/header";

function ListarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Usar AbortController previne atualizações em componentes desmontados
    const controller = new AbortController();

    async function carregarUsuarios() {
      try {
        const response = await fetch("http://localhost:8000/usuarios", {
          signal: controller.signal,
        });

        if (response.ok) {
          const data = await response.json();
          setUsuarios(data);
        } else {
          alert("Erro ao buscar a lista de usuários.");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Erro ao conectar:", error);
          alert("Falha na conexão com o servidor backend.");
        }
      } finally {
        setLoading(false);
      }
    }

    carregarUsuarios();

    return () => controller.abort();
  }, []);

  const handleDelete = async (id, nome) => {
    if (
      !window.confirm(`Tem certeza que deseja excluir o usuário "${nome}"?`)
    ) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/usuarios/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Usuário excluído com sucesso!");
        setUsuarios((prev) => prev.filter((u) => u.id_usuario !== id));
      } else {
        const errorData = await response.json();
        alert(`Erro ao excluir: ${errorData.detail || "Erro desconhecido"}`);
      }
    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert("Não foi possível excluir o usuário.");
    }
  };

  return (
    <section>
      <Header />
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-700 font-medium text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para o início</span>
            </Link>

            <Link
              to="/cadastrar-usuario"
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-xs transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar Usuário</span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">
              Usuários Cadastrados
            </h1>

            {loading ? (
              <p className="text-slate-500 text-center py-8">
                Carregando usuários...
              </p>
            ) : usuarios.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 mb-4">
                  Nenhum usuário cadastrado ainda.
                </p>
                <Link
                  to="/cadastrar-usuario"
                  className="text-blue-600 font-medium hover:underline text-sm"
                >
                  Cadastre o primeiro usuário
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Nome</th>
                      <th className="py-3 px-4">CPF</th>
                      <th className="py-3 px-4">E-mail</th>
                      <th className="py-3 px-4">Celular</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {usuarios.map((u) => (
                      <tr
                        key={u.id_usuario}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {u.id_usuario}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {u.nome}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{u.cpf}</td>
                        <td className="py-3 px-4 text-slate-600">{u.email}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {u.celular}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/editar-usuario/${u.id_usuario}`}
                              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(u.id_usuario, u.nome)}
                              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ListarUsuarios;
