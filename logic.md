# Avalanche Bulletin CSV Generator Logic

This document provides a detailed explanation of the logic implemented in `scripts/generate_butlleti_csv.py`, which generates CSV files with avalanche risk ratings for ski mountaineering routes.

## Overview

The script processes avalanche bulletin data (`butlleti_allaus.json`) and route information (`routes_corretgides.xlsx`) to calculate safety ratings for ski touring routes based on snow conditions, avalanche danger, and wind exposure.

## Input Data Sources

### 1. Avalanche Bulletin (`butlleti_allaus.json`)
- **Snow thickness data** (`gruixos_mantell`): Snow depth measurements at different altitudes (1500m, 2000m, 2500m) for different meteorological zones and orientations
- **Zone data** (`zones`): Avalanche danger levels and wind-affected orientations for each meteorological zone
- **Metadata**: Date and time of bulletin elaboration

### 2. Routes Data (`routes_corretgides.xlsx`)
- Route characteristics including:
  - `zona_meteo`: Meteorological zone
  - `orientation`: Route orientation (e.g., "N", "S", "NE+SE")
  - `start_altitude` / `end_altitude`: Elevation range
  - `terreny`: Terrain complexity ("SIMPLE", "EXIGENT", "COMPLEX")
  - `route_index_global`: Unique route identifier

## Core Logic Functions

### Snow Depth Processing

#### `_parse_cm(value: str) -> float`
- Extracts numeric value from snow depth strings (e.g., "45 cm" → 45.0)

#### `_round_to_5(value: float) -> int`
- Rounds values to nearest multiple of 5 for standardization

#### `_interpolate_snow(gruixos: dict, zone_key: str, orient_key: str, altitude: float) -> int`
**Purpose**: Calculates snow depth at any altitude using linear interpolation between reference points.

**Logic**:
1. Extracts snow depths at 1500m, 2000m, and 2500m for the specified zone and orientation
2. Applies piecewise linear interpolation:
   - **Below 1500m**: Uses 1500m value directly
   - **Above 2500m**: Uses 2500m value directly
   - **1500m-2000m**: Linear interpolation between 1500m and 2000m values
   - **2000m-2500m**: Linear interpolation between 2000m and 2500m values
3. Rounds result to nearest multiple of 5cm

**Mathematical Formula**:
For altitude between reference points A and B:
```
interpolated_value = value_A + ((altitude - altitude_A) / (altitude_B - altitude_A)) × (value_B - value_A)
```

### Orientation Handling

#### `_orientation_key(orientation: str) -> str`
- Simplifies orientation to either "N" (north-facing) or "S" (south-facing) based on presence of "S" in the orientation string

#### `_split_orientations(value: str)`
- Parses multi-orientation strings (e.g., "NE+SE" → ["NE", "SE"])

### Rating Calculations

#### 1. Snow Rating (`_rating_neu`)
**Purpose**: Evaluates route safety based on snow depth availability.

**Logic**:
1. Calculates snow depth at route start and end altitudes using interpolation
2. If either point has zero snow depth, returns rating of 0 (unsafe/impossible)
3. Otherwise, calculates rating based on start altitude snow depth:
   ```
   rating = min(5, ceil(start_snow_depth / 5))
   ```
   - More snow = higher rating (safer)
   - Capped at maximum rating of 5

#### 2. Wind Rating (`_rating_vent`)
**Purpose**: Identifies route orientations affected by problematic winds.

**Logic**:
1. Splits route orientation into individual directions
2. Compares with bulletin's wind-affected orientations for the zone
3. Returns matched orientations as a string (e.g., "NE+SE")
4. Empty string indicates no wind exposure (safer)

#### 3. Avalanche Danger Rating (`_rating_perill`)
**Purpose**: Calculates safety rating based on avalanche danger level and terrain complexity.

**Logic**:
1. **Danger Level Extraction** (`_perill_level`):
   - Checks if route's maximum altitude exceeds critical altitude threshold
   - Uses appropriate danger level (high altitude vs. low altitude)
   - Falls back to general danger level if altitude-specific data unavailable

2. **Terrain-Adjusted Rating**:
   - **SIMPLE terrain**: `rating = 5 - danger_level`
   - **EXIGENT terrain**: `rating = 5 - (1.5 × danger_level)`
   - **COMPLEX terrain**: `rating = 5 - (2.0 × danger_level)`

   More complex terrain receives harsher penalties for the same danger level.

3. **Floor and Bounds**: `max(0, floor(rating))`

### Final Rating Calculation

**Logic Flow**:
1. Calculate individual ratings: `rating_neu`, `rating_perill`, `rating_vent`
2. **Base Rating**: `min(rating_neu, rating_perill)`
   - Takes the more restrictive of snow and avalanche danger ratings
3. **Wind Penalty**: If no wind-affected orientations found (`rating_vent` is empty):
   ```
   base_final = ceil(base_rating × 1.25)
   ```
   - 25% penalty for potential unknown wind effects
4. **Final Rating**: `min(5, base_final)`
   - Ensures rating never exceeds maximum of 5

## Data Processing Workflow

### File Location Resolution
The script implements flexible file discovery to work in different execution contexts:
- Local development environment
- GitHub Actions CI/CD
- Various working directory scenarios

### Main Processing Loop
For each route in the Excel file:
1. Extract route metadata (zone, orientation, altitude, terrain)
2. Fetch corresponding zone data from avalanche bulletin
3. Calculate all rating components
4. Apply final rating logic
5. Store results in structured record

### Output Generation
- Creates timestamped CSV file: `butlleti_YYYY_MM_DD.csv`
- Contains columns: `route_index_global`, `rating_neu`, `rating_perill`, `rating_vent`, `rating_final`
- Saves to `data/` directory

## Key Design Principles

### 1. Conservative Safety Approach
- Uses minimum of snow and avalanche ratings as base
- Applies penalties for wind exposure uncertainty
- More complex terrain receives stricter evaluation

### 2. Data Interpolation
- Linear interpolation provides smooth transitions between altitude reference points
- Handles edge cases (below/above reference range) gracefully

### 3. Standardization
- Rounds snow depths to 5cm increments for consistency
- Normalizes orientation codes for reliable matching
- Caps all ratings at maximum value of 5

### 4. Robustness
- Multiple fallback paths for file location
- Graceful handling of missing data fields
- Error reporting for critical file dependencies

## Example Calculation

For a route with:
- Zone: "zona_1", Orientation: "N", Start: 2100m, End: 2400m, Terrain: "EXIGENT"
- Snow depths: 1500m→30cm, 2000m→60cm, 2500m→90cm
- Avalanche danger: Level 3, Wind orientations: ["N", "NE"]

**Calculations**:
1. **Snow at 2100m**: 60 + ((2100-2000)/500) × (90-60) = 66cm → `rating_neu = min(5, ceil(66/5)) = 5`
2. **Wind**: Route "N" matches bulletin "N" → `rating_vent = "N"`
3. **Avalanche**: EXIGENT terrain → `rating_perill = max(0, floor(5 - 1.5×3)) = 0`
4. **Final**: `min(rating_neu, rating_perill) = min(5, 0) = 0` → `rating_final = 0`

This route would receive a final rating of 0 due to high avalanche danger in exigent terrain, despite good snow conditions.