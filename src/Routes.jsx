// src/Routes.jsx
import { Routes, Route } from "react-router-dom";
import WelcomeMessage from "./components/WelcomeMessage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<WelcomeMessage />} />
      {/* Se quiser, depois você adiciona outras rotas aqui */}
    </Routes>
  );
}
