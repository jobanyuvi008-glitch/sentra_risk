/* ==============================================
   PAGES/OPTIMIZER.JS — Investment Optimizer
   ============================================== */

const OptimizerPage = {

  render() {
    return `
      <div class="page">
        <div class="page-header">
          <h1 class="page-title">Investment Optimizer</h1>
          <p class="page-subtitle">Enter a security budget to find the optimal combination of controls that maximises risk reduction and ROSI.</p>
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
              <input
                type="number"
                class="budget-input"
                id="budget-input"
                placeholder="e.g. 25"
                min="1"
                max="10000"
                value=""
              />
              <span class="budget-input-suffix">Lakhs</span>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <button class="optimize-btn" id="optimize-btn">
              <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Optimize
            </button>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              ${[8, 15, 25, 48, 73].map(v => `
                <button
                  class="action-meta-pill"
                  style="cursor:pointer;border:1px solid var(--border);background:var(--bg-app);border-radius:100px;padding:4px 10px;font-size:11px;font-weight:500;color:var(--text-secondary);transition:all 0.15s ease;"
                  data-quick="${v}"
                  onmouseenter="this.style.borderColor='var(--accent)';this.style.color='var(--accent)';"
                  onmouseleave="this.style.borderColor='var(--border)';this.style.color='var(--text-secondary)';"
                >₹${v}L</button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Results -->
        <div id="optimizer-results">
          <div class="card" style="padding:60px 24px;text-align:center;">
            <svg viewBox="0 0 24 24" style="width:40px;height:40px;stroke:var(--text-muted);fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;margin:0 auto 14px;">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <div style="font-size:14px;font-weight:600;color:var(--text-secondary);">Enter a budget to see recommendations</div>
            <div style="font-size:12.5px;color:var(--text-muted);margin-top:6px;line-height:1.5;max-width:320px;margin-left:auto;margin-right:auto;">
              The optimizer will find the best combination of security controls within your budget, ranked by Return on Security Investment (ROSI).
            </div>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    const btn      = document.getElementById('optimize-btn');
    const inputEl  = document.getElementById('budget-input');

    btn.addEventListener('click', () => this.runOptimize());

    inputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter') this.runOptimize();
    });

    // Quick-select buttons
    document.querySelectorAll('[data-quick]').forEach(qBtn => {
      qBtn.addEventListener('click', () => {
        inputEl.value = qBtn.dataset.quick;
        this.runOptimize();
      });
    });
  },

  runOptimize() {
    const inputEl  = document.getElementById('budget-input');
    const resultsEl = document.getElementById('optimizer-results');
    const budgetLakhs = parseFloat(inputEl.value);

    if (!budgetLakhs || budgetLakhs <= 0) {
      inputEl.focus();
      inputEl.style.borderColor = 'var(--risk-critical)';
      setTimeout(() => { inputEl.style.borderColor = ''; }, 1500);
      return;
    }

    const actions = SENTRA_DATA.scenarios.actions;
    const baseEAL = SENTRA_DATA.scenarios.baseEALCr;

    // Find all combinations within budget (brute force — only 5 actions = 31 combos)
    const n = actions.length;
    let allCombos = [];

    for (let mask = 1; mask < (1 << n); mask++) {
      let cost = 0;
      let ealRed = 0;
      let combo = [];
      for (let i = 0; i < n; i++) {
        if (mask & (1 << i)) {
          cost += actions[i].costLakhs;
          ealRed += actions[i].ealReductionCr;
          combo.push(actions[i]);
        }
      }
      if (cost <= budgetLakhs) {
        const ealRedCapped = Math.min(ealRed, baseEAL * 0.96);
        const afterEAL = Math.max(baseEAL - ealRedCapped, 0.10);
        const rosi = cost > 0 ? (ealRedCapped * 100 / cost) : 0;
        allCombos.push({ combo, cost, ealRed: ealRedCapped, afterEAL, rosi });
      }
    }

    // Sort by EAL reduction (descending), take top 6
    allCombos.sort((a, b) => b.ealRed - a.ealRed || b.rosi - a.rosi);
    const topCombos = allCombos.slice(0, 6);

    if (topCombos.length === 0) {
      resultsEl.innerHTML = `
        <div class="card" style="padding:48px 24px;text-align:center;">
          <svg viewBox="0 0 24 24" style="width:36px;height:36px;stroke:var(--text-muted);fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;margin:0 auto 12px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div style="font-size:14px;font-weight:600;color:var(--text-secondary);">Budget too low for any action</div>
          <div style="font-size:12.5px;color:var(--text-muted);margin-top:6px;">The minimum effective budget is ₹5L (Security Awareness Training). Try increasing your budget.</div>
        </div>
      `;
      return;
    }

    const best = topCombos[0];
    const reductionPct = ((best.ealRed / baseEAL) * 100).toFixed(0);

    // Render summary callout
    const summaryHTML = `
      <div class="optimizer-summary" style="margin-bottom:20px;">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <div>
          <strong>Best combination</strong> reduces EAL by ₹${best.ealRed.toFixed(2)} Cr (${reductionPct}% reduction)
          at ₹${best.cost}L investment — <strong>ROSI: ${best.rosi.toFixed(1)}×</strong>.
          New EAL: ₹${best.afterEAL.toFixed(2)} Cr (down from ₹${baseEAL.toFixed(2)} Cr).
        </div>
      </div>
    `;

    // Render results table
    const rowsHTML = topCombos.map((combo, idx) => {
      const isRecommended = idx === 0;
      const reductionPct = ((combo.ealRed / baseEAL) * 100).toFixed(0);
      const actionNames = combo.combo.map(a => a.name).join(', ');

      return `
        <tr class="${isRecommended ? 'recommended-row' : ''}">
          <td class="reco-name-cell">
            ${actionNames}
            ${isRecommended ? '<span class="recommended-badge">★ Recommended</span>' : ''}
          </td>
          <td style="font-weight:600;color:var(--text-primary);">₹${combo.cost}L</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="flex:1;height:4px;background:var(--bg-hover);border-radius:2px;min-width:60px;max-width:100px;">
                <div style="height:100%;border-radius:2px;background:var(--risk-low);width:${Math.min(reductionPct, 100)}%;"></div>
              </div>
              <span style="font-weight:600;color:var(--risk-low);font-variant-numeric:tabular-nums;">${reductionPct}%</span>
            </div>
          </td>
          <td style="font-weight:600;color:var(--text-primary);">₹${combo.afterEAL.toFixed(2)} Cr</td>
          <td class="rosi-value">${combo.rosi.toFixed(1)}×</td>
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
                <th>Security Controls</th>
                <th>Investment</th>
                <th>Risk Reduction</th>
                <th>EAL After</th>
                <th>ROSI</th>
              </tr>
            </thead>
            <tbody>${rowsHTML}</tbody>
          </table>
        </div>
      </div>

      <!-- Budget Slider hint -->
      <div style="margin-top:16px;font-size:12px;color:var(--text-muted);display:flex;align-items:center;gap:8px;">
        <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Showing top ${topCombos.length} combinations within ₹${budgetLakhs}L budget. ROSI = EAL reduction ÷ cost. All ${actions.length} available controls considered.
      </div>
    `;
  },
};
