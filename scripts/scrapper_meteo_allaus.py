#!/usr/bin/env python3
"""
Scraper pel Butlletí d'Allaus d'Andorra (meteo.ad)
Extreu informació sobre perill d'allaus, gruixos de neu, i condicions
"""

import requests
from bs4 import BeautifulSoup
from datetime import datetime
import json
import re


class MeteoAllausScraper:
    def __init__(self):
        self.base_url = "https://www.meteo.ad"
        self.url_estatneu = f"{self.base_url}/estatneu"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
    
    def scrape_butlleti(self):
        """Extreu tota la informació del butlletí d'allaus"""
        response = self.session.get(self.url_estatneu)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        data = {
            'timestamp_scraping': datetime.now().isoformat(),
            'url': self.url_estatneu,
            'metadata': self._extract_metadata(soup),
            'zones': self._extract_zones_info(soup),
            'gruixos_mantell': self._extract_gruixos_mantell(soup),
            'neu_nova': self._extract_neu_nova(soup),
            'espais_protegits': self._extract_espais_protegits(soup),
            'estabilitat_text': self._extract_estabilitat_text(soup),
            'qualitat_neu_text': self._extract_qualitat_neu_text(soup)
        }
        
        return data
    
    def _extract_metadata(self, soup):
        """Extreu les metadades del butlletí"""
        metadata = {}
        
        # Buscar el text amb la data d'elaboració
        h1 = soup.find('h1')
        if h1:
            text_complet = h1.find_next_sibling(string=True)
            if text_complet:
                # Exemple: "Elaborat el 17/12/2025 16:00, vàlid fins el 18/12/2025"
                match = re.search(r'Elaborat el (\d{2}/\d{2}/\d{4} \d{2}:\d{2}).*vàlid fins el (\d{2}/\d{2}/\d{4})', str(text_complet))
                if match:
                    metadata['data_elaboracio'] = match.group(1)
                    metadata['valid_fins'] = match.group(2)
                
                # Propera actualització
                match_update = re.search(r'Propera actualització (\d{2}/\d{2}/\d{4}) a les (\d{2}:\d{2})', str(text_complet))
                if match_update:
                    metadata['propera_actualitzacio'] = f"{match_update.group(1)} {match_update.group(2)}"
        
        # Link al PDF
        pdf_link = soup.find('a', href=re.compile(r'estatNeu.*\.pdf'))
        if pdf_link:
            metadata['pdf_url'] = self.base_url + pdf_link['href']
        
        # Mapa general
        mapa = soup.find('img', alt=re.compile('Mapa', re.IGNORECASE))
        if mapa and mapa.get('src'):
            metadata['mapa_url'] = self.base_url + mapa['src']
        
        return metadata
    
    def _extract_zones_info(self, soup):
        """Extreu informació de les tres zones (nord, centre, sud)"""
        zones = {}

        # Map iconos divs to zones (iconos1=nord, iconos2=centre, iconos3=sud)
        zone_mapping = {
            'iconos1': 'zona_nord',
            'iconos2': 'zona_centre',
            'iconos3': 'zona_sud'
        }

        for iconos_class, zona_key in zone_mapping.items():
            iconos_div = soup.find('div', class_=iconos_class)

            if iconos_div:
                zona_data = {}
                imgs = iconos_div.find_all('img')

                # Initialize lists
                zona_data['problemes'] = []
                zona_data['orientacions'] = []
                zona_data['mides_allaus'] = []
                zona_data['tipus_sobrecarga'] = []
                altitude_specific_found = False

                for img in imgs:
                    src = img.get('src', '')

                    # Nivell de perill with altitude-specific information
                    # Process ico-risque first to check for altitude-specific patterns
                    if 'ico-risque' in src:
                        filename = src.split('/')[-1]
                        damunt_match = re.search(r'(\d+)damunt(\d+)', filename)
                        if damunt_match:
                            nivel_alt = int(damunt_match.group(1))   # Level above altitude
                            nivel_baix = int(damunt_match.group(2))  # Level below altitude

                            # Look for the altitude value in nearby span elements
                            altitud_critica = None
                            altitude_spans = iconos_div.find_all('span', string=re.compile(r'\d{4}'))
                            if altitude_spans:
                                altitud_critica = altitude_spans[0].get_text().strip() + 'm'

                            # Only create nivells_perill if there's actually a difference
                            if nivel_alt != nivel_baix:
                                zona_data['nivells_perill'] = {
                                    'alt_altitud': nivel_alt,
                                    'baix_altitud': nivel_baix
                                }
                                if altitud_critica:
                                    zona_data['nivells_perill']['altitud_critica'] = altitud_critica

                                # Set main danger level to the higher one for backward compatibility
                                zona_data['nivell_perill'] = max(nivel_alt, nivel_baix)
                            else:
                                # No altitude difference, just use the single danger level
                                zona_data['nivell_perill'] = nivel_alt
                            altitude_specific_found = True
                        else:
                            # Generic risque image, extract basic danger level
                            match = re.search(r'(\d+)', filename)
                            if match and 'nivell_perill' not in zona_data:
                                zona_data['nivell_perill'] = int(match.group(1))
                    elif 'ico_perill' in src and not altitude_specific_found:
                        # Only use ico_perill if no altitude-specific data was found
                        # This represents a uniform danger level across all altitudes
                        nivel_baix = self._extract_number_from_img(src)
                        zona_data['nivell_perill'] = nivel_baix

                    # Problemes típics
                    if any(problem in src for problem in ['capes_febles', 'neu_humida', 'neu_ventada', 'neu_recent']):
                        problema = self._extract_problem_name(src)
                        if problema not in zona_data['problemes']:
                            zona_data['problemes'].append(problema)

                    # Orientacions
                    if 'ico-vent' in src:
                        orientacio = self._extract_orientacio(src)
                        if orientacio and orientacio not in zona_data['orientacions']:
                            zona_data['orientacions'].append(orientacio)

                    # Mides d'allaus
                    if 'Mida_' in src:
                        mida = self._extract_number_from_img(src)
                        if mida and mida not in zona_data['mides_allaus']:
                            zona_data['mides_allaus'].append(mida)

                    # Tipus de sobrecàrrega
                    if any(trigger in src for trigger in ['Feble', 'Fort', 'Espontani']):
                        trigger = src.split('/')[-1].replace('.png', '')
                        if trigger not in zona_data['tipus_sobrecarga']:
                            zona_data['tipus_sobrecarga'].append(trigger)

                    # Tendència
                    if '24_' in src:
                        zona_data['tendencia'] = src.split('/')[-1].replace('24_', '').replace('.png', '')

                zones[zona_key] = zona_data

        return zones
    
    def _extract_gruixos_mantell(self, soup):
        """Extreu les taules de gruixos del mantell nival"""
        gruixos = {}

        # Find tables that contain snow depth data
        tables = soup.find_all('table')

        for table in tables:
            rows = table.find_all('tr')
            if len(rows) > 0:
                # Check if first row contains a zone name
                first_row_cells = rows[0].find_all(['th', 'td'])
                if first_row_cells:
                    first_cell_text = first_row_cells[0].get_text(strip=True)

                    # Look for zone pattern in the first cell
                    zona_match = re.search(r'Zona (nord|centre|sud)', first_cell_text, re.IGNORECASE)
                    if zona_match:
                        zona = zona_match.group(1).lower()
                        zona_data = self._parse_gruix_table(table)
                        if zona_data:
                            gruixos[zona] = zona_data

        return gruixos
    
    def _parse_gruix_table(self, table):
        """Parseja una taula de gruixos de neu"""
        data = {}
        rows = table.find_all('tr')
        
        for row in rows[1:]:  # Saltar header
            cols = row.find_all('td')
            if len(cols) >= 5:
                orientacio = cols[0].get_text(strip=True)
                if orientacio in ['N', 'S']:
                    data[orientacio] = {
                        'altitud_mantell': cols[1].get_text(strip=True),
                        'gruix_1500m': cols[2].get_text(strip=True),
                        'gruix_2000m': cols[3].get_text(strip=True),
                        'gruix_2500m': cols[4].get_text(strip=True)
                    }
        
        return data
    
    def _extract_neu_nova(self, soup):
        """Extreu la taula de gruixos de neu nova"""
        neu_nova = {}

        # Find the table with station names (look for FEDA pattern)
        tables = soup.find_all('table')
        for table in tables:
            rows = table.find_all('tr')
            if len(rows) > 1:
                # Check if this table has station names by looking for FEDA or similar
                first_data_row = rows[1] if len(rows) > 1 else None
                if first_data_row:
                    first_cell = first_data_row.find(['th', 'td'])
                    if first_cell and ('FEDA' in first_cell.get_text() or 'Grau Roig' in first_cell.get_text()):
                        # This is the snow stations table
                        headers = [th.get_text(strip=True) for th in rows[0].find_all(['th', 'td'])]

                        for row in rows[1:]:
                            cols = row.find_all(['th', 'td'])
                            if cols and len(cols) >= 2:
                                estacio = cols[0].get_text(strip=True)
                                valors = [col.get_text(strip=True) for col in cols[1:]]

                                # Only add if we have a valid station name and data
                                if estacio and not estacio.endswith('cm') and valors:
                                    neu_nova[estacio] = {
                                        headers[i+1]: valors[i] for i in range(min(len(valors), len(headers)-1))
                                    }
                        break

        return neu_nova
    
    def _extract_espais_protegits(self, soup):
        """Extreu informació dels espais naturals protegits"""
        espais = {}

        espais_noms = ['Sorteny', 'Comapedrosa', 'Madriu-Perafita-Claror']

        for nom in espais_noms:
            # Look for the protected area name in h4 tags with class 'remarcado'
            header = soup.find('h4', class_='remarcado', string=re.compile(nom, re.IGNORECASE))
            if not header:
                # Fallback to any string containing the name
                header_text = soup.find(string=re.compile(nom, re.IGNORECASE))
                if header_text:
                    header = header_text.find_parent()

            if header:
                # Look for detailed description in next sibling or nearby elements
                descripcio = ''

                # Check next sibling for detailed text
                next_sibling = header.find_next_sibling()
                if next_sibling and len(next_sibling.get_text(strip=True)) > 50:
                    descripcio = next_sibling.get_text(strip=True)
                else:
                    # Fallback: look for any nearby substantial text
                    nearby_elements = header.find_all_next(['div', 'p'], limit=3)
                    for element in nearby_elements:
                        text = element.get_text(strip=True)
                        if len(text) > 100:  # Just check for substantial content
                            descripcio = text
                            break

                    # If still no description, use fallback text
                    if not descripcio:
                        descripcio = "Breu guia nivometeorològica"

                # Look for map
                mapa_url = None
                mapa_img = soup.find('img', src=re.compile(f'mapa_{nom.lower().replace("-", "_")}', re.IGNORECASE))
                if mapa_img and mapa_img.get('src'):
                    mapa_url = self.base_url + mapa_img['src']

                espais[nom] = {
                    'descripcio': descripcio,
                    'mapa_url': mapa_url
                }

        return espais
    
    def _extract_estabilitat_text(self, soup):
        """Extreu el text sobre l'estabilitat del mantell"""
        # Look for div containing both header and content
        divs = soup.find_all('div', class_='col-sm-12')
        for div in divs:
            full_text = div.get_text()
            if 'Estabilitat del mantell nival' in full_text and 'Qualitat de la neu' in full_text:
                # Split the text to find the estabilitat section
                parts = full_text.split('Qualitat de la neu')[0]  # Everything before qualitat
                estabilitat_part = parts.split('Estabilitat del mantell nival')[1]  # Everything after header
                return estabilitat_part.strip()
        return None
    
    def _extract_qualitat_neu_text(self, soup):
        """Extreu el text sobre la qualitat de la neu"""
        # Look for div containing both header and content
        divs = soup.find_all('div', class_='col-sm-12')
        for div in divs:
            full_text = div.get_text()
            if 'Estabilitat del mantell nival' in full_text and 'Qualitat de la neu' in full_text:
                # Split the text to find the qualitat section
                qualitat_part = full_text.split('Qualitat de la neu')[1]  # Everything after header
                return qualitat_part.strip()
        return None
    
    def _extract_number_from_img(self, src):
        """Extreu números d'un path d'imatge"""
        match = re.search(r'(\d+)', src.split('/')[-1])
        return int(match.group(1)) if match else None
    
    def _extract_problem_name(self, src):
        """Extreu el nom del problema des del path"""
        filename = src.split('/')[-1].replace('.jpg', '').replace('_', ' ')
        return filename
    
    def _extract_orientacio(self, src):
        """Converteix el número d'orientació a graus o text"""
        num = self._extract_number_from_img(src)
        if num:
            # Complete mapping based on actual compass rose icons from meteo.ad (all 60 icons)
            orientacions = {
                # Single directions (1-8)
                1: 'N', 2: 'NE', 3: 'E', 4: 'SE',
                5: 'S', 6: 'SW', 7: 'W', 8: 'NW',

                # Multi-sector patterns (9-32)
                9: 'N+NE', 10: 'N+NE+E', 11: 'E+NE', 12: 'NE+E+SE',
                13: 'E+SE', 14: 'E+SE+S', 15: 'S+SE', 16: 'SE+S+SW',
                17: 'S+SW', 18: 'S+SW+W', 19: 'SW+W', 20: 'SW+W+NW',
                21: 'W+NW', 22: 'W+NW+N', 23: 'N+NE+E+SE+S', 24: 'E+SE+S+SW+W',
                25: 'S+SW+W+NW+N', 26: 'W+NW+N+NE+E', 27: 'NW+N+NE+E+SE',
                28: 'NE+E+SE+S+SW', 29: 'SE+S+SW+W+NW', 30: 'SW+W+NW+N+NE',
                31: 'NW+N+NE+SE+S+SW', 32: 'NW+NE+E+SE+SW+W',

                # Extended complex patterns (33-60)
                33: 'W+NW+N+NE+E+SE+S', 34: 'E+SE+S+SW+W+NW+N', 35: 'SE+S+SW+W+NW+N+NE',
                36: 'S+SW+W+NW+N+NE+E', 37: 'SW+W+NW+N+NE+E+SE', 38: 'W+NW+N+NE+E+SE+S',
                39: 'NW+N+NE+E+SE+S+SW', 40: 'N+NE+E+SE+S+SW+W', 41: 'E+SE+S+SW+W+NW',
                42: 'SE+S+SW+W+NW+N', 43: 'S+SW+W+NW+N+NE', 44: 'SW+W+NW+N+NE+E',
                45: 'W+NW+N+NE+E+SE', 46: 'NW+N+NE+E+SE+S', 47: 'N+NE+E+SE+S+SW',
                48: 'NE+E+SE+S+SW+W', 49: 'NONE', 50: 'ALL_DIRECTIONS',
                51: 'NW+N+NE', 52: 'ALL_DIRECTIONS', 53: 'N+NE+E+SE', 54: 'NE+E+SE+S',
                55: 'E+SE+S+SW', 56: 'SE+S+SW+W', 57: 'S+SW+W+NW', 58: 'SW+W+NW+N',
                59: 'W+NW+N+NE', 60: 'NW+N+NE+E'
            }
            return orientacions.get(num, f'Dir-{num}')
        return None
    
    def save_to_json(self, data, filename='butlleti_allaus.json'):
        """Guarda les dades en format JSON"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)


def main():
    scraper = MeteoAllausScraper()
    data = scraper.scrape_butlleti()
    scraper.save_to_json(data)


if __name__ == "__main__":
    main()