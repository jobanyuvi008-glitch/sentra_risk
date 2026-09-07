/* ==============================================
   PAGES/EXPLORER.JS — Risk Explorer + Add Asset
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
          <button onclick="ExplorerPage.submitAsset()" style="margin-top:16px;padding:10px 20px;background:var(--risk-low);color:white;border-radius:8px;font-weight:600;cursor:pointer;">Submit to Data Pipeline</button>
          <p id="add-status" style="margin-top:10px;font-size:12px;color:var(--risk-low);"></p>
        </div>

        <!-- ASSET GRID (Live Data goes here) -->
        <div class="assets-grid" id="live-assets-grid">
           <div style="color:var(--text-muted); grid-column: span 3; text-align: center; padding: 40px;">
              <svg viewBox="0 0 24 24" style="width:24px;height:24px;stroke:currentColor;fill:none;stroke-width:2;margin:0 auto 10px;animation:spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
              Fetching live assets from Neon PostgreSQL...
           </div>
        </div>

        <!-- TOGGLE BUTTON FOR ALL ASSETS -->
        <div style="text-align: center; margin-top: 32px;">
          <button id="toggle-assets-btn" onclick="ExplorerPage.toggleShowAll()" style="padding:10px 24px;background:transparent;color:var(--accent);border:2px solid var(--accent);border-radius:8px;font-weight:600;cursor:pointer;display:none; transition: all 0.2s;">
            Show All Vulnerabilities
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
      
      // Animate button color
      if (this.showAll) {
          btn.innerText = "Show Top 12 Only";
          btn.style.background = "var(--accent)";
          btn.style.color = "white";
      } else {
          btn.innerText = "Show All Vulnerabilities";
          btn.style.background = "transparent";
          btn.style.color = "var(--accent)";
      }
      
      this.renderGrid();
  },

  submitAsset() {
      const btn = event.target;
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

      fetch('http://127.0.0.1:5000/api/add-asset', {
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

  init() {
    // Fetch ALL Live Assets from our new API
    fetch('http://127.0.0.1:5000/api/assets')
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
      
      // If showAll is false, slice the top 12. If true, show everything!
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
                <span class="severity-badge ${level}">${level}</span>
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
  }
};