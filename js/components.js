/* ==============================================
   COMPONENTS.JS — Reusable Render Functions
   ============================================== */

/* ——— Severity Badge HTML ——— */
function renderSeverityBadge(level) {
  const labels = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };
  return `<span class="severity-badge ${level}">${labels[level] || level}</span>`;
}

/* ——— Metric Trend HTML ——— */
function renderTrend(value, isGoodDown = true) {
  const num = parseFloat(value);
  const isUp = num > 0;
  const isGood = isGoodDown ? !isUp : isUp;
  const cls = isGood ? 'down' : 'up';
  const icon = isUp
    ? `<svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`
    : `<svg viewBox="0 0 24 24"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>`;
  return `<span class="metric-trend ${cls}">${icon}${value}</span>`;
}

/* ——— Metric Card HTML ——— */
function renderMetricCard({ id, label, value, valueSuffix = '', subText, trend, sparklineId, valueClass = '' }) {
  return `
    <div class="metric-card" id="${id || ''}">
      <div class="metric-card-label">${label}</div>
      <div class="metric-card-value ${valueClass}">
        ${value}<span style="font-size:0.55em;font-weight:600;letter-spacing:0;opacity:0.75;margin-left:2px;">${valueSuffix}</span>
      </div>
      <div class="metric-card-sub">
        ${subText || ''}
        ${trend ? renderTrend(trend) : ''}
      </div>
      ${sparklineId ? `<div class="sparkline-wrap"><canvas id="${sparklineId}"></canvas></div>` : ''}
    </div>
  `;
}

