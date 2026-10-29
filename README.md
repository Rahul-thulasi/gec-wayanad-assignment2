# GEC Wayanad — MySQL-Backed REST API & Project Showcase Portal (Assignment 3)

An institutional, data-driven web application developed for **Government Engineering College Wayanad (GEC Wayanad)** to showcase academic capstone projects, engineering research, and student technological initiatives.

This project upgrades Assignment 2 from a file-based JSON service to an enterprise-grade **MySQL relational database architecture** paired with a secure **PHP PDO REST API**, **PHP session-based authentication**, and an asynchronous **Vanilla JavaScript Fetch frontend** with real-time DOM updates and debounced live search.

---

## 1. Architectural Overview & Data Flow

The architecture strictly adheres to KTU CST463 Assignment 3 guidelines:

```text
┌────────────────────────────────────────────────────────┐
│               MySQL Database (gec_assignment3)         │
│  - Normalized Tables: projects, students, faculty,     │
│    technologies, project_members, project_technologies │
│  - Demonstration Accounts Table: users                 │
└───────────────────────────┬────────────────────────────┘
                            │ PDO (Prepared Statements, Transactions, UTF-8)
┌───────────────────────────▼────────────────────────────┐
│                    PHP REST API Layer                  │
│  - config/database.php  : PDO connection provider      │
│  - api/helpers.php      : JSON envelopes & session     │
│  - api/items.php        : GET (list & live search),    │
│                           POST (create), PUT (update)  │
│  - api/login.php        : Session login (HttpOnly)     │
│  - api/logout.php       : Terminate session            │
│  - api/session.php      : Session state check          │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP JSON Only (application/json; charset=utf-8)
                            │ Credentials: 'same-origin' (Session Cookie)
┌───────────────────────────▼────────────────────────────┐
│                  Frontend Client Layer                 │
│  - js/app.js   : Fetch API, debounced search (300ms),  │
│                  state management, dynamic DOM updates │
│  - index.html  : Semantic HTML5, accessible modals,    │
│                  auth controls, filter bars            │
│  - css/style.css: Institutional responsive styling     │
└────────────────────────────────────────────────────────┘
```

### Core Architecture Principles:
1. **Zero Server-Side HTML Rendering:** The PHP REST API endpoints communicate exclusively via JSON payloads (`Content-Type: application/json; charset=utf-8`) with standardized HTTP status codes (200, 201, 400, 401, 404, 405, 500).
2. **Relational Normalization & Integrity:** Institutional entities are organized into 3NF normalized MySQL tables with foreign key constraints (`ON DELETE CASCADE`, `ON UPDATE CASCADE`) and database transactions wrapping multi-table operations.
3. **Session Authentication via `$_SESSION`:** Mutation operations (`POST` create, `PUT` update) strictly enforce server-side session checks. Unauthenticated requests are rejected with HTTP 401 Unauthorized.
4. **Asynchronous Single-Page Interactivity:** The frontend never performs full-page reloads. All queries, filtering, creation, and editing update the UI asynchronously through the Fetch API.
5. **Debounced Server-Side Live Search:** As the user types, requests to `GET /api/items.php?q=keyword` are debounced by 300ms, minimizing database load while delivering instantaneous results.

---

## 2. Directory Structure

```text
gec-project-showcase/
├── index.html               # Main responsive institutional portal & modals
├── logo.png                 # Official GEC Wayanad institutional emblem
├── database.sql             # MySQL schema DDL & baseline demonstration dataset
├── router.php               # Built-in PHP server router for clean REST routes
├── api.php                  # Legacy root router mapping to api/items.php
├── .htaccess                # Apache / XAMPP mod_rewrite routing
├── .gitignore               # Ignored cache, logs, and system files
├── config/
│   └── database.php         # Secure PDO connection module (UTF-8, error shielding)
├── api/
│   ├── helpers.php          # JSON response envelopes & session utilities
│   ├── items.php            # REST endpoint: GET (list & search), POST, PUT
│   ├── login.php            # Authentication endpoint (POST, session regeneration)
│   ├── logout.php           # Session termination endpoint (POST/GET)
│   └── session.php          # Session verification endpoint (GET)
├── css/
│   └── style.css            # Institutional design system & responsive styling
├── js/
│   └── app.js               # Vanilla JS controller with Fetch API & debounced search
├── data/
│   └── projectdata.json     # Assignment 2 reference dataset (migrated to MySQL)
└── README.md                # Complete project documentation & demonstration manual
```

