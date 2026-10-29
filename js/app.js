/**
 * ============================================================================
 * GEC Wayanad — Data-Driven Project Showcase Portal
 * KTU CST463 Web Programming Assignment 3
 * Script: js/app.js
 * Vanilla JavaScript (ES6+) Application Controller
 * Features:
 *  - MySQL-backed PHP REST API Integration (/api/items.php)
 *  - Debounced Server-Side Live Search (GET /api/items.php?q=keyword)
 *  - PHP Session-based Authentication (/api/login.php, /api/logout.php, /api/session.php)
 *  - Asynchronous CRUD (POST create, PUT update) without full page reload
 *  - Safe DOM generation & XSS prevention
 * ============================================================================
 */

(function () {
  'use strict';

  // RESTful Data Service Endpoints
  const API_ITEMS_ENDPOINT = './api/items.php';
  const API_LOGIN_ENDPOINT = './api/login.php';
  const API_LOGOUT_ENDPOINT = './api/logout.php';
  const API_SESSION_ENDPOINT = './api/session.php';

  // Application State
  const state = {
    allProjects: [],
    filteredProjects: [],
    activeFilters: {
      search: '',
      domain: 'all',
      department: 'all',
      year: 'all',
      status: 'all',
      tech: 'all',
      sort: 'year-desc'
    },
    currentView: 'grid', // 'grid' | 'list'
    isLoading: false,
    hasError: false,
    isAuthenticated: false,
    currentUser: null,
    searchDebounceTimer: null
  };

  // DOM Elements
  const DOM = {
    // Navigation & Auth
    navToggleBtn: document.getElementById('navToggleBtn'),
    siteNav: document.getElementById('siteNav'),
    navLinks: document.querySelectorAll('.nav-link'),
    navLoginBtn: document.getElementById('navLoginBtn'),
    navAuthUserPanel: document.getElementById('navAuthUserPanel'),
    navUserBadge: document.getElementById('navUserBadge'),
    navUsernameText: document.getElementById('navUsernameText'),
    navNewProjectBtn: document.getElementById('navNewProjectBtn'),
    navLogoutBtn: document.getElementById('navLogoutBtn'),

    // Statistics
    statTotalProjects: document.getElementById('statTotalProjects'),
    statDomains: document.getElementById('statDomains'),
    statCompleted: document.getElementById('statCompleted'),
    statActive: document.getElementById('statActive'),
    statCards: document.querySelectorAll('.stat-card'),

    // Search & Filters
    searchInputWrapper: document.querySelector('.search-input-wrapper'),
    searchInput: document.getElementById('searchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    domainFilter: document.getElementById('domainFilter'),
    departmentFilter: document.getElementById('departmentFilter'),
    yearFilter: document.getElementById('yearFilter'),
    statusFilter: document.getElementById('statusFilter'),
    sortSelect: document.getElementById('sortSelect'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),

    // Toolbar
    resultsCount: document.getElementById('resultsCount'),
    totalCount: document.getElementById('totalCount'),
    activeFiltersBar: document.getElementById('activeFiltersBar'),
    toolbarAddProjectBtn: document.getElementById('toolbarAddProjectBtn'),
    viewGridBtn: document.getElementById('viewGridBtn'),
    viewListBtn: document.getElementById('viewListBtn'),

    // Project Grid Container
    projectGrid: document.getElementById('projectGrid'),

    // Project Details Modal Dialog
    projectModal: document.getElementById('projectModal'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalCloseActionBtn: document.getElementById('modalCloseActionBtn'),
    modalProjectId: document.getElementById('modalProjectId'),
    modalProjectStatus: document.getElementById('modalProjectStatus'),
    modalProjectTitle: document.getElementById('modalProjectTitle'),
    modalProjectDomain: document.getElementById('modalProjectDomain'),
    modalProjectDept: document.getElementById('modalProjectDept'),
    modalProjectYear: document.getElementById('modalProjectYear'),
    modalProjectGuide: document.getElementById('modalProjectGuide'),
    modalProjectDesc: document.getElementById('modalProjectDesc'),
    modalProjectTechs: document.getElementById('modalProjectTechs'),
    modalProjectTeam: document.getElementById('modalProjectTeam'),

    // Login Modal Dialog
    loginModal: document.getElementById('loginModal'),
    loginModalCloseBtn: document.getElementById('loginModalCloseBtn'),
    loginCancelBtn: document.getElementById('loginCancelBtn'),
    loginForm: document.getElementById('loginForm'),
    loginUsername: document.getElementById('loginUsername'),
    loginPassword: document.getElementById('loginPassword'),
    loginAlertBox: document.getElementById('loginAlertBox'),
    loginSubmitBtn: document.getElementById('loginSubmitBtn'),

    // Project Create / Edit Modal Dialog
    projectEditModal: document.getElementById('projectEditModal'),
    projectEditCloseBtn: document.getElementById('projectEditCloseBtn'),
    projectEditCancelBtn: document.getElementById('projectEditCancelBtn'),
    projectEditForm: document.getElementById('projectEditForm'),
    projectEditModalTitle: document.getElementById('projectEditModalTitle'),
    editModalBadge: document.getElementById('editModalBadge'),
    editModalSubBadge: document.getElementById('editModalSubBadge'),
    projectEditAlertBox: document.getElementById('projectEditAlertBox'),
    editProjectIdHidden: document.getElementById('editProjectIdHidden'),
    editProjectIdentifier: document.getElementById('editProjectIdentifier'),
    editProjectStatus: document.getElementById('editProjectStatus'),
    editProjectTitle: document.getElementById('editProjectTitle'),
    editProjectDomain: document.getElementById('editProjectDomain'),
    editProjectDept: document.getElementById('editProjectDept'),
    editProjectYear: document.getElementById('editProjectYear'),
    editProjectGuide: document.getElementById('editProjectGuide'),
    editProjectTech: document.getElementById('editProjectTech'),
    editProjectTeam: document.getElementById('editProjectTeam'),
    editProjectDesc: document.getElementById('editProjectDesc'),
    projectEditSaveBtn: document.getElementById('projectEditSaveBtn'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer')
  };

  /**
   * Initialize Application
   */
  async function init() {
    setupEventListeners();
    await checkAuthSession();
    await fetchProjectData();
  }

  /**
   * Toast notification helper
   */
  function showToast(message, type = 'info') {
    if (!DOM.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /**
   * Check Active Authentication Session
   */
  async function checkAuthSession() {
    try {
      const res = await fetch(API_SESSION_ENDPOINT, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'same-origin'
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.authenticated && data.user) {
        setAuthState(true, data.user);
      } else {
        setAuthState(false, null);
      }
    } catch (e) {
      console.warn('GEC Wayanad Portal: Session check skipped or unavailable.', e);
      setAuthState(false, null);
    }
  }

  /**
   * Update UI Authentication State
   */
  function setAuthState(isAuth, user) {
    state.isAuthenticated = isAuth;
    state.currentUser = user;

    if (isAuth && user) {
      if (DOM.navLoginBtn) DOM.navLoginBtn.style.display = 'none';
      if (DOM.navAuthUserPanel) DOM.navAuthUserPanel.style.display = 'inline-flex';
      if (DOM.navUsernameText) DOM.navUsernameText.textContent = user.username || 'Admin';
      if (DOM.toolbarAddProjectBtn) DOM.toolbarAddProjectBtn.style.display = 'inline-flex';
    } else {
      if (DOM.navLoginBtn) DOM.navLoginBtn.style.display = 'inline-flex';
      if (DOM.navAuthUserPanel) DOM.navAuthUserPanel.style.display = 'none';
      if (DOM.toolbarAddProjectBtn) DOM.toolbarAddProjectBtn.style.display = 'none';
    }

    // Re-render project cards so Edit buttons appear/disappear according to auth status
    if (state.allProjects.length > 0) {
      renderProjectGrid();
    }
  }

  /**
   * Render Loading State
   */
  function renderLoadingState() {
    state.isLoading = true;
    state.hasError = false;
    toggleFilterControls(false);

    DOM.resultsCount.textContent = '...';
    DOM.totalCount.textContent = '...';

    DOM.projectGrid.innerHTML = `
      <div class="loading-state" role="status" aria-live="polite">
        <div class="spinner" aria-hidden="true"></div>
        <p class="loading-title">Connecting to Institutional MySQL Data Service</p>
        <p class="loading-subtitle">Requesting <code>${escapeHtml(API_ITEMS_ENDPOINT)}</code> via PHP PDO...</p>
      </div>
    `;
  }

  /**
   * Render Error State
   */
  function renderErrorState(errorMessage) {
    state.isLoading = false;
    state.hasError = true;
    toggleFilterControls(false);

    DOM.resultsCount.textContent = '0';
    DOM.totalCount.textContent = '0';
    DOM.statTotalProjects.textContent = '0';
    DOM.statDomains.textContent = '0';
    DOM.statCompleted.textContent = '0';
    DOM.statActive.textContent = '0';

    const isGitHubPages = window.location.hostname.includes('github.io');

    DOM.projectGrid.innerHTML = `
      <div class="error-state" role="alert" aria-live="assertive">
        <div class="error-state-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 class="error-state-title">${isGitHubPages ? 'GitHub Pages Static Hosting Notice' : 'Unable to Connect to Institutional Database'}</h3>
        <p class="error-state-desc">
          ${isGitHubPages
            ? '<strong>Notice:</strong> GitHub Pages provides static asset hosting and cannot execute server-side PHP scripts or connect directly to a MySQL database (<code>gec_assignment3</code>). For full KTU CST463 Assignment 3 evaluation with authenticated CRUD and live MySQL REST API, run locally using <code>php -S localhost:8000 router.php</code> or deploy to a PHP/MySQL host.'
            : `The browser encountered an error communicating with the PHP MySQL REST API (<code>${escapeHtml(API_ITEMS_ENDPOINT)}</code>). Please verify that MySQL and the PHP development server are running and the database has been imported.`
          }
        </p>
        <div class="error-details-box">${escapeHtml(errorMessage)}</div>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center;">
          <button type="button" class="btn btn-retry" id="retryFetchBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            Retry Request (api/items.php)
          </button>
          ${isGitHubPages ? `
            <button type="button" class="btn btn-secondary" id="previewStaticBtn" style="padding: 0.7rem 1.2rem; font-weight: 600;">
              Preview Baseline Dataset (Static Fallback)
            </button>
          ` : ''}
        </div>
      </div>
    `;

    const retryBtn = document.getElementById('retryFetchBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        fetchProjectData();
      });
    }

    const previewBtn = document.getElementById('previewStaticBtn');
    if (previewBtn) {
      previewBtn.addEventListener('click', async () => {
        renderLoadingState();
        try {
          const res = await fetch('./data/projectdata.json');
          if (!res.ok) throw new Error('Could not load static baseline data.');
          const json = await res.json();
          state.allProjects = (json.graph || []).filter(item => item && item.type === 'Project');
          state.isLoading = false;
          state.hasError = false;
          toggleFilterControls(true);
          populateFilterDropdowns();
          updateStatistics();
          applyFilters();
          showToast('Loaded static baseline demonstration dataset.', 'info');
        } catch (e) {
          renderErrorState(e.message);
        }
      });
    }
  }

  /**
   * Render Server Empty State
   */
  function renderServerEmptyState() {
    state.isLoading = false;
    toggleFilterControls(false);

    DOM.projectGrid.innerHTML = `
      <div class="empty-state" role="status">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        </div>
        <h3 class="empty-state-title">No Project Records in MySQL Database</h3>
        <p class="empty-state-desc">The institutional database currently contains zero project entries. Click below to add a new project or refresh.</p>
        <div style="display: flex; gap: 0.75rem; justify-content: center;">
          <button type="button" class="btn btn-primary" id="serverEmptyRefreshBtn">
            Refresh From Server
          </button>
          ${state.isAuthenticated ? `
            <button type="button" class="btn btn-primary" id="serverEmptyAddBtn">
              + Create First Project
            </button>
          ` : ''}
        </div>
      </div>
    `;

    const refreshBtn = document.getElementById('serverEmptyRefreshBtn');
    if (refreshBtn) refreshBtn.addEventListener('click', fetchProjectData);

    const addBtn = document.getElementById('serverEmptyAddBtn');
    if (addBtn) addBtn.addEventListener('click', openCreateProjectModal);
  }

  /**
   * Enable or disable search & filter inputs
   */
  function toggleFilterControls(enabled) {
    DOM.searchInput.disabled = !enabled;
    DOM.domainFilter.disabled = !enabled;
    DOM.departmentFilter.disabled = !enabled;
    DOM.yearFilter.disabled = !enabled;
    DOM.statusFilter.disabled = !enabled;
    DOM.sortSelect.disabled = !enabled;
    DOM.resetFiltersBtn.disabled = !enabled;
  }

  /**
   * Fetch All Projects from the MySQL-backed REST API
   */
  async function fetchProjectData() {
    renderLoadingState();

    try {
      const response = await fetch(API_ITEMS_ENDPOINT, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'same-origin'
      });

      if (!response.ok) {
        let serverErrorMsg = `HTTP Error ${response.status} (${response.statusText || 'Request Failed'})`;
        try {
          const errorJson = await response.json();
          if (errorJson && errorJson.message) {
            serverErrorMsg = `${serverErrorMsg}: ${errorJson.message}`;
          }
        } catch {}
        throw new Error(serverErrorMsg);
      }

      const res = await response.json();
      const records = res.data || res.graph || [];

      if (!Array.isArray(records)) {
        throw new Error('Malformed JSON: records collection is not an array.');
      }

      state.allProjects = records;
      state.isLoading = false;
      state.hasError = false;

      if (state.allProjects.length === 0) {
        updateStatistics();
        renderServerEmptyState();
        return;
      }

      toggleFilterControls(true);
      populateFilterDropdowns();
      updateStatistics();
      applyFilters();

    } catch (err) {
      console.error('GEC Wayanad Portal: Data fetch from REST API failed.', err);
      renderErrorState(err.message || 'Network error or unreachable MySQL service.');
    }
  }

  /**
   * Debounced Server-Side Live Search (GET /api/items.php?q=keyword)
   */
  async function performServerSearch(query) {
    if (DOM.searchInputWrapper) {
      DOM.searchInputWrapper.classList.add('is-searching');
    }

    try {
      const params = new URLSearchParams();
      if (query && query.trim() !== '') {
        params.append('q', query.trim());
      }
      if (state.activeFilters.domain !== 'all') params.append('domain', state.activeFilters.domain);
      if (state.activeFilters.department !== 'all') params.append('department', state.activeFilters.department);
      if (state.activeFilters.year !== 'all') params.append('year', state.activeFilters.year);
      if (state.activeFilters.status !== 'all') params.append('status', state.activeFilters.status);

      const url = `${API_ITEMS_ENDPOINT}?${params.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'same-origin'
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const res = await response.json();
      const matches = res.data || res.graph || [];

      // Update filtered projects in state
      state.filteredProjects = matches;

      // Apply sorting on returned server records
      sortFilteredProjects();
      renderActiveFilterChips();
      renderProjectGrid();

    } catch (e) {
      console.warn('GEC Wayanad Portal: Server search error, falling back to in-memory filter.', e);
      applyFilters();
    } finally {
      if (DOM.searchInputWrapper) {
        DOM.searchInputWrapper.classList.remove('is-searching');
      }
    }
  }

  /**
   * Populate Filter Dropdowns dynamically
   */
  function populateFilterDropdowns() {
    const domains = new Set();
    const departments = new Set();
    const years = new Set();

    state.allProjects.forEach(proj => {
      if (proj.domain) domains.add(proj.domain);
      if (proj.department) departments.add(proj.department);
      if (proj.year) years.add(proj.year);
    });

    DOM.domainFilter.innerHTML = '<option value="all">All Domains</option>';
    DOM.departmentFilter.innerHTML = '<option value="all">All Departments</option>';
    DOM.yearFilter.innerHTML = '<option value="all">All Years</option>';

    Array.from(domains).sort().forEach(domain => {
      const opt = document.createElement('option');
      opt.value = domain;
      opt.textContent = domain;
      DOM.domainFilter.appendChild(opt);
    });

    Array.from(departments).sort().forEach(dept => {
      const opt = document.createElement('option');
      opt.value = dept;
      opt.textContent = dept;
      DOM.departmentFilter.appendChild(opt);
    });

    Array.from(years).sort((a, b) => b - a).forEach(year => {
      const opt = document.createElement('option');
      opt.value = year.toString();
      opt.textContent = year.toString();
      DOM.yearFilter.appendChild(opt);
    });

    if (state.activeFilters.domain !== 'all') DOM.domainFilter.value = state.activeFilters.domain;
    if (state.activeFilters.department !== 'all') DOM.departmentFilter.value = state.activeFilters.department;
    if (state.activeFilters.year !== 'all') DOM.yearFilter.value = state.activeFilters.year;
  }

  /**
   * Update Top Statistics Cards
   */
  function updateStatistics() {
    const total = state.allProjects.length;
    const uniqueDomains = new Set(state.allProjects.map(p => p.domain)).size;
    const completedCount = state.allProjects.filter(p => p.status && p.status.toLowerCase() === 'completed').length;
    const activeCount = state.allProjects.filter(p => p.status && (p.status.toLowerCase() === 'prototype' || p.status.toLowerCase() === 'development')).length;

    DOM.statTotalProjects.textContent = total;
    DOM.statDomains.textContent = uniqueDomains;
    DOM.statCompleted.textContent = completedCount;
    DOM.statActive.textContent = activeCount;
    DOM.totalCount.textContent = total;
  }

  /**
   * Sort filtered projects according to active sort option
   */
  function sortFilteredProjects() {
    const sort = state.activeFilters.sort;
    state.filteredProjects.sort((a, b) => {
      if (sort === 'year-desc') {
        return (b.year || 0) - (a.year || 0) || (a.title || '').localeCompare(b.title || '');
      } else if (sort === 'year-asc') {
        return (a.year || 0) - (b.year || 0) || (a.title || '').localeCompare(b.title || '');
      } else if (sort === 'title-asc') {
        return (a.title || '').localeCompare(b.title || '');
      } else if (sort === 'status') {
        return (a.status || '').localeCompare(b.status || '');
      }
      return 0;
    });
  }

  /**
   * Filter and Sort Projects locally
   */
  function applyFilters() {
    if (state.isLoading || state.hasError) return;

    const { search, domain, department, year, status, tech } = state.activeFilters;
    const searchLower = search.trim().toLowerCase();

    state.filteredProjects = state.allProjects.filter(project => {
      if (domain !== 'all' && project.domain !== domain) return false;
      if (department !== 'all' && project.department !== department) return false;
      if (year !== 'all' && String(project.year) !== String(year)) return false;
      if (status !== 'all' && (!project.status || project.status.toLowerCase() !== status.toLowerCase())) return false;
      if (tech !== 'all') {
        const hasTech = Array.isArray(project.technologies) &&
          project.technologies.some(t => t.toLowerCase() === tech.toLowerCase());
        if (!hasTech) return false;
      }
      if (searchLower) {
        const titleMatch = (project.title || '').toLowerCase().includes(searchLower);
        const descMatch = (project.description || '').toLowerCase().includes(searchLower);
        const domainMatch = (project.domain || '').toLowerCase().includes(searchLower);
        const deptMatch = (project.department || '').toLowerCase().includes(searchLower);
        const idMatch = (project.id || '').toLowerCase().includes(searchLower);
        const guideMatch = (project.guide || '').toLowerCase().includes(searchLower);
        const guideNameMatch = (project.guide_name || '').toLowerCase().includes(searchLower);
        const teamMatch = Array.isArray(project.team) && project.team.some(member => member.toLowerCase().includes(searchLower));
        const techMatch = Array.isArray(project.technologies) && project.technologies.some(t => t.toLowerCase().includes(searchLower));

        if (!titleMatch && !descMatch && !domainMatch && !deptMatch && !idMatch && !guideMatch && !guideNameMatch && !teamMatch && !techMatch) {
          return false;
        }
      }
      return true;
    });

    sortFilteredProjects();
    renderActiveFilterChips();
    renderProjectGrid();
  }

  /**
   * Render Active Filter Chips in the Toolbar
   */
  function renderActiveFilterChips() {
    DOM.activeFiltersBar.innerHTML = '';
    const chips = [];

    if (state.activeFilters.search) {
      chips.push({ key: 'search', label: `Search: "${state.activeFilters.search}"` });
    }
    if (state.activeFilters.domain !== 'all') {
      chips.push({ key: 'domain', label: `Domain: ${state.activeFilters.domain}` });
    }
    if (state.activeFilters.department !== 'all') {
      chips.push({ key: 'department', label: `Dept: ${state.activeFilters.department}` });
    }
    if (state.activeFilters.year !== 'all') {
      chips.push({ key: 'year', label: `Year: ${state.activeFilters.year}` });
    }
    if (state.activeFilters.status !== 'all') {
      chips.push({ key: 'status', label: `Status: ${state.activeFilters.status}` });
    }
    if (state.activeFilters.tech !== 'all') {
      chips.push({ key: 'tech', label: `Tech: ${state.activeFilters.tech}` });
    }

    chips.forEach(chip => {
      const pill = document.createElement('span');
      pill.className = 'active-pill';
      pill.innerHTML = `
        <span>${escapeHtml(chip.label)}</span>
        <button type="button" aria-label="Remove filter ${escapeHtml(chip.label)}" data-key="${chip.key}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;

      pill.querySelector('button').addEventListener('click', () => {
        clearSingleFilter(chip.key);
      });

      DOM.activeFiltersBar.appendChild(pill);
    });
  }

  /**
   * Clear an individual active filter
   */
  function clearSingleFilter(key) {
    if (key === 'search') {
      state.activeFilters.search = '';
      DOM.searchInput.value = '';
      DOM.searchClearBtn.style.display = 'none';
      performServerSearch('');
      return;
    } else if (key === 'domain') {
      state.activeFilters.domain = 'all';
      DOM.domainFilter.value = 'all';
    } else if (key === 'department') {
      state.activeFilters.department = 'all';
      DOM.departmentFilter.value = 'all';
    } else if (key === 'year') {
      state.activeFilters.year = 'all';
      DOM.yearFilter.value = 'all';
    } else if (key === 'status') {
      state.activeFilters.status = 'all';
      DOM.statusFilter.value = 'all';
    } else if (key === 'tech') {
      state.activeFilters.tech = 'all';
    }
    applyFilters();
  }

  /**
   * Render Dynamic Project Cards into the DOM
   */
  function renderProjectGrid() {
    DOM.projectGrid.innerHTML = '';
    const projects = state.filteredProjects;
    DOM.resultsCount.textContent = projects.length;

    if (projects.length === 0) {
      renderSearchEmptyState();
      return;
    }

    const fragment = document.createDocumentFragment();
    projects.forEach(project => {
      const card = createProjectCardElement(project);
      fragment.appendChild(card);
    });

    DOM.projectGrid.appendChild(fragment);
  }

  /**
   * Create a single Project Card DOM Element
   */
  function createProjectCardElement(project) {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.setAttribute('data-id', project.id);

    const statusLower = (project.status || '').toLowerCase();
    let statusClass = 'status-prototype';
    if (statusLower === 'completed') statusClass = 'status-completed';
    else if (statusLower === 'development') statusClass = 'status-development';

    const techTagsHtml = (project.technologies || [])
      .map(tech => `<button type="button" class="tech-tag" data-tech="${escapeHtml(tech)}">${escapeHtml(tech)}</button>`)
      .join('');

    const teamCount = Array.isArray(project.team) ? project.team.length : 0;
    const guideDisplay = project.guide_name || project.guide || 'N/A';

    card.innerHTML = `
      <div class="card-top">
        <span class="card-id-badge">${escapeHtml(project.id)}</span>
        <span class="status-badge ${statusClass}">${escapeHtml(project.status || 'Active')}</span>
      </div>

      <button type="button" class="card-domain-badge" data-domain="${escapeHtml(project.domain || '')}" title="Filter by domain ${escapeHtml(project.domain || '')}">
        ${escapeHtml(project.domain || 'General')}
      </button>

      <h3 class="card-title">${escapeHtml(project.title || 'Untitled Project')}</h3>

      <div class="card-meta-row">
        <span class="card-meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
          ${escapeHtml(project.department || 'Engineering')}
        </span>
        <span>•</span>
        <span class="card-meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          ${escapeHtml(String(project.year || ''))}
        </span>
      </div>

      <p class="card-description">${escapeHtml(project.description || '')}</p>

      <div class="card-tech-list" aria-label="Technologies used">
        ${techTagsHtml}
      </div>

      <div class="card-footer-info">
        <div class="team-guide-info">
          <span>Team: <strong>${teamCount} Student${teamCount !== 1 ? 's' : ''}</strong></span>
          <span>Guide: <strong>${escapeHtml(guideDisplay)}</strong></span>
        </div>
        <div class="card-action-btns">
          ${state.isAuthenticated ? `
            <button type="button" class="btn-card-edit" data-id="${escapeHtml(project.id)}" title="Edit project record in MySQL">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              <span>Edit</span>
            </button>
          ` : ''}
          <button type="button" class="btn-card-details" data-id="${escapeHtml(project.id)}">
            View Details
          </button>
        </div>
      </div>
    `;

    // View Details Click
    card.querySelector('.btn-card-details').addEventListener('click', () => {
      openProjectModal(project);
    });

    // Edit Button Click (Authenticated)
    const editBtn = card.querySelector('.btn-card-edit');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        openEditProjectModal(project);
      });
    }

    // Domain badge click filters by domain
    card.querySelector('.card-domain-badge').addEventListener('click', (e) => {
      const domainVal = e.target.getAttribute('data-domain');
      if (domainVal) {
        state.activeFilters.domain = domainVal;
        DOM.domainFilter.value = domainVal;
        applyFilters();
        smoothScrollToShowcase();
      }
    });

    // Technology tags click filters by technology
    card.querySelectorAll('.tech-tag').forEach(tagBtn => {
      tagBtn.addEventListener('click', (e) => {
        const techVal = e.target.getAttribute('data-tech');
        if (techVal) {
          state.activeFilters.tech = techVal;
          applyFilters();
          smoothScrollToShowcase();
        }
      });
    });

    return card;
  }

  /**
   * Render Search Empty State
   */
  function renderSearchEmptyState() {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-state';
    emptyDiv.innerHTML = `
      <div class="empty-state-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </div>
      <h3 class="empty-state-title">No matching institutional projects found</h3>
      <p class="empty-state-desc">Try modifying your live search query or resetting the selected filters.</p>
      <button type="button" class="btn btn-primary" id="emptyResetBtn">
        Reset All Filters
      </button>
    `;

    emptyDiv.querySelector('#emptyResetBtn').addEventListener('click', resetAllFilters);
    DOM.projectGrid.appendChild(emptyDiv);
  }

  /**
   * Open and Populate Project Details Modal Dialog
   */
  function openProjectModal(project) {
    DOM.modalProjectId.textContent = project.id || '';
    DOM.modalProjectStatus.textContent = project.status || 'Active';
    DOM.modalProjectStatus.className = `status-badge ${
      (project.status || '').toLowerCase() === 'completed'
        ? 'status-completed'
        : (project.status || '').toLowerCase() === 'development'
        ? 'status-development'
        : 'status-prototype'
    }`;
    DOM.modalProjectTitle.textContent = project.title || '';
    DOM.modalProjectDomain.textContent = project.domain || '';
    DOM.modalProjectDept.textContent = project.department || '';
    DOM.modalProjectYear.textContent = project.year || '';
    DOM.modalProjectGuide.textContent = project.guide_name || project.guide || '';
    DOM.modalProjectDesc.textContent = project.description || '';

    // Technologies
    DOM.modalProjectTechs.innerHTML = '';
    (project.technologies || []).forEach(tech => {
      const span = document.createElement('span');
      span.className = 'tech-tag';
      span.textContent = tech;
      DOM.modalProjectTechs.appendChild(span);
    });

    // Team
    DOM.modalProjectTeam.innerHTML = '';
    (project.team || []).forEach(member => {
      const badge = document.createElement('span');
      badge.className = 'member-badge';
      badge.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        ${escapeHtml(member)}
      `;
      DOM.modalProjectTeam.appendChild(badge);
    });

    DOM.projectModal.classList.add('is-open');
    DOM.projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    DOM.modalCloseBtn.focus();
  }

  function closeProjectModal() {
    DOM.projectModal.classList.remove('is-open');
    DOM.projectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /**
   * Open Login Modal
   */
  function openLoginModal() {
    DOM.loginAlertBox.style.display = 'none';
    DOM.loginForm.reset();
    DOM.loginModal.classList.add('is-open');
    DOM.loginModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => DOM.loginUsername.focus(), 100);
  }

  function closeLoginModal() {
    DOM.loginModal.classList.remove('is-open');
    DOM.loginModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /**
   * Handle Login Submission (POST /api/login.php)
   */
  async function handleLoginSubmit(e) {
    e.preventDefault();
    const username = DOM.loginUsername.value.trim();
    const password = DOM.loginPassword.value.trim();

    if (!username || !password) {
      showLoginAlert('Please enter both username and password.', 'error');
      return;
    }

    DOM.loginSubmitBtn.disabled = true;
    DOM.loginSubmitBtn.innerHTML = '<span>Authenticating...</span>';

    try {
      const response = await fetch(API_LOGIN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed. Please verify credentials.');
      }

      // Success
      setAuthState(true, data.user);
      closeLoginModal();
      showToast(`Welcome, ${data.user.username}! Authenticated successfully.`, 'success');
      
      // Refresh data
      await fetchProjectData();

    } catch (err) {
      showLoginAlert(err.message, 'error');
    } finally {
      DOM.loginSubmitBtn.disabled = false;
      DOM.loginSubmitBtn.innerHTML = '<span>Authenticate Session</span>';
    }
  }

  function showLoginAlert(msg, type) {
    DOM.loginAlertBox.className = `alert-banner alert-banner-${type}`;
    DOM.loginAlertBox.textContent = msg;
    DOM.loginAlertBox.style.display = 'block';
  }

  /**
   * Handle Logout (POST /api/logout.php)
   */
  async function handleLogout() {
    try {
      await fetch(API_LOGOUT_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        credentials: 'same-origin'
      });
    } catch (e) {
      console.warn('Logout network notice:', e);
    }
    setAuthState(false, null);
    showToast('Logged out of institutional session.', 'info');
    fetchProjectData();
  }

  /**
   * Open Project Create Modal
   */
  function openCreateProjectModal() {
    DOM.projectEditAlertBox.style.display = 'none';
    DOM.projectEditForm.reset();
    DOM.editProjectIdHidden.value = '';
    DOM.editProjectIdentifier.value = '';
    DOM.editProjectIdentifier.disabled = false;
    DOM.projectEditModalTitle.textContent = 'Create New Project Record';
    DOM.editModalBadge.textContent = 'NEW PROJECT';
    DOM.editModalSubBadge.textContent = 'MYSQL INSERT';
    DOM.projectEditSaveBtn.innerHTML = '<span>Save to MySQL</span>';

    DOM.projectEditModal.classList.add('is-open');
    DOM.projectEditModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => DOM.editProjectTitle.focus(), 100);
  }

  /**
   * Open Project Edit Modal (Populated with existing data)
   */
  function openEditProjectModal(project) {
    DOM.projectEditAlertBox.style.display = 'none';
    DOM.projectEditForm.reset();
    DOM.editProjectIdHidden.value = project.id || '';
    DOM.editProjectIdentifier.value = project.id || '';
    DOM.editProjectIdentifier.disabled = true; // Primary key cannot be changed
    DOM.editProjectStatus.value = project.status || 'Prototype';
    DOM.editProjectTitle.value = project.title || '';
    DOM.editProjectDomain.value = project.domain || '';
    DOM.editProjectDept.value = project.department || 'Computer Science and Engineering';
    DOM.editProjectYear.value = project.year || 2026;
    DOM.editProjectGuide.value = project.guide || project.guide_name || '';
    DOM.editProjectTech.value = Array.isArray(project.technologies) ? project.technologies.join(', ') : '';
    DOM.editProjectTeam.value = Array.isArray(project.team) ? project.team.join(', ') : '';
    DOM.editProjectDesc.value = project.description || '';

    DOM.projectEditModalTitle.textContent = `Edit Project (${project.id})`;
    DOM.editModalBadge.textContent = escapeHtml(project.id);
    DOM.editModalSubBadge.textContent = 'MYSQL UPDATE';
    DOM.projectEditSaveBtn.innerHTML = '<span>Update Record</span>';

    DOM.projectEditModal.classList.add('is-open');
    DOM.projectEditModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => DOM.editProjectTitle.focus(), 100);
  }

  function closeProjectEditModal() {
    DOM.projectEditModal.classList.remove('is-open');
    DOM.projectEditModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /**
   * Handle Project Create / Update Submission (POST or PUT /api/items.php)
   */
  async function handleProjectEditSubmit(e) {
    e.preventDefault();

    const isEdit = Boolean(DOM.editProjectIdHidden.value.trim());
    const targetId = DOM.editProjectIdHidden.value.trim() || DOM.editProjectIdentifier.value.trim();

    const title = DOM.editProjectTitle.value.trim();
    const domain = DOM.editProjectDomain.value.trim();
    const department = DOM.editProjectDept.value.trim();
    const year = parseInt(DOM.editProjectYear.value, 10);
    const guide = DOM.editProjectGuide.value.trim();
    const status = DOM.editProjectStatus.value;
    const description = DOM.editProjectDesc.value.trim();

    // Parse comma-separated tech and team
    const technologies = DOM.editProjectTech.value
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const team = DOM.editProjectTeam.value
      .split(',')
      .map(m => m.trim())
      .filter(m => m.length > 0);

    if (!title || !domain || !department || !year || !guide || !description) {
      showProjectEditAlert('Please fill in all mandatory fields.', 'error');
      return;
    }

    const payload = {
      title,
      domain,
      department,
      year,
      guide,
      status,
      technologies,
      team,
      description
    };

    if (!isEdit && targetId) {
      payload.id = targetId;
    }

    DOM.projectEditSaveBtn.disabled = true;
    DOM.projectEditSaveBtn.innerHTML = '<span>Saving to MySQL...</span>';

    try {
      let endpoint = API_ITEMS_ENDPOINT;
      let method = 'POST';

      if (isEdit) {
        endpoint = `${API_ITEMS_ENDPOINT}?id=${encodeURIComponent(targetId)}`;
        method = 'PUT';
      }

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });

      const res = await response.json();

      if (response.status === 401) {
        setAuthState(false, null);
        throw new Error('Your session has expired. Please log in again.');
      }

      if (!response.ok || !res.success) {
        let errDesc = res.message || 'Operation failed.';
        if (Array.isArray(res.errors)) {
          errDesc += ' ' + res.errors.join(' ');
        }
        throw new Error(errDesc);
      }

      // Success
      closeProjectEditModal();
      showToast(isEdit ? `Project "${title}" updated successfully!` : `Project created successfully!`, 'success');

      // Update state without full page reload
      if (isEdit && res.data) {
        const index = state.allProjects.findIndex(p => p.id === targetId);
        if (index !== -1) {
          state.allProjects[index] = res.data;
        } else {
          state.allProjects.unshift(res.data);
        }
        applyFilters();
        updateStatistics();
      } else {
        await fetchProjectData();
      }

    } catch (err) {
      showProjectEditAlert(err.message, 'error');
    } finally {
      DOM.projectEditSaveBtn.disabled = false;
      DOM.projectEditSaveBtn.innerHTML = isEdit ? '<span>Update Record</span>' : '<span>Save to MySQL</span>';
    }
  }

  function showProjectEditAlert(msg, type) {
    DOM.projectEditAlertBox.className = `alert-banner alert-banner-${type}`;
    DOM.projectEditAlertBox.textContent = msg;
    DOM.projectEditAlertBox.style.display = 'block';
  }

  /**
   * Reset All Filters and Search Queries
   */
  function resetAllFilters() {
    state.activeFilters.search = '';
    state.activeFilters.domain = 'all';
    state.activeFilters.department = 'all';
    state.activeFilters.year = 'all';
    state.activeFilters.status = 'all';
    state.activeFilters.tech = 'all';
    state.activeFilters.sort = 'year-desc';

    DOM.searchInput.value = '';
    DOM.searchClearBtn.style.display = 'none';
    DOM.domainFilter.value = 'all';
    DOM.departmentFilter.value = 'all';
    DOM.yearFilter.value = 'all';
    DOM.statusFilter.value = 'all';
    DOM.sortSelect.value = 'year-desc';

    applyFilters();
  }

  /**
   * Setup Event Listeners
   */
  function setupEventListeners() {
    // Debounced Live Search against server
    DOM.searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      state.activeFilters.search = val;
      DOM.searchClearBtn.style.display = val.length > 0 ? 'block' : 'none';

      // Clear existing debounce timer
      if (state.searchDebounceTimer) {
        clearTimeout(state.searchDebounceTimer);
      }

      // Debounce server search request by 300ms
      state.searchDebounceTimer = setTimeout(() => {
        performServerSearch(val);
      }, 300);
    });

    // Clear search button
    DOM.searchClearBtn.addEventListener('click', () => {
      state.activeFilters.search = '';
      DOM.searchInput.value = '';
      DOM.searchClearBtn.style.display = 'none';
      DOM.searchInput.focus();
      performServerSearch('');
    });

    // Filter dropdowns
    DOM.domainFilter.addEventListener('change', (e) => {
      state.activeFilters.domain = e.target.value;
      applyFilters();
    });

    DOM.departmentFilter.addEventListener('change', (e) => {
      state.activeFilters.department = e.target.value;
      applyFilters();
    });

    DOM.yearFilter.addEventListener('change', (e) => {
      state.activeFilters.year = e.target.value;
      applyFilters();
    });

    DOM.statusFilter.addEventListener('change', (e) => {
      state.activeFilters.status = e.target.value;
      applyFilters();
    });

    DOM.sortSelect.addEventListener('change', (e) => {
      state.activeFilters.sort = e.target.value;
      applyFilters();
    });

    DOM.resetFiltersBtn.addEventListener('click', resetAllFilters);

    // View mode toggle
    DOM.viewGridBtn.addEventListener('click', () => {
      state.currentView = 'grid';
      DOM.viewGridBtn.classList.add('active');
      DOM.viewGridBtn.setAttribute('aria-pressed', 'true');
      DOM.viewListBtn.classList.remove('active');
      DOM.viewListBtn.setAttribute('aria-pressed', 'false');
      DOM.projectGrid.classList.remove('list-layout');
    });

    DOM.viewListBtn.addEventListener('click', () => {
      state.currentView = 'list';
      DOM.viewListBtn.classList.add('active');
      DOM.viewListBtn.setAttribute('aria-pressed', 'true');
      DOM.viewGridBtn.classList.remove('active');
      DOM.viewGridBtn.setAttribute('aria-pressed', 'false');
      DOM.projectGrid.classList.add('list-layout');
    });

    // Stat cards interactive filtering
    DOM.statCards.forEach(card => {
      card.addEventListener('click', () => {
        if (state.isLoading || state.hasError) return;
        if (card.hasAttribute('data-filter')) {
          resetAllFilters();
        } else if (card.hasAttribute('data-filter-status')) {
          const status = card.getAttribute('data-filter-status');
          resetAllFilters();
          state.activeFilters.status = status;
          DOM.statusFilter.value = status;
          applyFilters();
        } else if (card.hasAttribute('data-filter-domain')) {
          resetAllFilters();
          DOM.domainFilter.focus();
        }
        smoothScrollToShowcase();
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });

    // Modal controls: Details Modal
    DOM.modalCloseBtn.addEventListener('click', closeProjectModal);
    DOM.modalCloseActionBtn.addEventListener('click', closeProjectModal);
    DOM.projectModal.addEventListener('click', (e) => {
      if (e.target === DOM.projectModal) closeProjectModal();
    });

    // Modal controls: Login Modal
    if (DOM.navLoginBtn) DOM.navLoginBtn.addEventListener('click', openLoginModal);
    if (DOM.loginModalCloseBtn) DOM.loginModalCloseBtn.addEventListener('click', closeLoginModal);
    if (DOM.loginCancelBtn) DOM.loginCancelBtn.addEventListener('click', closeLoginModal);
    if (DOM.loginForm) DOM.loginForm.addEventListener('submit', handleLoginSubmit);
    if (DOM.loginModal) {
      DOM.loginModal.addEventListener('click', (e) => {
        if (e.target === DOM.loginModal) closeLoginModal();
      });
    }

    // Modal controls: Project Editor Modal
    if (DOM.navNewProjectBtn) DOM.navNewProjectBtn.addEventListener('click', openCreateProjectModal);
    if (DOM.toolbarAddProjectBtn) DOM.toolbarAddProjectBtn.addEventListener('click', openCreateProjectModal);
    if (DOM.projectEditCloseBtn) DOM.projectEditCloseBtn.addEventListener('click', closeProjectEditModal);
    if (DOM.projectEditCancelBtn) DOM.projectEditCancelBtn.addEventListener('click', closeProjectEditModal);
    if (DOM.projectEditForm) DOM.projectEditForm.addEventListener('submit', handleProjectEditSubmit);
    if (DOM.projectEditModal) {
      DOM.projectEditModal.addEventListener('click', (e) => {
        if (e.target === DOM.projectEditModal) closeProjectEditModal();
      });
    }

    // Logout control
    if (DOM.navLogoutBtn) DOM.navLogoutBtn.addEventListener('click', handleLogout);

    // Global keyboard shortcuts (Escape closes modals)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (DOM.projectModal.classList.contains('is-open')) closeProjectModal();
        if (DOM.loginModal && DOM.loginModal.classList.contains('is-open')) closeLoginModal();
        if (DOM.projectEditModal && DOM.projectEditModal.classList.contains('is-open')) closeProjectEditModal();
      }
    });

    // Mobile navigation toggle
    DOM.navToggleBtn.addEventListener('click', () => {
      const isExpanded = DOM.siteNav.classList.toggle('is-open');
      DOM.navToggleBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    });

    DOM.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        DOM.siteNav.classList.remove('is-open');
        DOM.navToggleBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Scroll active link detection
    window.addEventListener('scroll', handleScrollActiveNav, { passive: true });
  }

  /**
   * Active link state updater during scroll
   */
  function handleScrollActiveNav() {
    const scrollPos = window.scrollY + 120;
    const sections = ['home', 'statistics', 'projects', 'about', 'contact'];

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = document.getElementById(sections[i]);
      if (section && section.offsetTop <= scrollPos) {
        DOM.navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${sections[i]}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
        break;
      }
    }
  }

  /**
   * Helper: Smooth scroll to project showcase section
   */
  function smoothScrollToShowcase() {
    const section = document.getElementById('projects');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Security helper: Escape HTML entities to prevent XSS
   */
  function escapeHtml(str) {
    if (typeof str !== 'string') return String(str ?? '');
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Start the application when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
