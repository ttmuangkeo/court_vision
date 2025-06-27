# Components Structure

This directory contains all React components organized by feature and purpose following React best practices.

## 📁 Directory Structure

```
frontend/src/components/
├── common/                    # Reusable components
│   ├── Button/
│   │   ├── Button.js
│   │   ├── Button.css
│   │   └── index.js
│   └── Card/
│       ├── Card.js
│       ├── Card.css
│       └── index.js
├── layout/                    # Layout components
│   ├── Navbar/
│   │   ├── Navbar.js
│   │   ├── Navbar.css
│   │   └── index.js
│   └── Footer/
├── pages/                     # Page-level components
│   ├── Games/
│   │   ├── GamesDashboard/
│   │   │   ├── GamesDashboard.js
│   │   │   └── index.js
│   │   ├── GamesList/
│   │   │   ├── GamesList.js
│   │   │   └── index.js
│   │   └── GameDetail/
│   │       ├── GameDetail.js
│   │       └── index.js
│   ├── Teams/
│   │   ├── TeamsList/
│   │   │   ├── TeamsList.js
│   │   │   └── index.js
│   │   └── TeamDetail/
│   │       ├── TeamDetail.js
│   │       └── index.js
│   ├── Players/
│   │   ├── PlayersList/
│   │   │   ├── PlayersList.js
│   │   │   └── index.js
│   │   └── PlayerDetail/
│   │       ├── PlayerDetail.js
│   │       └── index.js
│   └── Analytics/
│       └── GameAnalytics/
│           ├── GameAnalytics.js
│           └── index.js
└── features/                  # Feature-specific components
    └── tagging/
        ├── FastTagging/
        │   ├── FastTagging.js
        │   ├── FastTagging.css
        │   └── index.js
        ├── GameHeader/
        │   ├── GameHeader.js
        │   ├── GameHeader.css
        │   └── index.js
        ├── PlayerSelector/
        │   ├── PlayerSelector.js
        │   ├── PlayerSelector.css
        │   └── index.js
        ├── GameTimeInput/
        │   ├── GameTimeInput.js
        │   ├── GameTimeInput.css
        │   └── index.js
        ├── QuickActions/
        │   ├── QuickActions.js
        │   ├── QuickActions.css
        │   ├── quickActionsConfig.js
        │   └── index.js
        ├── PredictionPanel/
        │   ├── PredictionPanel.js
        │   ├── PredictionPanel.css
        │   └── index.js
        ├── DecisionQualityPanel/
        │   ├── DecisionQualityPanel.js
        │   ├── DecisionQualityPanel.css
        │   └── index.js
        ├── RecentPlays/
        │   ├── RecentPlays.js
        │   ├── RecentPlays.css
        │   └── index.js
        └── TagDetailsModal/
            ├── TagDetailsModal.js
            └── index.js
```

## 🎯 Component Categories

### **Common Components** (`/common`)
Reusable UI components that can be used across the application:
- **Button/**: Reusable button component
- **Card/**: Card layout component
- Future: Modal, Input, Select, etc.

### **Layout Components** (`/layout`)
Components that define the overall structure of the application:
- **Navbar/**: Main navigation bar
- Future: Footer, Sidebar, etc.

### **Page Components** (`/pages`)
Top-level page components organized by feature area:

#### **Games** (`/pages/Games`)
- **GamesDashboard/**: Home page with stats and recent games
- **GamesList/**: List of all games with filtering
- **GameDetail/**: Detailed game view

#### **Teams** (`/pages/Teams`)
- **TeamsList/**: List of NBA teams
- **TeamDetail/**: Detailed team view with roster

#### **Players** (`/pages/Players`)
- **PlayersList/**: List of players with search and filtering
- **PlayerDetail/**: Detailed player profile and analytics

#### **Analytics** (`/pages/Analytics`)
- **GameAnalytics/**: Game-specific analytics and insights

### **Feature Components** (`/features`)
Feature-specific components organized by domain:

#### **Tagging** (`/features/tagging`)
All components related to the play tagging system:
- **FastTagging/**: Main container for the tagging interface
- **GameHeader/**: Game information header
- **PlayerSelector/**: Player selection with team filtering
- **GameTimeInput/**: Quarter and time selection
- **QuickActions/**: Action buttons for tagging plays
- **PredictionPanel/**: Smart suggestions and predictions
- **DecisionQualityPanel/**: Decision quality analysis
- **RecentPlays/**: Display of recently tagged plays
- **TagDetailsModal/**: Modal for tag information

## 📋 Component Organization Principles

### **1. Feature-Based Organization**
- Components are grouped by feature/domain rather than type
- Related components are kept together
- Each feature has its own directory

### **2. Component-First Structure**
- Each component has its own directory
- Component files (JS, CSS, config) are co-located
- `index.js` files enable clean imports

### **3. Clear Separation of Concerns**
- **Common**: Reusable UI components
- **Layout**: Application structure
- **Pages**: Top-level page components
- **Features**: Domain-specific functionality

### **4. Scalable Structure**
- Easy to add new features
- Clear patterns for new components
- Maintainable as the application grows

## 🔗 Import Examples

```javascript
// Clean imports using index.js files
import FastTagging from './components/features/tagging/FastTagging';
import QuickActions from './components/features/tagging/QuickActions';
import GamesList from './components/pages/Games/GamesList';
import PlayerDetail from './components/pages/Players/PlayerDetail';
```

## 🚀 Benefits of This Structure

1. **Easy Navigation**: Clear folder structure makes it easy to find components
2. **Scalable**: Easy to add new features without cluttering existing code
3. **Maintainable**: Related files are co-located
4. **Reusable**: Common components are clearly separated
5. **Clean Imports**: Index.js files enable clean import paths
6. **Best Practices**: Follows React community standards

## 📝 Adding New Components

When adding a new component:

1. **Determine the category**: Common, Layout, Page, or Feature
2. **Create component directory**: `ComponentName/`
3. **Add component files**: `ComponentName.js`, `ComponentName.css` (if needed)
4. **Create index.js**: `export { default } from './ComponentName.js';`
5. **Update imports**: Use the new clean import path

This structure makes the codebase much more organized and maintainable! 🏀 