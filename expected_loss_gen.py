import json

# 1. Load the data
with open('data.json', 'r') as f:
    assets = json.load(f)

print("Calculating Expected Monthly Loss (The Final Risk Score)...")

# 2. Loop through and calculate
for asset in assets:
    # Make sure the previous variables exist before calculating!
    if "probability_of_attack_per_month" in asset and "financial_impact_lakhs" in asset:
        
        # THE CORE FORMULA: Probability * Impact
        expected_loss = asset["probability_of_attack_per_month"] * asset["financial_impact_lakhs"]
        
        # Save the new variable into the asset
        asset["expected_monthly_loss_lakhs"] = round(expected_loss, 2)
    else:
        print(f"⚠️ Missing data for {asset['asset_id']}, skipping...")

# 3. Overwrite data.json
with open('data.json', 'w') as f:
    json.dump(assets, f, indent=4)

print("✅ Done! Added 'expected_monthly_loss_lakhs' to data.json")