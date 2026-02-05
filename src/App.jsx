import { HashRouter } from "react-router-dom";
import Routes from "./routes";
import { supabase } from "./lib/supabase";

export default function App() {
  // Se o Supabase NÃO estiver inicializado, mostra um aviso claro (não tela preta)
  if (!supabase) {
    return (
      <div
        style={{
          background: "#000",
          color: "#f5c542",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          padding: "24px",
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        ❌ Erro crítico: Supabase não inicializado.
        <br />
        Verifique as variáveis de ambiente.
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes />
    </HashRouter>
  );
}
