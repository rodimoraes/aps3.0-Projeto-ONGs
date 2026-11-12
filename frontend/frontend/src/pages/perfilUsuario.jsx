import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserCog,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  X,
  KeyRound,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Header from "../components/header.jsx";
import { maskCPF, maskCelular, verificarForcaSenha } from "../../js/validador";

const API = "http://127.0.0.1:8000";
const ESTADOS_CIVIS = ["solteiro", "casado", "divorciado", "viuvo"];
const REQUISITOS = [
  ["minimo8", "Mínimo 8 caracteres"],
  ["maiuscula", "Uma letra maiúscula"],
  ["minuscula", "Uma letra minúscula"],
  ["numero", "Um número"],
  ["especial", "Um caractere especial"],
];

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all";

function TabelaSenha({ forca }) {
  return (
    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-slate-600">Força da senha</span>
        <span className="text-xs font-semibold" style={{ color: forca.cor }}>
          {forca.label}
        </span>
      </div>
      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${forca.percentual}%`, backgroundColor: forca.cor }}
        />
      </div>
      <ul className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
        {REQUISITOS.map(([k, label]) => {
          const ok = forca.requisitos[k];
          return (
            <li key={k} className="flex items-center gap-1.5 text-xs">
              {ok ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <X className="w-3 h-3 text-slate-400" />
              )}
              <span className={ok ? "text-green-700" : "text-slate-500"}>
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PerfilUsuario() {
  const navigate = useNavigate();
  const usuarioLogado = JSON.parse(localStorage.getItem("usuario") || "null");

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [alterarSenha, setAlterarSenha] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    endereco: "",
    estado_civil: "",
    email: "",
    data_nascimento: "",
    celular: "",
    voluntario: false,
    senha_atual: "",
    novaSenha: "",
    confirmarSenha: "",
  });

  const forca = verificarForcaSenha(form.novaSenha);

  useEffect(() => {
    if (!usuarioLogado) {
      alert("Você precisa estar logado para acessar seu perfil.");
      navigate("/login", { state: { redirectTo: "/perfil" } });
      return;
    }

    const carregar = async () => {
      try {
        const res = await fetch(`${API}/usuarios/${usuarioLogado.id_usuario}`);
        if (res.ok) {
          const data = await res.json();
          setForm({
            nome: data.nome || "",
            cpf: data.cpf || "",
            endereco: data.endereco || "",
            estado_civil: data.estado_civil || "",
            email: data.email || "",
            data_nascimento: data.data_nascimento || "",
            celular: data.celular || "",
            voluntario: Boolean(data.voluntario),
            senha_atual: "",
            novaSenha: "",
            confirmarSenha: "",
          });
        } else {
          const e = await res.json().catch(() => ({}));
          setErro(
            typeof e.detail === "string"
              ? e.detail
              : "Não foi possível carregar os dados do perfil.",
          );
        }
      } catch (err) {
        console.error(err);
        setErro("Erro ao conectar com o servidor.");
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let v = type === "checkbox" ? checked : value;
    if (name === "cpf") v = maskCPF(value);
    if (name === "celular") v = maskCelular(value);
    setForm((prev) => ({ ...prev, [name]: v }));
    // limpa mensagens ao editar
    if (erro) setErro("");
    if (sucesso) setSucesso("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    // ---------- Validações locais da senha ----------
    if (alterarSenha) {
      if (!form.senha_atual) {
        setErro("Informe a sua senha atual para alterá-la.");
        return;
      }
      if (!forca.valida) {
        setErro("A nova senha não atende aos requisitos mínimos.");
        return;
      }
      if (form.novaSenha !== form.confirmarSenha) {
        setErro("A confirmação da senha não confere.");
        return;
      }
    }

    setSalvando(true);

    try {
      // ============================================================
      // 1) Atualiza os dados cadastrais
      // ============================================================
      const payload = {
        nome: form.nome,
        cpf: form.cpf,
        endereco: form.endereco,
        estado_civil: form.estado_civil,
        email: form.email,
        data_nascimento: form.data_nascimento,
        celular: form.celular,
        voluntario: form.voluntario,
      };

      const resDados = await fetch(
        `${API}/usuarios/${usuarioLogado.id_usuario}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!resDados.ok) {
        const err = await resDados.json().catch(() => ({}));
        const msg = Array.isArray(err.detail)
          ? err.detail
              .map((x) => `${x.loc?.join(".") || "campo"}: ${x.msg}`)
              .join(", ")
          : err.detail || "Erro ao salvar os dados cadastrais.";
        setErro(msg);
        setSalvando(false);
        return;
      }

      // Atualiza o localStorage (nome e email no header)
      const usuarioAtualizado = {
        ...usuarioLogado,
        nome: form.nome,
        email: form.email,
      };
      localStorage.setItem("usuario", JSON.stringify(usuarioAtualizado));
      window.dispatchEvent(new Event("usuarioAtualizado"));

      // ============================================================
      // 2) Atualiza a senha (se marcado)
      // ============================================================
      if (alterarSenha) {
        const token = localStorage.getItem("token");
        if (!token) {
          setErro(
            "Sessão expirada. Faça login novamente para alterar sua senha.",
          );
          setSalvando(false);
          return;
        }

        const resSenha = await fetch(
          `${API}/usuarios/${usuarioLogado.id_usuario}/senha`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              senha_atual: form.senha_atual,
              senha_nova: form.novaSenha,
            }),
          },
        );

        if (!resSenha.ok) {
          const err = await resSenha.json().catch(() => ({}));
          const msg =
            typeof err.detail === "string"
              ? err.detail
              : "Falha ao alterar a senha.";
          // ⚠️ dados cadastrais já foram salvos → avisa o usuário
          setErro(
            `Dados cadastrais atualizados, mas a senha NÃO foi alterada: ${msg}`,
          );
          setSalvando(false);
          return;
        }

        // Limpa os campos de senha após sucesso
        setForm((prev) => ({
          ...prev,
          senha_atual: "",
          novaSenha: "",
          confirmarSenha: "",
        }));
        setAlterarSenha(false);
      }

      setSucesso(
        alterarSenha
          ? "Dados e senha atualizados com sucesso!"
          : "Perfil atualizado com sucesso!",
      );

      // Redireciona após 1.2s pra dar tempo do usuário ler
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      console.error(err);
      setErro("Erro de conexão com o servidor.");
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium">Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-0">
      <Header />
      <div className="max-w-2xl mx-auto py-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-700 font-medium mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para o Início</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <UserCog className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Meu Perfil</h1>
              <p className="text-xs text-slate-500">
                Edite suas informações pessoais cadastradas.
              </p>
            </div>
          </div>

          {erro && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="break-words">{erro}</span>
            </div>
          )}

          {sucesso && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="break-words">{sucesso}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                required
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={form.cpf}
                  onChange={handleChange}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Celular
                </label>
                <input
                  type="text"
                  name="celular"
                  value={form.celular}
                  onChange={handleChange}
                  required
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Endereço
              </label>
              <input
                type="text"
                name="endereco"
                value={form.endereco}
                onChange={handleChange}
                required
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estado Civil
                </label>
                <select
                  name="estado_civil"
                  value={form.estado_civil}
                  onChange={handleChange}
                  required
                  className={inputCls + " bg-white"}
                >
                  <option value="">Selecione</option>
                  {ESTADOS_CIVIS.map((v) => (
                    <option key={v} value={v}>
                      {v.charAt(0).toUpperCase() + v.slice(1)}(a)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  name="data_nascimento"
                  value={form.data_nascimento}
                  onChange={handleChange}
                  required
                  className={inputCls}
                />
              </div>
            </div>

            {/* ALTERAR SENHA */}
            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700 mb-3">
                <input
                  type="checkbox"
                  checked={alterarSenha}
                  onChange={(e) => {
                    setAlterarSenha(e.target.checked);
                    if (!e.target.checked) {
                      setForm((p) => ({
                        ...p,
                        senha_atual: "",
                        novaSenha: "",
                        confirmarSenha: "",
                      }));
                    }
                  }}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <KeyRound className="w-4 h-4 text-slate-500" />
                Alterar minha senha
              </label>

              {alterarSenha && (
                <div className="space-y-3 pl-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Senha atual <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={mostrarSenhaAtual ? "text" : "password"}
                        name="senha_atual"
                        value={form.senha_atual}
                        onChange={handleChange}
                        required
                        placeholder="Digite sua senha atual"
                        className={inputCls}
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarSenhaAtual((v) => !v)}
                        className="absolute right-3 top-3 text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        {mostrarSenhaAtual ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nova senha <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={mostrarSenha ? "text" : "password"}
                        name="novaSenha"
                        value={form.novaSenha}
                        onChange={handleChange}
                        required
                        placeholder="Crie uma senha forte"
                        className={inputCls}
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarSenha((v) => !v)}
                        className="absolute right-3 top-3 text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        {mostrarSenha ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {form.novaSenha && <TabelaSenha forca={forca} />}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirmar nova senha{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={mostrarSenha ? "text" : "password"}
                      name="confirmarSenha"
                      value={form.confirmarSenha}
                      onChange={handleChange}
                      required
                      placeholder="Repita a nova senha"
                      className={inputCls}
                    />
                    {form.confirmarSenha &&
                      form.novaSenha !== form.confirmarSenha && (
                        <p className="text-[11px] text-red-600 mt-1">
                          As senhas não conferem.
                        </p>
                      )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <Link
                to="/"
                className="w-1/2 py-2.5 text-center text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={salvando}
                className="w-1/2 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5"
              >
                {salvando && <Loader2 className="w-4 h-4 animate-spin" />}
                {salvando ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PerfilUsuario;
