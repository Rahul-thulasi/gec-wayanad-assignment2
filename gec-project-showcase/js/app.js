/**
 * ============================================================================
 * GEC Wayanad — Data-Driven Project Showcase Portal
 * Script: js/app.js
 * Vanilla JavaScript (ES6+) Application Controller
 * ============================================================================
 */

(function () {
  'use strict';

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
    currentView: 'grid' // 'grid' | 'list'
  };

  // Fallback dataset for file:// protocol environments where fetch() is blocked by browser CORS
  const FALLBACK_DATASET = {
    "graph": [
      {
        "id": "project-001",
        "type": "Project",
        "title": "Wayanad Landslide Monitoring System",
        "domain": "Disaster Management",
        "description": "A system for monitoring environmental parameters to support early identification of landslide-prone conditions.",
        "year": 2026,
        "department": "Computer Science and Engineering",
        "team": ["student-001", "student-002", "student-003"],
        "guide": "faculty-001",
        "technologies": ["IoT", "Python", "Machine Learning"],
        "status": "Prototype"
      },
      {
        "id": "project-002",
        "type": "Project",
        "title": "Campus Resource Booking System",
        "domain": "Web Application",
        "description": "A web application for booking classrooms, laboratories and other institutional resources.",
        "year": 2026,
        "department": "Computer Science and Engineering",
        "team": ["student-004", "student-005"],
        "guide": "faculty-002",
        "technologies": ["HTML", "CSS", "JavaScript", "PHP"],
        "status": "Development"
      },
      {
        "id": "project-003",
        "type": "Project",
        "title": "Smart Agro-Climatic Sensor Network for Wayanad Coffee Plantations",
        "domain": "Agriculture & IoT",
        "description": "Demonstration record: Low-power mesh sensor deployment for microclimate tracking, soil moisture profiling, and frost alerts tailored for high-altitude hill agriculture.",
        "year": 2026,
        "department": "Electronics and Communication Engineering",
        "team": ["student-006", "student-007", "student-008"],
        "guide": "faculty-003",
        "technologies": ["LoRaWAN", "Embedded C", "ESP32", "MQTT"],
        "status": "Prototype"
      },
      {
        "id": "project-004",
        "type": "Project",
        "title": "Kabini River Basin Water Level Early Warning Alert System",
        "domain": "Disaster Management",
        "description": "Demonstration record: Ultrasonic depth telemetry combined with predictive hydrological runoff models to warn downstream riverbank communities during peak monsoon.",
        "year": 2025,
        "department": "Civil Engineering",
        "team": ["student-009", "student-010"],
        "guide": "faculty-004",
        "technologies": ["Python", "Telemetry", "GIS Mapping", "GSM Module"],
        "status": "Completed"
      },
      {
        "id": "project-005",
        "type": "Project",
        "title": "Malayalam Dialect Speech Recognition for Tribal Health Access",
        "domain": "Artificial Intelligence",
        "description": "Demonstration record: Acoustic fine-tuning of automated speech recognition models to transcribe local regional dialects for primary healthcare assistance.",
        "year": 2026,
        "department": "Computer Science and Engineering",
        "team": ["student-011", "student-012", "student-013"],
        "guide": "faculty-001",
        "technologies": ["PyTorch", "Transformers", "Audio Processing", "Flask"],
        "status": "Development"
      },
      {
        "id": "project-006",
        "type": "Project",
        "title": "Hybrid Solar-Micro-Hydro Campus Energy Management System",
        "domain": "Renewable Energy",
        "description": "Demonstration record: Supervisory SCADA controller balancing collegiate rooftop photovoltaic generation and backup storage units with dynamic load shedding.",
        "year": 2025,
        "department": "Electrical and Electronics Engineering",
        "team": ["student-014", "student-015"],
        "guide": "faculty-005",
        "technologies": ["MATLAB/Simulink", "SCADA", "Power Electronics", "Modbus"],
        "status": "Completed"
      },
      {
        "id": "project-007",
        "type": "Project",
        "title": "GECW Digital Central Repository & E-Thesis Archive",
        "domain": "Web Application",
        "description": "Demonstration record: Open-access academic publication and capstone repository facilitating peer review, plagiarism verification, and institutional indexing.",
        "year": 2025,
        "department": "Computer Science and Engineering",
        "team": ["student-016", "student-017", "student-018"],
        "guide": "faculty-002",
        "technologies": ["JavaScript", "Node.js", "IndexedDB", "REST API"],
        "status": "Completed"
      },
      {
        "id": "project-008",
        "type": "Project",
        "title": "Autonomous Forest Trail Inspection Rover for Wildlife Corridors",
        "domain": "Robotics & Vision",
        "description": "Demonstration record: Ruggedized tracked chassis navigating rugged terrain with edge computer vision to detect fence breaches and human-wildlife encounters.",
        "year": 2026,
        "department": "Mechanical Engineering",
        "team": ["student-019", "student-020", "student-021"],
        "guide": "faculty-006",
        "technologies": ["ROS2", "OpenCV", "Jetson Nano", "SolidWorks"],
        "status": "Prototype"
      },
      {
        "id": "project-009",
        "type": "Project",
        "title": "Federated Hospital Record Exchange for District Clinics",
        "domain": "Information Security",
        "description": "Demonstration record: Privacy-preserving cryptographically verified ledger mechanism permitting tamper-evident transfer of patient health summaries.",
        "year": 2024,
        "department": "Computer Science and Engineering",
        "team": ["student-022", "student-023"],
        "guide": "faculty-007",
        "technologies": ["Cryptography", "Go", "Docker", "WebSockets"],
        "status": "Completed"
      },
      {
        "id": "project-010",
        "type": "Project",
        "title": "Smart Rainwater Harvesting & Greywater Recycling Controller",
        "domain": "Renewable Energy",
        "description": "Demonstration record: Automated pneumatic multi-stage filtration monitor regulating campus hostel auxiliary water supplies based on meteorological forecast data.",
        "year": 2024,
        "department": "Civil Engineering",
        "team": ["student-024", "student-025"],
        "guide": "faculty-004",
        "technologies": ["Arduino", "Fluid Dynamics", "Turbidity Sensors"],
        "status": "Completed"
      }
    ]
  };

  // DOM Elements
  const DOM = {
    // Navigation
    navToggleBtn: document.getElementById('navToggleBtn'),
    siteNav: document.getElementById('siteNav'),
    navLinks: document.querySelectorAll('.nav-link'),

    // Statistics
    statTotalProjects: document.getElementById('statTotalProjects'),
    statDomains: document.getElementById('statDomains'),
    statCompleted: document.getElementById('statCompleted'),
    statActive: document.getElementById('statActive'),
    statCards: document.querySelectorAll('.stat-card'),

    // Search & Filters
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
    viewGridBtn: document.getElementById('viewGridBtn'),
    viewListBtn: document.getElementById('viewListBtn'),

    // Project Grid Container
    projectGrid: document.getElementById('projectGrid'),

    // Modal Dialog
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
    modalProjectTeam: document.getElementById('modalProjectTeam')
  };

  /**
   * Initialize Application
   */
  async function init() {
    setupEventListeners();
    await loadProjectData();
    populateFilterDropdowns();
    updateStatistics();
    applyFilters();
  }

  /**
   * Load JSON Project Data
   * First attempts asynchronous fetch from 'data/projectdata.json'.
   * Falls back smoothly if running locally via file:// where fetch is restricted by browser security.
   */
  async function loadProjectData() {
    try {
      const response = await fetch('data/projectdata.json');
      if (!response.ok) {
        throw new Error(`HTTP error status: ${response.status}`);
      }
      const jsonData = await response.json();
      if (!jsonData.graph || !Array.isArray(jsonData.graph)) {
        throw new Error('Invalid JSON format: graph array missing');
      }
      state.allProjects = jsonData.graph;
      console.info('GEC Wayanad Portal: Project data successfully loaded from data/projectdata.json.');
    } catch (err) {
      console.warn('GEC Wayanad Portal: Remote fetch failed, activating resilient local fallback dataset.', err.message);
      state.allProjects = FALLBACK_DATASET.graph;
      showToastNotice('Project data loaded from local dataset.');
    }
  }

  /**
   * Populate Filter Dropdowns dynamically based on JSON dataset values
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

    // Populate Domains
    Array.from(domains).sort().forEach(domain => {
      const opt = document.createElement('option');
      opt.value = domain;
      opt.textContent = domain;
      DOM.domainFilter.appendChild(opt);
    });

    // Populate Departments
    Array.from(departments).sort().forEach(dept => {
      const opt = document.createElement('option');
      opt.value = dept;
      opt.textContent = dept;
      DOM.departmentFilter.appendChild(opt);
    });

    // Populate Years (descending)
    Array.from(years).sort((a, b) => b - a).forEach(year => {
      const opt = document.createElement('option');
      opt.value = year.toString();
      opt.textContent = year.toString();
      DOM.yearFilter.appendChild(opt);
    });
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
   * Filter and Sort Projects
   */
  function applyFilters() {
    const { search, domain, department, year, status, tech, sort } = state.activeFilters;
    const searchLower = search.trim().toLowerCase();

    // 1. Filtering
    state.filteredProjects = state.allProjects.filter(project => {
      // Domain filter
      if (domain !== 'all' && project.domain !== domain) {
        return false;
      }

      // Department filter
      if (department !== 'all' && project.department !== department) {
        return false;
      }

      // Academic Year filter
      if (year !== 'all' && String(project.year) !== String(year)) {
        return false;
      }

      // Status filter
      if (status !== 'all' && project.status.toLowerCase() !== status.toLowerCase()) {
        return false;
      }

      // Technology tag filter
      if (tech !== 'all') {
        const hasTech = Array.isArray(project.technologies) && 
          project.technologies.some(t => t.toLowerCase() === tech.toLowerCase());
        if (!hasTech) return false;
      }

      // Search keyword filter (matches across title, description, domain, department, technologies, team, guide, id)
      if (searchLower) {
        const titleMatch = (project.title || '').toLowerCase().includes(searchLower);
        const descMatch = (project.description || '').toLowerCase().includes(searchLower);
        const domainMatch = (project.domain || '').toLowerCase().includes(searchLower);
        const deptMatch = (project.department || '').toLowerCase().includes(searchLower);
        const idMatch = (project.id || '').toLowerCase().includes(searchLower);
        const guideMatch = (project.guide || '').toLowerCase().includes(searchLower);
        const teamMatch = Array.isArray(project.team) && project.team.some(member => member.toLowerCase().includes(searchLower));
        const techMatch = Array.isArray(project.technologies) && project.technologies.some(t => t.toLowerCase().includes(searchLower));

        if (!titleMatch && !descMatch && !domainMatch && !deptMatch && !idMatch && !guideMatch && !teamMatch && !techMatch) {
          return false;
        }
      }

      return true;
    });

    // 2. Sorting
    state.filteredProjects.sort((a, b) => {
      if (sort === 'year-desc') {
        return b.year - a.year || a.title.localeCompare(b.title);
      } else if (sort === 'year-asc') {
        return a.year - b.year || a.title.localeCompare(b.title);
      } else if (sort === 'title-asc') {
        return a.title.localeCompare(b.title);
      } else if (sort === 'status') {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });

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

    // Check for empty state
    if (projects.length === 0) {
      renderEmptyState();
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

    // Status class mapping
    const statusLower = (project.status || '').toLowerCase();
    let statusClass = 'status-prototype';
    if (statusLower === 'completed') statusClass = 'status-completed';
    else if (statusLower === 'development') statusClass = 'status-development';

    // Build technology pills HTML
    const techTagsHtml = (project.technologies || [])
      .map(tech => `<button type="button" class="tech-tag" data-tech="${escapeHtml(tech)}">${escapeHtml(tech)}</button>`)
      .join('');

    const teamCount = Array.isArray(project.team) ? project.team.length : 0;

    card.innerHTML = `
      <div class="card-top">
        <span class="card-id-badge">${escapeHtml(project.id)}</span>
        <span class="status-badge ${statusClass}">${escapeHtml(project.status)}</span>
      </div>

      <button type="button" class="card-domain-badge" data-domain="${escapeHtml(project.domain)}" title="Filter by domain ${escapeHtml(project.domain)}">
        ${escapeHtml(project.domain)}
      </button>

      <h3 class="card-title">${escapeHtml(project.title)}</h3>

      <div class="card-meta-row">
        <span class="card-meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
          ${escapeHtml(project.department)}
        </span>
        <span>•</span>
        <span class="card-meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          ${escapeHtml(String(project.year))}
        </span>
      </div>

      <p class="card-description">${escapeHtml(project.description)}</p>

      <div class="card-tech-list" aria-label="Technologies used">
        ${techTagsHtml}
      </div>

      <div class="card-footer-info">
        <div class="team-guide-info">
          <span>Team: <strong>${teamCount} Student${teamCount !== 1 ? 's' : ''}</strong></span>
          <span>Guide: <strong>${escapeHtml(project.guide)}</strong></span>
        </div>
        <button type="button" class="btn-card-details" data-id="${escapeHtml(project.id)}">
          View Details
        </button>
      </div>
    `;

    // Event handler: View Details Button
    card.querySelector('.btn-card-details').addEventListener('click', () => {
      openProjectModal(project);
    });

    // Event handler: Domain badge click filters by domain
    card.querySelector('.card-domain-badge').addEventListener('click', (e) => {
      const domainVal = e.target.getAttribute('data-domain');
      if (domainVal) {
        state.activeFilters.domain = domainVal;
        DOM.domainFilter.value = domainVal;
        applyFilters();
        smoothScrollToShowcase();
      }
    });

    // Event handlers: Clickable technology tags
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
   * Render Empty State when no results match
   */
  function renderEmptyState() {
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
      <p class="empty-state-desc">Try modifying your search keywords or resetting the selected domain, department, or status filters.</p>
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
    DOM.modalProjectId.textContent = project.id;
    DOM.modalProjectStatus.textContent = project.status;
    DOM.modalProjectStatus.className = `status-badge ${
      project.status.toLowerCase() === 'completed'
        ? 'status-completed'
        : project.status.toLowerCase() === 'development'
        ? 'status-development'
        : 'status-prototype'
    }`;
    DOM.modalProjectTitle.textContent = project.title;
    DOM.modalProjectDomain.textContent = project.domain;
    DOM.modalProjectDept.textContent = project.department;
    DOM.modalProjectYear.textContent = project.year;
    DOM.modalProjectGuide.textContent = project.guide;
    DOM.modalProjectDesc.textContent = project.description;

    // Render Tech Pills in modal
    DOM.modalProjectTechs.innerHTML = '';
    (project.technologies || []).forEach(tech => {
      const span = document.createElement('span');
      span.className = 'tech-tag';
      span.textContent = tech;
      DOM.modalProjectTechs.appendChild(span);
    });

    // Render Team Member Badges in modal
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

  /**
   * Close Project Details Modal Dialog
   */
  function closeProjectModal() {
    DOM.projectModal.classList.remove('is-open');
    DOM.projectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
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
    // Search input
    DOM.searchInput.addEventListener('input', (e) => {
      state.activeFilters.search = e.target.value;
      DOM.searchClearBtn.style.display = e.target.value.length > 0 ? 'block' : 'none';
      applyFilters();
    });

    // Clear search button
    DOM.searchClearBtn.addEventListener('click', () => {
      state.activeFilters.search = '';
      DOM.searchInput.value = '';
      DOM.searchClearBtn.style.display = 'none';
      DOM.searchInput.focus();
      applyFilters();
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

    // Modal controls
    DOM.modalCloseBtn.addEventListener('click', closeProjectModal);
    DOM.modalCloseActionBtn.addEventListener('click', closeProjectModal);
    DOM.projectModal.addEventListener('click', (e) => {
      if (e.target === DOM.projectModal) {
        closeProjectModal();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && DOM.projectModal.classList.contains('is-open')) {
        closeProjectModal();
      }
    });

    // Mobile navigation toggle
    DOM.navToggleBtn.addEventListener('click', () => {
      const isExpanded = DOM.siteNav.classList.toggle('is-open');
      DOM.navToggleBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    });

    // Close mobile nav when clicking a link
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
   * Helper: Non-intrusive Toast Notice
   */
  function showToastNotice(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notice';
    toast.setAttribute('role', 'status');
    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      <span>${escapeHtml(message)}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  }

  /**
   * Security helper: Escape HTML entities to prevent XSS
   */
  function escapeHtml(str) {
    if (typeof str !== 'string') return String(str || '');
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
