import json
import psycopg2
from psycopg2.extras import execute_values
import os
from dotenv import load_dotenv

# 🔒 Securely load the database URL from your hidden .env file!
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")


def migrate():
    try:
        # 1. Connect to Neon PostgreSQL
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        # 2. Load JSON data
        with open("data.json", "r") as f:
            assets = json.load(f)

        print(f"Preparing {len(assets)} records to push to Neon...")

        # 3. Safely extract values using .get() to prevent KeyErrors
        records = [
            (
                asset.get("asset_id"),
                asset.get("asset_name"),
                asset.get("business_criticality", 0),
                asset.get("sensitive_data_records", 0),
                asset.get("vulnerability_cve"),
                asset.get("vulnerability_name"),
                float(asset.get("cvss_severity", 0.0)),
                bool(asset.get("internet_exposed", False)),
                int(asset.get("remediation_cost_lakhs", 0)),
                asset.get("remediation_action"),
                float(asset.get("probability_of_attack_per_month", 0.0)),
                float(asset.get("financial_impact_lakhs", 0.0)),
                float(asset.get("expected_monthly_loss_lakhs", 0.0)),
            )
            for asset in assets
        ]

        # 4. WIPE THE OLD DATA (The "Live Sync" Trick)
        cur.execute("TRUNCATE TABLE corporate_assets RESTART IDENTITY;")

        # 5. Perform atomic batch insert with the new data
        insert_query = """
            INSERT INTO corporate_assets (
                asset_id, asset_name, business_criticality, sensitive_data_records,
                vulnerability_cve, vulnerability_name, cvss_severity, internet_exposed,
                remediation_cost_lakhs, remediation_action, probability_of_attack_per_month,
                financial_impact_lakhs, expected_monthly_loss_lakhs
            ) VALUES %s
        """
        execute_values(cur, insert_query, records)

        # 6. Commit transaction and clean up
        conn.commit()
        cur.close()
        conn.close()

        print(f"✅ DB SYNC: Refreshed Neon Database with {len(assets)} up-to-date assets.")

    except FileNotFoundError:
        print("Error: 'data.json' was not found in the current working directory.")
    except Exception as e:
        print(f"Migration Error: {e}")

if __name__ == "__main__":
    migrate()