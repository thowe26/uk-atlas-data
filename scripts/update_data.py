import pandas as pd
import requests
import os
from io import StringIO

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
        "cabinets": ["qna", "pn2", "ukea", "mret"], 
        "frequency": "quarters",
        "filter_year": 1980,
        # FALLBACK: If API fails, try this direct CSV link
        "fallback_url": "https://www.ons.gov.uk/generator?format=csv&uri=/economy/grossdomesticproductgdp/timeseries/ihyq/qna"
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
    # 1. CLEANUP: Delete the broken GDP file so we start fresh
    if os.path.exists("data/gdp_growth.csv"):
        os.remove("data/gdp_growth.csv")
        print("🗑️  Deleted old gdp_growth.csv to ensure clean slate.")

    os.makedirs('data', exist_ok=True)
    headers = {'User-Agent': 'Mozilla/5.0'}

    for name, config in DATASETS.items():
        print(f"--- Hunting for: {name} ({config['series'].upper()}) ---")
        
        found_data = False
        
        # METHOD A: Try the ONS API (Preferred)
        for cabinet in config['cabinets']:
            if found_data: break
            
            # Try lowercase and uppercase cabinet names
            for cab in [cabinet.lower(), cabinet.upper()]:
                if found_data: break
                
                url = f"https://api.ons.gov.uk/timeseries/{config['series']}/dataset/{cab}/data"
                try:
                    response = requests.get(url, headers=headers, timeout=10)
                    if response.status_code == 200:
                        data = response.json()
                        freq_key = config['frequency']
                        
                        if freq_key in data and len(data[freq_key]) > 0:
                            rows = []
                            for p in data[freq_key]:
                                year = int(p['year'])
                                if year >= config['filter_year']:
                                    rows.append({"Date": p['date'], "Value": p['value']})
                            
                            if len(rows) > 0:
                                df = pd.DataFrame(rows)
                                output_file = f"data/{name}.csv"
                                df.to_csv(output_file, index=False)
                                print(f"  ✅ SUCCESS (API)! Found {len(df)} rows in '{cab}'.")
                                found_data = True
                except Exception as e:
                    print(f"      [!] API Error on {cab}: {e}")

        # METHOD B: Fallback to Direct CSV (If API Failed)
        if not found_data and "fallback_url" in config:
            print(f"  ⚠️ API failed. Trying Fallback CSV...")
            try:
                response = requests.get(config['fallback_url'], headers=headers, timeout=15)
                if response.status_code == 200:
                    csv_data = StringIO(response.text)
                    df = pd.read_csv(csv_data, skiprows=7) # Skip ONS headers
                    df.columns = ['Date', 'Value']
                    
                    # Basic Cleaning
                    df['Date'] = pd.to_datetime(df['Date'], format='%Y %b', errors='coerce') # Expects "2023 MAR" format
                    if df['Date'].isnull().all():
                         # Try Quarter format "1980 Q1"
                         df['Date'] = pd.PeriodIndex(df['Date'], freq='Q').to_timestamp()
                    
                    df = df.dropna(subset=['Date'])
                    df = df[df['Date'].dt.year >= config['filter_year']]
                    
                    output_file = f"data/{name}.csv"
                    df.to_csv(output_file, index=False)
                    print(f"  ✅ SUCCESS (Fallback)! Saved {len(df)} rows.")
                    found_data = True
            except Exception as e:
                print(f"      [!] Fallback Error: {e}")

        if not found_data:
            print(f"❌ CRITICAL: Could not find data for {name}")

if __name__ == "__main__":
    fetch_data()
