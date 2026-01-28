import pandas as pd
import requests
from io import StringIO
import os

# --- CONFIGURATION ---
# We list multiple "Possible Locations" (URLs) for tricky datasets like GDP.
# The script will try them in order until one works.
DATASETS = {
    "cpi_inflation": {
        "urls": ["https://www.ons.gov.uk/generator?format=csv&uri=/economy/inflationandpriceindices/timeseries/l55o/mm23"],
        "filter_year": 1980
    },
    "gdp_growth": {
        # GDP is tricky. It moves between "Quarterly National Accounts" (qna) and "First Release" (pn2)
        "urls": [
            "https://www.ons.gov.uk/generator?format=csv&uri=/economy/grossdomesticproductgdp/timeseries/ihyq/qna",
            "https://www.ons.gov.uk/generator?format=csv&uri=/economy/grossdomesticproductgdp/timeseries/ihyq/pn2",
            "https://www.ons.gov.uk/generator?format=csv&uri=/economy/grossdomesticproductgdp/timeseries/ihyq/mret"
        ],
        "filter_year": 1980
    },
    "national_debt": {
        "urls": ["https://www.ons.gov.uk/generator?format=csv&uri=/economy/governmentpublicsectorandtaxes/publicsectorfinance/timeseries/hf6x/pusf"],
        "filter_year": 1970
    },
    "unemployment": {
        "urls": ["https://www.ons.gov.uk/generator?format=csv&uri=/employmentandlabourmarket/peoplenotinwork/unemployment/timeseries/mgsx/lms"],
        "filter_year": 1971
    }
}

def fetch_data():
    os.makedirs('data', exist_ok=True)
    headers = {'User-Agent': 'Mozilla/5.0'}

    for name, config in DATASETS.items():
        print(f"--- Processing: {name} ---")
        success = False
        
        # Try every URL in the list
        for url in config['urls']:
            try:
                print(f"Trying: {url}...")
                response = requests.get(url, headers=headers)
                
                if response.status_code == 200:
                    # Parse Data
                    csv_data = StringIO(response.text)
                    df = pd.read_csv(csv_data, skiprows=7) 
                    
                    # Clean and Save
                    df.columns = ['Date', 'Value']
                    df['Date'] = pd.to_datetime(df['Date'], format='%Y %b', errors='coerce')
                    df = df.dropna(subset=['Date']) 
                    df = df[df['Date'].dt.year >= config['filter_year']]
                    
                    output_file = f"data/{name}.csv"
                    df.to_csv(output_file, index=False)
                    print(f"✅ Success! Saved {len(df)} rows to {output_file}")
                    success = True
                    break # Stop trying URLs, we found it!
                else:
                    print(f"⚠️ Failed (Status {response.status_code})")
            except Exception as e:
                print(f"⚠️ Error: {e}")

        if not success:
            print(f"❌ CRITICAL: Could not find data for {name} in any location.")

if __name__ == "__main__":
    fetch_data()
