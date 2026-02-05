import { Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import FreeTastingPage from './pages/FreeTastingPage';
import ConsultationPage from './pages/ConsultationPage';
import ConsultationLandingPage from './pages/ConsultationLandingPage';
import EnviarEditalPage from './pages/EnviarEditalPage';
import FormSuccessPage from './pages/FormSuccessPage';
import SubmissionPage from './pages/SubmissionPage';
import RelatorioPage from './pages/RelatorioPage';
import SuccessPage from './pages/SuccessPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/degustacao-gratuita" element={<FreeTastingPage />} />
      <Route path="/consultoria" element={<ConsultationPage />} />
      <Route path="/consultoria/landing" element={<ConsultationLandingPage />} />
      <Route path="/enviar-edital" element={<EnviarEditalPage />} />
      <Route path="/form-sucesso" element={<FormSuccessPage />} />
      <Route path="/submission" element={<SubmissionPage />} />
      <Route path="/relatorio" element={<RelatorioPage />} />
      <Route path="/sucesso" element={<SuccessPage />} />
      <Route path="/pagamento/sucesso" element={<PaymentSuccess />} />
      <Route path="/pagamento/cancelado" element={<PaymentCancel />} />

      {/* fallback */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}
