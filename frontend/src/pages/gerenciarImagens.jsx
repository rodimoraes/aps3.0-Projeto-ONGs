import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Image as ImageIcon,
  Plus,
  Trash2,
  Link as LinkIcon,
} from "lucide-react";
import Header from "../components/header.jsx"

function GerenciarImagens() {
  const { id_ong } = useParams();
  const [ong, setOng] = useState(null);
  const [imagens, setImagens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formulário para nova imagem
  const [novaImagem, setNovaImagem] = useState({
    url: "",
    descricao: "",
  });

  // Carrega a ONG e as imagens associadas
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Busca ONG
        const resOng = await fetch(`http://127.0.0.1:8000/ongs/${id_ong}`);
        if (resOng.ok) {
          const dataOng = await resOng.json();
          setOng(dataOng);
        }

        // Busca Imagens
        const resImagens = await fetch(
          `http://127.0.0.1:8000/imagens/ong/${id_ong}`
        );
        if (resImagens.ok) {
          const dataImagens = await resImagens.json();
          setImagens(dataImagens);
        }
      } catch (error) {
        console.error("Erro ao carregar imagens:", error);
        alert("Erro ao conectar com o servidor.");
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [id_ong]);

  // Cadastra nova imagem
  const handleCadastrar = async (e) => {
    e.preventDefault();

    if (!novaImagem.url || !novaImagem.descricao) {
      alert("Por favor, preencha a URL e a descrição.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/imagens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_ong: Number(id_ong),
          id_campanha: null,
          url: novaImagem.url,
          descricao: novaImagem.descricao,
        }),
      });

      if (response.ok) {
        alert("Imagem adicionada com sucesso!");

        // Recarrega a lista de imagens
        const res = await fetch(`http://127.0.0.1:8000/imagens/ong/${id_ong}`);
        if (res.ok) {
          const data = await res.json();
          setImagens(data);
        }

        setNovaImagem({ url: "", descricao: "" });
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.detail}`);
      }
    } catch (error) {
      console.error("Erro ao cadastrar imagem:", error);
      alert("Não foi possível conectar ao servidor.");
    }
  };

  // Exclui uma imagem
  const handleDelete = async (id_img) => {
    if (!window.confirm("Deseja realmente remover esta imagem?")) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/imagens/${id_img}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Imagem removida!");
        setImagens((prev) => prev.filter((img) => img.id_img !== id_img));
      } else {
        alert("Erro ao remover imagem.");
      }
    } catch (error) {
      console.error("Erro ao deletar imagem:", error);
      alert("Erro de conexão com o servidor.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium">Carregando galeria...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-0">
      <Header/>
      <div className="max-w-4xl mx-auto py-5">
        {/* Navegação */}
        <Link
          to="/ongs"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-700 font-medium text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Lista de ONGs</span>
        </Link>

        {/* Cabeçalho */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">
            Galeria de Fotos
          </span>
          <h1 className="text-2xl font-bold text-slate-800 mt-1">
            {ong ? ong.nome : `ONG #${id_ong}`}
          </h1>
        </div>

        {/* Formulário para Adicionar Imagem */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-purple-600" />
            Adicionar Nova Imagem
          </h2>

          <form onSubmit={handleCadastrar} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL da Imagem <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://exemplo.com/foto.jpg"
                  value={novaImagem.url}
                  onChange={(e) =>
                    setNovaImagem({ ...novaImagem, url: e.target.value })
                  }
                  required
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                />
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descrição da Foto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Foto da sede, Ação social de Natal..."
                value={novaImagem.descricao}
                onChange={(e) =>
                  setNovaImagem({ ...novaImagem, descricao: e.target.value })
                }
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Salvar Foto na Galeria
            </button>
          </form>
        </div>

        {/* Grid de Fotos */}
        {imagens.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-xs">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">
              Nenhuma imagem cadastrada para esta ONG ainda.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {imagens.map((img) => (
              <div
                key={img.id_img}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={img.url}
                    alt={img.descricao}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/400x300?text=Imagem+Indispon%C3%ADvel";
                    }}
                  />
                </div>

                <div className="p-4 flex items-center justify-between gap-2 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-700 line-clamp-2">
                    {img.descricao}
                  </p>
                  <button
                    onClick={() => handleDelete(img.id_img)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Excluir imagem"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GerenciarImagens;