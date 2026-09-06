/* ==============================================
   PAGES/DASHBOARD.JS — Executive Risk Dashboard
   ============================================== */

const DashboardPage = {

  render() {
    const d = SENTRA_DATA.dashboard;
    const org = SENTRA_DATA.org;

    return `
      <!-- Dashboard Hero Band -->
      <div class="dashboard-hero">
        <div style="max-width:1300px;margin:0 auto;">
          <div class="hero-org">
            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            ${org.name} &mdash; ${org.industry}
          </div>
          <div class="hero-tagline">Turn Cyber Risk into Financial Decisions</div>
          <div class="hero-meta">Report period: ${org.reportDate} &nbsp;&middot;&nbsp; Last updated ${org.lastUpdated} &nbsp;&middot;&nbsp; ${org.assetsMonitored} assets monitored</div>
        </div>
      </div>

      <!-- Page Content -->
      <div class="page" style="padding-top:32px;">

        <!-- Metric Cards -->
        <div class="metrics-grid" style="margin-bottom:24px;">
          ${renderMetricCard({
            id: 'mc-risk-score',
            label: `<svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> CYBER RISK SCORE`,
            value: d.riskScore,
            valueSuffix: '/100',
            valueClass: 'high',
            subText: 'Overall posture rating',
            trend: d.riskTrendYoY,
            sparklineId: 'spark-score',
          })}
          ${renderMetricCard({
            id: 'mc-eal',
            label: `<svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> EXPECTED ANNUAL LOSS`,
            value: '₹4.20',
            valueSuffix: 'Cr',
            valueClass: 'critical',
            subText: 'Probability-weighted',
            trend: '+12.1%',
            sparklineId: 'spark-eal',
          })}
          ${renderMetricCard({
            id: 'mc-exposure',
            label: `<svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> TOTAL EXPOSURE`,
            value: '₹18.0',
            valueSuffix: 'Cr',
            valueClass: '',
            subText: 'Max financial impact',
            trend: '+20.0%',
            sparklineId: 'spark-exposure',
          })}
          ${renderMetricCard({
            id: 'mc-cves',
            label: `<svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ACTIVE CVEs`,
            value: org.activeCVEs,
            valueSuffix: '',
            valueClass: 'high',
            subText: `<span style="color:var(--risk-critical);font-weight:600;">${org.criticalCVEs} critical</span> unpatched`,
            sparklineId: null,
          })}
        </div>

        <!-- Bottom Grid: Contributors + Composition -->
        <div class="dash-bottom-grid" style="display:grid;grid-template-columns:3fr 2fr;gap:20px;margin-bottom:24px;">

          <!-- Top 5 Risk Contributors -->
          <div class="chart-card">
            <div class="chart-card-header">
              <div>
                <div class="chart-card-title">Top 5 Risk Contributors</div>
                <div class="chart-card-sub">Expected Annual Loss by asset (₹ Crore)</div>
              </div>
              <div style="display:flex;gap:12px;align-items:center;">
                <span class="severity-badge critical">Total ₹4.20 Cr</span>
              </div>
            </div>
            <div class="chart-container" style="height:220px;">
              <canvas id="chart-contributors"></canvas>
            </div>
          </div>

          <!-- Risk Composition -->
          <div class="chart-card">
            <div class="chart-card-header">
              <div>
                <div class="chart-card-title">Risk Composition</div>
                <div class="chart-card-sub">By threat category (%)</div>
              </div>
            </div>
            <div class="chart-container" style="height:220px;">
              <canvas id="chart-composition"></canvas>
            </div>
          </div>
        </div>

        <!-- EAL Trend (Full Width) -->
        <div class="chart-card">
          <div class="chart-card-header">
            <div>
              <div class="chart-card-title">Expected Annual Loss — 12-Month Trend</div>
              <div class="chart-card-sub">Monthly EAL estimate (₹ Crore) — Oct 2025 to Sep 2026</div>
            </div>
            <span class="metric-trend up" style="font-size:12px;">
              <svg viewBox="0 0 24 24" style="width:11px;height:11px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              +35.5% YoY
            </span>
          </div>
          <div class="chart-container" style="height:180px;">
            <canvas id="chart-eal-trend"></canvas>
          </div>
        </div>

      </div>
    `;
  },

  init() {
    const d = SENTRA_DATA.dashboard;
    const rc = SENTRA_DATA.riskComposition;
    const tc = SENTRA_DATA.topContributors;

    applyChartDefaults();

    // Sparklines
    const accentColor = cssVar('--accent');
    const critColor    = '#DC2626';
    const neutralColor = '#64748B';

    createSparkline('spark-score', d.scoreTrend, accentColor);
    createSparkline('spark-eal', d.ealTrend, critColor);
    createSparkline('spark-exposure', d.exposureTrend, neutralColor);

    // Level colors for bar chart
    const levelColor = { critical: '#DC2626', high: '#EA580C', medium: '#D97706', low: '#16A34A' };
    const barColors   = tc.map(t => levelColor[t.level]);

    createHorizontalBarChart(
      'chart-contributors',
      tc.map(t => t.name),
      tc.map(t => t.eal),
      barColors
    );

    createDonutChart(
      'chart-composition',
      rc.labels,
      rc.values,
      rc.colors
    );

    // EAL Trend line
    const accentHex = '#2E5AAC';
    const ctx = document.getElementById('chart-eal-trend');
    if (ctx) {
      const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 180);
      gradient.addColorStop(0, accentHex + '30');
      gradient.addColorStop(1, accentHex + '00');

      destroyChart('chart-eal-trend');
      ChartRegistry['chart-eal-trend'] = new Chart(ctx, {
        type: 'line',
        data: {
          labels: d.trendLabels,
          datasets: [{
            label: 'EAL (₹ Cr)',
            data: d.ealTrend,
            borderColor: accentHex,
            borderWidth: 2,
            fill: true,
            backgroundColor: gradient,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: accentHex,
            pointBorderColor: cssVar('--bg-card'),
            pointBorderWidth: 2,
            pointHoverRadius: 5,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 500 },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: cssVar('--bg-card'),
              borderColor: cssVar('--border'),
              borderWidth: 1,
              titleColor: cssVar('--text-primary'),
              bodyColor: cssVar('--text-secondary'),
              padding: 10,
              cornerRadius: 8,
              callbacks: { label: ctx => ` ₹${ctx.parsed.y.toFixed(2)} Cr EAL` },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              border: { display: false },
              ticks: { color: cssVar('--text-muted'), font: { size: 11 } },
            },
            y: {
              grid: { color: cssVar('--border'), drawTicks: false },
              border: { display: false },
              ticks: {
                color: cssVar('--text-muted'),
                font: { size: 11 },
                callback: v => `₹${v}Cr`,
              },
              min: 2.5,
            },
          },
        },
      });
    }
  },
};
