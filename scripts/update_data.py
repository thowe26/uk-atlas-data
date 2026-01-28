import pandas as pd
import requests
import os
import json

# --- CONFIGURATION ---
# The Robot will try these datasets in order until it finds data.
DATASETS = {
    "cpi_inflation": {
        "series": "l55o", 
        "cabinets": ["mm23", "cpi"], # Try 'mm23' first, then 'cpi'
        "frequency": "months",
        "filter_year": 1980
    },
    "gdp_growth": {
        "series": "ihyq", 
        "cabinets": ["qna", "pn2", "mret", "ukea"], # Try all these locations for GDP
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
    os.makedirs('data', exist_ok=True)
    headers = {'User-Agent': 'Mozilla/5.0'}

    for name, config in DATASETS.items():
        print(f"--- Hunting for: {name} ({config['series']}) ---")
        
        found_data = False
        
        # Try each 'cabinet' (dataset) in the list
        for cabinet in config['cabinets']:
            url = f"https://api.ons.gov.uk/timeseries/{config['series']}/dataset/{cabinet}/data"
            print(f"  ... checking cabinet '{cabinet}'")
            
            try:
                response = requests.get(url, headers=headers)
                
                if response.status_code == 200:
                    data = response.json()
                    freq_key = config['frequency']
                    
                    # Check 1: Does the frequency key exist? (e.g. 'quarters')
                    if freq_key not in data:
                        print(f"      [!] Key '{freq_key}' not found in JSON.")
                        continue
                        
                    raw_points = data[freq_key]
                    
                    # Check 2: Is the list empty?
                    if len(raw_points) == 0:
                        print(f"      [!] Data list is empty.")
                        continue

                    # Process Data
                    rows = []
                    for p in raw_points:
                        year = int(p['year'])
                        if year >= config['filter_year']:
                            rows.append({
                                "Date": p['date'],
                                "Value": p['value']
                            })
                    
                    # Check 3: Did we actually get rows after filtering?
                    if len(rows) > 0:
                        df = pd.DataFrame(rows)
                        output_file = f"data/{name}.csv"
                        df.to_csv(output_file, index=False)
                        print(f"  ✅ SUCCESS! Found {len(df)} rows in '{cabinet}'. Saved to {output_file}")
                        found_data = True
                        break # Stop hunting, we found it!
                    else:
                         print(f"      [!] All data was filtered out (Year < {config['filter_year']}).")
                else:
                    print(f"      [x] API Error: {response.status_code}")
                    
            except Exception as e:
                print(f"      [!] Script Error: {e}")

        if not found_data:
            print(f"❌ CRITICAL: Could not find ANY data for {name} in any cabinet.")

if __name__ == "__main__":
    fetch_data()
