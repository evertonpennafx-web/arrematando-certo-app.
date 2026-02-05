import { Routes, Route } from 'react-router-dom';
import WelcomeMessage from './components/WelcomeMessage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<WelcomeMessage />} />
    </Routes>
  );
}