---

## 3. Strict Technology Constraints

| Layer | Permitted Technology | Notes |
| :--- | :--- | :--- |
| **Frontend Markup** | Semantic HTML5 | Zero server-side template engines |
| **Styling** | Modern Vanilla CSS3 | Responsive grid/flexbox, custom properties |
| **Client Scripting** | Vanilla JavaScript (ES6+), Fetch API | Zero npm build tools, zero external JS frameworks |
| **Backend Service** | Vanilla PHP (7.4+ / 8.x) | Zero Laravel/Symfony, PDO prepared statements |
| **Database** | MySQL (8.0+ / MariaDB) | Relational database `gec_assignment3` |
| **Authentication** | Native PHP Sessions (`$_SESSION`) | Session regeneration, HttpOnly & SameSite cookies |

---

## 4. Relational Database Schema (`gec_assignment3`)

The database `gec_assignment3` models institutional engineering projects and participants:

### Tables:
1. **`projects`**: Core project records (`id`, `title`, `domain`, `description`, `year`, `department`, `guide_id`, `status`).
2. **`faculty`**: Academic guides and advisors (`id`, `name`, `department`).
3. **`students`**: Student researchers and contributors (`id`, `name`, `department`).
4. **`technologies`**: Master registry of technical stacks, frameworks, and tools (`id`, `name`).
5. **`project_members`**: Many-to-many junction table between `projects` and `students`.
6. **`project_technologies`**: Many-to-many junction table between `projects` and `technologies`.
7. **`users`**: Administrative demonstration accounts (`id`, `username`, `password`, `role`).

---

## 5. Demonstration Login Credentials

> **Academic Evaluation Notice:** The following predefined accounts are provided strictly for local faculty demonstration as mandated by Assignment 3 guidelines:

| Username | Password | Role | Permissions |
| :--- | :--- | :--- | :--- |
| **`admin`** | **`admin123`** | Administrator | Full creation and editing rights |
| **`demo_user`** | **`demo_pass`** | Faculty Evaluator | Full creation and editing rights |

*Public visitors (unauthenticated) can browse, filter, and execute live search across all records.*

---

## 6. How to Run Locally

### Option A: Using the PHP Built-In Server (Currently Running)

1. **Verify MySQL is running** on your system on port 3306.
2. **Import the database schema and baseline dataset**:
   ```bash
   # On Windows PowerShell:
   Get-Content database.sql | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
   # Or via MySQL Command Line Client:
   # mysql -u root -p < database.sql
   ```
3. **Start the PHP development server**:
   ```bash
   php -S 127.0.0.1:8000 router.php
   ```
4. **Open your browser and navigate to**:
   👉 **`http://localhost:8000/`**

---

### Option B: Using XAMPP on Windows

1. Open **XAMPP Control Panel** and start **Apache** and **MySQL**.
2. Copy this project folder into `C:\xampp\htdocs\gec-project-showcase` (or `webassignment`).
3. Open **phpMyAdmin** at `http://localhost/phpmyadmin/`.
4. Click **Import**, select `database.sql`, and click **Go**.
5. Navigate to:
   👉 **`http://localhost/webassignment/`**

*The database configuration in `config/database.php` automatically detects XAMPP credentials (`root` with an empty password) as well as password-protected local installations (`rahulthulasi`), requiring zero manual code modifications.*

---

## 7. REST API Documentation

### Standard Response Envelopes

