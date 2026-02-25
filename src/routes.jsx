import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";

import Analisar from "./pages/Analisar";
import Resultado from "./pages/Resultado";

import FreeTastingPage from "./pages/FreeTastingPage";
import ConsultationPage from "./pages/ConsultationPage";
import EnviarEditalPage from "./pages/EnviarEditalPage";
import SubmissionPage from "./pages/SubmissionPage";

// ✅ IMPORTA O RELATÓRIO
import RelatorioPage from "./pages/RelatorioPage";

// ✅ IMPORTA PÁGINAS DO CLUB (NOVO)
import Club from "./pages/Club";
import ClubOportunidades from "./pages/ClubOportunidades";
import ClubImoveis from "./pages/ClubImoveis";

export default function AppRoutes() {
  return (
    <Routes>
      {/* HOME BONITA */}
      <Route path="/" element={<HomePage />} />

      {/* ROTAS DOS BOTÕES */}
      <Route path="/degustacao-gratuita" element={<FreeTastingPage />} />
      <Route path="/consultoria" element={<ConsultationPage />} />
      <Route path="/enviar-edital" element={<EnviarEditalPage />} />

      {/* PLANOS (usa query string ?plan=standard|express) */}
      <Route path="/submission" element={<SubmissionPage />} />

      {/* ✅ ROTA DO RELATÓRIO (ERA ISSO QUE TAVA FALTANDO) */}
      <Route path="/relatorio" element={<RelatorioPage />} />

      {/* ✅ ROTAS DO CLUB (NOVO) */}
      <Route path="/club" element={<Club />} />
      <Route path="/club/oportunidades" element={<ClubOportunidades />} />
      <Route path="/club/imoveis" element={<ClubImoveis />} />

      {/* MVP IA */}
      <Route path="/analisar" element={<Analisar />} />
      <Route path="/resultado" element={<Resultado />} />

      {/* FALLBACK */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}
