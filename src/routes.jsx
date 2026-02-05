import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Analisar from "./pages/Analisar";
import Resultado from "./pages/Resultado";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/analisar" element={<Analisar />} />
      <Route path="/resultado" element={<Resultado />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
