# Andorra Skimo Bulletin 🏔️

A React-based avalanche route planning web application for ski-mountaineering in Andorra. Combines real-time avalanche bulletins from meteo.ad with ATES route data to provide intelligent route recommendations and safety assessments.

## ✨ Features

- **📊 Intelligent Route Ranking**: Multi-criteria scoring system (safety, snow quality, wind exposure)
- **🔍 Smart Search & Filtering**: Autocomplete route search with advanced filters
- **🏆 Top Recommendations**: Daily top 3 route suggestions based on current conditions
- **❄️ Real-time Snow Data**: Current avalanche bulletins and snow depth measurements
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **🗺️ Route Integration**: Direct links to detailed route information on visor.allaus.ad

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Architecture

### Core Components

- **Hero Section**: Landing page with project statistics and call-to-action
- **Route Explorer**: Main interface with top picks and complete route listing
- **Smart Filters**: Advanced filtering by route name, zone, and safety ratings
- **Route Cards**: Detailed route information with safety assessments
- **Methodology Legend**: Interactive explanations of rating system and data sources

### Data Sources

1. **meteo.ad/estatneu** - Official Andorra avalanche bulletins (daily updates)
2. **visor.allaus.ad** - ATES terrain classification and route catalog

### Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS v3 (clean, gradient-free design)
- **Data**: Static CSV/JSON files served from public folder
- **Deployment**: Static site generation for Vercel, Netlify, etc.

## 📊 Route Ranking Algorithm

Routes are ranked using a multi-criteria scoring system:

1. **Final Rating** (primary) - Overall recommendation score
2. **Safety Level** (secondary) - Terrain complexity + avalanche risk
3. **Snow Quality** (tertiary) - Snow depth and conditions
4. **Wind Exposure** (quaternary) - Problematic wind directions

## 🎨 Design System

### Color Scheme
- **Primary**: Blue tones for headers, buttons, and navigation
- **Success**: Green for safe conditions and positive ratings
- **Warning**: Orange/yellow for caution conditions
- **Danger**: Red for dangerous conditions

### Visual Elements
- **Glassmorphism**: Semi-transparent cards with backdrop blur
- **Mountain Icons**: Weather and terrain-themed emojis (🏔️, ❄️, ⚠️, 🌬️, ✅)
- **Responsive Layout**: Mobile-first design with flexible grid system

## 📁 Project Structure

```
src/
├── App.jsx                 # Main application component
├── components/
│   ├── FilterPanel.jsx     # Search and filtering interface
│   ├── Legend.jsx          # Methodology and data sources
│   ├── RouteCard.jsx       # Individual route display
│   └── RouteList.jsx       # Route container component
└── utils/
    ├── dataLoader.js       # CSV/JSON data loading
    └── routeRanking.js     # Route analysis and sorting

public/
├── data/
│   ├── routes.csv          # Route catalog (semicolon-separated)
│   └── butlleti_*.csv      # Daily avalanche ratings (comma-separated)
└── assets/
    └── *.jpg              # Hero images and methodology diagrams
```

## 🔧 Development Notes

### Data Format

**routes.csv** (semicolon-separated):
```csv
route_name;zona_meteo;difficulty;distance;elevation_gain
```

**Daily ratings** (comma-separated):
```csv
route_index_global,rating_neu,rating_perill,rating_vent,rating_final
```

### Browser Support
- Modern browsers with ES6+ support
- Clipboard API for route name copying
- CSS Grid and Flexbox for responsive layout

### Known Limitations

**Route Linking**: Cannot directly automate search on visor.allaus.ad due to browser security restrictions. Current implementation:
- Opens visor.allaus.ad in new tab
- Copies route name to clipboard
- User manually pastes into search field

## ⚠️ Safety Disclaimer

This tool provides informational data only. Always:
- Consult official avalanche bulletins
- Use proper safety equipment
- Have appropriate mountaineering experience
- Check current weather conditions
- Inform others of your route plans

**Data sources**: Official Andorra meteorological services and ATES terrain classification system.

## 📄 License

MIT License - See LICENSE file for details.
