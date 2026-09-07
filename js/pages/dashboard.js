/* ==============================================
   PAGES/DASHBOARD.JS — Executive Risk Dashboard (Fully Live!)
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
            ${org.name} &mdash; LIVE ENVIRONMENT
          </div>
          <div class="hero-tagline">Turn Cyber Risk into Financial Decisions</div>
          <div class="hero-meta">Live Data Sync Active &nbsp;&middot;&nbsp; Real-time EPSS Probabilities</div>
        </div>
      </div>

      <!-- Page Content -->
      <div class="page" style="padding-top:32px;">

        <!-- Metric Cards -->
        <div class="metrics-grid" style="margin-bottom:24px;">
          ${renderMetricCard({
            id: 'mc-risk-score',
            label: `<svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> CYBER RISK SCORE`,
            value: '...', 
            valueSuffix: '/100',
            valueClass: 'high',
            subText: 'Overall posture rating',
            trend: d.riskTrendYoY,
            sparklineId: 'spark-score',
          })}
          ${renderMetricCard({
            id: 'mc-eal',
            label: `<svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> EXPECTED MONTHLY LOSS`,
            value: '₹...',
            valueSuffix: 'Cr',
            valueClass: 'critical',
            subText: 'Live Probability-Weighted Risk',
            trend: 'Live Sync',
            sparklineId: 'spark-eal',
          })}
          ${renderMetricCard({
            id: 'mc-exposure',
            label: `<svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> TOTAL ASSETS`,
            value: '...',
            valueSuffix: 'Scanned',
            valueClass: 'accent',
            subText: 'Connected to Neon PostgreSQL',
            trend: 'Live Sync',
            sparklineId: 'spark-exposure',
          })}
          ${renderMetricCard({
            id: 'mc-cves',
            label: `<svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ACTIVE CVEs`,
            value: '...',
            valueSuffix: '',
            valueClass: 'high',
            subText: `<span style="color:var(--text-muted);">Loading live CVEs...</span>`,
            sparklineId: null,
          })}
        </div>

        <!-- Bottom Grid: Contributors + Composition -->
        <div class="dash-bottom-grid" style="display:grid;grid-template-columns:3fr 2fr;gap:20px;margin-bottom:24px;">

          <!-- Top 5 Risk Contributors (LIVE DATA) -->
          <div class="chart-card">
            <div class="chart-card-header">
              <div>
                <div class="chart-card-title">Top 5 Live Risk Contributors</div>
                <div class="chart-card-sub">Expected Loss by asset (₹ Crore)</div>
              </div>
              
              <!-- 💥 NEW: VIEW ALL BUTTON -->
              <button onclick="navigateTo('explorer')" style="cursor:pointer; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--accent); background:var(--accent-subtle); border:1px solid var(--accent-border); padding:6px 12px; border-radius:100px; transition:all 0.2s;" onmouseover="this.style.transform='translateX(2px)'" onmouseout="this.style.transform='translateX(0)'">
                View All &rarr;
              </button>
              
            </div>
            <div class="chart-container" style="height:220px;">
              <canvas id="chart-contributors"></canvas>
            </div>
          </div>

          <!-- Risk Composition (Mocked for Visuals) -->
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
              <div class="chart-card-title">Expected Monthly Loss — 12-Month Trend</div>
              <div class="chart-card-sub">Monthly EAL estimate (₹ Crore) — Oct 2025 to Sep 2026</div>
            </div>
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

    applyChartDefaults();

    // Draw base static sparklines and donut to keep the UI beautiful
    createSparkline('spark-score', d.scoreTrend, cssVar('--accent'));
    createSparkline('spark-eal', d.ealTrend, '#DC2626');
    createSparkline('spark-exposure', d.exposureTrend, '#64748B');
    createDonutChart('chart-composition', rc.labels, rc.values, rc.colors);

    // ==========================================
    // FETCH FULL LIVE ASSET DATA FROM FLASK API
    // ==========================================
    fetch('http://127.0.0.1:5000/api/assets')
      .then(res => res.json())
      .then(data => {
          // Convert Lakhs to Crores for the Dashboard (1 Crore = 100 Lakhs)
          const ealCr = (data.total_enterprise_risk_lakhs / 100).toFixed(2);
          
          // ==========================================
          // 1. DYNAMIC CYBER RISK SCORE (0-100)
          // ==========================================
          const topRisks = data.assets.slice(0, 12);
          const avgProb = topRisks.reduce((sum, a) => sum + a.probability_of_attack_per_month, 0) / topRisks.length;
          const dynamicScore = Math.round(avgProb * 100);
          
          let scoreClass = 'low';
          if (dynamicScore >= 75) scoreClass = 'critical';
          else if (dynamicScore >= 50) scoreClass = 'high';
          else if (dynamicScore >= 25) scoreClass = 'medium';

          const scoreCard = document.querySelector('#mc-risk-score');
          scoreCard.querySelector('.metric-card-value').innerHTML = `${dynamicScore}<span style="font-size:0.55em;font-weight:600;letter-spacing:0;opacity:0.75;margin-left:2px;">/100</span>`;
          scoreCard.querySelector('.metric-card-value').className = `metric-card-value ${scoreClass}`;
          
          // ==========================================
          // 2. INJECT DYNAMIC MONEY AND TOTAL ASSETS
          // ==========================================
          document.querySelector('#mc-eal .metric-card-value').innerHTML = 
              `₹${ealCr}<span style="font-size:0.55em;font-weight:600;letter-spacing:0;opacity:0.75;margin-left:2px;">Cr</span>`;
          
          document.querySelector('#mc-exposure .metric-card-value').innerHTML = 
              `${data.total}<span style="font-size:0.55em;font-weight:600;letter-spacing:0;opacity:0.75;margin-left:2px;">Scanned</span>`;

          // ==========================================
          // 3. DYNAMIC ACTIVE & CRITICAL CVEs
          // ==========================================
          const totalCVEs = data.assets.length;
          const criticalCVEs = data.assets.filter(a => parseFloat(a.cvss_severity) >= 9.0).length;

          document.querySelector('#mc-cves .metric-card-value').innerText = totalCVEs;
          document.querySelector('#mc-cves .metric-card-sub').innerHTML = 
              `<span style="color:var(--risk-critical);font-weight:600;">${criticalCVEs} critical</span> unpatched`;

          // ==========================================
          // 4. DRAW LIVE BAR CHART (Top 5 Risks)
          // ==========================================
          const top5 = data.assets.slice(0, 5);
          const labels = top5.map(a => a.asset_name);
          const values = top5.map(a => parseFloat((a.expected_monthly_loss_lakhs / 100).toFixed(2)));
          const colors = ['#DC2626', '#DC2626', '#EA580C', '#D97706', '#D97706'];

          createHorizontalBarChart('chart-contributors', labels, values, colors);

          // ==========================================
          // 5. DRAW THE 12-MONTH TREND LINE CHART
          // ==========================================
          const trendData = [...d.ealTrend]; 
          trendData[trendData.length - 1] = parseFloat(ealCr); 

          const accentHex = cssVar('--accent').trim() || '#2E5AAC';
          const ctx = document.getElementById('chart-eal-trend');
          
          if (ctx) {
            const canvasCtx = ctx.getContext('2d');
            const gradient = canvasCtx.createLinearGradient(0, 0, 0, 180);
            gradient.addColorStop(0, accentHex + '30');
            gradient.addColorStop(1, accentHex + '00');

            destroyChart('chart-eal-trend');
            ChartRegistry['chart-eal-trend'] = new Chart(canvasCtx, {
              type: 'line',
              data: {
                labels: d.trendLabels,
                datasets: [{
                  label: 'EAL (₹ Cr)',
                  data: trendData,
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
                  },
                },
              },
            });
          }

      })
      .catch(err => console.error("API not running", err));
  },
};