# GEC Wayanad — PHP RESTful Data Service (Assignment 2)

An institutional web application developed for **Government Engineering College Wayanad (GEC Wayanad)** to showcase academic capstone projects and research initiatives. This project extends Assignment 1 by transitioning from a purely client-loaded data model to a multi-tier **PHP-based RESTful data service architecture**.

---

## 1. Architectural Overview & Data Flow

The application strictly separates data storage, server-side data delivery, and client-side presentation:

```text
┌─────────────────────────┐
│ data/projectdata.json   │  <-- Standalone JSON Dataset (RO-Crate Graph Schema)
└────────────┬────────────┘
             │ File System Read & Validation
┌────────────▼────────────┐
│        api.php          │  <-- Vanilla PHP RESTful Service Endpoint
└────────────┬────────────┘
             │ HTTP GET Response (Content-Type: application/json; charset=utf-8)
┌────────────▼────────────┐
│        js/app.js        │  <-- Native Browser Fetch API (Loading/Error/Retry States)
└────────────┬────────────┘
             │ Safe DOM Generation (Zero Server-Side HTML)
┌────────────▼────────────┐
│       index.html        │  <-- Interactive, Responsive User Interface
└─────────────────────────┘
```

### Core Architecture Rules:
1. **The browser generates 100% of the user interface:** PHP strictly delivers structured JSON data and never generates HTML markup, project cards, or server templates.
2. **Linear HTTP Delivery:** JavaScript requests `./api.php` over HTTP via `fetch()`. No project data is hardcoded into JavaScript or HTML.
3. **In-Memory Client-Side Interactivity:** Once loaded from `api.php`, project records are stored in application state. Real-time searching, domain filtering, department filtering, year filtering, status filtering, and sorting execute instantaneously in the browser without repeated server round-trips or full-page reloads.

---

## 2. Directory Structure

```text
gec-project-showcase/
├── index.html                       # Semantic HTML5 page structure
├── css/
│   └── style.css                    # Institutional design system & responsive styling
├── js/
│   └── app.js                       # Vanilla JS controller with Fetch API & state management
├── data/
│   └── projectdata.json             # Independent JSON dataset (graph array structure)
├── schemas/
│   └── projectdata.schema.json      # Formal JSON Schema (Draft 2020-12) specification
├── api.php                          # Vanilla PHP RESTful data endpoint
├── logo.png                         # Official GEC Wayanad institutional emblem
└── README.md                        # Complete project documentation & testing manual
```

---

## 3. Strict Technology Constraints

| Layer | Permitted Technology | Prohibited (Strictly Excluded) |
| :--- | :--- | :--- |
| **Frontend Markup** | Semantic HTML5 | React, Angular, Vue, Next.js, Server-side PHP templates |
| **Styling** | Modern Vanilla CSS3 | Bootstrap, Tailwind CSS, Sass/SCSS build systems |
| **Client Scripting** | Vanilla JavaScript (ES6+), Fetch API | jQuery, Axios, lodash, npm bundlers, Node.js runtimes |
| **Backend Service** | Vanilla PHP (7.4+ / 8.x) | Laravel, Symfony, Slim, Composer packages |
| **Data Storage** | Independent JSON file (`projectdata.json`) | MySQL, PostgreSQL, SQLite, MongoDB, external APIs |

---

## 4. JSON Dataset & Schema Specification

### 4.1 JSON Dataset (`data/projectdata.json`)
The dataset adheres to the RO-Crate-aligned graph schema where all institutional records reside in the top-level `graph` array:

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

*Student and faculty identities are represented by standardized institutional reference identifiers (`student-001`, `faculty-001`) in accordance with academic assignment privacy guidelines.*

