# GEC Wayanad — Data-Driven Project Showcase Portal

An institutional web application developed for **Government Engineering College Wayanad (GEC Wayanad)** to showcase academic capstone projects and research initiatives. The application strictly decouples data from presentation by dynamically rendering structured JSON records via vanilla JavaScript.

---

## 1. Project Overview

The **GEC Wayanad Project Showcase Portal** serves as a centralized digital repository of engineering projects completed and underway at the institution. Designed for academic evaluation, it demonstrates core frontend engineering proficiencies:

- **Strict Data-Presentation Decoupling:** Zero hardcoded project cards in HTML. 100% of the project cards, filters, and metrics are generated dynamically at runtime from structured JSON records.
- **Pure Native Technology Stack:** Built exclusively with semantic HTML5, modern CSS3, and vanilla ES6+ JavaScript. No third-party frameworks, build tools, backend servers, or external CDN dependencies.
- **Resilient & Self-Contained:** Fully functional offline and portable. Includes an intelligent fetch handler that operates smoothly on web servers, GitHub Pages, or direct local file systems.
- **Accessibility & Responsive Design:** Follows modern UX design principles with mobile-first responsive layouts, keyboard accessibility, and ARIA attributes.

---

## 2. Directory Structure

```text
gec-project-showcase/
├── index.html              # Semantic HTML5 single-page structure
├── css/
│   └── style.css           # Institutional design system & responsive styling
├── js/
│   └── app.js              # Vanilla JS application controller & dynamic renderer
├── data/
│   └── projectdata.json    # Institutional JSON dataset (graph array schema)
└── README.md               # Project documentation & evaluation guide
```

---

## 3. Technology Stack & Constraints Adherence

| Component | Technology | Rationale & Constraint Compliance |
| :--- | :--- | :--- |
| **Markup** | HTML5 Semantic Elements | Uses `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<dialog>` patterns. |
| **Styling** | Pure CSS3 | Custom CSS variables, responsive CSS Grid and Flexbox, glassmorphism, institutional palette. Zero framework bloat. |
| **Scripting** | Vanilla JavaScript (ES6+) | Native DOM creation, async fetch API, dynamic multi-field filtering, state management. Zero external libraries. |
| **Dataset** | JSON Graph Schema | Strict compliance with the assigned graph array schema preserving object IDs, team arrays, and faculty references. |

---

## 4. Key Features & Interactivity

1. **Dynamic Project Grid & Cards:**
   - Rendered entirely on the client side from `data/projectdata.json`.
   - Displays project ID badge, color-coded status badge (`Prototype`, `Development`, `Completed`), academic year, department, domain, description, clickable technology tags, team count, and faculty advisor ID.

2. **Multi-Criterion Search & Filtering:**
   - **Real-Time Search Bar:** Instantly searches across title, description, domain, department, technology tags, team member IDs, and guide IDs.
   - **Domain Filter:** Dynamically generated from unique domains present in the dataset.
   - **Department Filter:** Dynamically indexed across college departments.
   - **Academic Year Filter:** Filters projects by completion or submission year.
   - **Status Filter:** Filter by Prototype, Development, or Completed states.
   - **Sort Controller:** Sort by newest academic year, oldest year, title alphabetical order (A-Z), or status.
   - **Clickable Tags:** Clicking any technology pill or domain badge immediately filters the catalog.

3. **Portal Analytics & Statistics:**
   - Real-time counters showing total projects, specialized domains, and active vs. completed systems.
   - Interactive KPI cards: Clicking "Completed Systems" automatically applies the filter.

4. **Detailed Inspection Modal:**
   - Accessible modal window displaying comprehensive project details, student team lists, advisor details, and technical scope.
   - Supports keyboard `Escape` dismissal and focus management.

5. **View Mode Switching:**
   - Toggle between **Grid View** (visual cards) and **Compact List View** (scannable rows).

---

## 5. JSON Dataset Specification

The project dataset resides in `data/projectdata.json` following the specified schema:

```json
{
  "graph": [
    {
      "id": "project-001",
      "type": "Project",
      "title": "Wayanad Landslide Monitoring System",
      "domain": "Disaster Management",
      "description": "A system for monitoring environmental parameters to support early identification of landslide-prone conditions.",
      "year": 2026,
      "department": "Computer Science and Engineering",
      "team": [
        "student-001",
        "student-002",
        "student-003"
      ],
      "guide": "faculty-001",
      "technologies": [
        "IoT",
        "Python",
        "Machine Learning"
      ],
      "status": "Prototype"
    }
  ]
}
```

*Note: In accordance with academic guidelines, student and faculty identities are represented by standardized reference identifiers (e.g., `student-001`, `faculty-001`).*

---

## 6. How to Run & Test the Application

### Option A: Local HTTP Server (Recommended)
You can serve the directory using Python, Node, or VS Code Live Server:

```bash
# Using Python 3:
python -m http.server 8000
# Then open http://localhost:8000 in your browser
```

```bash
# Using Node.js (npx):
npx serve .
```

### Option B: Direct File Opening
Double-click `index.html` to open it in any web browser. 
*The application incorporates an automatic fallback mechanism: if the browser's CORS policy blocks local `fetch()` over `file://`, the portal activates a self-contained local mirror dataset without interruption.*

### Option C: GitHub Pages Deployment
1. Push this repository to GitHub.
2. Navigate to **Settings > Pages**.
3. Under **Build and deployment > Branch**, select `main` (or `master`) and `/ (root)`.
4. Click **Save**. The live URL will be active within minutes.

---

## 7. Institutional Attribution & Academic Notice

- **Institution:** Government Engineering College Wayanad (GEC Wayanad)
- **Location:** Thalappuzha P.O., Mananthavady, Wayanad, Kerala - 670644
- **Affiliation:** APJ Abdul Kalam Technological University (KTU) / Directorate of Technical Education, Govt. of Kerala
- **Academic Disclaimer:** This application was developed for educational demonstration and web technology assignment evaluation.
