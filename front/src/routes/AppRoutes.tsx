import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import Aquisicoes from "../pages/aquisicoes/Aquisicoes";
import OrcamentoRFX from "../pages/aquisicoes/OrcamentoRFX";
import StatusRFX from "../pages/aquisicoes/StatusRFX";
import AquisicoesVG from "../pages/aquisicoes/VisaoGeral";
import BuscarContratos from "../pages/contratos/BuscarContratos";
import Compromissos from "../pages/contratos/Compromissos";
import Contratos from "../pages/contratos/Contratos";
import OSS2Cloud from "../pages/contratos/OSS2Cloud";
import ContratosVG from "../pages/contratos/VisaoGeral";
import Dashboard from "../pages/Dashboard";
import Aprovacoes from "../pages/dashboard/Aprovacoes";
import EditarCompromissos from "../pages/dashboard/EditarCompromissos";
import EditarMasterPivot from "../pages/dashboard/EditarMasterPivot";
import EditorForum from "../pages/dashboard/EditorForum";
import EditorNewsletter from "../pages/dashboard/EditorNewsletter";
import EditorNoticia from "../pages/dashboard/EditorNoticia";
import ForumAdmin from "../pages/dashboard/Forum";
import Inscritos from "../pages/dashboard/Inscritos";
import Newsletters from "../pages/dashboard/Newsletters";
import Noticias from "../pages/dashboard/Noticias";
import Usuarios from "../pages/dashboard/Usuarios";
import Demandas from "../pages/demandas/Demandas";
import DemandasVG from "../pages/demandas/VisaoGeral";
import EmConstrucao from "../pages/EmConstrucao";
import ForgotPassword from "../pages/ForgotPassword";
import Forum from "../pages/forum/Forum";
import ForumPost from "../pages/forum/ForumPost";
import Home from "../pages/Home";
import Inventario from "../pages/inventario/Inventario";
import Login from "../pages/Login";
import News from "../pages/News";
import Artigo from "../pages/news/Artigo";
import Newsletter from "../pages/Newsletter";
import MasterPivot from "../pages/orcamento/MasterPivot";
import Orcamento from "../pages/orcamento/Orcamento";
import RealizacaoNFV from "../pages/orcamento/RealizacaoNFV";
import OrcamentoVG from "../pages/orcamento/VisaoGeral";
import ProjetosDetalhamento from "../pages/projetos/Detalhamento";
import Projetos from "../pages/projetos/Projetos";
import ReusoHardware from "../pages/projetos/ReusoHardware";
import ProjetosVG from "../pages/projetos/VisaoGeral";
import Register from "../pages/Register";
import ResetPassword from "../pages/ResetPassword";
import { getPlaceholderRoutes } from "./placeholderRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute roles={["admin", "moderador"]} />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route index element={<Dashboard />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="aprovacoes" element={<Aprovacoes />} />
            <Route path="inscritos" element={<Inscritos />} />
            <Route path="forum" element={<ForumAdmin />} />
            <Route path="forum/novo" element={<EditorForum />} />
            <Route path="forum/:id" element={<EditorForum />} />
          </Route>

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

      <Route element={<ProtectedRoute />}>
        <Route path="/orcamento" element={<Orcamento />} />
        <Route path="/orcamento/visao-geral" element={<OrcamentoVG />} />
        <Route path="/orcamento/realizacao-nfv" element={<RealizacaoNFV />} />
        <Route path="/orcamento/master-pivot" element={<MasterPivot />} />
      </Route>

      <Route path="/aquisicoes" element={<Aquisicoes />} />
      <Route path="/aquisicoes/visao-geral" element={<AquisicoesVG />} />
      <Route path="/aquisicoes/status-rfx" element={<StatusRFX />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/aquisicoes/orcamento-rfx" element={<OrcamentoRFX />} />
      </Route>

      <Route path="/projetos" element={<Projetos />} />
      <Route path="/projetos/visao-geral" element={<ProjetosVG />} />
      <Route path="/projetos/detalhamento" element={<ProjetosDetalhamento />} />
      <Route path="/projetos/reuso_hardware" element={<ReusoHardware />} />

      <Route path="/demandas" element={<Demandas />} />
      <Route path="/demandas/visao-geral" element={<DemandasVG />} />

      <Route path="/inventario" element={<Inventario />} />
      <Route path="/inventario/:tipo" element={<Inventario />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/contratos" element={<Contratos />} />
        <Route path="/contratos/visao-geral" element={<ContratosVG />} />
        <Route path="/contratos/oss2cloud" element={<OSS2Cloud />} />
        <Route path="/contratos/buscar-contratos" element={<BuscarContratos />} />
        <Route path="/contratos/compromissos" element={<Compromissos />} />
      </Route>

      <Route path="/sobre" element={<EmConstrucao />} />
      <Route path="/news" element={<News />} />
      <Route path="/newsletter" element={<Newsletter />} />
      <Route path="/news/:slug" element={<Artigo />} />
      <Route path="/forum" element={<Forum />} />
      <Route path="/forum/:slug" element={<ForumPost />} />

      {getPlaceholderRoutes().map(path => (
        <Route key={path} path={path} element={<EmConstrucao />} />
      ))}

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