### 4.2 Formal JSON Schema (`schemas/projectdata.schema.json`)
The dataset structure is formally defined using **JSON Schema Draft 2020-12** (`https://json-schema.org/draft/2020-12/schema`):
- Root is validated as an `object` with a mandatory `graph` array.
- Every graph item requires `id` (non-empty string) and `type` (string).
- Conditional validation (`if: { "properties": { "type": { "const": "Project" } } }`) validates project records against mandatory fields: `title`, `domain`, `description`, `year` (integer), `department`, `team` (array of strings), `guide`, `technologies` (array of strings), and `status` (`Prototype`, `Development`, or `Completed`).
- Enables extensibility for other potential entity types within the institutional graph.

#### How to Validate the Dataset Against the Schema:
- **Using Python:**
  ```bash
  python -c "import json, jsonschema; data=json.load(open('data/projectdata.json')); schema=json.load(open('schemas/projectdata.schema.json')); jsonschema.validate(data, schema); print('Valid!')"
  ```
- **Using Node.js (ajv-cli):**
  ```bash
  npx ajv-cli validate -s schemas/projectdata.schema.json -d data/projectdata.json --spec=draft2020
  ```
- **Using Online Validators:** Copy `schemas/projectdata.schema.json` and `data/projectdata.json` into [jsonschemavalidator.net](https://www.jsonschemavalidator.net/).

---

## 5. PHP RESTful Endpoint (`api.php`)

`api.php` is implemented in pure vanilla PHP without external dependencies. Its responsibilities are strictly confined to data verification and delivery:

1. **Path Resolution:** Resolves file paths reliably using `__DIR__ . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'projectdata.json'`.
2. **HTTP Method Enforcement:** Validates `$_SERVER['REQUEST_METHOD']`. Only `GET` is permitted. Any other method triggers an **HTTP 405 Method Not Allowed** with an `Allow: GET` header and a JSON error payload.
3. **Response Headers:** Emits `Content-Type: application/json; charset=utf-8` and strict `Cache-Control` headers preventing stale browser caching.
4. **File Verification:**
   - If `projectdata.json` does not exist: returns **HTTP 404 Not Found** with `{"error": true, "message": "Project data file not found."}`.
   - If the file is not readable: returns **HTTP 500 Internal Server Error** with an unreadable message.
5. **Syntax & Schema Verification:**
   - Decodes content using `json_decode()`. If `json_last_error() !== JSON_ERROR_NONE`, returns **HTTP 500 Internal Server Error** with `{"error": true, "message": "Invalid JSON syntax encountered in project dataset."}`.
   - Confirms that `$data['graph']` exists and is a valid array; otherwise returns **HTTP 500**.
6. **Information Shielding:** Errors are suppressed from standard output (`display_errors = 0`) to prevent PHP stack traces or server file paths from leaking into the JSON payload.

---

## 6. JavaScript Client Controller (`js/app.js`)

`js/app.js` interacts with the backend solely through `fetch('./api.php')` with modern `async/await`:

- **Loading State:** Immediately displays an animated CSS spinner with the message *"Connecting to Institutional Data Service..."* while disabling search/filter controls to prevent inconsistent states.
- **HTTP Response Verification:** Checks `response.ok`. If the status is non-2xx, parses server error JSON and surfaces meaningful feedback.
- **Entity Filtering:** Filters the graph array for records where `type === 'Project'` before generating cards.
- **Interactive Error State & Retry Mechanism:** If `api.php` fails (network unreachable, 404, 500), renders a styled error card showing the error detail and provides a **Retry Request** button that restarts the data fetch without a page reload.
- **Empty States:** Distinctly handles empty server datasets versus zero-matching search/filter results.
- **Safe DOM Rendering:** Uses `textContent` and sanitization helper `escapeHtml()` to protect against Cross-Site Scripting (XSS).

---

## 7. How to Run Locally

### Prerequisites
A working PHP installation (PHP 7.4 or PHP 8.x).

### Step 1: Start the PHP Development Server
Open a terminal in the project directory (`gec-project-showcase` or the repository root) and execute:

```bash
php -S localhost:8000
```

### Step 2: Open in Your Browser
Navigate to:
👉 **[http://localhost:8000/](http://localhost:8000/)**

The browser loads `index.html`, and `js/app.js` immediately requests `http://localhost:8000/api.php` over HTTP.

### Step 3: Test the API Endpoint Directly
Visit:
👉 **[http://localhost:8000/api.php](http://localhost:8000/api.php)**

Verify that the browser or HTTP client receives raw JSON with `Content-Type: application/json; charset=utf-8`.

---

## 8. End-to-End Testing Matrix

| Test Scenario | Test Action | Expected Behavior | Verification Status |
| :--- | :--- | :--- | :--- |
| **1. Normal Retrieval** | `GET http://localhost:8000/api.php` | Returns HTTP 200, valid JSON graph, renders all 10 project cards and statistics. | Passed |
| **2. Method Not Allowed** | `POST http://localhost:8000/api.php` | Returns HTTP 405, `Allow: GET` header, JSON error message. | Passed |
| **3. Missing Data File** | Temporarily rename `projectdata.json` | `api.php` returns HTTP 404, frontend displays error alert with Retry button. | Passed |
| **4. Malformed JSON** | Introduce syntax error in JSON file | `api.php` returns HTTP 500, frontend surfaces invalid JSON warning. | Passed |
| **5. Empty Graph** | Set `{"graph": []}` in JSON file | Frontend renders *"No Project Records Available"* empty state. | Passed |
| **6. Interactive Retry** | Click "Retry Request" after resolving error | Frontend re-fetches `api.php` and renders project cards without reloading the page. | Passed |
| **7. Multi-Criteria Filter** | Select Domain, Department, Year, Status | Instantaneous in-memory filtering; results counter and cards update dynamically. | Passed |
| **8. Real-Time Search** | Type keywords (e.g., "IoT", "Malayalam", "faculty-001") | Real-time card matching across all project fields and metadata. | Passed |
| **9. Project Details Modal** | Click "View Details" on any card | Opens accessible modal dialog with complete team and technical specifications; closes on `Esc` key. | Passed |
| **10. View Layout Toggle** | Click List View / Grid View buttons | Seamlessly switches between responsive card grid and compact scannable list view. | Passed |

---

## 9. Deployment Guidelines (PHP-Enabled Hosting)

> **Important Deployment Notice:**  
> GitHub Pages only hosts **static web assets** (HTML, CSS, client-side JS) and **cannot execute PHP scripts**. If deployed solely to GitHub Pages, requests to `api.php` will serve raw PHP source code or return 404 rather than executing the script.

### Deploying to a Free/Production PHP Host:
1. **Recommended Free PHP Hosting Providers:**
   - **Render / Railway / Fly.io:** Deploy as a Docker or native PHP web service.
   - **InfinityFree / 000webhost / AwardSpace:** Free cPanel PHP 8.x hosting with Apache/Nginx.
2. **File Deployment:**
   - Upload `index.html`, `api.php`, `logo.png`, `css/`, `js/`, `data/`, and `schemas/` into the public web root (typically `public_html/` or `htdocs/`).
3. **Verify Endpoint:**
   - Open `https://your-domain.com/api.php` in your browser. Verify HTTP 200 and JSON output.
4. **Subdirectory Path Note:**
   - If hosted in a subfolder (e.g., `https://your-domain.com/showcase/`), ensure the relative path `fetch('./api.php')` in `js/app.js` correctly targets the endpoint in the same directory.

---

## 10. Institutional Attribution

- **Institution:** Government Engineering College Wayanad (GEC Wayanad)
- **Location:** Thalappuzha P.O., Mananthavady, Wayanad, Kerala - 670644
- **Affiliation:** APJ Abdul Kalam Technological University (KTU) & Directorate of Technical Education, Govt. of Kerala
- **Academic Assignment:** Web Technology Showcase Project — Assignment 2 (PHP RESTful Data Service)
