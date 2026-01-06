import { useState } from 'react';
import { HomePage, SettingsPage } from './pages';

type Page = 'home' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  return currentPage === 'home' ? (
    <HomePage onNavigateToSettings={() => setCurrentPage('settings')} />
  ) : (
    <SettingsPage onBack={() => setCurrentPage('home')} />
  );
}

export default App;
