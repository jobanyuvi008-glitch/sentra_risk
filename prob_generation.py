import json
import requests
import time

# 1. Load the raw data
with open('data.json', 'r') as f:
    assets = json.load(f)

# 2. Hash Map Cache (To avoid calling the API 100 times for the same CVEs)
epss_cache = {}

def get_monthly_probability(cve_id, cvss_severity):
    """
    Fetches the 30-day (monthly) probability of attack from FIRST.org.
    """
    # If it is a Misconfiguration (e.g., MISCONF-01), EPSS doesn't track it.
    # We use a fallback: (CVSS / 10) * 0.5 as a simulated monthly probability
    if not cve_id.startswith("CVE-"):
        return round((cvss_severity / 10.0) * 0.5, 3)

    # Check if we already fetched this CVE (O(1) Time Complexity lookup)
    if cve_id in epss_cache:
        return epss_cache[cve_id]

    # Call the Live EPSS API
    url = f"https://api.first.org/data/v1/epss?cve={cve_id}"
    
    try:
        response = requests.get(url, timeout=5)
        data = response.json()
        
        if 'data' in data and len(data['data']) > 0:
            # The 'epss' field is the exact 30-day probability
            monthly_prob = float(data['data'][0]['epss'])
            
            # Save it to cache
            epss_cache[cve_id] = monthly_prob
            print(f"✅ API Success: {cve_id} -> {monthly_prob}")
            
            # EPSS API asks users not to spam requests, so we sleep for 0.1 seconds
            time.sleep(0.1) 
            return monthly_prob
            
    except Exception as e:
        print(f"⚠️ API Error for {cve_id}. Using fallback.")
    
    # Fallback if API fails
    fallback = round((cvss_severity / 10.0) * 0.5, 3)
    epss_cache[cve_id] = fallback
    return fallback

# 3. Loop through every asset and add the Monthly Probability
print("Fetching 30-day attack probabilities from FIRST.org EPSS API...")

for asset in assets:
    # Get the probability
    base_prob = get_monthly_probability(asset["vulnerability_cve"], asset["cvss_severity"])
    
    # If the server is exposed to the internet, we increase the probability by 15%
    if asset.get("internet_exposed") == True:
        final_prob = min(1.0, base_prob + 0.15)
    else:
        final_prob = base_prob
        
    # Add the new variable to the asset
    asset["probability_of_attack_per_month"] = round(final_prob, 4)

# 4. Save the updated data to a new file
with open('data_with_probability.json', 'w') as f:
    json.dump(assets, f, indent=4)

print("\n🚀 Done! Saved updated data to 'data_with_probability.json'")
# 4. OVERWRITE the exact same file
with open('data.json', 'w') as f:
    json.dump(assets, f, indent=4)

print("\n🚀 Done! Successfully added probabilities directly into 'data.json'")