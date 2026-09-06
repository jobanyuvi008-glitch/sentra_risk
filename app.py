from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import json
import requests
import os
from dotenv import load_dotenv

# 🔒 Load secrets from .env file securely!
load_dotenv()

app = Flask(__name__)
CORS(app)

# Fetch variables securely from the system environment
DATABASE_URL = os.getenv("DATABASE_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

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
    You are Sentra AI, the Chief Information Security Officer's (CISO) AI assistant. 
    Keep your answers highly professional, analytical, and strictly under 3 sentences.
    You have access to the company's live database. If the user asks about their risks, costs, or what to fix, USE THIS EXACT DATA to answer them accurately:
    
    {company_data_context}
    """
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "llama-3.1-8b-instant", # 🚀 UPDATED TO THE NEWEST MODEL!
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]
    }
    
    try:
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
        ai_text = response.json()["choices"][0]["message"]["content"]
        return jsonify({"response": ai_text})
    except Exception as e:
        return jsonify({"response": "AI is currently offline. Please check your Groq API Key and internet connection."})

if __name__ == '__main__':
    print("🚀 Starting Flask API on http://127.0.0.1:5000")
    app.run(port=5000, debug=True)