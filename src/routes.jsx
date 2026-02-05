import { Routes, Route } from "react-router-dom";

function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "#111", color: "#fff", padding: 24 }}>
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
