import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/Login";
import VisaoGeral from "./pages/orcamento/VisaoGeral";
import RealizacaoNFV from "./pages/orcamento/RealizacaoNFV";
import Orcamento from "./pages/orcamento/Orcamento";
import MasterPivot from "./pages/orcamento/MasterPivot";
import Aquisicoes from "./pages/aquisicoes/Aquisicoes";
import Projetos from "./pages/projetos/Projetos";
import ProjetosVG from "./pages/projetos/VisaoGeral";
import ProjetosDetalhamento from "./pages/projetos/Detalhamento";
import Demandas from "./pages/demandas/Demandas";
import DemandasVG from "./pages/demandas/VisaoGeral";
import Contratos from "./pages/contratos/Contratos";
import ContratosVG from "./pages/contratos/VisaoGeral";
import OSS2Cloud from "./pages/contratos/OSS2Cloud";
import BuscarContratos from "./pages/contratos/BuscarContratos";
import Compromissos from "./pages/contratos/Compromissos";
import EditarMasterPivot from "./pages/dashboard/EditarMasterPivot";
import EditarCompromissos from "./pages/dashboard/EditarCompromissos";
import Usuarios from "./pages/dashboard/Usuarios";
import Aprovacoes from "./pages/dashboard/Aprovacoes";
import Newsletters from "./pages/dashboard/Newsletters";
import EditorNewsletter from "./pages/dashboard/EditorNewsletter";
import Inscritos from "./pages/dashboard/Inscritos";
import DashboardLayout from "./components/DashboardLayout";
import AquisVG from "./pages/aquisicoes/VisaoGeral";
import StatusRFX from "./pages/aquisicoes/StatusRFX";
import OrcamentoRFX from "./pages/aquisicoes/OrcamentoRFX";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
// import Sobre from "./pages/Sobre";
import News from "./pages/News";
import Newsletter from "./pages/Newsletter";
import Artigo from "./pages/news/Artigo";
import Forum from "./pages/forum/Forum";
import ForumPost from "./pages/forum/ForumPost";
import Noticias from "./pages/dashboard/Noticias";
import EditorNoticia from "./pages/dashboard/EditorNoticia";
import ForumAdmin from "./pages/dashboard/Forum";
import EditorForum from "./pages/dashboard/EditorForum";
import EmConstrucao from "./pages/EmConstrucao";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { navLinks } from "./config/navLinks";

function placeholderRoutes() {
  return navLinks.flatMap(link => {
    const routes = [];
    if (!link.external) routes.push(link.to);
    link.children?.forEach(child => {
      if (!child.external) routes.push(child.to);
    });
    return routes;
  });
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    const visited: string[] = JSON.parse(sessionStorage.getItem('_pages') || '[]');
    if (!visited.includes(location.pathname)) {
      fetch(`${import.meta.env.VITE_API_URL}/auth/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: location.pathname }),
      }).catch(() => {});
      visited.push(location.pathname);
      sessionStorage.setItem('_pages', JSON.stringify(visited));
    }
  }, [location.pathname]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Rotas protegidas — admin e moderador */}
        <Route element={<ProtectedRoute roles={['admin', 'moderador']} />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            {/* Sub-rotas exclusivas de admin */}
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route index element={<Dashboard />} />
              <Route path="usuarios" element={<Usuarios />} />
              <Route path="aprovacoes" element={<Aprovacoes />} />
              <Route path="inscritos" element={<Inscritos />} />
              <Route path="forum" element={<ForumAdmin />} />
              <Route path="forum/novo" element={<EditorForum />} />
              <Route path="forum/:id" element={<EditorForum />} />
            </Route>
            {/* Sub-rotas acessíveis a admin e moderador */}
            <Route path="editar-master-pivot" element={<EditarMasterPivot />} />
            <Route path="editar-compromissos" element={<EditarCompromissos />} />
            <Route path="newsletter" element={<Newsletters />} />
            <Route path="newsletter/nova" element={<EditorNewsletter />} />
            <Route path="newsletter/:id" element={<EditorNewsletter />} />
            <Route path="noticias" element={<Noticias />} />
            <Route path="noticias/nova" element={<EditorNoticia />} />
            <Route path="noticias/:id" element={<EditorNoticia />} />
          </Route>
        </Route>

        {/* Rotas orcamento protegidas — qualquer usuário logado */}
        <Route element={<ProtectedRoute />}>
          <Route path="/orcamento" element={<Orcamento />} />
          <Route path="/orcamento/visao-geral" element={<VisaoGeral />} />
          <Route path="/orcamento/realizacao-nfv" element={<RealizacaoNFV />} />
          <Route path="/orcamento/master-pivot" element={<MasterPivot />} />
        </Route>

        <Route path="/aquisicoes" element={<Aquisicoes />} />
        <Route path="/aquisicoes/visao-geral" element={<AquisVG />} />
        <Route path="/aquisicoes/status-rfx" element={<StatusRFX />} />
        {/* Rotas aquisicoes protegidas — qualquer usuário logado */}
        <Route element={<ProtectedRoute />}>
          <Route path="/aquisicoes/orcamento-rfx" element={<OrcamentoRFX />} />
        </Route>
       
        {/* Rotas projetos */}
        <Route path="/projetos" element={<Projetos />} />
        <Route path="/projetos/visao-geral" element={<ProjetosVG />} />
        <Route path="/projetos/detalhamento" element={<ProjetosDetalhamento />} />

        {/* Rotas demandas */}
        <Route path="/demandas" element={<Demandas />} />
        <Route path="/demandas/visao-geral" element={<DemandasVG />} />

        {/* Rotas contratos protegidas — qualquer usuário logado */}
        <Route element={<ProtectedRoute />}>
          <Route path="/contratos" element={<Contratos />} />
          <Route path="/contratos/visao-geral" element={<ContratosVG />} />
          <Route path="/contratos/oss2cloud" element={<OSS2Cloud />} />
          <Route path="/contratos/buscar-contratos" element={<BuscarContratos />} />
          <Route path="/contratos/compromissos" element={<Compromissos />} />
        </Route>

        <Route path="/sobre" element={<EmConstrucao />} />

        {/* Rotas News — públicas */}
        <Route path="/news" element={<News />} />
        <Route path="/newsletter" element={<Newsletter />} />
        <Route path="/news/:slug" element={<Artigo />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/:slug" element={<ForumPost />} />

        {placeholderRoutes().map(path => (
          <Route key={path} path={path} element={<EmConstrucao />} />
        ))}

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}
