import pandas as pd
import requests
from io import StringIO
import os

# --- THE CONFIGURATION DICTIONARY ---
# This is the "Menu" for the Robot. 
# We map a filename to a specific ONS Series ID.
# IDs:
# 'l55o': CPI Inflation (Annual %)
# 'ihyq': GDP Quarter-on-Quarter Growth
# 'hf6x': Public Sector Net Debt as % of GDP
# 'mgsx': Unemployment Rate (Aged 16+)
DATASETS = {
    "cpi_inflation": {"id": "l55o", "filter_year": 1980},
    "gdp_growth":    {"id": "ihyq", "filter_year": 1980},
    "national_debt": {"id": "hf6x", "filter_year": 1970},
    "unemployment":  {"id": "mgsx", "filter_year": 1971}
}

BASE_URL = "https://www.ons.gov.uk/generator?format=csv&uri=/economy/{}/timeseries/{}/mm23"

# Helper to guess the correct URL path (ONS paths vary slightly)
def get_ons_url(series_id):
    # Try common paths for different data types
    paths = [
        "inflationandpriceindices", 
        "grossdomesticproductgdp", 
        "governmentpublicsectorandtaxes", 
        "labourmarket"
    ]
    # We will try to fetch from each path until one works
    return paths

def fetch_data():
    os.makedirs('data', exist_ok=True)
    headers = {'User-Agent': 'Mozilla/5.0'}

    for name, config in DATASETS.items():
        print(f"--- Processing: {name} ({config['id']}) ---")
        
        success = False
        paths = get_ons_url(config['id'])
        
        for path in paths:
            # Construct URL
            url = f"https://www.ons.gov.uk/generator?format=csv&uri=/economy/{path}/timeseries/{config['id']}/mm23"
            
            try:
                response = requests.get(url, headers=headers)
                if response.status_code == 200:
                    # Parse Data
                    csv_data = StringIO(response.text)
                    df = pd.read_csv(csv_data, skiprows=7) # Skip ONS header junk
                    
                    # Clean Columns
                    df.columns = ['Date', 'Value']
                    
                    # Filter by Year
                    df['Date'] = pd.to_datetime(df['Date'], format='%Y %b', errors='coerce')
                    df = df.dropna(subset=['Date']) # Drop rows that failed date parsing
                    df = df[df['Date'].dt.year >= config['filter_year']]
                    
                    # Save
                    output_file = f"data/{name}.csv"
                    df.to_csv(output_file, index=False)
                    print(f"✅ Success! Saved {len(df)} rows to {output_file}")
                    success = True
                    break # Stop trying paths, we found it
            except Exception as e:
                print(f"⚠️ Error trying path {path}: {e}")
        
        if not success:
            print(f"❌ FAILED to find data for {name}")

if __name__ == "__main__":
    fetch_data()
