import pandas as pd
import requests
from io import StringIO
import os

# --- CONFIGURATION ---
# We now provide the EXACT ONS "Generator URL" for each dataset.
# This prevents the robot from looking in the wrong folder.
DATASETS = {
    "cpi_inflation": {
        "url": "https://www.ons.gov.uk/generator?format=csv&uri=/economy/inflationandpriceindices/timeseries/l55o/mm23",
        "filter_year": 1980
    },
    "gdp_growth": {
        # GDP Quarter on Quarter (Series IHYQ from Dataset QNA)
        "url": "https://www.ons.gov.uk/generator?format=csv&uri=/economy/grossdomesticproductgdp/timeseries/ihyq/qna",
        "filter_year": 1980
    },
    "national_debt": {
        # Public Sector Net Debt % GDP (Series HF6X from Dataset PUSF)
        "url": "https://www.ons.gov.uk/generator?format=csv&uri=/economy/governmentpublicsectorandtaxes/publicsectorfinance/timeseries/hf6x/pusf",
        "filter_year": 1970
    },
    "unemployment": {
        # Unemployment Rate 16+ (Series MGSX from Dataset LMS)
        # Note: This lives in 'employmentandlabourmarket', not 'economy'
        "url": "https://www.ons.gov.uk/generator?format=csv&uri=/employmentandlabourmarket/peoplenotinwork/unemployment/timeseries/mgsx/lms",
        "filter_year": 1971
    }
}

def fetch_data():
    os.makedirs('data', exist_ok=True)
    headers = {'User-Agent': 'Mozilla/5.0'}

    for name, config in DATASETS.items():
        print(f"--- Processing: {name} ---")
        
        try:
            response = requests.get(config['url'], headers=headers)
            
            if response.status_code == 200:
                # Parse Data
                csv_data = StringIO(response.text)
                # ONS CSVs usually have ~7 lines of metadata we don't need
                df = pd.read_csv(csv_data, skiprows=7) 
                
                # Clean Columns (Standardize them to Date/Value)
                df.columns = ['Date', 'Value']
                
                # Filter by Year
                df['Date'] = pd.to_datetime(df['Date'], format='%Y %b', errors='coerce')
                df = df.dropna(subset=['Date']) 
                df = df[df['Date'].dt.year >= config['filter_year']]
                
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
