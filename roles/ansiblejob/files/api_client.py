#!/usr/bin/env python3
"""
A small Python script to call the API defined in index.js
"""

import requests
import sys

# Base URL of the running API
BASE_URL = "http://192.168.1.30"

def call_api(endpoint):
    """Call the specified API endpoint and return the response."""
    try:
        response = requests.get(f"{BASE_URL}{endpoint}")
        response.raise_for_status()  # Raises an HTTPError for bad responses
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error calling API: {e}")
        sys.exit(1)

def main():
    """Main function to demonstrate API calls."""
    print("Calling /status endpoint:")
    result = call_api("/status")
    
    if(result["status"] == "OK"):
        print("OK")
        sys.exit(0)
    if(result["status"] != "OK"):
        print("NOK")
        sys.exit(1)

if __name__ == "__main__":
    main()
