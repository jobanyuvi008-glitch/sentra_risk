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
@app.route('/api/add-asset', methods=['POST'])
def add_asset():
    new_asset = request.json
    try:
        with open('data.json', 'r') as f:
            assets = json.load(f)
        assets.append(new_asset)
        with open('data.json', 'w') as f:
            json.dump(assets, f, indent=4)
        return jsonify({"status": "success", "message": "Asset added to pipeline!"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ==========================================
# 5. NEW: DELETE ASSET ENDPOINT
# ==========================================
@app.route('/api/delete-asset', methods=['POST'])
def delete_asset():
    req = request.json
    asset_id = req.get("asset_id")
    cve = req.get("vulnerability_cve")
    
    try:
        with open('data.json', 'r') as f:
            assets = json.load(f)
        
        # Keep everything EXCEPT the one the user clicked delete on
        updated_assets = [a for a in assets if not (a.get("asset_id") == asset_id and a.get("vulnerability_cve") == cve)]
        
        with open('data.json', 'w') as f:
            json.dump(updated_assets, f, indent=4)
            
        return jsonify({"status": "success", "message": "Asset deleted!"})
    except Exception as e:
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