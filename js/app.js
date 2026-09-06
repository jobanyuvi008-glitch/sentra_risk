/* ==============================================
   APP.JS — Router, Theme Toggle, Initialization
   ============================================== */

/* ——— Page Registry ——— */
const PAGES = {
  dashboard:  DashboardPage,
  explorer:   ExplorerPage,
  simulator:  SimulatorPage,
  optimizer:  OptimizerPage,
  assistant:  AssistantPage,
};

/* ——— State ——— */
let currentPage = null;
let isDark = false;

/* ——— Router ——— */
function navigateTo(pageId) {
  if (!PAGES[pageId]) return;

  // Destroy all charts before leaving the page
  destroyAllCharts();

  // Highlight active nav item
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageId);
  });

  // Render the page
  const pageContainer = document.getElementById('page-content');
  pageContainer.innerHTML = PAGES[pageId].render();

  // Initialize the page (charts, events)
  if (typeof PAGES[pageId].init === 'function') {
    PAGES[pageId].init();
  }

  currentPage = pageId;

  // Close mobile sidebar if open
  closeMobileSidebar();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/* ——— Theme Toggle ——— */
function initTheme() {
  // Check saved preference
  const saved = localStorage.getItem('sentra-theme');
  if (saved === 'dark') setTheme('dark');
  else setTheme('light');
}

function setTheme(theme) {
  isDark = theme === 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('sentra-theme', theme);

  const btn = document.getElementById('theme-toggle-btn');
  const topBtn = document.getElementById('theme-toggle-top');

  const moonIcon = `<svg viewBox="0 0 24 24" style="width:17px;height:17px;stroke:currentColor;fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  const sunIcon  = `<svg viewBox="0 0 24 24" style="width:17px;height:17px;stroke:currentColor;fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;

  const label = isDark ? 'Light Mode' : 'Dark Mode';
  const icon  = isDark ? sunIcon : moonIcon;

  if (btn) btn.innerHTML = `${icon} ${label}`;
  if (topBtn) topBtn.innerHTML = isDark ? sunIcon : moonIcon;

  // Refresh chart colors after theme change
  setTimeout(refreshChartTheme, 50);
}

function toggleTheme() {
  setTheme(isDark ? 'light' : 'dark');
}

/* ——— Mobile Sidebar ——— */
function openMobileSidebar() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebar-overlay');
  sidebar.classList.add('open');
  overlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeMobileSidebar() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebar-overlay');
  sidebar.classList.remove('open');
  overlay.classList.remove('visible');
  document.body.style.overflow = '';
}

/* ——— Initialization ——— */
function initApp() {
  // Apply chart defaults
  applyChartDefaults();

  // Theme
  initTheme();

  // Nav item click handlers
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.page));
  });

  // Theme toggle (sidebar)
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  // Theme toggle (topbar)
  const themeTopBtn = document.getElementById('theme-toggle-top');
  if (themeTopBtn) themeTopBtn.addEventListener('click', toggleTheme);

  // Mobile hamburger
  const hamburger = document.getElementById('hamburger-btn');
  if (hamburger) hamburger.addEventListener('click', openMobileSidebar);

  // Overlay close
  const overlay = document.getElementById('sidebar-overlay');
  if (overlay) overlay.addEventListener('click', closeMobileSidebar);

  // Navigate to Dashboard on load
  navigateTo('dashboard');
}

// Boot the app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
