import json
import requests
import psycopg2
from psycopg2.extras import execute_values
import os
from dotenv import load_dotenv

# Load credentials securely (GitHub will inject these later!)
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

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
            return prob
    except Exception:
        pass
    
    fallback = round((cvss_severity / 10.0) * 0.5, 3)
    epss_cache[cve_id] = fallback
    return fallback

def run_single_sync():
    print("🚀 GITHUB ACTIONS: STARTING DATA SYNC...")
    
    try:
        # 1. Read Raw Assets
        with open("data.json", "r") as f:
            assets = json.load(f)
        
        records_to_insert = []
        
        # 2. Transform Data
        for asset in assets:
            base_prob = get_monthly_probability(asset.get("vulnerability_cve"), float(asset.get("cvss_severity", 0)))
            final_prob = min(1.0, base_prob + 0.15) if asset.get("internet_exposed") else base_prob
            
            base_impact = int(asset.get("business_criticality", 0)) * 10
            breach_cost = (int(asset.get("sensitive_data_records", 0)) * 100) / 100000
            financial_impact = base_impact + breach_cost
            
            expected_loss = final_prob * financial_impact

            records_to_insert.append((
                asset.get("asset_id"), asset.get("asset_name"), int(asset.get("business_criticality", 0)),
                int(asset.get("sensitive_data_records", 0)), asset.get("vulnerability_cve"),
                asset.get("vulnerability_name"), float(asset.get("cvss_severity", 0.0)),
                bool(asset.get("internet_exposed", False)), int(asset.get("remediation_cost_lakhs", 0)),
                asset.get("remediation_action"), round(final_prob, 4), round(financial_impact, 2), round(expected_loss, 2)
            ))

        # 3. Push to Neon PostgreSQL
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        cur.execute("TRUNCATE TABLE corporate_assets RESTART IDENTITY;")
        
        insert_query = """
            INSERT INTO corporate_assets (
                asset_id, asset_name, business_criticality, sensitive_data_records,
                vulnerability_cve, vulnerability_name, cvss_severity, internet_exposed,
                remediation_cost_lakhs, remediation_action, probability_of_attack_per_month,
                financial_impact_lakhs, expected_monthly_loss_lakhs
            ) VALUES %s
        """
        execute_values(cur, insert_query, records_to_insert)

        conn.commit()
        cur.close()
        conn.close()
        print("✅ GITHUB ACTIONS: NEON DATABASE SYNCED SUCCESSFULLY.")

    except Exception as e:
        print(f"❌ GITHUB ACTIONS ERROR: {e}")

if __name__ == "__main__":
    run_single_sync()