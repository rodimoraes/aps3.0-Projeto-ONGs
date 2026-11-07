import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate();
  // Recupera dados do usuário autenticado do localStorage
  const usuarioLogado = JSON.parse(localStorage.getItem("usuario") || "null");
  const handleLogout = () => {
    localStorage.removeItem("usuario");
    alert("Você saiu do sistema.");
    navigate("/login");
  };
  const toggleMenu = () => {
    setMenuAberto((prev) => !prev);
  };
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-2xs">
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center
justify-between"
      >
        {/* 1. LOGO DA PLATAFORMA (Extremidade Esquerda) */}
        <div className="flex items-center shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-lg text-slate-800
hover:text-blue-600 transition-colors"
          >
            <img
              src="/EncontreONG.png"
              alt="Logo Encontre ONG"
              className="h-8 sm:h-7 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>
        </div>
        {/* 2. NAVEGAÇÃO DESKTOP (Centralizada e com espaçamento ampliado entre os botões)
         */}
        <nav className="hidden md:flex items-center justify-center gap-12 text-sm fontsemibold text-slate-600">
          <Link
            to="/"
            className="hover:text-blue-600 transition-colors px-2 py-1"
          >
            Início
          </Link>
          <Link
            to="/explorar-ongs"
            className="hover:text-blue-600 transition-colors px-2 py-1"
          >
            ONGs
          </Link>
          <Link
            to="/cadastrar-ong"
            className="hover:text-blue-600 transition-colors px-2
py-1"
          >
            Cadastrar ONG
          </Link>
        </nav>
        {/* 3. AÇÕES DE USUÁRIO / LOGIN (Extremidade Direita no Desktop) */}
        <div className="hidden md:flex items-center justify-end gap-4 shrink-0">
          {usuarioLogado ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap1.5 bg-slate-100 px-3 py-1.5 rounded-xl">
                <User className="w-4 h-4 text-blue-600" />
                {usuarioLogado.nome || "Usuário"}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs fontsemibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl
transition-all cursor-pointer"
                title="Sair da conta"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold textwhite bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-2xs"
            >
              <User className="w-4 h-4" />
              <span>Entrar</span>
            </Link>
          )}
        </div>
        {/* 4. BOTÃO HAMBÚRGUER (Apenas visível em telas mobile / menores que md) */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100
rounded-xl transition-colors cursor-pointer"
          aria-label="Abrir menu"
        >
          {menuAberto ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>
      {/* 5. MENU DROPDOWN MOBILE (Aparece apenas quando menuAberto for true no mobile) */}
      {menuAberto && (
        <div
          className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3
shadow-md animate-in slide-in-from-top duration-200"
        >
          <nav className="flex flex-col space-y-2 text-xs font-semibold text-slate-700">
            <Link
              to="/"
              onClick={() => setMenuAberto(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Início
            </Link>
            <Link
              to="/explorar-ongs"
              onClick={() => setMenuAberto(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              ONGs
            </Link>
            <Link
              to="/cadastrar-ong"
              onClick={() => setMenuAberto(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cadastrar ONG
            </Link>
          </nav>
          <div className="pt-3 border-t border-slate-100">
            {usuarioLogado ? (
              <div
                className="flex items-center justify-between px-3 py-2 bg-slate-50
rounded-xl"
              >
                <span
                  className="text-xs font-semibold text-slate-700 flex items-center
gap-1.5"
                >
                  <User className="w-4 h-4 text-blue-600" />
                  {usuarioLogado.nome || "Usuário"}
                </span>
                <button
                  onClick={() => {
                    setMenuAberto(false);
                    handleLogout();
                  }}
                  className="text-xs font-semibold text-red-600 hover:underline flex itemscenter gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuAberto(false)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs
font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all"
              >
                <User className="w-4 h-4" />
                <span>Entrar / Cadastrar</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
export default Header;
