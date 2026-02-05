import { BrowserRouter } from 'react-router-dom';
import Routes from './Routes';
import { supabase } from './lib/supabase';

export default function App() {
  if (!supabase) {
    return (
      <div style={{
        background: '#000',
        color: '#f5c542',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px'
      }}>
        ❌ Erro crítico: Supabase não inicializado.<br />
        Verifique as variáveis de ambiente.
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  );
}
