/* ==============================================
   PAGES/SIMULATOR.JS — Live Scenario Simulator
   ============================================== */

const SimulatorPage = {
  liveActions: {},
  baseEALCr: 0,
  baseExposureCr: 0,
  checkedActions: new Set(),

  render() {
    return `
      <div class="page">
        <div class="page-header">
          <h1 class="page-title">Live Scenario Simulator</h1>
          <p class="page-subtitle">Select security controls to instantly model the impact on your real-time database financial exposure.</p>
        </div>

        <div class="simulator-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start;">

          <!-- LEFT: Dynamic Action Cards -->
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:12px;display:flex;align-items:center;gap:8px;">
              <svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:var(--accent);fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              Select Security Controls
            </div>
            <div id="actions-list" style="display:flex;flex-direction:column;gap:10px;">
              <div style="color:var(--text-muted); padding: 20px;">Fetching Live Scenarios...</div>
            </div>
          </div>

          <!-- RIGHT: Before / After UI -->
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:12px;display:flex;align-items:center;gap:8px;">
              <svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:var(--accent);fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Live Risk Impact Analysis
            </div>
            <div id="sim-results">
              <div class="card" style="padding:40px 24px;text-align:center;">
                <svg viewBox="0 0 24 24" style="width:36px;height:36px;stroke:var(--text-muted);fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;margin:0 auto 12px;"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                <div style="font-size:13.5px;font-weight:600;color:var(--text-secondary);">Select controls to model impact</div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:6px;line-height:1.5;">Check one or more security actions on the left to see the before/after financial comparison across the entire enterprise.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Investment Summary Bar -->
        <div class="card card-pad" id="investment-bar" style="margin-top:24px;display:none;">
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0;text-align:center;">
            <div style="padding:0 16px;border-right:1px solid var(--border);">
              <div class="label-caps" style="margin-bottom:4px;">Actions Selected</div>
              <div id="inv-count" style="font-size:24px;font-weight:700;color:var(--accent);font-variant-numeric:tabular-nums;letter-spacing:-0.02em;">0</div>
            </div>
            <div style="padding:0 16px;border-right:1px solid var(--border);">
              <div class="label-caps" style="margin-bottom:4px;">Total Cost</div>
              <div id="inv-cost" style="font-size:24px;font-weight:700;color:var(--text-primary);font-variant-numeric:tabular-nums;letter-spacing:-0.02em;">₹0L</div>
            </div>
            <div style="padding:0 16px;border-right:1px solid var(--border);">
              <div class="label-caps" style="margin-bottom:4px;">Risk Reduced</div>
              <div id="inv-eal-red" style="font-size:24px;font-weight:700;color:var(--risk-low);font-variant-numeric:tabular-nums;letter-spacing:-0.02em;">₹0 Cr</div>
            </div>
            <div style="padding:0 16px;">
              <div class="label-caps" style="margin-bottom:4px;">Avg ROSI</div>
              <div id="inv-rosi" style="font-size:24px;font-weight:700;color:var(--risk-low);font-variant-numeric:tabular-nums;letter-spacing:-0.02em;">—</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    this.checkedActions = new Set();
    
    // FETCH ALL LIVE DATA (Not just Top 12!)
    fetch('https://sentra-risk.onrender.com/api/assets')
      .then(res => res.json())
      .then(data => {
         this.baseEALCr = data.total_enterprise_risk_lakhs / 100;
         this.baseExposureCr = this.baseEALCr * 3.5; 
         
         // Group ALL assets by exact remediation_action to create the cards
         this.liveActions = {};
         data.assets.forEach(asset => {
             const action = asset.remediation_action;
             if (!this.liveActions[action]) {
                 this.liveActions[action] = { id: action, name: action, costLakhs: 0, riskSavedLakhs: 0, instances: 0 };
             }
             this.liveActions[action].costLakhs += asset.remediation_cost_lakhs;
             this.liveActions[action].riskSavedLakhs += asset.expected_monthly_loss_lakhs;
             this.liveActions[action].instances += 1;
         });

         this.renderCards();
      });
  },

  renderCards() {
    const listEl = document.getElementById('actions-list');
    listEl.innerHTML = '';

    // Sort actions by most risk saved
    const sortedActions = Object.values(this.liveActions).sort((a, b) => b.riskSavedLakhs - a.riskSavedLakhs);

    sortedActions.forEach(action => {
      const cardHTML = `
        <div class="action-card" data-action-id="${action.id}" style="cursor:pointer;">
          <div class="action-checkbox">
            <svg class="action-checkbox-check" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="action-card-body">
            <div class="action-card-name">${action.name}</div>
            <div class="action-card-desc">Applying this fix will secure ${action.instances} vulnerable assets across the network.</div>
            <div class="action-card-meta">
              <span class="action-meta-pill">₹${action.costLakhs}L cost</span>
              <span class="action-meta-pill" style="color:var(--risk-low);">−₹${(action.riskSavedLakhs/100).toFixed(2)} Cr EAL</span>
            </div>
          </div>
        </div>
      `;
      listEl.innerHTML += cardHTML;
    });

    // Re-bind click events
    document.querySelectorAll('.action-card').forEach(card => {
      card.addEventListener('click', () => {
        const actionId = card.dataset.actionId;
        if (this.checkedActions.has(actionId)) {
          this.checkedActions.delete(actionId);
          card.classList.remove('checked');
        } else {
          this.checkedActions.add(actionId);
          card.classList.add('checked');
        }
        this.updateResults();
      });
    });
  },

  updateResults() {
    const resultsEl = document.getElementById('sim-results');
    const investBar = document.getElementById('investment-bar');

    if (this.checkedActions.size === 0) {
      resultsEl.innerHTML = `
        <div class="card" style="padding:40px 24px;text-align:center;">
          <svg viewBox="0 0 24 24" style="width:36px;height:36px;stroke:var(--text-muted);fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;margin:0 auto 12px;"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          <div style="font-size:13.5px;font-weight:600;color:var(--text-secondary);">Current Live Exposure: ₹${this.baseEALCr.toFixed(2)} Cr</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:6px;line-height:1.5;">Check one or more security actions on the left to see the before/after financial comparison across the entire enterprise.</div>
        </div>
      `;
      investBar.style.display = 'none';
      return;
    }

    let totalCostLakhs = 0;
    let totalEalReductionLakhs = 0;

    this.checkedActions.forEach(actionId => {
      totalCostLakhs += this.liveActions[actionId].costLakhs;
      totalEalReductionLakhs += this.liveActions[actionId].riskSavedLakhs;
    });

    const totalEALReductionCr = totalEalReductionLakhs / 100;
    
    // We use Math.max(0, ...) so if they check all boxes, it safely hits ₹0.00 Cr
    const afterEALCr = Math.max(this.baseEALCr - totalEALReductionCr, 0.00);
    const reductionPct = ((totalEALReductionCr / this.baseEALCr) * 100).toFixed(1);
    
    const afterExposureCr = Math.max(this.baseExposureCr * (1 - (reductionPct / 100)), 0.00); 
    const afterLikelihood = Math.max(64 - reductionPct, 0);
    const rosi = totalCostLakhs > 0 ? (totalEalReductionLakhs / totalCostLakhs).toFixed(1) : '—';

    // Original Beautiful Before / After Render
    resultsEl.innerHTML = `
      <div class="reduction-callout" style="margin-bottom:16px;">
        <div class="reduction-callout-left">
          <div class="reduction-callout-title">Risk Reduced By</div>
          <div class="reduction-callout-sub">Live EAL: ₹${this.baseEALCr.toFixed(2)} Cr &rarr; ₹${afterEALCr.toFixed(2)} Cr</div>
          <div class="reduction-callout-sub" style="font-size:12px;color:var(--text-muted);">Investment: ₹${totalCostLakhs}L &nbsp;·&nbsp; ROSI: ${rosi}×</div>
        </div>
        <div class="reduction-callout-number">${reductionPct}%</div>
      </div>

      <div class="before-after-grid">
        <!-- BEFORE -->
        <div class="before-after-card">
          <div class="ba-header">
            <div class="ba-dot"></div><span class="ba-label">BEFORE</span>
          </div>
          <div class="ba-metrics">
            <div class="ba-metric">
              <div class="ba-metric-label">BREACH LIKELIHOOD</div>
              <div class="ba-metric-value">64%</div>
            </div>
            <div class="ba-metric">
              <div class="ba-metric-label">MAX EXPOSURE</div>
              <div class="ba-metric-value">₹${this.baseExposureCr.toFixed(1)} Cr</div>
            </div>
            <div class="ba-metric">
              <div class="ba-metric-label">EXPECTED LOSS</div>
              <div class="ba-metric-value">₹${this.baseEALCr.toFixed(2)} Cr</div>
            </div>
          </div>
        </div>

        <!-- AFTER -->
        <div class="before-after-card after">
          <div class="ba-header">
            <div class="ba-dot after-dot"></div><span class="ba-label after-label">AFTER</span>
          </div>
          <div class="ba-metrics">
            <div class="ba-metric">
              <div class="ba-metric-label">BREACH LIKELIHOOD</div>
              <div class="ba-metric-value after-value">${afterLikelihood.toFixed(0)}%</div>
            </div>
            <div class="ba-metric">
              <div class="ba-metric-label">MAX EXPOSURE</div>
              <div class="ba-metric-value after-value">₹${afterExposureCr.toFixed(1)} Cr</div>
            </div>
            <div class="ba-metric">
              <div class="ba-metric-label">EXPECTED LOSS</div>
              <div class="ba-metric-value after-value">₹${afterEALCr.toFixed(2)} Cr</div>
            </div>
          </div>
        </div>
      </div>
    `;

    investBar.style.display = 'block';
    document.getElementById('inv-count').textContent = this.checkedActions.size;
    document.getElementById('inv-cost').textContent = `₹${totalCostLakhs}L`;
    document.getElementById('inv-eal-red').textContent = `₹${totalEALReductionCr.toFixed(2)} Cr`;
    document.getElementById('inv-rosi').textContent = `${rosi}×`;
  },
};