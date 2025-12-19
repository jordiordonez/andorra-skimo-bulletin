import json
import math
from datetime import datetime
from pathlib import Path

import pandas as pd


def _parse_cm(value: str) -> float:
    return float(value.replace("cm", "").strip())


def _round_to_5(value: float) -> int:
    return int(round(value / 5.0) * 5)


def _orientation_key(orientation: str) -> str:
    return "S" if "S" in orientation.upper() else "N"


def _split_orientations(value: str):
    return [part.strip().upper() for part in value.split("+") if part.strip()]


def _interpolate_snow(gruixos: dict, zone_key: str, orient_key: str, altitude: float) -> int:
    zone_data = gruixos[zone_key][orient_key]
    values = {
        1500: _parse_cm(zone_data.get("gruix_1500m", "0 cm")),
        2000: _parse_cm(zone_data.get("gruix_2000m", "0 cm")),
        2500: _parse_cm(zone_data.get("gruix_2500m", "0 cm")),
    }

    if altitude <= 1500:
        raw = values[1500]
    elif altitude >= 2500:
        raw = values[2500]
    elif altitude <= 2000:
        factor = (altitude - 1500) / 500
        raw = values[1500] + factor * (values[2000] - values[1500])
    else:
        factor = (altitude - 2000) / 500
        raw = values[2000] + factor * (values[2500] - values[2000])

    return _round_to_5(raw)


def _rating_vent(zone_data: dict, route_orientation: str) -> str:
    route_dirs = _split_orientations(str(route_orientation))
    matched = []

    for orient_str in zone_data.get("orientacions", []):
        zone_dirs = _split_orientations(orient_str)
        for dir_code in route_dirs:
            if dir_code in zone_dirs and dir_code not in matched:
                matched.append(dir_code)

    return "+".join(matched)


def _rating_neu(gruixos: dict, zona_meteo: str, orientation: str, start_alt: float, end_alt: float) -> int:
    zone_key = zona_meteo.replace("zona_", "")
    orient_key = _orientation_key(orientation)

    start_snow = _interpolate_snow(gruixos, zone_key, orient_key, start_alt)
    end_snow = _interpolate_snow(gruixos, zone_key, orient_key, end_alt)

    if start_snow == 0 or end_snow == 0:
        return 0

    return min(5, math.ceil(start_snow / 5))


def _perill_level(zone_data: dict, end_alt: float) -> int:
    if "nivells_perill" in zone_data:
        levels = zone_data["nivells_perill"]
        alt_critica = float(str(levels.get("altitud_critica", "0").replace("m", "")))
        return int(levels["alt_altitud"] if end_alt >= alt_critica else levels["baix_altitud"])
    return int(zone_data.get("nivell_perill", 0))


def _rating_perill(zone_data: dict, end_alt: float, terreny: str) -> int:
    nivell = _perill_level(zone_data, end_alt)

    if terreny == "SIMPLE":
        rating = 5 - nivell
    elif terreny == "EXIGENT":
        rating = 5 - 1.5 * nivell
    else:  # COMPLEX
        rating = 5 - 2 * nivell

    return max(0, int(math.floor(rating)))


def _resolve_path(rel_path: str) -> Path:
    """Resolve path from CWD or repo root."""
    direct = Path(rel_path)
    if direct.exists():
        return direct

    base = Path(__file__).resolve().parent.parent
    candidate = base / rel_path
    if candidate.exists():
        return candidate

    raise FileNotFoundError(f"No s'ha trobat {rel_path} ni {candidate}")


def main():
    butlleti_path = _resolve_path("data/butlleti_allaus.json")
    routes_path = _resolve_path("data/routes_corretgides.xlsx")

    data = json.loads(butlleti_path.read_text())
    gruixos = data["gruixos_mantell"]

    data_elaboracio = data["metadata"]["data_elaboracio"]
    dt = datetime.strptime(data_elaboracio, "%d/%m/%Y %H:%M")
    date_tag = dt.strftime("%Y_%m_%d")

    routes = pd.read_excel(routes_path)

    records = []
    for _, row in routes.iterrows():
        zona_meteo = row["zona_meteo"]
        zone_data = data["zones"][zona_meteo]
        rating_neu = _rating_neu(
            gruixos,
            zona_meteo,
            row["orientation"],
            float(row["start_altitude"]),
            float(row["end_altitude"]),
        )
        rating_perill = _rating_perill(zone_data, float(row["end_altitude"]), row["terreny"])
        rating_vent = _rating_vent(zone_data, row["orientation"])
        base_final = min(rating_neu, rating_perill)
        if not rating_vent:
            base_final = math.ceil(base_final * 1.25)
        rating_final = min(5, base_final)

        records.append(
            {
                "route_index_global": int(row["route_index_global"]),
                "rating_neu": rating_neu,
                "rating_perill": rating_perill,
                "rating_vent": rating_vent,
                "rating_final": rating_final,
            }
        )

    output_dir = routes_path.parent if routes_path.parent.name == "data" else Path(__file__).resolve().parent.parent / "data"
    output_path = output_dir / f"butlleti_{date_tag}.csv"
    pd.DataFrame(records).to_csv(output_path, index=False)


if __name__ == "__main__":
    main()