/* ——— Asset Card HTML ——— */
function renderAssetCard(asset) {
  const icons = {
    'credit-card': `<svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
    'database':    `<svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
    'globe':       `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    'users':       `<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    'mail':        `<svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  };

  const levelColors = {
    critical: 'var(--risk-critical)',
    high:     'var(--risk-high)',
    medium:   'var(--risk-medium)',
    low:      'var(--risk-low)',
  };

  const barColor = levelColors[asset.level] || 'var(--accent)';
  const likelihoodWidth = asset.likelihoodPct;

  return `
    <div class="asset-card" data-asset-id="${asset.id}" id="asset-card-${asset.id}">
      <div class="asset-card-top">
        <div style="flex:1;min-width:0;">
          <div class="d-flex align-center gap-3" style="margin-bottom:8px;">
            <div class="asset-card-icon">
              ${icons[asset.icon] || icons['database']}
            </div>
            <div>
              <div class="asset-card-name">${asset.name}</div>
              <div class="asset-card-category">${asset.category}</div>
            </div>
          </div>
        </div>
        ${renderSeverityBadge(asset.level)}
      </div>

      <div style="display:flex;flex-direction:column;gap:8px;">
        <div class="d-flex align-center justify-between" style="font-size:11px;font-weight:500;color:var(--text-muted);">
          <span>Breach Likelihood</span>
          <span style="font-weight:700;color:${barColor};font-variant-numeric:tabular-nums;">${asset.likelihoodPct}%</span>
        </div>
        <div class="asset-card-bar">
          <div class="asset-card-bar-fill" style="width:${likelihoodWidth}%;background:${barColor};"></div>
        </div>
      </div>

      <div class="asset-card-stats">
        <div class="stat-mini">
          <span class="stat-mini-label">EAL</span>
          <span class="stat-mini-value">₹${asset.ealCr.toFixed(2)} Cr</span>
        </div>
        <div class="stat-mini">
          <span class="stat-mini-label">Critical CVEs</span>
          <span class="stat-mini-value" style="color:${asset.criticalCVEs > 0 ? 'var(--risk-critical)' : 'var(--risk-low)'};">${asset.criticalCVEs}</span>
        </div>
        <div class="stat-mini">
          <span class="stat-mini-label">Impact</span>
          <span class="stat-mini-value">₹${asset.impactCr.toFixed(1)} Cr</span>
        </div>
        <div class="stat-mini">
          <span class="stat-mini-label">Controls</span>
          <span class="stat-mini-value">${asset.controlEffectivenessPct}%</span>
        </div>
      </div>
    </div>
  `;
}

/* ——— Asset Detail Panel HTML ——— */
function renderAssetDetail(asset) {
  const levelColors = {
    critical: 'var(--risk-critical)',
    high:     'var(--risk-high)',
    medium:   'var(--risk-medium)',
    low:      'var(--risk-low)',
  };

  const riskDriversHTML = asset.riskDrivers.map(d => `
    <div class="risk-driver-item">
      <div class="risk-driver-dot"></div>
      <span>${d}</span>
    </div>
  `).join('');

  const mitigationsHTML = asset.mitigations.map(m => `
    <div class="mitigation-item">
      <div class="mitigation-dot"></div>
      <span>${m}</span>
    </div>
  `).join('');

  return `
    <div class="asset-detail" id="asset-detail-panel">
      <div class="asset-detail-header">
        <div>
          <div class="d-flex align-center gap-3" style="margin-bottom:8px;">
            ${renderSeverityBadge(asset.level)}
            <span style="font-size:12px;color:var(--text-muted);font-weight:500;">${asset.category}</span>
          </div>
          <h2 class="asset-detail-title">${asset.name}</h2>
          <p class="asset-detail-desc">${asset.description}</p>
        </div>
        <button class="close-btn" id="close-detail-btn" aria-label="Close detail panel">
          <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <!-- Stat Blocks -->
      <div class="stat-blocks-grid">
        <div class="stat-block">
          <div class="stat-block-label">Expected Annual Loss</div>
          <div class="stat-block-value risk-colored ${asset.level}">₹${asset.ealCr.toFixed(2)} Cr</div>
          <div class="stat-block-sub">Probability-weighted</div>
        </div>
        <div class="stat-block">
          <div class="stat-block-label">Breach Likelihood</div>
          <div class="stat-block-value risk-colored ${asset.level}">${asset.likelihoodPct}%</div>
          <div class="stat-block-sub">12-month estimate</div>
        </div>
        <div class="stat-block">
          <div class="stat-block-label">Potential Impact</div>
          <div class="stat-block-value">₹${asset.impactCr.toFixed(1)} Cr</div>
          <div class="stat-block-sub">If breach occurs</div>
        </div>
        <div class="stat-block">
          <div class="stat-block-label">Asset Value</div>
          <div class="stat-block-value">₹${asset.assetValueCr.toFixed(0)} Cr</div>
          <div class="stat-block-sub">Business valuation</div>
        </div>
        <div class="stat-block">
          <div class="stat-block-label">Critical CVEs</div>
          <div class="stat-block-value risk-colored ${asset.criticalCVEs > 5 ? 'critical' : asset.criticalCVEs > 2 ? 'high' : asset.criticalCVEs > 0 ? 'medium' : 'low'}">${asset.criticalCVEs}</div>
          <div class="stat-block-sub">${asset.highCVEs} high-severity</div>
        </div>
        <div class="stat-block">
          <div class="stat-block-label">Control Effectiveness</div>
          <div class="stat-block-value ${asset.controlEffectivenessPct < 50 ? 'risk-colored critical' : asset.controlEffectivenessPct < 65 ? 'risk-colored high' : ''}">${asset.controlEffectivenessPct}%</div>
          <div class="stat-block-sub">Current coverage</div>
        </div>
        <div class="stat-block">
          <div class="stat-block-label">Criticality Score</div>
          <div class="stat-block-value">${asset.criticalityScore}<span style="font-size:0.5em;font-weight:500;opacity:0.6;">/100</span></div>
          <div class="stat-block-sub">Business impact weight</div>
        </div>
        <div class="stat-block">
          <div class="stat-block-label">Risk Category</div>
          <div style="margin-top:6px;">${renderSeverityBadge(asset.level)}</div>
          <div class="stat-block-sub" style="margin-top:6px;">Overall assessment</div>
        </div>
      </div>

      <!-- Two column: Drivers + Mitigations -->
      <div class="two-col-grid" style="gap:24px;">
        <div>
          <div class="risk-drivers-title">
            <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Risk Drivers
          </div>
          <div>${riskDriversHTML}</div>
        </div>
        <div>
          <div class="risk-drivers-title" style="color:var(--risk-low);">
            <svg viewBox="0 0 24 24" style="stroke:var(--risk-low);"><polyline points="20 6 9 17 4 12"/></svg>
            Recommended Mitigations
          </div>
          <div>${mitigationsHTML}</div>
        </div>
      </div>
    </div>
  `;
}

/* ——— Action Card HTML (Simulator) ——— */
function renderActionCard(action, checked = false) {
  return `
    <div class="action-card ${checked ? 'checked' : ''}" data-action-id="${action.id}" id="action-card-${action.id}">
      <div class="action-checkbox">
        <svg class="action-checkbox-check" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div class="action-card-body">
        <div class="action-card-name">${action.name}</div>
        <div class="action-card-desc">${action.description}</div>
        <div class="action-card-meta">
          <span class="action-meta-pill">₹${action.costLakhs}L cost</span>
          <span class="action-meta-pill">${action.timelineWeeks}w timeline</span>
          ${action.likelihoodReductionPct > 0 ? `<span class="action-meta-pill">−${action.likelihoodReductionPct}% likelihood</span>` : ''}
          ${action.impactReductionPct > 0 ? `<span class="action-meta-pill">−${action.impactReductionPct}% impact</span>` : ''}
        </div>
      </div>
    </div>
  `;
}
