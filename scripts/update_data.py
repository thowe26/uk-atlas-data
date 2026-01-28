import pandas as pd
import requests
from io import StringIO
from datetime import datetime
import os

# --- CONFIGURATION ---
# ONS Series ID for CPI (Consumer Price Index) Annual % Change
DATA_URL = "https://www.ons.gov.uk/generator?format=csv&uri=/economy/inflationandpriceindices/timeseries/l55o/mm23"
OUTPUT_FILE = "data/cpi_inflation.csv"

def fetch_ons_data():
    print(f"Fetching data from: {DATA_URL}")
    
    # Ensure the data directory exists
    os.makedirs('data', exist_ok=True)

    # 1. Download the raw CSV from ONS
    headers = {'User-Agent': 'Mozilla/5.0'}
    response = requests.get(DATA_URL, headers=headers)
    
    if response.status_code != 200:
        raise Exception(f"Failed to download data: {response.status_code}")

    # 2. Clean the Data
    # ONS CSVs have a messy header. We skip lines to find real data.
    csv_data = StringIO(response.text)
    df = pd.read_csv(csv_data, skiprows=7) 
    
    # Rename columns: usually [Date, Value]
    df.columns = ['Date', 'CPI_Inflation']
    
    # Filter: Keep only data from 1970 onwards
    df['Date'] = pd.to_datetime(df['Date'], format='%Y %b', errors='coerce')
    df = df[df['Date'].dt.year >= 1970]
    
    # 3. Save to our Repo
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"Success! Saved {len(df)} rows to {OUTPUT_FILE}")

if __name__ == "__main__":
    fetch_ons_data()
