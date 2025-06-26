import React, { useState } from 'react';
import Navbar from './components/layout/Navbar';
import GamesDashboard from './components/pages/GamesDashboard';
import TeamsList from './components/pages/TeamsList';
import PlayersList from './components/pages/PlayersList';
import GamesList from './components/pages/GamesList';
// import TagsList from './components/TagsList'; // (create this next!)
import './App.css';

function App() {
  const [view, setView] = useState('dashboard');

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const renderCurrentView = () => {
    switch (view) {
      case 'dashboard':
        return <GamesDashboard />;
      case 'teams':
        return <TeamsList />;
      case 'players':
        return <PlayersList />;
      case 'games':
        return <GamesList />;
      default:
        return <GamesDashboard />;
    }
  };

  return (
    <div className="App">
      <Navbar currentView={view} onViewChange={handleViewChange} />
      {renderCurrentView()}
      {/* {view === 'tags' && <TagsList />} */}
    </div>
  );
}

export default App;
