
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";

import HomePage from "./pages/HomePage";
import SubmissionPage from "./pages/SubmissionPage";
import EnviarEditalPage from "./pages/EnviarEditalPage";
import SuccessPage from "./pages/SuccessPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import FreeTastingPage from "./pages/FreeTastingPage";
import ConsultationLandingPage from "./pages/ConsultationLandingPage";
import FormSuccessPage from "./pages/FormSuccessPage";
import RelatorioPage from "./pages/RelatorioPage";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/enviar-edital" element={<EnviarEditalPage />} />
        <Route path="/submission" element={<SubmissionPage />} />
        <Route path="/degustacao-gratuita" element={<FreeTastingPage />} />
        <Route path="/consultoria" element={<ConsultationLandingPage />} />
        <Route path="/relatorio" element={<RelatorioPage />} />
        <Route path="/sucesso" element={<SuccessPage />} />
        <Route path="/sucesso-formulario" element={<FormSuccessPage />} />
        <Route path="/pagamento-sucesso" element={<PaymentSuccess />} />
        <Route path="/pagamento-cancelado" element={<PaymentCancel />} />
      </Routes>
    </Router>
  );
}

export default App;
