import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import Analisar from "./pages/Analisar";
import Resultado from "./pages/Resultado";

export default function AppRoutes() {
  return (
    <Routes>
      {/* HOME BONITA (com planos, depoimentos etc.) */}
      <Route path="/" element={<HomePage />} />

      {/* MVP IA */}
      <Route path="/analisar" element={<Analisar />} />
      <Route path="/resultado" element={<Resultado />} />

      {/* fallback */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}
