import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import EnviarEditalPage from "./pages/EnviarEditalPage";
import SubmissionPage from "./pages/SubmissionPage";
import RelatorioPage from "./pages/RelatorioPage";
import SuccessPage from "./pages/SuccessPage";
import FormSuccessPage from "./pages/FormSuccessPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import ConsultationPage from "./pages/ConsultationPage";
import ConsultationLandingPage from "./pages/ConsultationLandingPage";
import FreeTastingPage from "./pages/FreeTastingPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/enviar-edital" element={<EnviarEditalPage />} />
      <Route path="/submission" element={<SubmissionPage />} />
      <Route path="/relatorio" element={<RelatorioPage />} />
      <Route path="/sucesso" element={<SuccessPage />} />
      <Route path="/form-sucesso" element={<FormSuccessPage />} />
      <Route path="/pagamento-sucesso" element={<PaymentSuccess />} />
      <Route path="/pagamento-cancelado" element={<PaymentCancel />} />
      <Route path="/consultoria" element={<ConsultationPage />} />
      <Route path="/consultoria-inicio" element={<ConsultationLandingPage />} />
      <Route path="/free" element={<FreeTastingPage />} />

      {/* fallback */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}
