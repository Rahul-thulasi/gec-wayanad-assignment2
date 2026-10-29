<?php
/**
 * ============================================================================
 * GEC Wayanad — Data-Driven Project Showcase Portal
 * KTU CST463 Web Programming Assignment 3
 * API Shared Utilities: api/helpers.php
 * JSON Responses, Secure Session Management, & Input Validation
 * ============================================================================
 */

// Suppress raw PHP HTML errors; API must communicate exclusively through JSON
ini_set('display_errors', '0');
error_reporting(E_ALL);

/**
 * Initialize PHP session with hardened cookie settings
 */
function initSecureSession() {
    if (session_status() === PHP_SESSION_NONE) {
        $isSecure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
        
        session_set_cookie_params([
            'lifetime' => 86400, // 24 hours
            'path'     => '/',
            'domain'   => '',
            'secure'   => $isSecure,
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
        session_start();
    }
}

/**
 * Send a standardized JSON HTTP response
 *
 * @param int $statusCode HTTP status code (200, 201, 400, 401, 404, 500, etc.)
 * @param array $payload Response data
 */
function sendJsonResponse(int $statusCode, array $payload) {
    if (!headers_sent()) {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-cache, no-store, must-revalidate');
        header('Pragma: no-cache');
        header('Expires: 0');
        header('X-Content-Type-Options: nosniff');
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Parse and validate incoming JSON request body
 *
 * @return array Parsed JSON payload
 */
function getJsonRequestBody(): array {
    $rawInput = file_get_contents('php://input');
    if ($rawInput === false || trim($rawInput) === '') {
        return [];
    }

    $decoded = json_decode($rawInput, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($decoded)) {
        sendJsonResponse(400, [
            'success' => false,
            'message' => 'Malformed JSON request body: ' . json_last_error_msg()
        ]);
    }
    return $decoded;
}

/**
 * Verify authenticated session; halts with HTTP 401 if unauthenticated
 *
 * @return array Authenticated user session data
 */
function requireAuthentication(): array {
    initSecureSession();
    if (empty($_SESSION['authenticated']) || empty($_SESSION['user'])) {
        sendJsonResponse(401, [
            'success' => false,
            'message' => 'Unauthorized: Authenticated administrative session required.'
        ]);
    }
    return $_SESSION['user'];
}

/**
 * Fetch complete project entity including joined team and technologies
 *
 * @param PDO $pdo
 * @param string|null $filterKeyword Search keyword or null
 * @param array $filters Additional filters (domain, department, year, status)
 * @return array List of normalized project items
 */
function fetchProjectsFromDB(PDO $pdo, ?string $filterKeyword = null, array $filters = []): array {
    $whereClauses = ["1=1"];
    $params = [];

    // Optional domain filter
    if (!empty($filters['domain']) && $filters['domain'] !== 'all') {
        $whereClauses[] = "p.domain = :domain";
        $params['domain'] = $filters['domain'];
    }

    // Optional department filter
    if (!empty($filters['department']) && $filters['department'] !== 'all') {
        $whereClauses[] = "p.department = :department";
        $params['department'] = $filters['department'];
    }

    // Optional year filter
    if (!empty($filters['year']) && $filters['year'] !== 'all') {
        $whereClauses[] = "p.year = :year";
        $params['year'] = (int)$filters['year'];
    }

    // Optional status filter
    if (!empty($filters['status']) && $filters['status'] !== 'all') {
        $whereClauses[] = "p.status = :status";
        $params['status'] = $filters['status'];
    }

    // Server-side keyword search across title, description, domain, department, guide, tech, id
    if ($filterKeyword !== null && trim($filterKeyword) !== '') {
        $kw = '%' . trim($filterKeyword) . '%';
        $whereClauses[] = "(
            p.id LIKE :kw_id 
            OR p.title LIKE :kw_title 
            OR p.description LIKE :kw_desc 
            OR p.domain LIKE :kw_domain 
            OR p.department LIKE :kw_dept 
            OR p.guide_id LIKE :kw_guide 
            OR f.name LIKE :kw_fname
            OR EXISTS (
                SELECT 1 FROM project_technologies pt2
                JOIN technologies t2 ON pt2.technology_id = t2.id
                WHERE pt2.project_id = p.id AND t2.name LIKE :kw_tech
            )
            OR EXISTS (
                SELECT 1 FROM project_members pm2
                JOIN students s2 ON pm2.student_id = s2.id
                WHERE pm2.project_id = p.id AND (s2.id LIKE :kw_sid OR s2.name LIKE :kw_sname)
            )
        )";
        $params['kw_id'] = $kw;
        $params['kw_title'] = $kw;
        $params['kw_desc'] = $kw;
        $params['kw_domain'] = $kw;
        $params['kw_dept'] = $kw;
        $params['kw_guide'] = $kw;
        $params['kw_fname'] = $kw;
        $params['kw_tech'] = $kw;
        $params['kw_sid'] = $kw;
        $params['kw_sname'] = $kw;
    }

    $sql = "
        SELECT 
            p.id,
            p.title,
            p.domain,
            p.description,
            p.year,
            p.department,
            p.guide_id,
            p.status,
            f.name AS guide_name,
            GROUP_CONCAT(DISTINCT t.name ORDER BY t.name ASC SEPARATOR '||') AS technologies_concat,
            GROUP_CONCAT(DISTINCT pm.student_id ORDER BY pm.student_id ASC SEPARATOR '||') AS team_concat
        FROM projects p
        LEFT JOIN faculty f ON p.guide_id = f.id
        LEFT JOIN project_technologies pt ON p.id = pt.project_id
        LEFT JOIN technologies t ON pt.technology_id = t.id
        LEFT JOIN project_members pm ON p.id = pm.project_id
        WHERE " . implode(' AND ', $whereClauses) . "
        GROUP BY p.id, p.title, p.domain, p.description, p.year, p.department, p.guide_id, p.status, f.name
        ORDER BY p.year DESC, p.id ASC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $projects = [];
    foreach ($rows as $row) {
        $techs = !empty($row['technologies_concat']) ? explode('||', $row['technologies_concat']) : [];
        $team = !empty($row['team_concat']) ? explode('||', $row['team_concat']) : [];

        $projects[] = [
            'id'           => $row['id'],
            'type'         => 'Project',
            'title'        => $row['title'],
            'domain'       => $row['domain'],
            'description'  => $row['description'],
            'year'         => (int)$row['year'],
            'department'   => $row['department'],
            'guide'        => $row['guide_id'],
            'guide_name'   => $row['guide_name'] ?: $row['guide_id'],
            'technologies' => $techs,
            'team'         => $team,
            'status'       => $row['status']
        ];
    }

    return $projects;
}
