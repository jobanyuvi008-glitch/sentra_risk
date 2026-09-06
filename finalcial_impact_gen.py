import json

# 1. Load the data
with open('data.json', 'r') as f:
    assets = json.load(f)

print("Calculating Financial Impact for all assets...")

# 2. Loop through and calculate
for asset in assets:
    # A. Base downtime cost (Criticality * 10 Lakhs)
    # Example: Criticality 10 = 100 Lakhs base impact
    base_impact_lakhs = asset["business_criticality"] * 10 
    
    # B. Stolen data cost (Assume ₹100 penalty per sensitive record)
    # 1 Lakh = 1,00,000 Rupees. So (Records * 100) / 100,000
    breach_cost_lakhs = (asset["sensitive_data_records"] * 100) / 100000 
    
    # C. Total Impact
    total_impact = base_impact_lakhs + breach_cost_lakhs
    
    # Save the new variable into the asset
    asset["financial_impact_lakhs"] = round(total_impact, 2)

# 3. Overwrite data.json
with open('data.json', 'w') as f:
    json.dump(assets, f, indent=4)

print("✅ Done! Added 'financial_impact_lakhs' to data.json")