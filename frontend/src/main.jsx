import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import Home from "./pages/home";
import Login from "./pages/login";

import CadastrarUsuario from "./pages/usuario/cadastrarUsuario";
import ListarUsuarios from "./pages/usuario/ListarUsuarios";
import EditarUsuario from "./pages/usuario/editarUsuario";

import DetalhesOng from "./pages/ongs/detalhesOng";
import CadastrarOng from "./pages/ongs/cadastrarOng";
import ListarOngs from "./pages/ongs/ListarOngs";
import EditarOng from "./pages/ongs/editarOng";

import GerenciarImagens from "./pages/gerenciarImagens";

import DetalhesCampanha from "./pages/campanhas/detalhesCampanha";
import ListarCampanhas from "./pages/campanhas/listarCampanhas";
import CadastrarCampanha from "./pages/campanhas/cadastrarCampanha";
import EditarCampanha from "./pages/campanhas/editarCampanha";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route path="/cadastrar-ong" element={<CadastrarOng />} />
        <Route path="/ongs" element={<ListarOngs />} />
        <Route path="/editar-ong/:id" element={<EditarOng />} />
        <Route path="/ongs/:id_ong" element={<DetalhesOng />} />

        <Route path="/cadastrar-usuario" element={<CadastrarUsuario />} />
        <Route path="/usuarios" element={<ListarUsuarios />} />
        <Route path="/editar-usuario/:id" element={<EditarUsuario />} />

        <Route path="/ongs/:id_ong/campanhas" element={<ListarCampanhas />} />
        <Route
          path="/ongs/:id_ong/campanhas/cadastrar"
          element={<CadastrarCampanha />}
        />
        <Route
          path="/campanhas/editar/:id_campanha"
          element={<EditarCampanha />}
        />
        <Route path="/campanhas/:id_campanha" element={<DetalhesCampanha />} />
        <Route path="/ongs/:id_ong/imagens" element={<GerenciarImagens />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
