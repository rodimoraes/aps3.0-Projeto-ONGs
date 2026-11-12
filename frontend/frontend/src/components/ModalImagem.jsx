import { useEffect } from "react";
import { X } from "lucide-react";
function ModalImagem({ imagem, onClose }) {
  if (!imagem) return null;
  // Permite fechar a pré-visualização pressionando a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdropblur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50 flex flex-col items-center p-2"
        onClick={(e) => e.stopPropagation()} // Impede o fechamento ao clicar diretamente na imagem
      >
        {/* Botão de Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white bgslate-800/80 hover:bg-slate-700/80 rounded-full transition-colors cursor-pointer"
          title="Fechar (ESC)"
        >
          <X className="w-5 h-5" />
        </button>
        {/* Imagem Ampliada */}
        <img
          src={typeof imagem === "string" ? imagem : imagem.url}
          alt={imagem.descricao || "Visualização da imagem"}
          className="max-h-[80vh] w-auto object-contain rounded-2xl"
        />
        {/* Legenda/Descrição (se existir) */}
        {imagem.descricao && (
          <div className="w-full text-center py-2 px-4">
            <p className="text-xs text-slate-300 font-medium">
              {imagem.descricao}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
export default ModalImagem;
