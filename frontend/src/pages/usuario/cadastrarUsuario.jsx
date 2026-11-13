import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserPlus,
  Check,
  X,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState, useMemo } from "react";
import {
  maskCPF,
  maskCelular,
  maskCEP,
  validarCPF,
  validarCelular,
  buscarCEP,
  verificarForcaSenha,
  montarEndereco,
  validarMaioridade,
  dataMaximaNascimento,
} from "../../../js/validador";
import Header from "../../components/header.jsx";

const ESTADOS_CIVIS = ["solteiro", "casado", "divorciado", "viuvo"];
const UFS =
  "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(
    " ",
  );
const REQUISITOS = [
  ["minimo8", "Mínimo 8 caracteres"],
  ["maiuscula", "Uma letra maiúscula"],
  ["minuscula", "Uma letra minúscula"],
  ["numero", "Um número"],
  ["especial", "Um caractere especial"],
];

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border text-slate-800 text-sm focus:outline-none focus:ring-2 transition-all";
const corBorda = {
  valid: "border-green-500 focus:ring-green-500/30",
  invalid: "border-red-400 focus:ring-red-500/30",
  idle: "border-slate-300 focus:ring-sky-500/30",
};

function Icone({ status }) {
  if (status === "loading")
    return (
      <Loader2 className="absolute right-3 top-3 w-4 h-4 text-blue-500 animate-spin" />
    );
  if (status === "valid" || status === "found")
    return <Check className="absolute right-3 top-3 w-4 h-4 text-green-600" />;
  if (status === "invalid")
    return <X className="absolute right-3 top-3 w-4 h-4 text-red-600" />;
  return null;
}

function CampoComStatus({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  status,
  msg,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required
          placeholder={placeholder}
          className={`${inputCls} ${corBorda[status] || corBorda.idle}`}
        />
        <Icone status={status} />
      </div>
      {msg && (
        <p
          className={`text-xs mt-1 ${
            status === "valid" || status === "found"
              ? "text-green-600"
              : status === "invalid"
                ? "text-red-600"
                : "text-slate-500"
          }`}
        >
          {msg}
        </p>
      )}
    </div>
  );
}

function CampoTexto({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = true,
  children,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      {children || (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`${inputCls} border-slate-300 focus:ring-sky-500/30`}
        />
      )}
    </div>
  );
}

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

function Secao({ children }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-6 mb-2 border-b border-slate-100 pb-1">
      {children}
    </h2>
  );
}

