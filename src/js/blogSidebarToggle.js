/**
 * blogSidebarToggle.js — collapsible "Recent Posts" sidebar on blog post pages.
 *
 * Loaded via `clientModules` in docusaurus.config.js. Vanilla JS (no React)
 * so it survives Docusaurus SPA navigation: a MutationObserver re-attaches
 * the toggle button whenever the sidebar title is (re)rendered.
 *
 * Behaviour:
 *  - Prepends a [-]/[+] button to the sidebar title ("Recent Posts").
 *  - Click toggles `.hax-sidebar-collapsed` on the sidebar container, which
 *    hides the <ul> list via CSS (see custom.css).
 *  - State persists in localStorage (`hax-sidebar-collapsed`).
 *  - Defaults to collapsed on mobile (<997px), expanded on desktop.
 */

function getSidebarTitle() {
  return document.querySelector("[class*='blogSidebarTitle']");
}

function getSidebarContainer(titleEl) {
  // Docusaurus renders BlogSidebar as <nav> or <aside> inside div.col--3.
  // Collapse the nearest container so only the list hides, title stays.
  return (
    titleEl.closest('nav') ||
    titleEl.closest('aside') ||
    titleEl.parentElement
  );
}

function applyCollapsed(container, collapsed) {
  if (!container) return;
  container.classList.toggle('hax-sidebar-collapsed', collapsed);
  const btn = container.querySelector('.hax-sidebar-toggle');
  if (btn) {
    btn.textContent = collapsed ? '[+]' : '[-]';
    btn.setAttribute('aria-expanded', String(!collapsed));
    btn.title = collapsed ? 'Expand Recent Posts' : 'Collapse Recent Posts';
  }
  try {
    localStorage.setItem('hax-sidebar-collapsed', collapsed ? '1' : '0');
  } catch (_) {
    /* private mode — ignore */
  }
}

function storedPreference() {
  try {
    const v = localStorage.getItem('hax-sidebar-collapsed');
    if (v === '1') return true;
    if (v === '0') return false;
  } catch (_) {
    /* ignore */
  }
  // No stored pref: collapse by default on mobile, expand on desktop.
  return window.matchMedia('(max-width: 996px)').matches;
}

function attachToggle() {
  const title = getSidebarTitle();
  if (!title || title.querySelector('.hax-sidebar-toggle')) return;
  const container = getSidebarContainer(title);
  if (!container) return;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'hax-sidebar-toggle';
  btn.setAttribute('aria-label', 'Toggle Recent Posts sidebar');
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    applyCollapsed(container, !container.classList.contains('hax-sidebar-collapsed'));
  });

  // Button first, then existing title text.
  title.prepend(btn);
  applyCollapsed(container, storedPreference());
}

export default (function init() {
  if (typeof window === 'undefined') return;
  attachToggle();
  // Re-attach after SPA route changes (sidebar is re-rendered per post).
  const observer = new MutationObserver(() => attachToggle());
  observer.observe(document.documentElement, { childList: true, subtree: true });
});
