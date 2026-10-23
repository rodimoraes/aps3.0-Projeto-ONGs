import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { uploadImageToImgBB } from "../../services/imgbb.js";
function CadastrarOng() {
  const navigate = useNavigate();
  const [formOng, setFormOng] = useState({
    nome: "",
    logo_url: "",
    banner_url: "",
    id_usuario_representante: "",
    id_categoria: "1",
    telefone: "",
    endereco: "",
    denominacao_social: "",
    sigla: "",
    objetivo_social_finalidade: "",
    RCPJ: "",
    CNAE: "",
    inscricao_municipal: "",
    como_ajudar: "",
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormOng((prev) => ({ ...prev, [name]: value }));
  };
  // Upload da Logo via ImgBB
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
  // Upload do Banner via ImgBB
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
    const dadosFormatados = {
      ...formOng,
      id_usuario_representante: Number(formOng.id_usuario_representante),
      id_categoria: Number(formOng.id_categoria),
      telefone: String(formOng.telefone),
      RCPJ: String(formOng.RCPJ),
      CNAE: String(formOng.CNAE),
      inscricao_municipal: String(formOng.inscricao_municipal),
      logo_url: formOng.logo_url || null,
      banner_url: formOng.banner_url || null,
    };
    try {
      const response = await fetch("http://127.0.0.1:8000/ongs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosFormatados),
      });
      if (response.ok) {
        alert("ONG cadastrada com sucesso!");
        navigate("/ongs");
      } else {
        const errorData = await response.json();
        alert(`Erro ao cadastrar: ${JSON.stringify(errorData.detail)}`);
      }
    } catch (error) {
      console.error("Erro na conexão:", error);
      alert("Não foi possível se conectar ao servidor.");
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xs border border-slate200 p-6 sm:p-8">
        <Link
          to="/ongs"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-700
font-medium mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a Lista</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          Cadastrar Nova ONG
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Upload de Imagens com ImgBB */}
          <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y4">
            <h2
              className="text-xs font-bold text-purple-900 uppercase tracking-wider flex
items-center gap-1.5"
            >
              <ImageIcon className="w-4 h-4 text-purple-600" />
              Upload da Logo e do Banner (ImgBB)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Logo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Logo da ONG
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3
file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:textwhite hover:file:bg-purple-700 bg-white border border-slate-300 rounded-xl cursor-pointer"
                />
                {uploadingLogo && (
                  <div className="flex items-center gap-1.5 text-xs text-purple-700 mt1.5">
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
              {/* Banner */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Banner / Capa
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  disabled={uploadingBanner}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3
file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:textwhite hover:file:bg-purple-700 bg-white border border-slate-300 rounded-xl cursor-pointer"
                />
                {uploadingBanner && (
                  <div className="flex items-center gap-1.5 text-xs text-purple-700 mt1.5">
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
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs
text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs
text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ID Representante <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="id_usuario_representante"
                value={formOng.id_usuario_representante}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs
text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Categoria <span className="text-red-500">*</span>
              </label>
              <select
                name="id_categoria"
                value={formOng.id_categoria}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs
22/10/2026, 21:10 Gemini Notebook
https://notebook.google.com/notebook/d74668a4-d042-4108-b2ac-60c42a88af6e 4/7
text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value={1}>Educação / Assistência</option>
                <option value={2}>Meio Ambiente</option>
                <option value={3}>Saúde</option>
                <option value={4}>Cultura / Esporte</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb1">
                Sigla
              </label>
              <input
                type="text"
                name="sigla"
                value={formOng.sigla}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs
text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Telefone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="telefone"
                value={formOng.telefone}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs
text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Endereço <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="endereco"
                value={formOng.endereco}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs
text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
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
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs
text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                RCPJ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="RCPJ"
                value={formOng.RCPJ}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs
text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs
text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs
text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs
text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div className="pt-4 border-t border-slate-100 flex gap-3">
            <Link
              to="/ongs"
              className="w-1/2 py-2.5 text-center text-xs font-semibold text-slate-700 bgslate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={uploadingLogo || uploadingBanner}
              className="w-1/2 py-2.5 text-xs font-semibold text-white bg-blue-600
hover:bg-blue-700 disabled:bg-blue-300 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Salvar Cadastro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default CadastrarOng;
