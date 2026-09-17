// Base do projeto React com Vite
import { StrictMode } from "react"; // Importa o StrictMode do React para ajudar a identificar problemas potenciais no aplicativo
import { createRoot } from "react-dom/client"; // Importa a função createRoot do ReactDOM para criar a raiz do aplicativo React
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Importa os componentes do React Router para gerenciar a navegação entre páginas

// Importa os estilos globais do aplicativo
import "./index.css";
import Home from "./pages/home";
import CadastrarOng from "./pages/cadastrarOng";
import CadastrarUsuario from "./pages/cadastrarUsuario";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cadastrar-ong" element={<CadastrarOng />} />
        <Route path="/cadastrar-usuario" element={<CadastrarUsuario />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
