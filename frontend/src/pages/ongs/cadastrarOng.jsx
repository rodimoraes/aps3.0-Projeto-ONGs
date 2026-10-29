import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  Check,
  X,
} from "lucide-react";
import { uploadImageToImgBB } from "../../services/imgbb.js";
import {
  maskCelular,
  maskCEP,
  validarCelular,
  buscarCEP,
  montarEndereco,
} from "../../../js/validador";

const UFS =
  "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(
    " ",
  );
const inputCls =
  "w-full px-3.5 py-2 rounded-xl border text-slate-800 text-xs focus:outline-none focus:ring-2 transition-all";
const corBorda = {
  valid: "border-green-500 focus:ring-green-500/30",
  invalid: "border-red-400 focus:ring-red-500/30",
  loading: "border-blue-400 focus:ring-blue-500/30",
  idle: "border-slate-300 focus:ring-blue-500/30",
};

function Icone({ status }) {
  if (status === "loading")
    return (
      <Loader2 className="absolute right-3 top-2.5 w-4 h-4 text-blue-500 animate-spin" />
    );
  if (status === "valid" || status === "found")
    return (
      <Check className="absolute right-3 top-2.5 w-4 h-4 text-green-600" />
    );
  if (status === "invalid")
    return <X className="absolute right-3 top-2.5 w-4 h-4 text-red-600" />;
  return null;
}

