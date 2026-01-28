import pandas as pd
import requests
import os
import json

# --- CONFIGURATION ---
DATASETS = {
    "cpi_inflation": {
        "series": "l55o", 
        "cabinets": ["mm23", "cpi"],
        "frequency": "months",
        "filter_year": 1980
    },
    "gdp_growth": {
        "series": "ihyq", 
        # SWITCHED: Try 'ukea' (Master Archive) first, then 'pn2' (First Release)
        "cabinets": ["ukea", "pn2", "qna", "mret"], 
        "frequency": "quarters",
        "filter_year": 1980
    },
    "national_debt": {
        "series": "hf6x", 
        "cabinets": ["pusf"],
        "frequency": "months",
        "filter_year": 1970
    },
    "unemployment": {
        "series": "mgsx", 
        "cabinets": ["lms"], 
        "frequency": "months",
        "filter_year": 1971
    }
}

def fetch_data():
    # 1. CLEANUP: Delete the broken GDP file if it exists so we don't get fooled
    if os.path.exists("data/gdp_growth.csv"):
        os.remove("data/gdp_growth.csv")
        print("🗑️  Deleted old gdp_growth.csv to ensure clean slate.")

    os.makedirs('data', exist_ok=True)
    headers = {'User-Agent': 'Mozilla/5.0'}

    for name, config in DATASETS.items():
        print(f"--- Hunting for: {name} ({config['series'].upper()}) ---")
        
        found_data = False
        
        for cabinet in config['cabinets']:
            # Try both Uppercase and Lowercase cabinet names (ONS is inconsistent)
            attempts = [cabinet.lower(), cabinet.upper()]
            
            for cab in attempts:
                if found_data: break 

                url = f"https://api.ons.gov.uk/timeseries/{config['series']}/dataset/{cab}/data"
                print(f"  ... checking cabinet '{cab}'")
                
                try:
                    response = requests.get(url, headers=headers)
                    
                    if response.status_code == 200:
                        data = response.json()
                        freq_key = config['frequency']
                        
                        if freq_key in data and len(data[freq_key]) > 0:
                            # Process Data
                            rows = []
                            for p in data[freq_key]:
                                year = int(p['year'])
                                if year >= config['filter_year']:
                                    rows.append({
                                        "Date": p['date'],
                                        "Value": p['value']
                                    })
                            
                            if len(rows) > 0:
                                df = pd.DataFrame(rows)
                                output_file = f"data/{name}.csv"
                                df.to_csv(output_file, index=False)
                                print(f"  ✅ SUCCESS! Found {len(df)} rows in '{cab}'. Saved to {output_file}")
                                found_data = True
                                break
                except Exception as e:
                    print(f"      [!] Error: {e}")

        if not found_data:
            print(f"❌ CRITICAL: Could not find data for {name}")

if __name__ == "__main__":
    fetch_data()
