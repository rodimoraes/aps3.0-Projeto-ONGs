import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import Home from "./pages/home";

import CadastrarUsuario from "./pages/usuario/cadastrarUsuario";
import ListarUsuarios from "./pages/usuario/ListarUsuarios";
import EditarUsuario from "./pages/usuario/editarUsuario";

import CadastrarOng from "./pages/cadastrarOng";
import ListarOngs from "./pages/ListarOngs";
import EditarOng from "./pages/editarOng";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/cadastrar-ong" element={<CadastrarOng />} />
        <Route path="/ongs" element={<ListarOngs />} />
        <Route path="/editar-ong/:id" element={<EditarOng />} />

        <Route path="/cadastrar-usuario" element={<CadastrarUsuario />} />
        <Route path="/usuarios" element={<ListarUsuarios />} />
        <Route path="/editar-usuario/:id" element={<EditarUsuario />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
