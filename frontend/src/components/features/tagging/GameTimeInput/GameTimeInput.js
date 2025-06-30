import React, { useState, useEffect } from 'react';
import './GameTimeInput.css';

function GameTimeInput({ gameTime, setGameTime, currentQuarter, setCurrentQuarter, onTimeChange }) {
  const [lastPlayTime, setLastPlayTime] = useState(null);
  const [autoIncrement, setAutoIncrement] = useState(true);
  const [timeMode, setTimeMode] = useState('auto'); // 'auto', 'manual', 'preset'

  // Smart time presets based on quarter and game situation
  const getSmartPresets = () => {
    const basePresets = [
      { label: 'Start', value: '12:00', icon: '🚀', shortcut: '1' },
      { label: 'Early', value: '10:00', icon: '⏰', shortcut: '2' },
      { label: 'Middle', value: '6:00', icon: '🕐', shortcut: '3' },
      { label: 'Late', value: '2:00', icon: '⏳', shortcut: '4' },
      { label: 'End', value: '0:30', icon: '🏁', shortcut: '5' }
    ];

    // Add quarter-specific presets
    if (currentQuarter === 4) {
      basePresets.push(
        { label: 'Clutch', value: '1:00', icon: '🔥', shortcut: '6' },
        { label: 'Final', value: '0:10', icon: '⚡', shortcut: '7' }
      );
    }

    return basePresets;
  };

  // Auto-increment time based on typical play duration
  const autoIncrementTime = () => {
    if (!gameTime || !autoIncrement) return;

    const [minutes, seconds] = gameTime.split(':').map(Number);
    let newMinutes = minutes;
    let newSeconds = seconds - 15; // Assume 15 seconds per play

    if (newSeconds < 0) {
      newMinutes -= 1;
      newSeconds = 60 + newSeconds;
    }

    if (newMinutes < 0) {
      // Move to previous quarter
      if (currentQuarter > 1) {
        setCurrentQuarter(currentQuarter - 1);
        newMinutes = 11;
        newSeconds = 45;
      } else {
        newMinutes = 0;
        newSeconds = 0;
      }
    }

    const newTime = `${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;
    setGameTime(newTime);
    setLastPlayTime(gameTime);
  };

  // Smart time estimation based on last play
  const estimateNextTime = () => {
    if (!lastPlayTime) return;

    const [minutes, seconds] = lastPlayTime.split(':').map(Number);
    let newMinutes = minutes;
    let newSeconds = seconds - 20; // Estimate 20 seconds between plays

    if (newSeconds < 0) {
      newMinutes -= 1;
      newSeconds = 60 + newSeconds;
    }

    if (newMinutes < 0) {
      if (currentQuarter > 1) {
        setCurrentQuarter(currentQuarter - 1);
        newMinutes = 11;
        newSeconds = 40;
      } else {
        newMinutes = 0;
        newSeconds = 0;
      }
    }

    return `${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;
  };

  // Handle play save - auto-increment for next play
  useEffect(() => {
    if (onTimeChange && lastPlayTime) {
      const estimatedTime = estimateNextTime();
      if (estimatedTime && autoIncrement) {
        setGameTime(estimatedTime);
      }
    }
  }, [lastPlayTime, autoIncrement, onTimeChange]);

  // Quick time adjustment buttons
  const quickAdjustments = [
    { label: '-30s', value: -30, icon: '⏪', shortcut: 'ArrowLeft' },
    { label: '-15s', value: -15, icon: '◀️', shortcut: 'ArrowDown' },
    { label: '+15s', value: 15, icon: '▶️', shortcut: 'ArrowUp' },
    { label: '+30s', value: 30, icon: '⏩', shortcut: 'ArrowRight' }
  ];

  const adjustTime = (seconds) => {
    if (!gameTime) return;

    const [minutes, secs] = gameTime.split(':').map(Number);
    let newMinutes = minutes;
    let newSeconds = secs + seconds;

    if (newSeconds >= 60) {
      newMinutes += Math.floor(newSeconds / 60);
      newSeconds = newSeconds % 60;
    } else if (newSeconds < 0) {
      newMinutes -= Math.ceil(Math.abs(newSeconds) / 60);
      newSeconds = 60 + (newSeconds % 60);
    }

    if (newMinutes < 0) {
      if (currentQuarter > 1) {
        setCurrentQuarter(currentQuarter - 1);
        newMinutes = 11;
      } else {
        newMinutes = 0;
      }
    } else if (newMinutes > 11) {
      if (currentQuarter < 4) {
        setCurrentQuarter(currentQuarter + 1);
        newMinutes = 0;
      } else {
        newMinutes = 11;
      }
    }

    const newTime = `${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;
    setGameTime(newTime);
  };

  const handlePresetClick = (preset) => {
    setGameTime(preset.value);
    setTimeMode('preset');
    setLastPlayTime(gameTime);
  };

  const handleManualTimeChange = (e) => {
    setGameTime(e.target.value);
    setTimeMode('manual');
  };

  // Auto-set initial time when quarter changes
  useEffect(() => {
    if (!gameTime && timeMode === 'auto') {
      // Set to start of quarter when quarter changes
      setGameTime('12:00');
    }
  }, [currentQuarter, gameTime, timeMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only handle shortcuts when not typing in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const smartPresets = getSmartPresets();
      
      // Number keys for presets
      if (e.key >= '1' && e.key <= '9') {
        const presetIndex = parseInt(e.key) - 1;
        if (smartPresets[presetIndex]) {
          e.preventDefault();
          handlePresetClick(smartPresets[presetIndex]);
        }
      }
      
      // Arrow keys for time adjustments
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          adjustTime(-30);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustTime(-15);
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustTime(15);
          break;
        case 'ArrowRight':
          e.preventDefault();
          adjustTime(30);
          break;
        case 'a':
        case 'A':
          e.preventDefault();
          setTimeMode('auto');
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          setTimeMode('manual');
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          setTimeMode('preset');
          break;
        case ' ':
          e.preventDefault();
          setAutoIncrement(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameTime, currentQuarter, timeMode]);

  const smartPresets = getSmartPresets();

  return (
    <div className="game-time-input-container">
      {/* Time Mode Toggle */}
      <div className="time-mode-toggle">
        <button
          className={`mode-btn ${timeMode === 'auto' ? 'active' : ''}`}
          onClick={() => setTimeMode('auto')}
          title="Auto-increment time after each play (A)"
        >
          🤖 Auto
        </button>
        <button
          className={`mode-btn ${timeMode === 'manual' ? 'active' : ''}`}
          onClick={() => setTimeMode('manual')}
          title="Manual time entry (M)"
        >
          ✏️ Manual
        </button>
        <button
          className={`mode-btn ${timeMode === 'preset' ? 'active' : ''}`}
          onClick={() => setTimeMode('preset')}
          title="Use time presets (P)"
        >
          ⚡ Quick
        </button>
      </div>

      {/* Main Time Input */}
      <div className="time-input-section">
        <label className="game-time-input-label" htmlFor="game-time-input">Game Time:</label>
        <input
          className="game-time-input-field"
          id="game-time-input"
          type="text"
          value={gameTime}
          onChange={handleManualTimeChange}
          placeholder="MM:SS"
          disabled={timeMode === 'auto'}
        />
        
        {/* Quick Adjustments */}
        <div className="time-adjustments">
          {quickAdjustments.map(adj => (
            <button
              key={adj.label}
              className="time-adjust-btn"
              onClick={() => adjustTime(adj.value)}
              title={`${adj.label} (${adj.shortcut})`}
            >
              {adj.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Smart Presets */}
      {timeMode === 'preset' && (
        <div className="smart-presets">
          <div className="presets-label">Quick Times (press number keys):</div>
          <div className="presets-grid">
            {smartPresets.map(preset => (
              <button
                key={preset.label}
                className="preset-btn"
                onClick={() => handlePresetClick(preset)}
                title={`${preset.label}: ${preset.value} (${preset.shortcut})`}
              >
                <span className="preset-icon">{preset.icon}</span>
                <span className="preset-label">{preset.label}</span>
                <span className="preset-time">{preset.value}</span>
                <span className="preset-shortcut">({preset.shortcut})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quarter Selection */}
      <div className="quarter-section">
        <label className="game-time-input-label">Quarter:</label>
        <div className="quarter-buttons">
          {[1, 2, 3, 4].map(q => (
            <button
              key={q}
              className={`quarter-btn${currentQuarter === q ? ' selected' : ''}`}
              onClick={() => setCurrentQuarter(q)}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Auto-increment Toggle */}
      <div className="auto-increment-toggle">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={autoIncrement}
            onChange={(e) => setAutoIncrement(e.target.checked)}
          />
          <span className="toggle-text">Auto-increment time (Spacebar)</span>
        </label>
      </div>

      {/* Time Status */}
      {lastPlayTime && (
        <div className="time-status">
          <span className="status-text">Last play: {lastPlayTime}</span>
          {autoIncrement && (
            <span className="status-hint">Next play will auto-advance</span>
          )}
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="shortcuts-help">
        <details>
          <summary>⌨️ Keyboard Shortcuts</summary>
          <div className="shortcuts-grid">
            <div><strong>Numbers 1-7:</strong> Quick time presets</div>
            <div><strong>Arrow Keys:</strong> Adjust time (±15s, ±30s)</div>
            <div><strong>A/M/P:</strong> Switch modes (Auto/Manual/Preset)</div>
            <div><strong>Spacebar:</strong> Toggle auto-increment</div>
          </div>
        </details>
      </div>
    </div>
  );
}

export default GameTimeInput; 