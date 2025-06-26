import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import GamesDashboard from './components/pages/GamesDashboard';
import GamesList from './components/pages/GamesList';
import GameDetail from './components/pages/GameDetail';
import GameAnalytics from './components/pages/GameAnalytics';
import FastTagging from './components/tagging/FastTagging';
import TeamsList from './components/pages/TeamsList';
import TeamDetail from './components/pages/TeamDetail';
import PlayersList from './components/pages/PlayersList';
import PlayerDetail from './components/pages/PlayerDetail';
// import TagsList from './components/TagsList'; // (create this next!)
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<GamesDashboard />} />
          <Route path="/games" element={<GamesList />} />
          <Route path="/games/:gameId" element={<GameDetail />} />
          <Route path="/games/:gameId/tag" element={<FastTagging />} />
          <Route path="/games/:gameId/analytics" element={<GameAnalytics />} />
          <Route path="/teams" element={<TeamsList />} />
          <Route path="/teams/:teamId" element={<TeamDetail />} />
          <Route path="/players" element={<PlayersList />} />
          <Route path="/players/:playerId" element={<PlayerDetail />} />
          {/* <Route path="/tags" element={<TagsList />} /> */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
