// Base do projeto React com Vite
import { StrictMode } from "react"; // Importa o StrictMode do React para ajudar a identificar problemas potenciais no aplicativo
import { createRoot } from "react-dom/client"; // Importa a função createRoot do ReactDOM para criar a raiz do aplicativo React
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Importa os componentes do React Router para gerenciar a navegação entre páginas

// Importa os estilos globais do aplicativo
import "./index.css";
import Home from "./pages/home";
import CadastrarOng from "./pages/cadastrarOng";
import CadastrarUsuario from "./pages/cadastrarUsuario";
import ListarOngs from "./pages/ListarOngs";
import EditarOng from "./pages/editarOng";
import { Edit } from "lucide-react";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cadastrar-ong" element={<CadastrarOng />} />
        <Route path="/cadastrar-usuario" element={<CadastrarUsuario />} />
        <Route path="/ongs" element={<ListarOngs />} />
        <Route path="/editar-ong/:id" element={<EditarOng />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
