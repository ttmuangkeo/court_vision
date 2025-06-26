import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import GamesDashboard from './components/pages/GamesDashboard';
import TeamsList from './components/pages/TeamsList';
import TeamDetail from './components/pages/TeamDetail';
import PlayersList from './components/pages/PlayersList';
import GamesList from './components/pages/GamesList';
// import TagsList from './components/TagsList'; // (create this next!)
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<GamesDashboard />} />
          <Route path="/teams" element={<TeamsList />} />
          <Route path="/teams/:teamId" element={<TeamDetail />} />
          <Route path="/players" element={<PlayersList />} />
          <Route path="/games" element={<GamesList />} />
          {/* <Route path="/tags" element={<TagsList />} /> */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
