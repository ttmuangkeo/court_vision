import React, { useState } from 'react';
import TeamsList from './components/TeamsList';
import PlayersList from './components/PlayersList';
import GamesList from './components/GamesList';
// import TagsList from './components/TagsList'; // (create this next!)
import './App.css';

function App() {
  const [view, setView] = useState('teams');

  return (
    <div className="App">
      <h1>Court Vision</h1>
      <nav>
        <button onClick={() => setView('teams')}>Teams</button>
        <button onClick={() => setView('players')}>Players</button>
        <button onClick={() => setView('games')}>Games</button>
        {/* <button onClick={() => setView('tags')}>Tags</button> */}
      </nav>
      {view === 'teams' && <TeamsList />}
      {view === 'players' && <PlayersList />}
      {view === 'games' && <GamesList />}
      {/* {view === 'tags' && <TagsList />} */}
    </div>
  );
}

export default App;
