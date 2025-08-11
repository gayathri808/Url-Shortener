import { useState } from 'react';
import UrlShortener from './components/UrlShortener';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('shortener');

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1 className="title">URL Shortener</h1>
          <nav className="nav">
            <button 
              className={`nav-button ${currentView === 'shortener' ? 'active' : ''}`}
              onClick={() => setCurrentView('shortener')}
            >
              Shorten URL
            </button>
            <button 
              className={`nav-button ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => setCurrentView('admin')}
            >
              Admin Panel
            </button>
          </nav>
        </header>

        <main className="main">
          {currentView === 'shortener' && <UrlShortener />}
          {currentView === 'admin' && <AdminPanel />}
        </main>
      </div>
    </div>
  );
}

export default App;