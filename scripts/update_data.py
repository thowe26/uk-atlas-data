import pandas as pd
import requests
import os

# --- NEW CONFIGURATION (API BASED) ---
# We use the official API: https://api.ons.gov.uk/timeseries/{SERIES}/{DATASET}/data
DATASETS = {
    "cpi_inflation": {
        "series": "l55o", 
        "dataset": "mm23", 
        "filter_year": 1980,
        "frequency": "months" # Inflation is monthly
    },
    "gdp_growth": {
        "series": "ihyq", 
        "dataset": "qna", 
        "filter_year": 1980,
        "frequency": "quarters" # GDP is quarterly
    },
    "national_debt": {
        "series": "hf6x", 
        "dataset": "pusf", 
        "filter_year": 1970,
        "frequency": "months"
    },
    "unemployment": {
        "series": "mgsx", 
        "dataset": "lms", 
        "filter_year": 1971,
        "frequency": "months"
    }
}

def fetch_data():
    os.makedirs('data', exist_ok=True)
    headers = {'User-Agent': 'Mozilla/5.0'}

    for name, config in DATASETS.items():
        print(f"--- Processing: {name} ({config['series'].upper()}) ---")
        
        # 1. Construct the API URL
        url = f"https://api.ons.gov.uk/timeseries/{config['series']}/dataset/{config['dataset']}/data"
        
        try:
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                # 2. Extract the specific list we need (months or quarters)
                freq_key = config['frequency']
                if freq_key not in data:
                    print(f"⚠️ Warning: Could not find '{freq_key}' in data. Available: {data.keys()}")
                    continue
                
                raw_points = data[freq_key]
                
                # 3. Convert to DataFrame
                # The API returns a list of dictionaries: [{'date': '1980 Q1', 'value': '2.5'}, ...]
                rows = []
                for p in raw_points:
                    # Clean Date: API gives "1980 Q1" or "2023 OCT". We want distinct sortable dates.
                    # For simplicity, we keep the 'date' string for the CSV, but we filter by 'year'
                    year = int(p['year'])
                    if year >= config['filter_year']:
                        # Use the label provided by ONS (e.g., "2023 Q1" or "2023 SEP")
                        # To make it work with our charts, we want a standard format if possible,
                        # but "YYYY QX" is actually fine for charts. 
                        # Let's standardize to YYYY-MM-DD for easier sorting if needed, 
                        # OR keep it simple. Let's keep the ONS 'date' label for display.
                        rows.append({
                            "Date": p['date'],  # e.g., "1988 JAN" or "2022 Q3"
                            "Value": p['value']
                        })

                df = pd.DataFrame(rows)
                
                # Save
                output_file = f"data/{name}.csv"
                df.to_csv(output_file, index=False)
                print(f"✅ Success! Saved {len(df)} rows to {output_file}")
                
            else:
                print(f"❌ Failed to download {name}. Status Code: {response.status_code}")
                
        except Exception as e:
            print(f"⚠️ Critical Error processing {name}: {e}")

if __name__ == "__main__":
    fetch_data()
