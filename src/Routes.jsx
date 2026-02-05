import { Routes, Route } from "react-router-dom";

function Home() {
  return (
    <div style={{ padding: 24, color: "#fff" }}>
      HOME ARREMATANDO CERTO ✅
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
