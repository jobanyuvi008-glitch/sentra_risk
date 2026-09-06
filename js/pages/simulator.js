/* ==============================================
   PAGES/SIMULATOR.JS — Scenario Simulator
   ============================================== */

const SimulatorPage = {
  checkedActions: new Set(),

  render() {
    const s = SENTRA_DATA.scenarios;
    const actionsHTML = s.actions.map(a => renderActionCard(a, false)).join('');

    return `
      <div class="page">
        <div class="page-header">
          <h1 class="page-title">Scenario Simulator</h1>
          <p class="page-subtitle">Select security controls to instantly model the impact on your financial risk exposure.</p>
        </div>

        <div class="simulator-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start;">

          <!-- LEFT: Actions -->
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:12px;display:flex;align-items:center;gap:8px;">
              <svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:var(--accent);fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              Select Security Controls
            </div>
            <div id="actions-list" style="display:flex;flex-direction:column;gap:10px;">
              ${actionsHTML}
            </div>
          </div>

          <!-- RIGHT: Before / After -->
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:12px;display:flex;align-items:center;gap:8px;">
              <svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:var(--accent);fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Risk Impact Analysis
            </div>
            <div id="sim-results">
              <div class="card" style="padding:40px 24px;text-align:center;">
                <svg viewBox="0 0 24 24" style="width:36px;height:36px;stroke:var(--text-muted);fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;margin:0 auto 12px;"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                <div style="font-size:13.5px;font-weight:600;color:var(--text-secondary);">Select controls to model impact</div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:6px;line-height:1.5;">Check one or more security actions on the left to see the before/after financial comparison.</div>
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
              <div class="label-caps" style="margin-bottom:4px;">Total Investment</div>
              <div id="inv-cost" style="font-size:24px;font-weight:700;color:var(--text-primary);font-variant-numeric:tabular-nums;letter-spacing:-0.02em;">₹0L</div>
            </div>
            <div style="padding:0 16px;border-right:1px solid var(--border);">
              <div class="label-caps" style="margin-bottom:4px;">EAL Reduction</div>
              <div id="inv-eal-red" style="font-size:24px;font-weight:700;color:var(--risk-low);font-variant-numeric:tabular-nums;letter-spacing:-0.02em;">₹0 Cr</div>
            </div>
            <div style="padding:0 16px;">
              <div class="label-caps" style="margin-bottom:4px;">ROSI</div>
              <div id="inv-rosi" style="font-size:24px;font-weight:700;color:var(--risk-low);font-variant-numeric:tabular-nums;letter-spacing:-0.02em;">—</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    this.checkedActions = new Set();
    this.bindEvents();
  },

  bindEvents() {
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
    const s = SENTRA_DATA.scenarios;
    const selected = s.actions.filter(a => this.checkedActions.has(a.id));
    const resultsEl = document.getElementById('sim-results');
    const investBar = document.getElementById('investment-bar');

    if (selected.length === 0) {
      resultsEl.innerHTML = `
        <div class="card" style="padding:40px 24px;text-align:center;">
          <svg viewBox="0 0 24 24" style="width:36px;height:36px;stroke:var(--text-muted);fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;margin:0 auto 12px;"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          <div style="font-size:13.5px;font-weight:600;color:var(--text-secondary);">Select controls to model impact</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:6px;line-height:1.5;">Check one or more security actions on the left to see the before/after financial comparison.</div>
        </div>
      `;
      if (investBar) investBar.style.display = 'none';
      return;
    }

    // Compute deltas (cap at reasonable values)
    const totalEALReduction = Math.min(
      selected.reduce((sum, a) => sum + a.ealReductionCr, 0),
      s.baseEALCr * 0.96
    );
    const totalLikelihoodReduction = Math.min(
      selected.reduce((sum, a) => sum + a.likelihoodReductionPct, 0),
      55
    );
    const totalImpactReduction = Math.min(
      selected.reduce((sum, a) => sum + a.impactReductionPct, 0),
      50
    );
    const totalCostLakhs = selected.reduce((sum, a) => sum + a.costLakhs, 0);

    const afterEAL       = Math.max(s.baseEALCr - totalEALReduction, 0.10);
    const afterLikelihood = Math.max(s.baseLikelihood - totalLikelihoodReduction, 8);
    const afterExposure   = Math.max(s.baseExposureCr * (1 - totalImpactReduction / 100), 1);
    const reductionPct    = ((totalEALReduction / s.baseEALCr) * 100).toFixed(0);
    const rosi            = totalCostLakhs > 0
      ? (totalEALReduction * 100 / totalCostLakhs).toFixed(1)
      : '—';

    // Clamp afterLikelihood display
    const displayAfterLikelihood = afterLikelihood.toFixed(0);

    resultsEl.innerHTML = `
      <!-- Reduction Callout -->
      <div class="reduction-callout" style="margin-bottom:16px;">
        <div class="reduction-callout-left">
          <div class="reduction-callout-title">Risk Reduced By</div>
          <div class="reduction-callout-sub">EAL: ₹${s.baseEALCr.toFixed(2)} Cr &rarr; ₹${afterEAL.toFixed(2)} Cr</div>
          <div class="reduction-callout-sub" style="font-size:12px;color:var(--text-muted);">Investment: ₹${totalCostLakhs}L &nbsp;·&nbsp; ROSI: ${rosi}×</div>
        </div>
        <div class="reduction-callout-number">${reductionPct}%</div>
      </div>

      <!-- Before / After Cards -->
      <div class="before-after-grid">
        <!-- BEFORE -->
        <div class="before-after-card">
          <div class="ba-header">
            <div class="ba-dot"></div>
            <span class="ba-label">BEFORE</span>
          </div>
          <div class="ba-metrics">
            <div class="ba-metric">
              <div class="ba-metric-label">BREACH LIKELIHOOD</div>
              <div class="ba-metric-value">${s.baseLikelihood}%</div>
            </div>
            <div class="ba-metric">
              <div class="ba-metric-label">FINANCIAL EXPOSURE</div>
              <div class="ba-metric-value">₹${s.baseExposureCr.toFixed(1)} Cr</div>
            </div>
            <div class="ba-metric">
              <div class="ba-metric-label">EXPECTED ANNUAL LOSS</div>
              <div class="ba-metric-value">₹${s.baseEALCr.toFixed(2)} Cr</div>
            </div>
          </div>
        </div>

        <!-- AFTER -->
        <div class="before-after-card after">
          <div class="ba-header">
            <div class="ba-dot after-dot"></div>
            <span class="ba-label after-label">AFTER</span>
          </div>
          <div class="ba-metrics">
            <div class="ba-metric">
              <div class="ba-metric-label">BREACH LIKELIHOOD</div>
              <div class="ba-metric-value after-value">${displayAfterLikelihood}%</div>
            </div>
            <div class="ba-metric">
              <div class="ba-metric-label">FINANCIAL EXPOSURE</div>
              <div class="ba-metric-value after-value">₹${afterExposure.toFixed(1)} Cr</div>
            </div>
            <div class="ba-metric">
              <div class="ba-metric-label">EXPECTED ANNUAL LOSS</div>
              <div class="ba-metric-value after-value">₹${afterEAL.toFixed(2)} Cr</div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Investment summary bar
    if (investBar) {
      investBar.style.display = 'block';
      document.getElementById('inv-count').textContent = selected.length;
      document.getElementById('inv-cost').textContent = `₹${totalCostLakhs}L`;
      document.getElementById('inv-eal-red').textContent = `₹${totalEALReduction.toFixed(2)} Cr`;
      document.getElementById('inv-rosi').textContent = `${rosi}×`;
    }
  },
};
