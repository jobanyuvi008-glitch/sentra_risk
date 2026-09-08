/* ==============================================
   PAGES/EXPLORER.JS — Risk Explorer + ML + Add/Delete
   ============================================== */

const ExplorerPage = {
  assetsData: [],
  showAll: false,

  render() {
    return `
      <div class="page">
        <div class="page-header">
          <div class="page-header-row">
            <div>
              <h1 class="page-title">Live Risk Explorer</h1>
              <p class="page-subtitle">View live monitored assets from Neon PostgreSQL or inject a new simulated asset.</p>
            </div>
            <button onclick="ExplorerPage.toggleAddForm()" style="padding:10px 20px;background:var(--accent);color:white;border-radius:8px;font-weight:600;display:flex;align-items:center;gap:8px;cursor:pointer;">
              <svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:white;fill:none;stroke-width:2;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Custom Asset
            </button>
          </div>
        </div>

        <!-- ADD ASSET FORM (Hidden by default) -->
        <div id="add-asset-form" class="card card-pad" style="display:none;margin-bottom:24px;border-color:var(--accent);">
          <h2 style="font-size:16px;margin-bottom:16px;color:var(--accent);">Inject New Asset to Pipeline</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <input type="text" id="new-asset-name" placeholder="Asset Name (e.g. CEO Laptop)" style="padding:10px;border-radius:6px;border:1px solid var(--border);background:var(--bg-app);color:var(--text-primary);">
            <input type="text" id="new-cve" placeholder="Vulnerability (e.g. CVE-2024-1234)" style="padding:10px;border-radius:6px;border:1px solid var(--border);background:var(--bg-app);color:var(--text-primary);">
            <input type="number" id="new-crit" placeholder="Business Criticality (1-10)" min="1" max="10" style="padding:10px;border-radius:6px;border:1px solid var(--border);background:var(--bg-app);color:var(--text-primary);">
            <input type="number" id="new-records" placeholder="Sensitive Records Stored" style="padding:10px;border-radius:6px;border:1px solid var(--border);background:var(--bg-app);color:var(--text-primary);">
            <input type="number" id="new-cost" placeholder="Fix Cost (Lakhs)" style="padding:10px;border-radius:6px;border:1px solid var(--border);background:var(--bg-app);color:var(--text-primary);">
            <select id="new-internet" style="padding:10px;border-radius:6px;border:1px solid var(--border);background:var(--bg-app);color:var(--text-primary);">
                <option value="true">Internet Exposed: Yes</option>
                <option value="false">Internet Exposed: No</option>
            </select>
          </div>
          <button onclick="ExplorerPage.submitAsset(this)" style="margin-top:16px;padding:10px 20px;background:var(--risk-low);color:white;border-radius:8px;font-weight:600;cursor:pointer;">Submit to Data Pipeline</button>
          <p id="add-status" style="margin-top:10px;font-size:12px;color:var(--risk-low);"></p>
        </div>

        <!-- ASSET GRID (Live Data goes here) -->
        <div class="assets-grid" id="live-assets-grid">
           <div style="color:var(--text-muted); grid-column: span 3; text-align: center; padding: 40px;">
              <svg viewBox="0 0 24 24" style="width:24px;height:24px;stroke:currentColor;fill:none;stroke-width:2;margin:0 auto 10px;animation:spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
              Fetching live assets from Neon PostgreSQL...
           </div>
        </div>

        <!-- TOGGLE BUTTONS FOR EXPLORER -->
        <div style="text-align: center; margin-top: 32px; display: flex; justify-content: center; gap: 16px;">
          <button id="toggle-assets-btn" onclick="ExplorerPage.toggleShowAll()" style="padding:10px 24px;background:transparent;color:var(--text-primary);border:2px solid var(--border-strong);border-radius:8px;font-weight:600;cursor:pointer; display:none; transition: all 0.2s;">
            Show All Vulnerabilities
          </button>
          
          <button id="run-ml-btn" onclick="ExplorerPage.runMLClustering()" style="padding:10px 24px;background:var(--accent);color:white;border:2px solid var(--accent);border-radius:8px;font-weight:600;cursor:pointer; display:flex; align-items:center; gap:8px; transition: all 0.2s; box-shadow: 0 4px 12px rgba(46, 90, 172, 0.3);">
            <svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:white;fill:none;stroke-width:2;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            Run ML Clustering
          </button>
        </div>

      </div>
    `;
  },

  toggleAddForm() {
      const form = document.getElementById('add-asset-form');
      form.style.display = form.style.display === 'none' ? 'block' : 'none';
  },

  toggleShowAll() {
      this.showAll = !this.showAll;
      const btn = document.getElementById('toggle-assets-btn');
      
      if (this.showAll) {
          btn.innerText = "Show Top 12 Only";
          btn.style.background = "var(--text-primary)";
          btn.style.color = "var(--bg-app)";
      } else {
          btn.innerText = "Show All Vulnerabilities";
          btn.style.background = "transparent";
          btn.style.color = "var(--text-primary)";
      }
      
      this.renderGrid();
  },

  submitAsset(btn) {
      btn.innerText = "Processing...";
      
      const newAsset = {
          "asset_id": "CUST-" + Math.floor(Math.random() * 1000),
          "asset_name": document.getElementById('new-asset-name').value || "Custom Asset",
          "business_criticality": parseInt(document.getElementById('new-crit').value) || 5,
          "sensitive_data_records": parseInt(document.getElementById('new-records').value) || 0,
          "vulnerability_cve": document.getElementById('new-cve').value || "CUSTOM-VULN",
          "vulnerability_name": "Custom Uploaded Vulnerability",
          "cvss_severity": 8.5,
          "internet_exposed": document.getElementById('new-internet').value === 'true',
          "remediation_cost_lakhs": parseInt(document.getElementById('new-cost').value) || 2,
          "remediation_action": "Apply standard patches"
      };

      fetch('https://sentra-risk.onrender.com/api/add-asset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAsset)
      })
      .then(res => res.json())
      .then(data => {
          document.getElementById('add-status').innerText = "✅ Success! Sent to Data Pipeline. (Will sync to DB in next 30s cycle)";
          btn.innerText = "Submit to Data Pipeline";
          document.getElementById('new-asset-name').value = '';
          document.getElementById('new-cve').value = '';
      });
  },

  deleteAsset(assetId, cve, btnElement) {
      if(!confirm(`Are you sure you want to delete vulnerability ${cve} from ${assetId}?`)) return;
      
      const card = btnElement.closest('.asset-card');
      if(card) card.style.display = 'none';

      fetch('https://sentra-risk.onrender.com/api/delete-asset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ asset_id: assetId, vulnerability_cve: cve })
      })
      .then(res => res.json())
      .then(data => {
          console.log("Deleted from backend successfully.");
      });
  },

  init() {
    fetch('https://sentra-risk.onrender.com/api/assets')
      .then(res => res.json())
      .then(data => {
          this.assetsData = data.assets;
          document.getElementById('toggle-assets-btn').style.display = 'inline-block';
          this.renderGrid();
      })
      .catch(err => {
          document.getElementById('live-assets-grid').innerHTML = '<div style="color:var(--risk-critical); grid-column: span 3; text-align: center;">Error fetching live data. Ensure app.py is running.</div>';
      });
  },

  renderGrid() {
      const grid = document.getElementById('live-assets-grid');
      grid.innerHTML = ''; 
      
      const displayAssets = this.showAll ? this.assetsData : this.assetsData.slice(0, 12);
      
      displayAssets.forEach(dbAsset => {
          let level = 'low';
          if (dbAsset.expected_monthly_loss_lakhs > 50) level = 'critical';
          else if (dbAsset.expected_monthly_loss_lakhs > 10) level = 'high';
          else if (dbAsset.expected_monthly_loss_lakhs > 2) level = 'medium';

          const ealCr = (dbAsset.expected_monthly_loss_lakhs / 100).toFixed(2);
          const impCr = (dbAsset.financial_impact_lakhs / 100).toFixed(2);
          const probPct = Math.round(dbAsset.probability_of_attack_per_month * 100);

          const cardHTML = `
            <div class="asset-card">
              <div class="asset-card-top">
                <div style="flex:1;min-width:0;">
                  <div class="d-flex align-center gap-3" style="margin-bottom:8px;">
                    <div class="asset-card-icon">
                      <svg viewBox="0 0 24 24"><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse></svg>
                    </div>
                    <div>
                      <div class="asset-card-name">${dbAsset.asset_name}</div>
                      <div class="asset-card-category">${dbAsset.asset_id}</div>
                    </div>
                  </div>
                </div>
                
                <div style="display:flex; gap:8px; align-items:center;">
                  <span class="severity-badge ${level}">${level}</span>
                  
                  <!-- THE TRASH CAN BUTTON -->
                  <button onclick="ExplorerPage.deleteAsset('${dbAsset.asset_id}', '${dbAsset.vulnerability_cve}', this)" style="background:transparent; border:none; cursor:pointer; color:var(--text-muted); transition:color 0.2s;" onmouseover="this.style.color='var(--risk-critical)'" onmouseout="this.style.color='var(--text-muted)'" title="Delete Asset">
                    <svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                  
                </div>
              </div>

              <div style="display:flex;flex-direction:column;gap:8px;">
                <div class="d-flex align-center justify-between" style="font-size:11px;font-weight:500;color:var(--text-muted);">
                  <span>Breach Likelihood</span>
                  <span style="font-weight:700;color:var(--risk-${level});">${probPct}%</span>
                </div>
                <div class="asset-card-bar">
                  <div class="asset-card-bar-fill" style="width:${probPct}%;background:var(--risk-${level});"></div>
                </div>
              </div>

              <div class="asset-card-stats">
                <div class="stat-mini">
                  <span class="stat-mini-label">EAL</span>
                  <span class="stat-mini-value">₹${ealCr} Cr</span>
                </div>
                <div class="stat-mini">
                  <span class="stat-mini-label">Vulnerability</span>
                  <span class="stat-mini-value" style="font-size:10px; color:var(--text-secondary); margin-top:4px;">${dbAsset.vulnerability_cve}</span>
                </div>
                <div class="stat-mini">
                  <span class="stat-mini-label">Impact</span>
                  <span class="stat-mini-value">₹${impCr} Cr</span>
                </div>
                <div class="stat-mini">
                  <span class="stat-mini-label">Fix Cost</span>
                  <span class="stat-mini-value">₹${dbAsset.remediation_cost_lakhs}L</span>
                </div>
              </div>
            </div>
          `;
          grid.innerHTML += cardHTML;
      });
  },

  // ==========================================
  // ML CLUSTERING FUNCTION
  // ==========================================
  runMLClustering() {
      const btn = document.getElementById('run-ml-btn');
      btn.innerHTML = 'Running K-Means Model...';
      
      fetch('https://sentra-risk.onrender.com/api/ml-clusters') 
      .then(res => res.json())
      .then(data => {
          this.assetsData = data.assets;
          
          // Sort so Tier 1 is at the top!
          this.assetsData.sort((a, b) => a.ml_prediction.tier.localeCompare(b.ml_prediction.tier));
          
          btn.innerHTML = '✅ Clustering Complete';
          btn.style.background = 'var(--risk-low)';
          btn.style.borderColor = 'var(--risk-low)';
          
          // Render the grid with the new ML tags
          const grid = document.getElementById('live-assets-grid');
          grid.innerHTML = `<div style="grid-column: span 3; padding: 15px; background:var(--accent-subtle); color:var(--accent); border-radius:8px; margin-bottom:10px; font-weight:600;">🧠 AI Engine applied Unsupervised K-Means clustering across 3 dimensions (CVSS, Impact, Probability).</div>`;
          
          this.assetsData.forEach(dbAsset => {
              const ealCr = (dbAsset.expected_monthly_loss_lakhs / 100).toFixed(2);
              const mlTier = dbAsset.ml_prediction.tier;
              const mlColor = dbAsset.ml_prediction.color;

              grid.innerHTML += `
                <div class="asset-card" style="border: 2px solid var(--risk-${mlColor}-border);">
                  <div class="asset-card-top">
                    <div>
                      <div class="asset-card-name">${dbAsset.asset_name}</div>
                      <div class="severity-badge ${mlColor}" style="margin-top:8px;">${mlTier}</div>
                    </div>
                    <!-- TRASH CAN BUTTON FOR ML VIEW -->
                    <button onclick="ExplorerPage.deleteAsset('${dbAsset.asset_id}', '${dbAsset.vulnerability_cve}', this)" style="background:transparent; border:none; cursor:pointer; color:var(--text-muted); transition:color 0.2s;" onmouseover="this.style.color='var(--risk-critical)'" onmouseout="this.style.color='var(--text-muted)'" title="Delete Asset">
                      <svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </div>
                  <div class="asset-card-stats" style="margin-top:16px;">
                    <div class="stat-mini">
                      <span class="stat-mini-label">EAL</span>
                      <span class="stat-mini-value">₹${ealCr} Cr</span>
                    </div>
                    <div class="stat-mini">
                      <span class="stat-mini-label">Vulnerability</span>
                      <span class="stat-mini-value" style="font-size:10px;">${dbAsset.vulnerability_cve}</span>
                    </div>
                  </div>
                </div>
              `;
          });
      })
      .catch(err => alert("ML Engine Error: Ensure your Python API is running correctly."));
  }
};