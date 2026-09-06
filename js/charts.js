/* ==============================================
   CHARTS.JS — Chart.js Wrappers
   All chart colors respect the current theme.
   ============================================== */

// Store all active Chart.js instances to enable clean destruction
const ChartRegistry = {};

/* ——— Destroy a chart if it exists ——— */
function destroyChart(id) {
  if (ChartRegistry[id]) {
    ChartRegistry[id].destroy();
    delete ChartRegistry[id];
  }
}

/* ——— Destroy all active charts ——— */
function destroyAllCharts() {
  Object.keys(ChartRegistry).forEach(destroyChart);
}

/* ——— Get current CSS variable value ——— */
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/* ——— Shared Chart.js defaults ——— */
function applyChartDefaults() {
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.color = cssVar('--text-secondary');
  Chart.defaults.borderColor = cssVar('--border');
}

/* ——— Sparkline (tiny trend line inside metric card) ——— */
function createSparkline(canvasId, data, color = '#2E5AAC') {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 44);
  gradient.addColorStop(0, color + '30');
  gradient.addColorStop(1, color + '00');

  ChartRegistry[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((_, i) => i),
      datasets: [{
        data,
        borderColor: color,
        borderWidth: 1.75,
        fill: true,
        backgroundColor: gradient,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointHoverBackgroundColor: color,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { display: false },
        y: { display: false },
      },
      elements: { line: { capBezierPoints: false } },
    },
  });
}

/* ——— Horizontal Bar Chart (Top Contributors) ——— */
function createHorizontalBarChart(canvasId, labels, values, colors) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  ChartRegistry[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 0,
        borderRadius: 4,
        borderSkipped: false,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400, easing: 'easeOutQuart' },
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
          callbacks: {
            label: ctx => ` ₹${ctx.parsed.x.toFixed(2)} Cr EAL`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: cssVar('--border'), drawTicks: false },
          border: { display: false },
          ticks: {
            color: cssVar('--text-muted'),
            font: { size: 11 },
            callback: v => `₹${v}Cr`,
          },
        },
        y: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: cssVar('--text-secondary'),
            font: { size: 12, weight: '500' },
          },
        },
      },
    },
  });
}

/* ——— Donut Chart (Risk Composition) ——— */
function createDonutChart(canvasId, labels, values, colors) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  ChartRegistry[canvasId] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors.map(c => c + 'E0'),
        borderColor: cssVar('--bg-card'),
        borderWidth: 3,
        hoverBorderWidth: 3,
        hoverOffset: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      animation: { duration: 500, easing: 'easeOutQuart' },
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: cssVar('--text-secondary'),
            font: { size: 12 },
            padding: 14,
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            pointStyleWidth: 10,
          },
        },
        tooltip: {
          backgroundColor: cssVar('--bg-card'),
          borderColor: cssVar('--border'),
          borderWidth: 1,
          titleColor: cssVar('--text-primary'),
          bodyColor: cssVar('--text-secondary'),
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.parsed}%`,
          },
        },
      },
    },
  });
}

/* ——— Grouped Bar Chart (Before / After Simulator) ——— */
function createBeforeAfterChart(canvasId, labels, beforeValues, afterValues) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const accent = cssVar('--accent');

  ChartRegistry[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Before',
          data: beforeValues,
          backgroundColor: cssVar('--risk-critical') + 'AA',
          borderColor: cssVar('--risk-critical'),
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'After',
          data: afterValues,
          backgroundColor: cssVar('--risk-low') + 'AA',
          borderColor: cssVar('--risk-low'),
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300, easing: 'easeOutQuart' },
      plugins: {
        legend: {
          labels: {
            color: cssVar('--text-secondary'),
            font: { size: 12 },
            boxWidth: 10,
            boxHeight: 10,
          },
        },
        tooltip: {
          backgroundColor: cssVar('--bg-card'),
          borderColor: cssVar('--border'),
          borderWidth: 1,
          titleColor: cssVar('--text-primary'),
          bodyColor: cssVar('--text-secondary'),
          padding: 10,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: cssVar('--text-secondary'), font: { size: 11 } },
        },
        y: {
          grid: { color: cssVar('--border'), drawTicks: false },
          border: { display: false },
          ticks: {
            color: cssVar('--text-muted'),
            font: { size: 11 },
          },
        },
      },
    },
  });
}

/* ——— Line Chart (Trend) ——— */
function createTrendLineChart(canvasId, labels, datasets) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  ChartRegistry[canvasId] = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      plugins: {
        legend: {
          labels: {
            color: cssVar('--text-secondary'),
            font: { size: 12 },
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: cssVar('--bg-card'),
          borderColor: cssVar('--border'),
          borderWidth: 1,
          titleColor: cssVar('--text-primary'),
          bodyColor: cssVar('--text-secondary'),
          padding: 10,
          cornerRadius: 8,
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
          ticks: { color: cssVar('--text-muted'), font: { size: 11 } },
        },
      },
    },
  });
}

/* ——— Update all charts on theme change ——— */
function refreshChartTheme() {
  applyChartDefaults();
  Object.values(ChartRegistry).forEach(chart => {
    chart.options.plugins.tooltip.backgroundColor = cssVar('--bg-card');
    chart.options.plugins.tooltip.borderColor = cssVar('--border');
    chart.options.plugins.tooltip.titleColor = cssVar('--text-primary');
    chart.options.plugins.tooltip.bodyColor = cssVar('--text-secondary');
    if (chart.options.scales) {
      Object.values(chart.options.scales).forEach(scale => {
        if (scale.grid) scale.grid.color = cssVar('--border');
        if (scale.ticks) scale.ticks.color = cssVar('--text-muted');
      });
    }
    chart.update('none');
  });
}
