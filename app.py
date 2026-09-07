from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import json
import requests
import os
from dotenv import load_dotenv

# 🔒 Load secrets from .env file securely
load_dotenv()

app = Flask(__name__)
# This explicitly tells Flask to allow any website on the internet to read its data
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Fetch variables securely from the system environment
DATABASE_URL = os.getenv("DATABASE_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# ==========================================
# 1. DATABASE LOADER (Fetches Live Neon Data)
# ==========================================
def load_data():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM corporate_assets;")
        data = cur.fetchall()
        cur.close()
        conn.close()
        return data
    except Exception as e:
        print(f"Database Error: {e}")
        return []

# ==========================================
# 2. DASHBOARD ENDPOINT
# ==========================================
@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    assets = load_data()
    total_expected_loss = sum(float(item.get("expected_monthly_loss_lakhs", 0)) for item in assets)
    sorted_assets = sorted(assets, key=lambda x: float(x.get("expected_monthly_loss_lakhs", 0)), reverse=True)
    
    return jsonify({
        "total_enterprise_risk_lakhs": round(total_expected_loss, 2),
        "total_assets_scanned": len(assets),
        "top_risks": sorted_assets[:12]
    })

# ==========================================
# 3. KNAPSACK BUDGET OPTIMIZER ENDPOINT
# ==========================================
@app.route('/api/optimize/<int:budget_lakhs>', methods=['GET'])
def optimize_budget(budget_lakhs):
    data = load_data()
    n = len(data)
    dp = [[0 for _ in range(budget_lakhs + 1)] for _ in range(n + 1)]

    for i in range(1, n + 1):
        cost = int(data[i-1].get("remediation_cost_lakhs", 0))
        value = float(data[i-1].get("expected_monthly_loss_lakhs", 0))

        for w in range(1, budget_lakhs + 1):
            if cost <= w:
                dp[i][w] = max(value + dp[i-1][w - cost], dp[i-1][w])
            else:
                dp[i][w] = dp[i-1][w]

    selected_fixes = []
    w = budget_lakhs
    for i in range(n, 0, -1):
        if dp[i][w] != dp[i-1][w]:
            selected_fixes.append(data[i-1])
            w -= int(data[i-1].get("remediation_cost_lakhs", 0))

    return jsonify({
        "budget_provided_lakhs": budget_lakhs,
        "max_risk_reduced_lakhs": round(dp[n][budget_lakhs], 2),
        "budget_spent_lakhs": budget_lakhs - w,
        "recommended_actions": selected_fixes
    })

# ==========================================
# 4. ADD ASSET ENDPOINT
# ==========================================
# ==========================================
# 4. ADD ASSET ENDPOINT (Injects straight into Neon DB)
# ==========================================
@app.route('/api/add-asset', methods=['POST'])
def add_asset():
    new_asset = request.json
    try:
        # We must calculate the expected loss for the new asset before inserting it
        base_impact = int(new_asset.get("business_criticality", 0)) * 10
        breach_cost = (int(new_asset.get("sensitive_data_records", 0)) * 100) / 100000
        financial_impact = base_impact + breach_cost
        
        # For a custom asset, we assign a default base probability of 0.85
        final_prob = 0.95 if new_asset.get("internet_exposed") else 0.85
        expected_loss = final_prob * financial_impact

        # Connect directly to Neon PostgreSQL
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Insert the new row directly into the live database
        cur.execute("""
            INSERT INTO corporate_assets (
                asset_id, asset_name, business_criticality, sensitive_data_records,
                vulnerability_cve, vulnerability_name, cvss_severity, internet_exposed,
                remediation_cost_lakhs, remediation_action, probability_of_attack_per_month,
                financial_impact_lakhs, expected_monthly_loss_lakhs
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            new_asset.get("asset_id"),
            new_asset.get("asset_name"),
            int(new_asset.get("business_criticality", 0)),
            int(new_asset.get("sensitive_data_records", 0)),
            new_asset.get("vulnerability_cve"),
            new_asset.get("vulnerability_name"),
            float(new_asset.get("cvss_severity", 0.0)),
            bool(new_asset.get("internet_exposed", False)),
            int(new_asset.get("remediation_cost_lakhs", 0)),
            new_asset.get("remediation_action"),
            round(final_prob, 4),
            round(financial_impact, 2),
            round(expected_loss, 2)
        ))
        
        conn.commit()
        cur.close()
        conn.close()
            
        return jsonify({"status": "success", "message": "Asset added directly to live database!"})
    except Exception as e:
        print(f"❌ Add Asset Error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

# ==========================================
# 5. NEW: DELETE ASSET ENDPOINT
# ==========================================
# ==========================================
# 5. DELETE ASSET ENDPOINT (Deletes from Neon DB)
# ==========================================
@app.route('/api/delete-asset', methods=['POST'])
def delete_asset():
    req = request.json
    asset_id = req.get("asset_id")
    cve = req.get("vulnerability_cve")
    
    try:
        # Connect directly to Neon PostgreSQL
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Delete the specific row directly from the live database
        cur.execute("""
            DELETE FROM corporate_assets 
            WHERE asset_id = %s AND vulnerability_cve = %s;
        """, (asset_id, cve))
        
        conn.commit()
        cur.close()
        conn.close()
            
        return jsonify({"status": "success", "message": "Asset deleted from live database!"})
    except Exception as e:
        print(f"❌ Delete Error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

# ==========================================
# 6. ALL ASSETS ENDPOINT
# ==========================================
@app.route('/api/assets', methods=['GET'])
def get_all_assets():
    assets = load_data()
    total_expected_loss = sum(float(item.get("expected_monthly_loss_lakhs", 0)) for item in assets)
    sorted_assets = sorted(assets, key=lambda x: float(x.get("expected_monthly_loss_lakhs", 0)), reverse=True)
    return jsonify({
        "total": len(sorted_assets),
        "total_enterprise_risk_lakhs": round(total_expected_loss, 2),
        "assets": sorted_assets
    })

# ==========================================
# 7. AI CHAT ENDPOINT (RAG)
# ==========================================
@app.route('/api/chat', methods=['POST'])
def chat():
    user_message = request.json.get("message", "")
    assets = load_data()
    sorted_assets = sorted(assets, key=lambda x: float(x.get("expected_monthly_loss_lakhs", 0)), reverse=True)
    top_5_assets = sorted_assets[:5]
    
    company_data_context = "Here is the live data for our company's top cyber risks right now:\n"
    for asset in top_5_assets:
        company_data_context += f"- Asset: {asset.get('asset_name')} | Vulnerability: {asset.get('vulnerability_cve')} | Expected Loss: {asset.get('expected_monthly_loss_lakhs')} Lakhs | Fix Cost: {asset.get('remediation_cost_lakhs')} Lakhs | Action: {asset.get('remediation_action')}\n"
    
    system_prompt = f"""
    You are Sentra AI, a friendly, business-focused Cyber Risk Advisor. 
    You are talking directly to the CISO. 
    RULE 1: Speak in simple, non-technical business terms. Explain things simply.
    RULE 2: Focus ONLY on financial risk (Lakhs) and the cost to fix it. 
    RULE 3: Do NOT just read a list of data. Summarize it naturally.
    RULE 4: Keep your answer strictly under 3 sentences.
    
    Here is the live data:
    {company_data_context}
    """
    
    if not GROQ_API_KEY:
        return jsonify({"response": "System Error: Missing API Key."})

    headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": "openai/gpt-oss-120b",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]
    }
    
    try:
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
        if response.status_code != 200:
            return jsonify({"response": f"Groq Error: {response.json().get('error', {}).get('message', 'Unknown')}"})
        return jsonify({"response": response.json()["choices"][0]["message"]["content"]})
    except Exception as e:
        return jsonify({"response": f"System error: {str(e)}"})

if __name__ == '__main__':
    print("🚀 Starting Flask API on http://127.0.0.1:5000")
    app.run(port=5000, debug=True)