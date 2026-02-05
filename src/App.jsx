import { BrowserRouter } from 'react-router-dom';

export default function App() {
  return (
    <BrowserRouter>
      <div
        style={{
          background: '#000',
          color: '#00ff88',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          fontFamily: 'sans-serif',
        }}
      >
        ✅ APP CARREGOU COM SUCESSO
      </div>
    </BrowserRouter>
  );
}
