import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Users,
  HeartHandshake,
  Home,
  LogIn,
  LogOut,
  PlusCircle,
  Compass,
} from "lucide-react";

function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = () => {
      const u = localStorage.getItem("usuario");
      setUsuario(u ? JSON.parse(u) : null);
    };
    loadUser();
    window.addEventListener("usuarioAtualizado", loadUser);
    window.addEventListener("storage", loadUser);
    return () => {
      window.removeEventListener("usuarioAtualizado", loadUser);
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
    window.dispatchEvent(new Event("usuarioAtualizado"));
    fecharMenu();
    navigate("/login");
  };

  const toggleMenu = () => setMenuAberto((prev) => !prev);
  const fecharMenu = () => setMenuAberto(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src="/EncontreONG.png"
            alt="Logo Encontre ONG"
            className="h-8 sm:h-7 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        <div className="relative">
          <button
            onClick={toggleMenu}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            aria-label="Abrir menu"
          >
            {menuAberto ? (
              <X className="w-6 h-6 text-slate-700" />
            ) : (
              <Menu className="w-6 h-6 text-slate-700" />
            )}
          </button>

          {menuAberto && (
            <>
              <div className="fixed inset-0 z-40" onClick={fecharMenu} />

              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border border-slate-200 py-2 z-50">
                <p className="px-4 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                  Menu Principal
                </p>

                <Link
                  to="/"
                  onClick={fecharMenu}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <Home className="w-4 h-4 text-slate-500" />
                  <span>Início</span>
                </Link>

                <Link
                  to="/explorar-ongs"
                  onClick={fecharMenu}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <Compass className="w-4 h-4 text-slate-500" />
                  <span>Explorar ONGs</span>
                </Link>

                <Link
                  to="/usuarios"
                  onClick={fecharMenu}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>Usuários</span>
                </Link>

                <Link
                  to="/ongs"
                  onClick={fecharMenu}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                >
                  <HeartHandshake className="w-4 h-4 text-slate-400" />
                  <span>Gerenciar ONGs</span>
                </Link>

                {usuario && !usuario.representante_ong && (
                  <Link
                    to="/cadastrar-ong"
                    onClick={fecharMenu}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-600" />
                    <span>Cadastrar Minha ONG</span>
                  </Link>
                )}

                <div className="border-t border-slate-100 my-1" />

                {usuario ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair ({usuario.nome.split(" ")[0]})</span>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={fecharMenu}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Entrar / Login</span>
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
