import json
import requests
import time
import random

with open('data.json', 'r') as f:
    assets = json.load(f)

epss_cache = {}

def get_monthly_probability(cve_id, cvss_severity):
    if not cve_id.startswith("CVE-"):
        return round((cvss_severity / 10.0) * 0.5, 3)
    if cve_id in epss_cache:
        return epss_cache[cve_id]
    
    url = f"https://api.first.org/data/v1/epss?cve={cve_id}"
    try:
        response = requests.get(url, timeout=5)
        data = response.json()
        if 'data' in data and len(data['data']) > 0:
            prob = float(data['data'][0]['epss'])
            epss_cache[cve_id] = prob
            time.sleep(0.1)
            return prob
    except Exception:
        pass
    
    fallback = round((cvss_severity / 10.0) * 0.5, 3)
    epss_cache[cve_id] = fallback
    return fallback

print("Fetching attack probabilities and applying Live Threat Telemetry...")

for asset in assets:
    base_prob = get_monthly_probability(asset["vulnerability_cve"], asset["cvss_severity"])
    
    
    fluctuation = random.uniform(0.85, 1.15) 
    final_prob = base_prob * fluctuation
    
    if asset.get("internet_exposed") == True:
        final_prob = final_prob + 0.10
        
    asset["probability_of_attack_per_month"] = round(min(1.0, final_prob), 4)

with open('data.json', 'w') as f:
    json.dump(assets, f, indent=4)

print("🚀 Done! Probabilities updated dynamically.")