function CadastrarUsuario() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    estado_civil: "",
    email: "",
    senha: "",
    data_nascimento: "",
    celular: "",
  });
  const [cpf, setCpf] = useState({ status: "idle", msg: "" });
  const [celular, setCelular] = useState({ status: "idle", msg: "" });
  const [cep, setCep] = useState({ status: "idle", msg: "" });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const forca = verificarForcaSenha(form.senha);
  const dataMaxima = dataMaximaNascimento(18);

  // Validação da data de nascimento — SÓ mostra mensagem se estiver ERRADA
  const dataNascStatus = useMemo(() => {
    if (!form.data_nascimento) return { status: "idle", msg: "" };
    const r = validarMaioridade(form.data_nascimento);
    return r.valid
      ? { status: "valid", msg: "" } // ✅ válido: nenhuma mensagem
      : { status: "invalid", msg: r.error }; // ❌ inválido: mostra erro
  }, [form.data_nascimento]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const v =
      name === "cpf"
        ? maskCPF(value)
        : name === "celular"
          ? maskCelular(value)
          : name === "cep"
            ? maskCEP(value)
            : name === "estado"
              ? value.toUpperCase()
              : value;

    if (name === "cpf") setCpf({ status: "idle", msg: "" });
    if (name === "celular") setCelular({ status: "idle", msg: "" });
    if (name === "cep") setCep({ status: "idle", msg: "" });
    setForm((prev) => ({ ...prev, [name]: v }));
  };

  const validarCpf = () => {
    const d = form.cpf.replace(/\D/g, "");
    if (!d) return;
    const r = validarCPF(form.cpf);
    setCpf(
      r.valid
        ? { status: "valid", msg: "CPF válido." }
        : { status: "invalid", msg: r.error || "CPF inválido." },
    );
  };

  const validarCelularField = () => {
    const d = form.celular.replace(/\D/g, "");
    if (!d) return;
    const r = validarCelular(form.celular);
    setCelular(
      r.valid
        ? { status: "valid", msg: "Celular válido." }
        : { status: "invalid", msg: r.error || "Celular inválido." },
    );
  };

  const buscarCep = async () => {
    const d = form.cep.replace(/\D/g, "");
    if (!d) return;
    if (d.length !== 8)
      return setCep({ status: "invalid", msg: "CEP incompleto (8 dígitos)." });
    setCep({ status: "loading", msg: "Buscando CEP..." });
    try {
      const data = await buscarCEP(form.cep);
      setForm((p) => ({
        ...p,
        logradouro: data.logradouro || p.logradouro,
        bairro: data.bairro || p.bairro,
        cidade: data.localidade || p.cidade,
        estado: data.uf || p.estado,
      }));
      setCep({ status: "found", msg: "CEP encontrado — endereço preenchido." });
    } catch (err) {
      setCep({ status: "invalid", msg: err.message });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🆕 VALIDAÇÃO DE MAIORIDADE
    const valIdade = validarMaioridade(form.data_nascimento);
    if (!valIdade.valid) {
      alert(valIdade.error);
      return;
    }

    if (cpf.status !== "valid") return alert("Valide o CPF antes de enviar.");
    if (celular.status !== "valid")
      return alert("Valide o celular antes de enviar.");
    if (!forca.valida)
      return alert("A senha não atende aos requisitos mínimos.");
    if (cep.status === "loading") return alert("Aguarde a consulta do CEP.");

    setEnviando(true);
    try {
      const res = await fetch("http://localhost:8000/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          cpf: form.cpf,
          endereco: montarEndereco(form),
          estado_civil: form.estado_civil,
          email: form.email,
          senha: form.senha,
          data_nascimento: form.data_nascimento,
          celular: form.celular,
          voluntario: false,
          representante_ong: false,
        }),
      });
      if (res.ok) {
        alert("Usuário cadastrado com sucesso! Faça seu login.");
        navigate("/login");
      } else {
        const err = await res.json().catch(() => ({}));
        let msg = "Verifique os dados.";
        if (typeof err.detail === "string") {
          msg = err.detail;
        } else if (Array.isArray(err.detail)) {
          msg = err.detail
            .map((x) => {
              let m = x.msg || "";
              if (m.startsWith("Value error, "))
                m = m.replace("Value error, ", "");
              return m;
            })
            .join("\n");
        }
        alert(`Erro: ${msg}`);
      }
    } catch {
      alert("Não foi possível conectar ao servidor backend.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-0 px-4">
      <Header />
      <div className="max-w-2xl mx-auto py-5">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-700 font-medium mb-6"
        >
          <ArrowLeft className="w-5 h-5" /> Voltar
        </Link>

        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <UserPlus className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              Cadastrar Novo Usuário
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Secao>Dados pessoais</Secao>

            <CampoTexto
              label="Nome Completo"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Ex: Maria Silva"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CampoComStatus
                label="CPF"
                name="cpf"
                value={form.cpf}
                onChange={handleChange}
                onBlur={validarCpf}
                placeholder="000.000.000-00"
                status={cpf.status}
                msg={cpf.msg}
              />
              <CampoComStatus
                label="Celular"
                name="celular"
                value={form.celular}
                onChange={handleChange}
                onBlur={validarCelularField}
                placeholder="(00) 00000-0000"
                status={celular.status}
                msg={celular.msg}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CampoTexto
                label="E-mail"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="exemplo@email.com"
              />

              {/* DATA DE NASCIMENTO COM VALIDAÇÃO 18+ */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Data de Nascimento <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="data_nascimento"
                    value={form.data_nascimento}
                    onChange={handleChange}
                    required
                    max={dataMaxima}
                    className={`${inputCls} ${
                      corBorda[dataNascStatus.status] || corBorda.idle
                    }`}
                  />
                  <Icone status={dataNascStatus.status} />
                </div>
                {/* Só exibe mensagem se houver erro */}
                {dataNascStatus.msg && (
                  <p className="text-xs mt-1 text-red-600">
                    {dataNascStatus.msg}
                  </p>
                )}
              </div>
            </div>

            <CampoTexto
              label="Estado Civil"
              name="estado_civil"
              value={form.estado_civil}
              onChange={handleChange}
            >
              <select
                name="estado_civil"
                value={form.estado_civil}
                onChange={handleChange}
                required
                className={`${inputCls} border-slate-300 focus:ring-sky-500/30 bg-white`}
              >
                <option value="">Selecione</option>
                {ESTADOS_CIVIS.map((v) => (
                  <option key={v} value={v}>
                    {v.charAt(0).toUpperCase() + v.slice(1)}(a)
                  </option>
                ))}
              </select>
            </CampoTexto>

            <Secao>Endereço</Secao>

            <CampoComStatus
              label="CEP"
              name="cep"
              value={form.cep}
              onChange={handleChange}
              onBlur={buscarCep}
              placeholder="00000-000"
              status={cep.status}
              msg={cep.msg}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <CampoTexto
                  label="Logradouro"
                  name="logradouro"
                  value={form.logradouro}
                  onChange={handleChange}
                />
              </div>
              <CampoTexto
                label="Número"
                name="numero"
                value={form.numero}
                onChange={handleChange}
              />
            </div>

            <CampoTexto
              label="Complemento"
              name="complemento"
              value={form.complemento}
              onChange={handleChange}
              required={false}
              placeholder="Apto, bloco..."
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <CampoTexto
                label="Bairro"
                name="bairro"
                value={form.bairro}
                onChange={handleChange}
              />
              <CampoTexto
                label="Cidade"
                name="cidade"
                value={form.cidade}
                onChange={handleChange}
              />
              <CampoTexto
                label="UF"
                name="estado"
                value={form.estado}
                onChange={handleChange}
              >
                <select
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                  required
                  className={`${inputCls} border-slate-300 focus:ring-sky-500/30 bg-white`}
                >
                  <option value="">--</option>
                  {UFS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </CampoTexto>
            </div>

            <Secao>Segurança</Secao>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Senha <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  name="senha"
                  value={form.senha}
                  onChange={handleChange}
                  required
                  placeholder="Crie uma senha forte"
                  className={`${inputCls} border-slate-300 focus:ring-sky-500/30`}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
                >
                  {mostrarSenha ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {form.senha && <TabelaSenha forca={forca} />}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={
                  enviando ||
                  cpf.status === "loading" ||
                  celular.status === "loading" ||
                  cep.status === "loading" ||
                  !forca.valida ||
                  dataNascStatus.status !== "valid"
                }
                className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enviando ? "Salvando..." : "Salvar Cadastro"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CadastrarUsuario;
