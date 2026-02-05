import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import Analisar from "./pages/Analisar";
import Resultado from "./pages/Resultado";

export default function AppRoutes() {
  return (
    <Routes>
      {/* HOME PRINCIPAL (BONITA) */}
      <Route path="/" element={<HomePage />} />

      {/* MVP */}
      <Route path="/analisar" element={<Analisar />} />
      <Route path="/resultado" element={<Resultado />} />

      {/* fallback */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}
