/* ==============================================
   PAGES/OPTIMIZER.JS — Live Investment Optimizer + Tech Details
   ============================================== */

const OptimizerPage = {
  baseEAL: 0,

  render() {
    return `
      <div class="page">
        <div class="page-header">
          <h1 class="page-title">Live AI Budget Optimizer</h1>
          <p class="page-subtitle">Powered by the Python 0/1 Knapsack Algorithm running on your live database.</p>
        </div>

        <!-- Budget Input Form -->
        <div class="budget-form" style="margin-bottom:24px;">
          <div class="budget-form-group">
            <div>
              <div class="budget-form-label">Security Investment Budget</div>
              <div class="budget-form-sublabel">Enter amount in Indian Rupee Lakhs (₹L)</div>
            </div>
            <div class="budget-input-wrap">
              <span class="budget-input-prefix">₹</span>
              <input type="number" class="budget-input" id="budget-input" placeholder="e.g. 15" min="1" max="10000" />
              <span class="budget-input-suffix">Lakhs</span>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <button class="optimize-btn" id="optimize-btn">
              <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Optimize Budget
            </button>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              ${[5, 15, 25, 50].map(v => `
                <button class="action-meta-pill" style="cursor:pointer;border:1px solid var(--border);background:var(--bg-app);border-radius:100px;padding:4px 10px;font-size:11px;font-weight:500;color:var(--text-secondary);" data-quick="${v}">₹${v}L</button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Results Table Container -->
        <div id="optimizer-results">
          <div class="card" style="padding:60px 24px;text-align:center;">
            <svg viewBox="0 0 24 24" style="width:40px;height:40px;stroke:var(--text-muted);fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;margin:0 auto 14px;">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <div style="font-size:14px;font-weight:600;color:var(--text-secondary);">Enter a budget to run the AI Knapsack Engine</div>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    // Get Base EAL from Live Dashboard API for progress bar math
    fetch('https://sentra-risk-backend.onrender.com/api/dashboard')
      .then(res => res.json())
      .then(data => { this.baseEAL = data.total_enterprise_risk_lakhs; });

    const btn = document.getElementById('optimize-btn');
    const inputEl = document.getElementById('budget-input');

    btn.addEventListener('click', () => this.runOptimize());
    inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') this.runOptimize(); });

    document.querySelectorAll('[data-quick]').forEach(qBtn => {
      qBtn.addEventListener('click', () => {
        inputEl.value = qBtn.dataset.quick;
        this.runOptimize();
      });
    });
  },

  runOptimize() {
    const inputEl = document.getElementById('budget-input');
    const resultsEl = document.getElementById('optimizer-results');
    const budgetLakhs = parseFloat(inputEl.value);

    if (!budgetLakhs || budgetLakhs <= 0) return;

    resultsEl.innerHTML = '<div style="text-align:center; padding: 40px; color:var(--text-muted);">Running Knapsack Algorithm...</div>';

    fetch(`https://sentra-risk-backend.onrender.com/api/optimize/${budgetLakhs}`)
      .then(res => res.json())
      .then(data => {
        if (!data.recommended_actions || data.recommended_actions.length === 0) {
          resultsEl.innerHTML = `<div class="card" style="padding:40px; text-align:center; color:var(--risk-high);">Budget too low to fix any vulnerabilities!</div>`;
          return;
        }

        const totalRosi = data.budget_spent_lakhs > 0 ? (data.max_risk_reduced_lakhs / data.budget_spent_lakhs).toFixed(1) : 0;
        const totalReductionPct = this.baseEAL > 0 ? ((data.max_risk_reduced_lakhs / this.baseEAL) * 100).toFixed(1) : 0;

        // Render Summary Callout
        const summaryHTML = `
          <div class="optimizer-summary" style="margin-bottom:20px;">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <div>
              <strong>Knapsack Engine Result:</strong> The optimal selection reduces risk by ₹${data.max_risk_reduced_lakhs}L (${totalReductionPct}%)
              using ₹${data.budget_spent_lakhs}L of your ₹${data.budget_provided_lakhs}L budget. <strong>Total ROSI: ${totalRosi}×</strong>
            </div>
          </div>
        `;

        // ==========================================
        // TECHNICAL DICTIONARY FOR SOLUTIONS
        // ==========================================
        const actionDetails = {
            "Update PHP to 7.3.11": "Patches critical Remote Code Execution (RCE) vulnerabilities in the PHP runtime environment, preventing unauthorized server takeover.",
            "Update Log4j to v2.17.1": "Mitigates the Log4Shell zero-day by disabling JNDI lookups, permanently blocking arbitrary code execution via manipulated log messages.",
            "Implement strict MFA policy": "Enforces Time-based One-Time Passwords (TOTP) across identity perimeters, mitigating credential stuffing and lateral network movement.",
            "Apply MS Security Update": "Installs the latest Microsoft Exchange Server cumulative patches to close ProxyLogon vulnerabilities and prevent web shell deployments.",
            "Enable Block Public Access": "Reconfigures Cloud Storage (S3) IAM policies to strictly deny unauthenticated internet access, preventing mass data exfiltration."
        };

        // Render Rows
        const rowsHTML = data.recommended_actions.map((action, idx) => {
          const itemRosi = action.remediation_cost_lakhs > 0 ? (action.expected_monthly_loss_lakhs / action.remediation_cost_lakhs).toFixed(1) : 0;
          const itemPct = this.baseEAL > 0 ? ((action.expected_monthly_loss_lakhs / this.baseEAL) * 100).toFixed(1) : 0;
          
          // Fetch the technical description from our dictionary, or use a default
          const techDescription = actionDetails[action.remediation_action] || "Implements standard cybersecurity controls to mitigate identified exposure and enforce compliance.";
          
          return `
            <tr>
              <td class="reco-name-cell" style="padding-top:16px; padding-bottom:16px; min-width:300px;">
                <div style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:6px;">Target Asset: ${action.asset_name}</div>
                <div style="font-size:14px; font-weight:600; color:var(--text-primary); margin-bottom:4px;">${action.remediation_action}</div>
                <div style="font-size:12px; color:var(--text-secondary); line-height:1.5; padding-right:20px;">${techDescription}</div>
              </td>
              <td style="font-weight:600;color:var(--text-primary);">₹${action.remediation_cost_lakhs}L</td>
              <td>
                <div style="display:flex;align-items:center;gap:8px;">
                  <div style="flex:1;height:4px;background:var(--bg-hover);border-radius:2px;min-width:60px;max-width:100px;">
                    <div style="height:100%;border-radius:2px;background:var(--risk-low);width:${Math.min(itemPct, 100)}%;"></div>
                  </div>
                  <span style="font-weight:600;color:var(--risk-low);font-variant-numeric:tabular-nums;">₹${action.expected_monthly_loss_lakhs.toFixed(1)}L</span>
                </div>
              </td>
              <td class="rosi-value">${itemRosi}×</td>
            </tr>
          `;
        }).join('');

        resultsEl.innerHTML = `
          ${summaryHTML}
          <div class="card" style="overflow:hidden;">
            <div class="reco-table-wrap">
              <table class="reco-table">
                <thead>
                  <tr>
                    <th>Asset & Security Control</th>
                    <th>Investment</th>
                    <th>Risk Eliminated</th>
                    <th>ROSI</th>
                  </tr>
                </thead>
                <tbody>${rowsHTML}</tbody>
              </table>
            </div>
          </div>
        `;
      });
  },
};