**Successful Response:**
```json
{
  "success": true,
  "message": "Records retrieved successfully",
  "total": 10,
  "data": [ ... ]
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

---

### Endpoints Specification

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| **`GET`** | `/api/items.php` | Public | Retrieve all project records from MySQL |
| **`GET`** | `/api/items.php?q=IoT` | Public | Debounced live search across title, domain, tech, team |
| **`GET`** | `/api/items.php?domain=Disaster+Management` | Public | Filter records by domain, department, year, status |
| **`GET`** | `/api/items.php?id=project-001` | Public | Retrieve a single project record by ID |
| **`POST`** | `/api/login.php` | Public | Authenticate session with JSON `{username, password}` |
| **`GET`** | `/api/session.php` | Public | Check current authentication status |
| **`POST`** | `/api/items.php` | **Authenticated** | Create a new project record |
| **`PUT`** | `/api/items.php?id=project-001` | **Authenticated** | Update an existing project record |
| **`POST`** | `/api/logout.php` | Public | Terminate active PHP session |

---

### Example HTTP Requests

#### 1. Retrieve Projects (Public GET)
```bash
curl -X GET "http://localhost:8000/api/items.php" -H "Accept: application/json"
```

#### 2. Server-Side Live Search (Public GET)
```bash
curl -X GET "http://localhost:8000/api/items.php?q=Landslide" -H "Accept: application/json"
```

#### 3. Administrative Login (POST)
```bash
curl -i -X POST "http://localhost:8000/api/login.php" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"username":"admin","password":"admin123"}'
```

#### 4. Create Project (Authenticated POST)
```bash
curl -i -X POST "http://localhost:8000/api/items.php" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Smart Solar Micro-Grid Controller",
    "domain": "Renewable Energy",
    "description": "Grid-tie solar inverter telemetry with edge ML optimization.",
    "year": 2026,
    "department": "Electrical and Electronics Engineering",
    "guide": "faculty-005",
    "status": "Prototype",
    "technologies": ["Python", "MATLAB", "IoT"],
    "team": ["student-014", "student-015"]
  }'
```

#### 5. Update Project (Authenticated PUT)
```bash
curl -i -X PUT "http://localhost:8000/api/items.php?id=project-001" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Wayanad Landslide Monitoring System (Phase 2)",
    "domain": "Disaster Management",
    "description": "Upgraded telemetry array with satellite uplink failover.",
    "year": 2026,
    "department": "Computer Science and Engineering",
    "guide": "faculty-001",
    "status": "Development",
    "technologies": ["IoT", "Python", "LoRaWAN", "Machine Learning"],
    "team": ["student-001", "student-002", "student-003"]
  }'
```

#### 6. Logout (POST)
```bash
curl -i -X POST "http://localhost:8000/api/logout.php" -b cookies.txt
```

---

## 8. Verification & Demonstration Checklist

The project has passed automated end-to-end integration tests:

| Test Scenario | Action | Expected Status | Result |
| :--- | :--- | :--- | :--- |
| **1. Database Retrieval** | `GET /api/items.php` | HTTP 200, JSON array of 10 items | **PASSED** |
| **2. Live Search** | `GET /api/items.php?q=Landslide` | HTTP 200, matched records | **PASSED** |
| **3. Empty Search** | `GET /api/items.php?q=nonexistent` | HTTP 200, empty collection `[]` | **PASSED** |
| **4. Invalid Login** | `POST /api/login.php` (bad pass) | HTTP 401 Unauthorized | **PASSED** |
| **5. Valid Login** | `POST /api/login.php` (`admin`/`admin123`) | HTTP 200, session established | **PASSED** |
| **6. Session Verification** | `GET /api/session.php` | HTTP 200, `authenticated: true` | **PASSED** |
| **7. Unauthenticated POST** | `POST /api/items.php` (no session) | HTTP 401 Unauthorized | **PASSED** |
| **8. Authenticated POST** | `POST /api/items.php` (with session) | HTTP 201 Created, record added | **PASSED** |
| **9. Authenticated PUT** | `PUT /api/items.php?id=...` (with session) | HTTP 200 OK, record updated | **PASSED** |
| **10. Missing PUT ID** | `PUT /api/items.php?id=fake-id` | HTTP 404 Not Found | **PASSED** |
| **11. Malformed JSON** | `POST /api/items.php` (invalid body) | HTTP 400 Bad Request | **PASSED** |
| **12. Logout** | `POST /api/logout.php` | HTTP 200, session destroyed | **PASSED** |
| **13. Post-Logout State** | `GET /api/session.php` | HTTP 200, `authenticated: false` | **PASSED** |
| **14. Frontend No Reload** | UI edits / creates project | Card updates asynchronously | **PASSED** |
| **15. Legacy Compatibility** | `GET /api.php` | HTTP 200, MySQL JSON | **PASSED** |

---

## 9. Deployment Requirements Notice

> **Important Notice Regarding GitHub Pages:**  
> GitHub Pages hosts purely **static files** (HTML, CSS, client-side JS) and **cannot execute PHP or connect to a MySQL database**. To run and evaluate this Assignment 3 application, it must be hosted on a PHP/MySQL runtime such as:
> - Local PHP CLI server (`php -S localhost:8000 router.php`)
> - Local XAMPP / WampServer / LAMP stack
> - Cloud PHP/MySQL host (e.g. Apache/Nginx with PHP-FPM and MySQL)
