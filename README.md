# Andorra Skimo Bulletin 🏔️

A React-based avalanche route planning web application for ski-mountaineering in Andorra. Combines real-time avalanche bulletins from meteo.ad with ATES route data to provide intelligent route recommendations and safety assessments.

## ✨ Features

- **📊 Intelligent Route Ranking**: Multi-criteria scoring system (safety, snow quantity, exposed slopes)
- **🔍 Smart Search & Filtering**: Autocomplete route search with advanced filters
- **🏆 Top Recommendations**: Daily top 3 route suggestions based on current conditions
- **❄️ Real-time Snow Data**: Current avalanche bulletins and snow depth measurements with mantell threshold logic
- **🌤️ Live Weather Integration**: Real-time weather conditions at 2000m elevation from Open-Meteo API
- **💾 Smart Weather Caching**: 15-minute client-side caching to optimize API usage and performance
- **🤖 Automated Updates**: Daily data scraping and processing at 4:05 PM Andorra time
- **📊 Advanced Snow Rating**: Mantell-based snow depth calculations with altitude interpolation
- **⚠️ Dangerous Slopes Detection**: Identifies and highlights routes with problematic slope orientations
- **📅 Smart Bulletin Selection**: Automatically uses most recent available bulletin data
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **🗺️ Route Integration**: Direct links to detailed route information on visor.allaus.ad
- **🌡️ Weather Forecasting**: 48-hour weather predictions for better trip planning
- **🎯 Safety-First Scoring**: Penalizes routes with dangerous conditions in the final rating

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
- **Route Cards**: Detailed route information with safety assessments and real-time weather
- **Weather Display**: Live conditions at 2000m with temperature, wind, and forecasts
- **Dangerous Slopes Indicator**: Visual warnings for routes with problematic orientations
- **Methodology Legend**: Interactive explanations of rating system and data sources
- **Mobile-Optimized Views**: Responsive cards and layouts for all screen sizes

### Data Sources & Automation

1. **meteo.ad/estatneu** - Official Andorra Meteorological Service
   - Avalanche bulletins and snow condition reports
   - Automated daily scraping at 4:05 PM Andorra time
   - Real-time snow depth and mantell altitude data
   - Avalanche danger levels by zone and orientation
   - Copyright: Servei Meteorològic d'Andorra

2. **visor.allaus.ad** - Andorra Recerca + Innovació (ARI)
   - ATES (Avalanche Terrain Exposure Scale) route classifications
   - Comprehensive route catalog with terrain complexity ratings
   - Route difficulty, altitude, and orientation data
   - Original ATES cartographic work: Centre d'Estudis de la Neu i la Muntanya d'Andorra (CENMA) & OBSA Observatori de la Sostenibilitat d'Andorra
   - Copyright: Andorra Recerca + Innovació

3. **open-meteo.com** - European Weather Service
   - Real-time weather data at 2000m elevation
   - Current temperature, wind conditions, and weather status
   - Today's and tomorrow's forecasts
   - Free API with 10,000 daily requests (3,000+ app visits supported)
   - Copyright: Open-Meteo.com

4. **GitHub Actions Workflow** - Automated data processing and deployment

### Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS v3 (clean, gradient-free design)
- **Data**: Static CSV/JSON files served from public folder
- **Weather API**: Open-Meteo REST API with client-side caching
- **Deployment**: Static site generation for GitHub Pages, Vercel, Netlify, etc.

## 📊 Route Ranking Algorithm

Routes are ranked using a multi-criteria scoring system with advanced snow calculations:

### Rating Components
1. **Final Rating** (primary) - Overall recommendation score with safety penalties
2. **Safety Level** (secondary) - Terrain complexity + avalanche risk
3. **Snow Quantity** (tertiary) - Snow depth and conditions with mantell logic
4. **Exposed Slopes** (quaternary) - Problematic slope orientations

### Safety Penalties (NEW)
- Routes with dangerous slopes receive a -0.5 penalty to their final rating
- Ensures safer routes are recommended even if they have slightly lower base scores
- Dangerous slopes are clearly marked with warning indicators

### Snow Rating Logic
- **Below Mantell Altitude**: `rating_neu = 0` (no skiable snow)
- **Between Mantell & 1500m**: Linear interpolation from 0cm to actual snow depth
- **Above 1500m**: Standard altitude-based interpolation (1500m-2500m)
- **Dynamic Updates**: Automatically adjusts based on latest snow depth measurements

### Bulletin Selection
- Automatically finds and uses the most recent available bulletin file
- Searches through 30 days of potential data files
- Displays correct timestamp matching the actual data being shown
- Falls back gracefully if current day's data is not yet available

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
│   ├── RouteCard.jsx       # Individual route display with weather
│   ├── RouteList.jsx       # Route container component
│   └── WeatherDisplay.jsx  # Weather conditions component
└── utils/
    ├── dataLoader.js       # CSV/JSON data loading
    ├── routeRanking.js     # Route analysis and sorting
    ├── weatherService.js   # Open-Meteo API integration
    └── weatherCache.js     # Client-side weather caching

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

## 📊 Data Attribution & Sources

This application uses data from:

**Avalanche & Meteorological Data:**
- **Servei Meteorològic d'Andorra** (meteo.ad) - Official avalanche bulletins, snow depth measurements, and weather conditions
- All avalanche danger assessments and snow data are sourced from official Andorran meteorological services

**Route & Terrain Data:**
- **Andorra Recerca + Innovació (ARI)** via visor.allaus.ad - ATES route classifications and terrain complexity ratings
- Original ATES cartographic development by Centre d'Estudis de la Neu i la Muntanya d'Andorra (CENMA) and OBSA Observatori de la Sostenibilitat d'Andorra
- Route catalog includes difficulty ratings, altitude profiles, and orientation data

**Weather Data:**
- **Open-Meteo.com** - Free European weather service providing real-time meteorological data
- Weather conditions at 2000m elevation across three Andorran zones (North, Centre, South)
- Current temperature, wind speed/direction, precipitation, and 48-hour forecasts

**Usage Compliance:**
- Data is used for non-commercial educational and safety purposes
- All original data remains property of respective institutions
- Users should always consult original official sources for authoritative information

## 📄 License

**Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)**

This project is licensed under CC BY-NC-SA 4.0, which means:

✅ **You CAN:**
- Use for personal, educational, and research purposes
- Share and redistribute the application
- Modify and build upon the work
- Use for avalanche safety education and training

❌ **You CANNOT:**
- Use for commercial purposes without explicit permission
- Sell or monetize the application or derivatives
- Remove attribution to original author and data sources

🔄 **ShareAlike Requirement:**
- Any modifications must be shared under the same CC BY-NC-SA 4.0 license
- Ensures safety tools remain freely available for public benefit

See LICENSE file for complete terms. For commercial licensing inquiries, please contact the author.

# GitHub Pages Enabled
