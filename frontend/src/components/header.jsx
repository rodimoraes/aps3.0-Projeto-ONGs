import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Search,
  Building2,
  UserCog,
  Home,
} from "lucide-react";

function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(() =>
    JSON.parse(localStorage.getItem("usuario") || "null"),
  );
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Sincroniza com mudanças no localStorage (login/logout/edição de perfil)
  useEffect(() => {
    const handleUpdate = () => {
      setUsuarioLogado(JSON.parse(localStorage.getItem("usuario") || "null"));
    };
    window.addEventListener("usuarioAtualizado", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("usuarioAtualizado", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownAberto(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    setUsuarioLogado(null);
    setDropdownAberto(false);
    setMenuAberto(false);
    window.dispatchEvent(new Event("usuarioAtualizado"));
    alert("Você saiu do sistema.");
    navigate("/login");
  };

  const toggleMenu = () => setMenuAberto((prev) => !prev);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* LOGO */}
        <div className="flex items-center shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-lg text-slate-800 hover:text-blue-600 transition-colors"
          >
            <img
              src="/EncontreONG.png"
              alt="Logo Encontre ONG"
              className="h-8 sm:h-7 w-auto object-contain"
            />
          </Link>
        </div>

        {/* NAVEGAÇÃO DESKTOP */}
        <nav className="hidden md:flex items-center justify-center gap-8 text-sm font-semibold text-slate-600">
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
            Explorar ONGs
          </Link>
        </nav>

        {/* AÇÕES DE USUÁRIO DESKTOP */}
        <div className="hidden md:flex items-center justify-end gap-4 shrink-0">
          {usuarioLogado ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownAberto((p) => !p)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {usuarioLogado.nome?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="max-w-[120px] truncate">
                  {usuarioLogado.nome || "Usuário"}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    dropdownAberto ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownAberto && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">
                      Conectado como
                    </p>
                    <p className="text-xs font-semibold text-slate-700 truncate">
                      {usuarioLogado.email || usuarioLogado.nome}
                    </p>
                  </div>

                  <Link
                    to="/"
                    onClick={() => setDropdownAberto(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Home className="w-4 h-4 text-slate-500" />
                    Início
                  </Link>
                  <Link
                    to="/explorar-ongs"
                    onClick={() => setDropdownAberto(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Search className="w-4 h-4 text-slate-500" />
                    Explorar ONGs
                  </Link>
                  <Link
                    to="/ongs"
                    onClick={() => setDropdownAberto(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Building2 className="w-4 h-4 text-slate-500" />
                    Gerenciar Minhas ONGs
                  </Link>
                  <Link
                    to="/perfil"
                    onClick={() => setDropdownAberto(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <UserCog className="w-4 h-4 text-slate-500" />
                    Meu Perfil
                  </Link>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair da conta
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-2xs"
            >
              <User className="w-4 h-4" />
              <span>Entrar</span>
            </Link>
          )}
        </div>

        {/* BOTÃO HAMBÚRGUER MOBILE */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Abrir menu"
        >
          {menuAberto ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* MENU MOBILE */}
      {menuAberto && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3 shadow-md">
          <nav className="flex flex-col space-y-2 text-xs font-semibold text-slate-700">
            <Link
              to="/"
              onClick={() => setMenuAberto(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <Home className="w-4 h-4 text-slate-500" />
              Início
            </Link>
            <Link
              to="/explorar-ongs"
              onClick={() => setMenuAberto(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-slate-500" />
              Explorar ONGs
            </Link>
            {usuarioLogado && (
              <>
                <Link
                  to="/ongs"
                  onClick={() => setMenuAberto(false)}
                  className="px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-slate-500" />
                  Gerenciar Minhas ONGs
                </Link>
                <Link
                  to="/perfil"
                  onClick={() => setMenuAberto(false)}
                  className="px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <UserCog className="w-4 h-4 text-slate-500" />
                  Meu Perfil
                </Link>
              </>
            )}
          </nav>
          <div className="pt-3 border-t border-slate-100">
            {usuarioLogado ? (
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-600" />
                  {usuarioLogado.nome || "Usuário"}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuAberto(false)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all"
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
