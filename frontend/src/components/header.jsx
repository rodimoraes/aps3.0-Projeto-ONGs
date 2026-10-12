import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Search, Heart } from "lucide-react";

function Header({ onMenuClick, onSearch }) {
  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (onSearch) onSearch(value);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* LADO ESQUERDO: Botão de Menu*/}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onMenuClick}
            aria-label="Abrir menu"
            className="p-2.5 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo / Nome do Projeto (EncontreONG) */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/EncontreONG.png"
              alt="Logo Encontre ONG"
              className="h-8 sm:h-7 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>
        </div>

        {/* CENTRO: Barra de Pesquisa */}
        <div className="flex-1 max-w-xl mx-auto">
          <div
            className={`relative flex items-center w-full rounded-2xl transition-all duration-300 ${
              isFocused
                ? "bg-white shadow-md ring-2 ring-sky-500/30 border-sky-400"
                : "bg-slate-100/80 hover:bg-slate-100 border-transparent"
            } border`}
          >
            {/* Ícone de Busca */}
            <div className="pl-4 text-slate-400">
              <Search
                className={`w-4 h-4 transition-colors ${isFocused ? "text-sky-500" : ""}`}
              />
            </div>

            {/* Input de Texto */}
            <input
              type="text"
              value={searchValue}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Buscar ONGs, causas ou projetos sociais..."
              className="w-full py-2.5 pl-3 pr-10 text-sm text-slate-800 bg-transparent placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* LADO DIREITO: Botões de doação e cadastro */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/ongs"
            className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-blue-600/20 text-blue-600" />
            <span>Doar</span>
          </Link>

          <Link
            to="/cadastrar-ong"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs hover:shadow-blue-200 transition-all active:scale-95 cursor-pointer"
          >
            Cadastrar ONG
          </Link>

          <Link
            to="/cadastrar-Usuario"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs hover:shadow-blue-200 transition-all active:scale-95 cursor-pointer"
          >
            Cadastrar Usuario
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