function CadastrarOng() {
  const navigate = useNavigate();
  const usuarioLogado = JSON.parse(localStorage.getItem("usuario") || "null");

  // ============================================================
  // Guard de acesso: precisa estar logado e NÃO ser representante
  // ============================================================
  useEffect(() => {
    if (!usuarioLogado) {
      alert("Você precisa estar logado para cadastrar uma ONG!");
      navigate("/login", { state: { redirectTo: "/cadastrar-ong" } });
      return;
    }
    if (usuarioLogado.representante_ong) {
      alert(
        "Você já é representante de uma ONG. Não é possível cadastrar outra.",
      );
      navigate("/ongs");
    }
  }, []);

  const [formOng, setFormOng] = useState({
    nome: "",
    logo_url: "",
    banner_url: "",
    id_categoria: "1",
    telefone: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    denominacao_social: "",
    sigla: "",
    objetivo_social_finalidade: "",
    RCPJ: "",
    CNAE: "",
    inscricao_municipal: "",
    como_ajudar: "",
  });

  const [telefoneStatus, setTelefoneStatus] = useState({
    status: "idle",
    msg: "",
  });
  const [cepStatus, setCepStatus] = useState({ status: "idle", msg: "" });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "telefone") {
      v = maskCelular(value);
      setTelefoneStatus({ status: "idle", msg: "" });
    } else if (name === "cep") {
      v = maskCEP(value);
      setCepStatus({ status: "idle", msg: "" });
    } else if (name === "estado") {
      v = value.toUpperCase();
    }
    setFormOng((prev) => ({ ...prev, [name]: v }));
  };

  const validarTelefone = () => {
    if (!formOng.telefone.replace(/\D/g, "")) return;
    const r = validarCelular(formOng.telefone);
    setTelefoneStatus(
      r.valid
        ? { status: "valid", msg: "Telefone válido." }
        : { status: "invalid", msg: r.error || "Telefone inválido." },
    );
  };

  const buscarCep = async () => {
    const d = formOng.cep.replace(/\D/g, "");
    if (!d) return;
    if (d.length !== 8) {
      setCepStatus({ status: "invalid", msg: "CEP incompleto (8 dígitos)." });
      return;
    }
    setCepStatus({ status: "loading", msg: "Buscando CEP..." });
    try {
      const data = await buscarCEP(formOng.cep);
      setFormOng((p) => ({
        ...p,
        logradouro: data.logradouro || p.logradouro,
        bairro: data.bairro || p.bairro,
        cidade: data.localidade || p.cidade,
        estado: data.uf || p.estado,
      }));
      setCepStatus({
        status: "found",
        msg: "Endereço preenchido automaticamente.",
      });
    } catch (err) {
      setCepStatus({ status: "invalid", msg: err.message });
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingLogo(true);
      const url = await uploadImageToImgBB(file);
      setFormOng((prev) => ({ ...prev, logo_url: url }));
    } catch (error) {
      alert(`Erro no upload da Logo: ${error.message}`);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingBanner(true);
      const url = await uploadImageToImgBB(file);
      setFormOng((prev) => ({ ...prev, banner_url: url }));
    } catch (error) {
      alert(`Erro no upload do Banner: ${error.message}`);
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (telefoneStatus.status !== "valid") {
      alert("Valide o telefone antes de enviar.");
      return;
    }

    setEnviando(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        nome: formOng.nome,
        logo_url: formOng.logo_url || null,
        banner_url: formOng.banner_url || null,
        id_categoria: Number(formOng.id_categoria),
        telefone: formOng.telefone,
        endereco: montarEndereco(formOng),
        denominacao_social: formOng.denominacao_social,
        sigla: formOng.sigla || null,
        objetivo_social_finalidade: formOng.objetivo_social_finalidade,
        RCPJ: String(formOng.RCPJ),
        CNAE: String(formOng.CNAE),
        inscricao_municipal: String(formOng.inscricao_municipal),
        como_ajudar: formOng.como_ajudar || null,
      };

      const response = await fetch("http://127.0.0.1:8000/ongs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Atualiza o usuário no localStorage → agora é representante
        const usuarioAtualizado = { ...usuarioLogado, representante_ong: true };
        localStorage.setItem("usuario", JSON.stringify(usuarioAtualizado));
        window.dispatchEvent(new Event("usuarioAtualizado"));

        alert(
          "ONG cadastrada com sucesso! Você agora é representante desta ONG.",
        );
        navigate("/ongs");
      } else {
        const err = await response.json();
        const msg = Array.isArray(err.detail)
          ? err.detail.map((e) => e.msg).join(", ")
          : err.detail || "Erro desconhecido.";
        alert(`Erro: ${msg}`);
      }
    } catch (error) {
      console.error("Erro na conexão:", error);
      alert("Não foi possível se conectar ao servidor.");
    } finally {
      setEnviando(false);
    }
  };

  if (!usuarioLogado) return null;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xs border border-slate-200 p-6 sm:p-8">
        <Link
          to="/ongs"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-700 font-medium mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a Lista</span>
        </Link>

        <h1 className="text-2xl font-bold text-slate-800 mb-1">
          Cadastrar Nova ONG
        </h1>
        <p className="text-xs text-slate-500 mb-6">
          Você será registrado(a) como representante desta ONG.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Uploads ImgBB */}
          <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-4">
            <h2 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-purple-600" />
              Upload da Logo e do Banner (ImgBB)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Logo da ONG
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 bg-white border border-slate-300 rounded-xl cursor-pointer"
                />
                {uploadingLogo && (
                  <div className="flex items-center gap-1.5 text-xs text-purple-700 mt-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                    <span>Enviando logo...</span>
                  </div>
                )}
                {formOng.logo_url && !uploadingLogo && (
                  <div className="flex items-center gap-1 text-xs text-emerald-700 mt-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Logo pronta!</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Banner / Capa
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  disabled={uploadingBanner}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 bg-white border border-slate-300 rounded-xl cursor-pointer"
                />
                {uploadingBanner && (
                  <div className="flex items-center gap-1.5 text-xs text-purple-700 mt-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                    <span>Enviando banner...</span>
                  </div>
                )}
                {formOng.banner_url && !uploadingBanner && (
                  <div className="flex items-center gap-1 text-xs text-emerald-700 mt-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Banner pronto!</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dados Cadastrais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome Fantasia <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nome"
                value={formOng.nome}
                onChange={handleChange}
                required
                className={inputCls + " border-slate-300"}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Denominação Social <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="denominacao_social"
                value={formOng.denominacao_social}
                onChange={handleChange}
                required
                className={inputCls + " border-slate-300"}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Categoria <span className="text-red-500">*</span>
              </label>
              <select
                name="id_categoria"
                value={formOng.id_categoria}
                onChange={handleChange}
                className={inputCls + " border-slate-300 bg-white"}
              >
                <option value={1}>Educação / Assistência</option>
                <option value={2}>Meio Ambiente</option>
                <option value={3}>Saúde</option>
                <option value={4}>Cultura / Esporte</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sigla
              </label>
              <input
                type="text"
                name="sigla"
                value={formOng.sigla}
                onChange={handleChange}
                className={inputCls + " border-slate-300"}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Telefone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="telefone"
                  value={formOng.telefone}
                  onChange={handleChange}
                  onBlur={validarTelefone}
                  required
                  placeholder="(00) 00000-0000"
                  className={
                    inputCls +
                    " " +
                    (corBorda[telefoneStatus.status] || corBorda.idle)
                  }
                />
                <Icone status={telefoneStatus.status} />
              </div>
              {telefoneStatus.msg && (
                <p
                  className={`text-[11px] mt-1 ${
                    telefoneStatus.status === "valid"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {telefoneStatus.msg}
                </p>
              )}
            </div>
          </div>

          {/* Endereço com CEP auto */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              CEP <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="cep"
                value={formOng.cep}
                onChange={handleChange}
                onBlur={buscarCep}
                required
                placeholder="00000-000"
                className={
                  inputCls + " " + (corBorda[cepStatus.status] || corBorda.idle)
                }
              />
              <Icone status={cepStatus.status} />
            </div>
            {cepStatus.msg && (
              <p
                className={`text-[11px] mt-1 ${
                  cepStatus.status === "found"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {cepStatus.msg}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Logradouro <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="logradouro"
                value={formOng.logradouro}
                onChange={handleChange}
                required
                className={inputCls + " border-slate-300"}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Número <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="numero"
                value={formOng.numero}
                onChange={handleChange}
                required
                className={inputCls + " border-slate-300"}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Complemento
            </label>
            <input
              type="text"
              name="complemento"
              value={formOng.complemento}
              onChange={handleChange}
              placeholder="Apto, bloco..."
              className={inputCls + " border-slate-300"}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bairro <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="bairro"
                value={formOng.bairro}
                onChange={handleChange}
                required
                className={inputCls + " border-slate-300"}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cidade <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="cidade"
                value={formOng.cidade}
                onChange={handleChange}
                required
                className={inputCls + " border-slate-300"}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                UF <span className="text-red-500">*</span>
              </label>
              <select
                name="estado"
                value={formOng.estado}
                onChange={handleChange}
                required
                className={inputCls + " border-slate-300 bg-white"}
              >
                <option value="">--</option>
                {UFS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Objetivo Social <span className="text-red-500">*</span>
            </label>
            <textarea
              name="objetivo_social_finalidade"
              rows="3"
              value={formOng.objetivo_social_finalidade}
              onChange={handleChange}
              required
              className={inputCls + " border-slate-300"}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CNPJ (RCPJ) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="RCPJ"
                value={formOng.RCPJ}
                onChange={handleChange}
                required
                className={inputCls + " border-slate-300"}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CNAE <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="CNAE"
                value={formOng.CNAE}
                onChange={handleChange}
                required
                className={inputCls + " border-slate-300"}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inscrição Municipal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="inscricao_municipal"
                value={formOng.inscricao_municipal}
                onChange={handleChange}
                required
                className={inputCls + " border-slate-300"}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Como Ajudar
            </label>
            <input
              type="text"
              name="como_ajudar"
              value={formOng.como_ajudar}
              onChange={handleChange}
              placeholder="Ex: Voluntariado, doações via chave PIX..."
              className={inputCls + " border-slate-300"}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex gap-3">
            <Link
              to="/ongs"
              className="w-1/2 py-2.5 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={enviando || uploadingLogo || uploadingBanner}
              className="w-1/2 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {enviando ? "Salvando..." : "Salvar Cadastro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CadastrarOng;
