import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import LandingPage from './components/pages/LandingPage';
import GamesDashboard from './components/pages/Games/GamesDashboard';
import GamesList from './components/pages/Games/GamesList';
import GameDetail from './components/pages/Games/GameDetail';
import GameAnalytics from './components/pages/Analytics/GameAnalytics';
import FastTagging from './components/features/tagging/FastTagging';
import TeamsList from './components/pages/Teams/TeamsList';
import TeamDetail from './components/pages/Teams/TeamDetail';
import PlayersList from './components/pages/Players/PlayersList';
import PlayerDetail from './components/pages/Players/PlayerDetail';
import AuthPage from './components/pages/Auth/AuthPage';
import ProtectedRoute from './components/common/ProtectedRoute';
// import TagsList from './components/TagsList'; // (create this next!)
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            <ProtectedRoute requireAuth={false}>
              <LandingPage />
            </ProtectedRoute>
          } />
          <Route path="/auth" element={
            <ProtectedRoute requireAuth={false}>
              <AuthPage />
            </ProtectedRoute>
          } />
          
          {/* Protected routes - require authentication */}
          <Route path="/dashboard" element={
            <ProtectedRoute requireAuth={true}>
              <>
                <Navbar />
                <GamesDashboard />
              </>
            </ProtectedRoute>
          } />
          <Route path="/games" element={
            <ProtectedRoute requireAuth={true}>
              <>
                <Navbar />
                <GamesList />
              </>
            </ProtectedRoute>
          } />
          <Route path="/games/:gameId" element={
            <ProtectedRoute requireAuth={true}>
              <>
                <Navbar />
                <GameDetail />
              </>
            </ProtectedRoute>
          } />
          <Route path="/games/:gameId/tag" element={
            <ProtectedRoute requireAuth={true}>
              <>
                <Navbar />
                <FastTagging />
              </>
            </ProtectedRoute>
          } />
          <Route path="/games/:gameId/analytics" element={
            <ProtectedRoute requireAuth={true}>
              <>
                <Navbar />
                <GameAnalytics />
              </>
            </ProtectedRoute>
          } />
          <Route path="/teams" element={
            <ProtectedRoute requireAuth={true}>
              <>
                <Navbar />
                <TeamsList />
              </>
            </ProtectedRoute>
          } />
          <Route path="/teams/:teamId" element={
            <ProtectedRoute requireAuth={true}>
              <>
                <Navbar />
                <TeamDetail />
              </>
            </ProtectedRoute>
          } />
          <Route path="/players" element={
            <ProtectedRoute requireAuth={true}>
              <>
                <Navbar />
                <PlayersList />
              </>
            </ProtectedRoute>
          } />
          <Route path="/players/:playerId" element={
            <ProtectedRoute requireAuth={true}>
              <>
                <Navbar />
                <PlayerDetail />
              </>
            </ProtectedRoute>
          } />
          {/* <Route path="/tags" element={<TagsList />} /> */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
