# Components Structure

This directory contains all React components organized by feature and purpose.

## Directory Structure

### `/layout`
- **Navbar.js** - Main navigation component

### `/pages` 
- **GamesDashboard.js** - Dashboard showing recent games and quick stats
- **GamesList.js** - List of all games with filtering
- **TeamsList.js** - List of all teams
- **PlayersList.js** - List of all players
- **GameDetail.js** - Detailed view of a single game

### `/tagging`
- **FastTagging.js** - Main container component for the tagging interface
- **GameHeader.js** - Game information header with back button
- **PlayerSelector.js** - Player selection with team filtering
- **GameTimeInput.js** - Quick time input buttons for game time
- **QuickActions.js** - Quick action buttons for common plays
- **RecentPlays.js** - Display of recently tagged plays
- **quickActionsConfig.js** - Configuration for quick action buttons

## Component Relationships

- **FastTagging** is the main container that orchestrates the tagging interface
- It imports and uses all the smaller components in the `/tagging` folder
- The tagging components are designed to work together for fast, efficient play tagging
- Pages components use FastTagging when a user wants to tag plays for a specific game

## 🎯 Component Categories

### **Layout Components** (`/layout`)
- **Navbar.js**: Main navigation bar with view switching
- Future: Footer, Sidebar, etc.

### **Page Components** (`/pages`)
- **GamesDashboard.js**: Home page with stats and recent games
- **GamesList.js**: List of all games
- **GameDetail.js**: Detailed game view (legacy)
- **TeamsList.js**: List of NBA teams
- **PlayersList.js**: List of players

### **Tagging Components** (`/tagging`)
- **GameHeader.js**: Game title, score, navigation
- **PlayerSelector.js**: Team filtering and player selection
- **GameTimeInput.js**: Quarter and time selection
- **QuickActions.js**: Action buttons for tagging plays
- **RecentPlays.js**: Display of recently tagged plays
- **quickActionsConfig.js**: Configuration for action buttons

### **Container Components** (root level)
- **FastTagging.js**: Main container that orchestrates tagging components

## 🚀 Benefits

1. **Clear Separation**: Layout, pages, and features are separated
2. **Easy Navigation**: Developers can quickly find what they need
3. **Scalable**: Easy to add new pages or features
4. **Maintainable**: Related components are grouped together
5. **Reusable**: Components can be easily reused across pages

## 📝 Naming Conventions

- **Page components**: PascalCase with descriptive names (e.g., `GamesDashboard`)
- **Feature components**: PascalCase with feature prefix (e.g., `GameHeader`)
- **Configuration files**: camelCase with descriptive names (e.g., `quickActionsConfig`)
- **Layout components**: PascalCase with layout purpose (e.g., `Navbar`)

## 🔄 Future Additions

- `/common` - Shared UI components (buttons, inputs, etc.)
- `/hooks` - Custom React hooks
- `/utils` - Utility functions
- `/styles` - CSS/styling files 